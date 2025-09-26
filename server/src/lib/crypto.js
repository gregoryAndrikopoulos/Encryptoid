import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

/** base64url helpers */
function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function fromB64url(s) {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/**
 * TOKEN FORMAT (192 bytes => 256 base64url chars):
 * [ 1B version | 1B algId | 2B flags | 32B key | 12B iv | 144B random pad ]
 *   version = 1, algId = 1 (aes-256-gcm), flags = 0 for now
 */
const TOKEN_BYTES = 192;
const VERSION = 1;
const ALG_AES_256_GCM = 1;

export function makeToken(key, iv) {
  const buf = Buffer.allocUnsafe(TOKEN_BYTES);
  let o = 0;
  buf.writeUInt8(VERSION, o++); // 1
  buf.writeUInt8(ALG_AES_256_GCM, o++); // 1
  buf.writeUInt16BE(0, o);
  o += 2; // flags (2)
  key.copy(buf, o);
  o += 32; // key
  iv.copy(buf, o);
  o += 12; // iv
  // fill remaining with random bytes
  randomBytes(TOKEN_BYTES - o).copy(buf, o);
  return b64url(buf); // length = 256 exactly
}

export function parseToken(token256) {
  if (typeof token256 !== "string" || token256.length !== 256) {
    throw new Error("bad_token_length");
  }
  const raw = fromB64url(token256);
  if (raw.length !== TOKEN_BYTES) throw new Error("bad_token_size");
  let o = 0;
  const version = raw.readUInt8(o++); // 1
  const algId = raw.readUInt8(o++); // 1
  const flags = raw.readUInt16BE(o);
  o += 2;

  if (version !== VERSION) throw new Error("bad_token_version");
  if (algId !== ALG_AES_256_GCM) throw new Error("bad_token_alg");

  const key = raw.subarray(o, o + 32);
  o += 32;
  const iv = raw.subarray(o, o + 12);
  // no need to bump `o` again; rest is ignored

  return { key, iv, flags };
}

/** AES-256-GCM core */
export function encryptBuffer(plainBuf) {
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plainBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  const ciphertext = Buffer.concat([enc, tag]);
  const token = makeToken(key, iv);
  return { ciphertext, token, key, iv };
}

export function decryptBuffer(cipherBuf, token256) {
  if (cipherBuf.length < 16) throw new Error("bad_ciphertext");
  const tag = cipherBuf.subarray(cipherBuf.length - 16);
  const enc = cipherBuf.subarray(0, cipherBuf.length - 16);
  const { key, iv } = parseToken(token256);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]);
  return { plain };
}
