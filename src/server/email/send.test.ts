import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const email = { to: "a@example.com", subject: "Hi", html: "<p>Hi</p>", replyTo: "b@example.com" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("sendEmail", () => {
  it("sends through Resend when there is a key, with the reply-to", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Quiz <hello@quiz.basrh.com>");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const { sendEmail } = await import("./send");
    expect(await sendEmail(email)).toEqual({ ok: true, via: "resend" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(init.body)).toMatchObject({ from: "Quiz <hello@quiz.basrh.com>", to: ["a@example.com"], reply_to: "b@example.com" });
  });

  it("falls back to the Mailtrap test inbox without a Resend key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "Quiz <hello@quiz.basrh.com>");
    vi.stubEnv("MAILTRAP_API_TOKEN", "tok");
    vi.stubEnv("MAILTRAP_INBOX_ID", "123");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const { sendEmail } = await import("./send");
    expect(await sendEmail(email)).toEqual({ ok: true, via: "mailtrap" });
    expect(fetchMock.mock.calls[0][0]).toBe("https://sandbox.api.mailtrap.io/api/send/123");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).from).toEqual({ name: "Quiz", email: "hello@quiz.basrh.com" });
  });

  it("reports a failure instead of pretending it was sent", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422 }));
    const { sendEmail } = await import("./send");
    expect(await sendEmail(email)).toEqual({ ok: false, error: "Resend answered 422" });
  });

  it("only skips when nothing is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("MAILTRAP_API_TOKEN", "");
    const { sendEmail } = await import("./send");
    expect(await sendEmail(email)).toEqual({ ok: true, via: "none" });
  });
});
