 
import { afterAll, describe, expect, it } from "vitest";
import { ONE_PIXEL_PNG, admin, anon, people, rand } from "./helpers.ts";

describe("storage bucket quiz-media", () => {
  const { A, B } = people();
  const bucket = (user: { db: any }) => user.db.storage.from("quiz-media");
  const mine = `${A.id}/${rand()}.png`;
  const others = `${B.id}/${rand()}.png`;
  const png = { contentType: "image/png" };

  afterAll(async () => {
    await admin.storage.from("quiz-media").remove([mine, others]);
  });

  it("the bucket is public with a 5 MB limit and image types only", async () => {
    const { data } = await admin.storage.getBucket("quiz-media");
    expect(data?.public).toBe(true);
    expect(data?.file_size_limit).toBe(5 * 1024 * 1024);
    expect([...(data?.allowed_mime_types ?? [])].sort()).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });

  it("a person can upload and list inside their own folder", async () => {
    const up = await bucket(A).upload(mine, ONE_PIXEL_PNG, png);
    expect(up.error).toBeNull();
    const { data } = await bucket(A).list(A.id);
    expect(data.map((f: any) => `${A.id}/${f.name}`)).toContain(mine);
  });

  it("anyone with the link can read a picture, but a stranger cannot list the folder", async () => {
    const { data: url } = anon.storage.from("quiz-media").getPublicUrl(mine);
    const res = await fetch(url.publicUrl);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const listed = await anon.storage.from("quiz-media").list(A.id);
    expect(listed.data ?? []).toHaveLength(0);
    // and another logged-in person cannot list it either
    expect((await bucket(B).list(A.id)).data ?? []).toHaveLength(0);
  });

  it("a person cannot upload into someone else's folder, nor at the top level", async () => {
    expect((await bucket(A).upload(others, ONE_PIXEL_PNG, png)).error).not.toBeNull();
    expect((await bucket(A).upload(`${rand()}.png`, ONE_PIXEL_PNG, png)).error).not.toBeNull();
    expect((await anon.storage.from("quiz-media").upload(`${A.id}/${rand()}.png`, ONE_PIXEL_PNG, png)).error).not.toBeNull();
  });

  it("rejects other file types and files over 5 MB", async () => {
    const text = await bucket(A).upload(`${A.id}/${rand()}.txt`, Buffer.from("hello"), { contentType: "text/plain" });
    expect(text.error).not.toBeNull();
    const big = await bucket(A).upload(`${A.id}/${rand()}.png`, Buffer.alloc(5 * 1024 * 1024 + 1), png);
    expect(big.error).not.toBeNull();
  });

  it("a person cannot delete or overwrite someone else's file, but can delete their own", async () => {
    const seeded = await admin.storage.from("quiz-media").upload(others, ONE_PIXEL_PNG, png);
    expect(seeded.error).toBeNull();

    await bucket(A).remove([others]);
    expect((await admin.storage.from("quiz-media").list(B.id)).data?.map((f) => f.name)).toContain(others.split("/")[1]);
    expect((await bucket(A).upload(others, ONE_PIXEL_PNG, { ...png, upsert: true })).error).not.toBeNull();

    const removed = await bucket(A).remove([mine]);
    expect(removed.error).toBeNull();
    expect((await admin.storage.from("quiz-media").list(A.id)).data?.map((f) => f.name) ?? []).not.toContain(mine.split("/")[1]);
  });
});
