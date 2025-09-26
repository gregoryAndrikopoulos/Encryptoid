import { describe, it, expect } from "vitest";
import request from "supertest";
import { Readable } from "node:stream";
import { app } from "../src/app.js";

const randToken = () => "x".repeat(256);
const b64 = (s) => Buffer.from(s, "base64");
const asStreamFile = (buf, filename) => [Readable.from(buf), { filename }]; // for supertest .attach

describe("POST /api/decrypt", () => {
  it("400 when token missing", async () => {
    const r = await request(app)
      .post("/api/decrypt")
      .attach("file", ...asStreamFile(b64("AAAA"), "cipher.enc.txt"));

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("token_required");
  });

  it("400 when token invalid length", async () => {
    const r = await request(app)
      .post("/api/decrypt")
      .field("token", "short")
      .attach("file", ...asStreamFile(b64("AAAA"), "cipher.enc.txt"));

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("token_invalid");
  });

  it("400 when wrong file extension", async () => {
    const r = await request(app)
      .post("/api/decrypt")
      .field("token", randToken())
      .attach("file", ...asStreamFile(b64("AAAA"), "wrong.txt"));

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("only_enc_txt_supported");
  });

  it("4xx on tampered payload / wrong token (no stack leak)", async () => {
    const r = await request(app)
      .post("/api/decrypt")
      .field("token", randToken()) // not matching any real key
      .attach("file", ...asStreamFile(b64("AQIDBAUG"), "cipher.enc.txt"));

    expect(r.status).toBeGreaterThanOrEqual(400);
    expect(r.status).toBeLessThan(500);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(typeof r.body?.code).toBe("string");
    // guard against stack traces in JSON
    expect(JSON.stringify(r.body)).not.toMatch(/Error:|\sat /);
  });
});
