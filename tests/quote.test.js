import test from "node:test";
import assert from "node:assert/strict";
import { buildQuoteMessage, createWhatsAppUrl, SERVICES, WHATSAPP_NUMBER } from "../src/quote.js";

const expectedMessage = (service) => [
  "¡Hola, equipo VELTRO! 👋",
  "Me gustaría solicitar una cotización personalizada para el siguiente servicio:",
  "",
  `🧼 *Servicio:* ${service}`,
  "📍 *Ubicación:* Por confirmar",
  "📏 *Cantidad o tamaño:* Por confirmar",
  "",
  "📸 Les compartiré fotografías para que puedan evaluar el trabajo y brindarme un presupuesto.",
  "",
  "Quedo atento(a) a la información y disponibilidad.",
  "",
  "¡Muchas gracias!",
].join("\n");

test("provides the seven requested services", () => {
  assert.deepEqual(SERVICES, [
    "Lavado de muebles",
    "Lavado de colchones",
    "Lavado de comedores y sillas",
    "Lavado de alfombras",
    "Lavado de tapetes",
    "Lavado de cojinería de carros",
    "Lavado de fachadas",
  ]);
});

test("creates the agreed personalized message for furniture cleaning", () => {
  assert.equal(buildQuoteMessage("Lavado de muebles"), expectedMessage("Lavado de muebles"));
});

test("includes the correct selected service in the message", () => {
  for (const service of SERVICES) assert.match(buildQuoteMessage(service), new RegExp(service));
});

test("preserves accents, emoji and WhatsApp formatting after URL encoding", () => {
  const url = new URL(createWhatsAppUrl("Lavado de cojinería de carros"));
  assert.equal(url.origin + url.pathname, `https://wa.me/${WHATSAPP_NUMBER}`);
  assert.equal(url.searchParams.get("text"), expectedMessage("Lavado de cojinería de carros"));
});

test("cards map to each service, including both rugs and mats", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const serviceCardsHtml = html.split('<section class="results-section')[0];
  const cards = [...serviceCardsHtml.matchAll(/data-gallery-service="([^"]+)"|data-gallery-services="([^"]+)"/g)];
  const mappedServices = cards.flatMap(([, single, multiple]) => (multiple ?? single).split("|"));
  assert.deepEqual(mappedServices.sort(), [...SERVICES].sort());
});

test("does not render a quote form or automatic appointment confirmation", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<form\b|<select\b|<textarea\b/i);
  assert.doesNotMatch(html, /<input\b(?![^>]*type="range")/i);
  assert.doesNotMatch(html, /cita confirmada|reserva confirmada|cita agendada/i);
});

test("renders accessible before and after comparisons with direct service links", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal((html.match(/class="comparison-range"/g) ?? []).length, 3);
  assert.equal((html.match(/class="comparison-label label-before"/g) ?? []).length, 3);
  assert.equal((html.match(/class="comparison-label label-after"/g) ?? []).length, 3);
  assert.match(html, /aria-label="Comparar sofá antes y después"/);
  assert.match(html, /class="result-quote" href="https:\/\/wa\.me\/573112337811"/);
});

test("service cards filter the before/after gallery by exact service", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.equal((html.match(/data-gallery-service=/g) ?? []).length, 5);
  assert.equal((html.match(/data-gallery-services=/g) ?? []).length, 1);
  assert.match(html, /id="results-title"/);
  assert.match(html, /class="results-reset"/);
  assert.match(source, /function filterResults\(services\)/);
  assert.match(source, /card\.dataset\.resultServices\.split\("\|"\)/);
  assert.match(source, /card\.hidden = !isVisible/);
});

test("provides responsive page sections for services, work results, process and company info", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const section of ["servicios", "resultados", "nosotros", "contacto"]) {
    assert.match(html, new RegExp(`id="${section}"`));
    assert.match(html, new RegExp(`href="#${section}"`));
  }
});
