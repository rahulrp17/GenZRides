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

  it("extra charges match Fare Notes (bata + night window)", async () => {
    const reply = await chat("is night driving charged");
    expect(reply).toMatch(/10 PM/);
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

  it("scheduled rides: 'Can I schedule a ride for later'", async () => {
    const reply = await chat("Can I schedule a ride for later");
    expect(reply).toMatch(/future date and time/i);
  });

  it("scheduled rides: 'I need a cab tomorrow at 8 AM'", async () => {
    const reply = await chat("I need a cab tomorrow at 8 AM");
    expect(reply).toMatch(/future date and time|advance/i);
  });

  it("fare explainer: 'How is the fare calculated'", async () => {
    const reply = await chat("How is the fare calculated");
    expect(reply).toMatch(/Base fare/);
    expect(reply).toMatch(/bata/i);
  });

  it("payment failure troubleshoots (not generic methods)", async () => {
    const reply = await chat("My payment failed");
    expect(reply).toMatch(/auto-voided|Payments/i);
    expect(reply).not.toMatch(/Payment Options/);
  });

  it("charged-but-incomplete mentions refunds", async () => {
    const reply = await chat("I was charged but my booking wasn't completed");
    expect(reply).toMatch(/5–7 working days/);
  });

  it("pay-after-arrival is confirmed", async () => {
    const reply = await chat("Can I pay after reaching the destination");
    expect(reply).toMatch(/after you reach/i);
  });

  it("problem report routes to support", async () => {
    const reply = await chat("I want to report a problem with my ride");
    expect(reply).toMatch(/\+91 93483 0199/);
  });

  it("lost item asks for booking ID", async () => {
    const reply = await chat("I left my phone in the cab");
    expect(reply).toMatch(/booking ID/i);
  });

  it("guest booking is explicit", async () => {
    const reply = await chat("Can I book a cab without creating an account");
    expect(reply).toMatch(/guest|no account/i);
  });

  it("round-trip fare question answers (not bare route prompt)", async () => {
    const reply = await chat("Does the fare change for round trips");
    expect(reply).toMatch(/both legs/i);
    expect(reply).toMatch(/Round-trip/);
  });

  it("tracking needs login", async () => {
    const reply = await chat("Where is my driver");
    expect(reply).toMatch(/log in/i);
  });

  it("status needs login", async () => {
    const reply = await chat("What is the status of my booking");
    expect(reply).toMatch(/log in/i);
  });

  it("airport beats vehicle words: 'Trichy Airport to the city' is travel, answered", async () => {
    const reply = await chat("I need a cab from Trichy Airport to the city");
    // Either airport info or a fare attempt — never the generic fleet list.
    expect(reply).not.toMatch(/Our Fleet/);
  });
});
