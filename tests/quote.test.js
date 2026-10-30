import { default as prueba } from "node:test";
import { default as comprobar } from "node:assert/strict";
import { access, readFile as leerArchivo } from "node:fs/promises";
import { crearMensajeCotizacion, crearUrlWhatsApp, SERVICIOS, NUMERO_WHATSAPP } from "../src/quote.js";
import { ELEMENTOS_GALERIA } from "../src/galeria.js";

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

prueba("ofrece los seis servicios vigentes sin lavado de fachadas", () => {
  comprobar.equal(SERVICIOS.length, 6);
  comprobar.ok(SERVICIOS.includes("Lavado de muebles"));
  comprobar.equal(SERVICIOS.includes("Lavado de fachadas"), false);
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

prueba("las tarjetas del catálogo filtran los servicios correctos", async () => {
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  const htmlTarjetasServicios = documentoHtml.split('<section class="seccion-resultados')[0];
  const tarjetas = [...htmlTarjetasServicios.matchAll(/data-servicio-galeria="([^"]+)"|data-servicios-galeria="([^"]+)"/g)];
  const serviciosAsociados = tarjetas.flatMap(([, servicioUnico, serviciosMultiples]) => (serviciosMultiples ?? servicioUnico).split("|"));
  comprobar.deepEqual(serviciosAsociados.sort(), [...SERVICIOS].sort());
  comprobar.doesNotMatch(htmlTarjetasServicios, /fachadas/i);
});

prueba("incluye 21 imágenes comparativas locales organizadas por servicio", async () => {
  comprobar.equal(ELEMENTOS_GALERIA.length, 21);
  for (const elemento of ELEMENTOS_GALERIA) {
    await access(new URL(`../assets/results/${elemento.imagen}`, import.meta.url));
    comprobar.ok(elemento.servicio.split("|").every((servicio) => SERVICIOS.includes(servicio)));
  }
  comprobar.ok(ELEMENTOS_GALERIA.filter((elemento) => elemento.servicio.includes("Lavado de muebles")).length >= 5);
  comprobar.ok(ELEMENTOS_GALERIA.filter((elemento) => elemento.servicio.includes("Lavado de colchones")).length >= 4);
  comprobar.equal(ELEMENTOS_GALERIA.some((elemento) => elemento.servicio.includes("fachadas")), false);
});

prueba("usa la imagen local suministrada como fondo de portada", async () => {
  const estilos = await leerArchivo(new URL("../styles.css", import.meta.url), "utf8");
  await access(new URL("../assets/images/Limpieza profesional de sofá en casa.png", import.meta.url));
  comprobar.match(estilos, /Limpieza profesional de sofá en casa\.png/);
});

prueba("no muestra formulario de cotización ni confirma citas automáticamente", async () => {
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  comprobar.doesNotMatch(documentoHtml, /<form\b|<select\b|<textarea\b/i);
  comprobar.doesNotMatch(documentoHtml, /cita confirmada|reserva confirmada|cita agendada/i);
});

prueba("incluye el visor accesible de comparativas con navegación y cuatro espacios mínimos", async () => {
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  const codigoFuente = await leerArchivo(new URL("../src/main.js", import.meta.url), "utf8");
  comprobar.match(documentoHtml, /<dialog class="visor-galeria"/);
  comprobar.match(documentoHtml, /class="[^"]*boton-anterior-galeria/);
  comprobar.match(documentoHtml, /class="[^"]*boton-siguiente-galeria/);
  comprobar.match(codigoFuente, /function abrirVisorGaleria/);
  comprobar.match(codigoFuente, /while \(imagenes\.length < 4\)/);
  comprobar.match(codigoFuente, /evento\.key === "ArrowLeft"/);
  comprobar.match(codigoFuente, /evento\.key === "ArrowRight"/);
});

prueba("crea tarjetas comparativas, filtra la categoría elegida y conserva sus resultados", async () => {
  const codigoFuente = await leerArchivo(new URL("../src/main.js", import.meta.url), "utf8");
  comprobar.match(codigoFuente, /function crearTarjetaResultado/);
  comprobar.match(codigoFuente, /galeriaResultados\.replaceChildren/);
  comprobar.match(codigoFuente, /function filtrarResultados\(servicios\)/);
  comprobar.match(codigoFuente, /tarjeta\.hidden = !estaVisible/);
  comprobar.match(codigoFuente, /imagenesPorServicio\.get\(servicio\)\.push\(elementoGaleria\)/);
});

prueba("incluye secciones adaptables para servicios, resultados, proceso e información", async () => {
  const documentoHtml = await leerArchivo(new URL("../index.html", import.meta.url), "utf8");
  for (const seccion of ["servicios", "resultados", "nosotros", "contacto"]) {
    comprobar.match(documentoHtml, new RegExp(`id="${seccion}"`));
    comprobar.match(documentoHtml, new RegExp(`href="#${seccion}"`));
  }
});
