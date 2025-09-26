import { describe, it, expect } from "vitest";
import request from "supertest";
import { Readable } from "node:stream";
import { app } from "../src/app.js";

const asStreamFile = (buf, filename) => [Readable.from(buf), { filename }];

describe("Round trip: /api/encrypt → /api/decrypt", () => {
  it("returns original plaintext after decrypt", async () => {
    const plaintext = "Hello Encryptoid!";

    // Encrypt a .txt
    const enc = await request(app)
      .post("/api/encrypt")
      .attach(
        "file",
        ...asStreamFile(Buffer.from(plaintext, "utf8"), "note.txt")
      );

    expect(enc.status).toBe(200);
    expect(enc.type).toMatch(/json/);

    const { ok, token, filename, ciphertextB64 } = enc.body;
    expect(ok).toBe(true);
    expect(typeof token).toBe("string");
    expect(token.length).toBe(256);
    expect(filename).toBe("note.txt");
    expect(typeof ciphertextB64).toBe("string");
    expect(ciphertextB64.length).toBeGreaterThan(0);

    // Decrypt using token + encrypted bytes
    const encryptedBytes = Buffer.from(ciphertextB64, "base64"); // server returns standard base64
    const dec = await request(app)
      .post("/api/decrypt")
      .field("token", token)
      .attach("file", ...asStreamFile(encryptedBytes, "note.enc.txt"));

    expect(dec.status).toBe(200);
    expect(dec.headers["content-type"]).toMatch(/application\/octet-stream/);
    expect(dec.headers["content-disposition"]).toMatch(
      /filename=.*\.dec\.txt/i
    );
    expect(Buffer.isBuffer(dec.body)).toBe(true);
    expect(dec.body.toString("utf8")).toBe(plaintext);
  });
});
