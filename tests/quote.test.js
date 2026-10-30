import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { buildQuoteMessage, createWhatsAppUrl, SERVICES, WHATSAPP_NUMBER } from "../src/quote.js";
import { GALLERY_ITEMS } from "../src/gallery.js";

test("provides the seven requested services", () => {
  assert.equal(SERVICES.length, 7);
  assert.ok(SERVICES.includes("Lavado de muebles"));
  assert.ok(SERVICES.includes("Lavado de fachadas"));
});

test("creates the agreed furniture quote message and requests photos", () => {
  const message = buildQuoteMessage("Lavado de muebles");
  assert.match(message, /\*Servicio:\* Lavado de muebles/);
  assert.match(message, /\*Ubicaci\u00f3n:\* Por confirmar/);
  assert.match(message, /\*Cantidad o tama\u00f1o:\* Por confirmar/);
  assert.match(message, /fotograf\u00edas/);
});

test("creates a correctly encoded WhatsApp link for the official phone", () => {
  const url = new URL(createWhatsAppUrl("Lavado de muebles"));
  assert.equal(url.origin + url.pathname, `https://wa.me/${WHATSAPP_NUMBER}`);
  assert.equal(url.searchParams.get("text"), buildQuoteMessage("Lavado de muebles"));
});

test("maps service cards to the selected gallery category", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const serviceCards = html.split('<section class="results-section')[0];
  assert.equal((serviceCards.match(/data-gallery-service=/g) ?? []).length, 5);
  assert.equal((serviceCards.match(/data-gallery-services=/g) ?? []).length, 1);
  assert.match(source, /function filterResults\(services\)/);
  assert.match(source, /card\.hidden = !isVisible/);
});

test("contains optimized local before-and-after images for available services", async () => {
  assert.equal(GALLERY_ITEMS.length, 21);
  for (const item of GALLERY_ITEMS) await access(new URL(`../assets/results/${item.image}`, import.meta.url));
  assert.ok(GALLERY_ITEMS.filter((item) => item.service.includes("Lavado de muebles")).length >= 5);
  assert.ok(GALLERY_ITEMS.filter((item) => item.service.includes("Lavado de colchones")).length >= 3);
  assert.ok(GALLERY_ITEMS.filter((item) => item.service.includes("Lavado de alfombras")).length >= 3);
  assert.ok(GALLERY_ITEMS.filter((item) => item.service.includes("Lavado de cojinería de carros")).length >= 3);
  assert.equal(GALLERY_ITEMS.some((item) => item.service.includes("Lavado de fachadas")), false);
});

test("does not show a quote form or automatically confirm appointments", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<form\b|<input\b|<select\b|<textarea\b/i);
  assert.doesNotMatch(html, /cita confirmada|reserva confirmada|cita agendada/i);
});

test("uses the supplied sofa-cleaning photo as the hero background", async () => {
  const { readFile, access } = await import("node:fs/promises");
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const imagePath = "../assets/images/Limpieza profesional de sofá en casa.png";
  await access(new URL(imagePath, import.meta.url));
  assert.match(css, /Limpieza profesional de sofá en casa\.png/);
});
