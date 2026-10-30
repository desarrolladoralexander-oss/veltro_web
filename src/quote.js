export const NUMERO_WHATSAPP = "573112337811";

export const SERVICIOS = [
  "Lavado de muebles",
  "Lavado de colchones",
  "Lavado de comedores y sillas",
  "Lavado de alfombras",
  "Lavado de tapetes",
  "Lavado de cojinería de carros",
  "Lavado de fachadas",
];

export function crearMensajeCotizacion(servicio) {
  return [
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
}

export function crearUrlWhatsApp(servicio) {
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(crearMensajeCotizacion(servicio))}`;
}
