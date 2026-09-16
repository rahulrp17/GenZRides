import { jest } from "@jest/globals";

// No OpenRouter key in test env → deterministic fallback router.
// These branches are pure (no DB, no HTTP) except vehicles/fare/route.
delete process.env.OPENROUTER_API_KEY;

const { chat } = await import("../src/services/aiAssistant.service.js");

describe("AI assistant knows the project (fallback router)", () => {
  it("answers airport pickup instead of fleet: 'is airport pickup available'", async () => {
    const reply = await chat("is airport pickup available");
    expect(reply).toMatch(/airport pickup/i);
    expect(reply).toMatch(/MAA/);
    expect(reply).not.toMatch(/Our Fleet/);
  });

  it("greeting prefix does not hijack: 'hey, is airport pickup available'", async () => {
    const reply = await chat("hey, is airport pickup available");
    expect(reply).toMatch(/airport pickup/i);
    expect(reply).not.toMatch(/Our Fleet/);
  });

  it("short greeting still greets", async () => {
    expect(await chat("hi")).toMatch(/Welcome to \*\*GenZRides\*\*/);
  });

  it("cancellation matches the Information page (free before start, 5–7 day refunds)", async () => {
    const reply = await chat("what is your cancellation policy");
    expect(reply).toMatch(/Free cancellation/);
    expect(reply).toMatch(/5–7 working days/);
    expect(reply).not.toMatch(/10%/);
  });

  it("extra charges match Fare Notes (bata ₹400, night 11 PM)", async () => {
    const reply = await chat("is night driving charged");
    expect(reply).toMatch(/11 PM/);
    const bata = await chat("what is driver bata");
    expect(bata).toMatch(/₹400\/day/);
  });

  it("contact gives the real helpline", async () => {
    const reply = await chat("how do I contact support");
    expect(reply).toMatch(/\+91 93483 0199/);
    expect(reply).toMatch(/support@genzrides\.com/);
  });

  it("outstation question explains trip types", async () => {
    const reply = await chat("do you do outstation trips");
    expect(reply).toMatch(/One-way/);
    expect(reply).toMatch(/Round-trip/);
  });

  it("thanks-with-content is not swallowed: 'thanks, what is the fare'", async () => {
    const reply = await chat("thanks, what is the fare");
    expect(reply).not.toMatch(/You're welcome/);
    expect(reply).toMatch(/tell me your route/i);
  });

  it("bare 'thanks' still thanks", async () => {
    expect(await chat("thanks")).toMatch(/You're welcome/);
  });
});
