import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("misc endpoints", () => {
  it("GET /healthz is ok", async () => {
    const r = await request(app).get("/healthz");
    expect(r.status).toBe(200);
    // Server returns { ok: true, service: "...", ts: <number> }
    expect(r.body).toMatchObject({ ok: true });
    expect(typeof r.body.service).toBe("string");
    expect(typeof r.body.ts).toBe("number");
  });

  it("unknown route 404 JSON", async () => {
    const r = await request(app).get("/nope");
    expect(r.status).toBe(404);
    expect(r.type).toMatch(/json/);
    expect(r.body).toMatchObject({ ok: false, code: "not_found" });
  });

  it("GET on encrypt not allowed (404/405)", async () => {
    const r = await request(app).get("/api/encrypt");
    expect([404, 405]).toContain(r.status);
  });

  it("GET on decrypt not allowed (404/405)", async () => {
    const r = await request(app).get("/api/decrypt");
    expect([404, 405]).toContain(r.status);
  });
});
