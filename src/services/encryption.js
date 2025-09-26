const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

async function postFormRaw(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    let code = `Request failed: ${res.status}`;
    try {
      const j = await res.clone().json();
      if (j && j.code) code = j.code;
    } catch {
      // continue regardless
    }
    throw new Error(code);
  }
  return res;
}

async function postFormJSON(path, formData) {
  const res = await postFormRaw(path, formData);
  return res.json();
}

// tiny base64 ->bytes helper
function base64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Encrypt: uploads plaintext file, receives JSON with token + ciphertextB64.
 * Returns { token, blob, filename } WITHOUT triggering download.
 */
export async function encryptFile(file) {
  const fd = new FormData();
  fd.append("file", file, file.name);

  const data = await postFormJSON("/api/encrypt", fd);
  // data: { ok, filename, plainSize, encSize, token, ciphertextB64 }

  const encName = file.name.endsWith(".txt")
    ? file.name.replace(/\.txt$/i, ".enc.txt")
    : `${file.name}.enc.txt`;

  const bytes = base64ToBytes(data.ciphertextB64);
  const blob = new Blob([bytes], { type: "application/octet-stream" });

  return { token: data.token, blob, filename: encName };
}

/**
 * Decrypt: uploads encrypted file + token, receives the plaintext as a blob.
 * Returns { blob, filename } WITHOUT triggering download.
 */
export async function decryptFile(file, token) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("token", token);

  const res = await postFormRaw("/api/decrypt", fd);

  // if backend returned JSON, it's an error response
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    throw new Error(data?.code || "decrypt_error");
  }

  const blob = await res.blob();

  // try to get a suggested filename from headers; fallback to *.dec.txt
  const dispo = res.headers.get("content-disposition") || "";
  const match = /filename="([^"]+)"/i.exec(dispo);
  const suggested =
    (match && match[1]) ||
    (file.name.toLowerCase().endsWith(".enc.txt")
      ? file.name.replace(/\.enc\.txt$/i, ".dec.txt")
      : file.name.replace(/\.txt$/i, ".dec.txt"));

  return { blob, filename: suggested };
}
