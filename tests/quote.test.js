import { default as prueba } from "node:test";
import { default as comprobar } from "node:assert/strict";
import { crearMensajeCotizacion, crearUrlWhatsApp, SERVICIOS, NUMERO_WHATSAPP } from "../src/quote.js";

const mensajeEsperado = (servicio) => [
  "¡Hola, equipo VELTRO! 👋",
  "Me gustaría solicitar una cotización personalizada para el siguiente servicio:",
  "",
  `🧼 *Servicio:* ${servicio}`,
  "📍 *Ubicación:* Por confirmar",
  "📏 *Cantidad o tamaño:* Por confirmar",
  "",
  "📸 Les compartiré fotografías para que puedan evaluar el trabajo y brindarme un presupuesto.",
  "",
  "Quedo atento(a) a la información y disponibilidad.",
  "",
  "¡Muchas gracias!",
].join("\n");

prueba("ofrece los siete servicios solicitados", () => {
  comprobar.deepEqual(SERVICIOS, [
    "Lavado de muebles",
    "Lavado de colchones",
    "Lavado de comedores y sillas",
    "Lavado de alfombras",
    "Lavado de tapetes",
    "Lavado de cojinería de carros",
    "Lavado de fachadas",
  ]);
});

prueba("crea el mensaje personalizado acordado para el lavado de muebles", () => {
  comprobar.equal(crearMensajeCotizacion("Lavado de muebles"), mensajeEsperado("Lavado de muebles"));
});

prueba("incluye el servicio elegido en el mensaje", () => {
  for (const servicio of SERVICIOS) comprobar.match(crearMensajeCotizacion(servicio), new RegExp(servicio));
});

prueba("conserva tildes, emojis y formato de WhatsApp al codificar la dirección", () => {
  const direccion = new URL(crearUrlWhatsApp("Lavado de cojinería de carros"));
  comprobar.equal(direccion.origin + direccion.pathname, `https://wa.me/${NUMERO_WHATSAPP}`);
  comprobar.equal(direccion.searchParams.get("text"), mensajeEsperado("Lavado de cojinería de carros"));
});

prueba("las tarjetas de servicio se relacionan con todos los servicios", async () => {
  const { readFile: leerArchivo } = await import("node:fs/promises");
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  const htmlTarjetasServicios = documentoHtml.split('<section class="seccion-resultados')[0];
  const tarjetas = [...htmlTarjetasServicios.matchAll(/data-servicio-galeria="([^"]+)"|data-servicios-galeria="([^"]+)"/g)];
  const serviciosAsociados = tarjetas.flatMap(([, servicioUnico, serviciosMultiples]) => (serviciosMultiples ?? servicioUnico).split("|"));
  comprobar.deepEqual(serviciosAsociados.sort(), [...SERVICIOS].sort());
});

prueba("no muestra un formulario de cotización ni confirma citas automáticamente", async () => {
  const { readFile: leerArchivo } = await import("node:fs/promises");
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  comprobar.doesNotMatch(documentoHtml, /<form\b|<select\b|<textarea\b/i);
  comprobar.doesNotMatch(documentoHtml, /<input\b(?![^>]*type="range")/i);
  comprobar.doesNotMatch(documentoHtml, /cita confirmada|reserva confirmada|cita agendada/i);
});

prueba("muestra comparaciones accesibles con enlaces directos a cada servicio", async () => {
  const { readFile: leerArchivo } = await import("node:fs/promises");
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  comprobar.equal((documentoHtml.match(/class="control-comparacion"/g) ?? []).length, 3);
  comprobar.equal((documentoHtml.match(/class="etiqueta-comparacion etiqueta-antes"/g) ?? []).length, 3);
  comprobar.equal((documentoHtml.match(/class="etiqueta-comparacion etiqueta-despues"/g) ?? []).length, 3);
  comprobar.match(documentoHtml, /aria-label="Comparar sofá antes y después"/);
  comprobar.match(documentoHtml, /class="cotizar-resultado" href="https:\/\/wa\.me\/573112337811"/);
});

prueba("las tarjetas filtran la galería por servicio exacto", async () => {
  const { readFile: leerArchivo } = await import("node:fs/promises");
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  const codigoFuente = await leerArchivo(new URL("../src/main.js", import.meta.url), "utf8");
  comprobar.equal((documentoHtml.match(/data-servicio-galeria=/g) ?? []).length, 5);
  comprobar.equal((documentoHtml.match(/data-servicios-galeria=/g) ?? []).length, 1);
  comprobar.match(documentoHtml, /id="titulo-resultados"/);
  comprobar.match(documentoHtml, /class="restablecer-resultados"/);
  comprobar.match(codigoFuente, /function filtrarResultados\(servicios\)/);
  comprobar.match(codigoFuente, /tarjeta\.dataset\.serviciosResultado\.split\("\|"\)/);
  comprobar.match(codigoFuente, /tarjeta\.hidden = !estaVisible/);
});

prueba("incluye secciones adaptables para servicios, resultados, proceso e información", async () => {
  const { readFile: leerArchivo } = await import("node:fs/promises");
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  for (const seccion of ["servicios", "resultados", "nosotros", "contacto"]) {
    comprobar.match(documentoHtml, new RegExp(`id="${seccion}"`));
    comprobar.match(documentoHtml, new RegExp(`href="#${seccion}"`));
  }
});
