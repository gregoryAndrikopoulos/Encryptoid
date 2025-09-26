import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import Busboy from "busboy";

export const app = express();

// basic middleware
app.disable("x-powered-by");
app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // simple permissive CORS for local dev
    credentials: false,
  })
);

// helpers
function jsonError(res, status, code) {
  return res.status(status).json({ ok: false, code });
}

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function hkdfSha256(keyMaterial, info = "encryptoid-v1", length = 32, salt) {
  return crypto.hkdfSync(
    "sha256",
    keyMaterial,
    salt ?? Buffer.alloc(0),
    info,
    length
  );
}

function deriveKeyFromToken(token) {
  // Token is ASCII (base64url-like). Use HKDF-SHA256 over its bytes.
  return hkdfSha256(
    Buffer.from(token, "utf8"),
    "encryptoid-aes-256-gcm-key",
    32
  );
}

function aesGcmEncrypt(plaintext, key) {
  const iv = crypto.randomBytes(12); // 96-bit nonce
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Simple binary envelope: magic(6) + iv(12) + tag(16) + enc(n)
  const magic = Buffer.from("ENCv1:", "utf8"); // 6 bytes
  return Buffer.concat([magic, iv, tag, enc]);
}

function aesGcmDecrypt(envelope, key) {
  const magic = Buffer.from("ENCv1:", "utf8");
  if (envelope.length < magic.length + 12 + 16)
    throw new Error("cipher_bad_format");
  if (!envelope.subarray(0, magic.length).equals(magic))
    throw new Error("cipher_bad_format");

  const off = magic.length;
  const iv = envelope.subarray(off, off + 12);
  const tag = envelope.subarray(off + 12, off + 12 + 16);
  const data = envelope.subarray(off + 12 + 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function generateToken256() {
  // Create a 256-character token using base64url of random bytes
  // 192 bytes - 256 chars (approx) after base64url (since 3 bytes - 4 chars)
  // Will generate a bit extra and slice to exactly 256
  const raw = crypto.randomBytes(196);
  const t = base64url(raw).slice(0, 256);
  // Ensure we actually hit length 256
  return t.padEnd(256, "x");
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    try {
      const busboy = Busboy({ headers: req.headers });
      let fileBuf = null;
      let fileInfo = null;
      const fields = {};

      busboy.on("file", (name, file, info) => {
        fileInfo = info;
        const chunks = [];
        file.on("data", (d) => chunks.push(d));
        file.on("limit", () => {
          reject(new Error("file_too_large"));
          file.resume();
        });
        file.on("end", () => {
          fileBuf = Buffer.concat(chunks);
        });
      });

      busboy.on("field", (name, val) => {
        fields[name] = val;
      });

      busboy.on("error", (err) => reject(err));
      busboy.on("finish", () => resolve({ fileBuf, fileInfo, fields }));

      req.pipe(busboy);
    } catch (e) {
      reject(e);
    }
  });
}

// routes

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "encryptoid-server", ts: Date.now() });
});

app.options("/api/encrypt", (_req, res) => res.sendStatus(204));
app.options("/api/decrypt", (_req, res) => res.sendStatus(204));

app.post("/api/encrypt", async (req, res) => {
  try {
    // if content-type doesn't include multipart/form-data treat as no file
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (!ct.includes("multipart/form-data")) {
      return jsonError(res, 400, "file_required");
    }

    const { fileBuf, fileInfo } = await parseMultipart(req);

    if (!fileBuf || !fileInfo) return jsonError(res, 400, "file_required");

    const filename = fileInfo.filename || "file.txt";
    if (!/\.txt$/i.test(filename))
      return jsonError(res, 400, "only_txt_supported");
    if (fileBuf.length === 0) return jsonError(res, 400, "file_empty");

    const token = generateToken256();
    const key = deriveKeyFromToken(token);
    const envelope = aesGcmEncrypt(fileBuf, key);

    const resp = {
      ok: true,
      filename,
      plainSize: fileBuf.length,
      encSize: envelope.length,
      token,
      ciphertextB64: envelope.toString("base64"),
    };
    return res.status(200).json(resp);
  } catch (err) {
    const msg = String(err?.message || err);
    if (
      /file_required|only_txt_supported|file_empty|cipher_bad_format|multipart/i.test(
        msg
      )
    ) {
      return jsonError(res, 400, msg);
    }
    return jsonError(res, 500, "encrypt_failed");
  }
});

app.post("/api/decrypt", async (req, res) => {
  try {
    // if content-type doesn't include multipart/form-data treat as no file
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (!ct.includes("multipart/form-data")) {
      return jsonError(res, 400, "file_required");
    }

    const { fileBuf, fileInfo, fields } = await parseMultipart(req);

    const token = String(fields.token ?? "");
    if (!token) return jsonError(res, 400, "token_required");
    if (token.length !== 256) return jsonError(res, 400, "token_invalid");

    if (!fileBuf || !fileInfo) return jsonError(res, 400, "file_required");
    const filename = fileInfo.filename || "cipher.enc.txt";
    if (!/\.enc\.txt$/i.test(filename))
      return jsonError(res, 400, "only_enc_txt_supported");
    if (fileBuf.length === 0) return jsonError(res, 400, "file_empty");

    const key = deriveKeyFromToken(token);

    let plaintext;
    try {
      plaintext = aesGcmDecrypt(fileBuf, key);
    } catch {
      // mask detailed errors but keep 4xx
      return jsonError(res, 400, "cipher_bad_format");
    }

    const outName = filename.replace(/\.enc\.txt$/i, ".dec.txt");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${outName}"`);
    return res.status(200).send(plaintext);
  } catch (err) {
    const msg = String(err?.message || err);
    if (
      /file_required|only_enc_txt_supported|file_empty|token_required|token_invalid|cipher_bad_format|multipart/i.test(
        msg
      )
    ) {
      return jsonError(res, 400, msg);
    }
    return jsonError(res, 500, "decrypt_failed");
  }
});

// JSON 404 for any unknown route
app.use((req, res) => {
  // special-case GETs on the POST-only endpoints
  if (
    req.method === "GET" &&
    (req.path === "/api/encrypt" || req.path === "/api/decrypt")
  ) {
    return res.status(404).json({ ok: false, code: "method_not_allowed" });
  }
  return res.status(404).json({ ok: false, code: "not_found" });
});
