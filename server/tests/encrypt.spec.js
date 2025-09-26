import { describe, it, expect } from "vitest";
import request from "supertest";
import { Readable } from "node:stream";
import { app } from "../src/app.js";

const asStreamFile = (buf, filename) => [Readable.from(buf), { filename }];

describe("POST /api/encrypt", () => {
  it("400 when file is missing", async () => {
    const r = await request(app).post("/api/encrypt");

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("file_required");
  });

  it("400 on empty .txt", async () => {
    const r = await request(app)
      .post("/api/encrypt")
      .attach("file", ...asStreamFile(Buffer.alloc(0), "empty.txt"));

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("file_empty");
  });

  it("400 on non-.txt", async () => {
    const r = await request(app)
      .post("/api/encrypt")
      .attach("file", ...asStreamFile(Buffer.from("xx"), "image.png"));

    expect(r.status).toBe(400);
    expect(r.type).toMatch(/json/);
    expect(r.body?.ok).toBe(false);
    expect(r.body?.code).toBe("only_txt_supported");
  });

  it("200 success returns expected JSON shape", async () => {
    const r = await request(app)
      .post("/api/encrypt")
      .attach("file", ...asStreamFile(Buffer.from("hello"), "doc.txt"));

    expect(r.status).toBe(200);
    expect(r.type).toMatch(/json/);

    const b = r.body;
    expect(b.ok).toBe(true);
    expect(typeof b.token).toBe("string");
    expect(b.token.length).toBe(256);
    expect(b.filename).toBe("doc.txt");
    expect(typeof b.ciphertextB64).toBe("string");
    expect(typeof b.plainSize).toBe("number");
    expect(typeof b.encSize).toBe("number");
    // guard against leaking stack traces in success payloads
    expect(JSON.stringify(b)).not.toMatch(/Error:|\sat /);
  });
});
