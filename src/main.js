import { crearUrlWhatsApp } from "./quote.js";

const botonMenu = document.querySelector(".boton-menu");
const navegacionPrincipal = document.querySelector("#navegacion-principal");

for (const enlace of document.querySelectorAll("[data-servicio-cotizacion]")) {
  enlace.href = crearUrlWhatsApp(enlace.dataset.servicioCotizacion);
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
}

const galeriaResultados = document.querySelector(".rejilla-resultados");
const ejemplosGaleria = [
  { servicio: "Lavado de comedores y sillas", titulo: "Comedores y sillas", imagen: "photo-1617806118233-18e1de247200", textoAlternativo: "Sillas de comedor" },
  { servicio: "Lavado de tapetes", titulo: "Lavado de tapetes", imagen: "photo-1600166898405-da9535204843", textoAlternativo: "Tapete" },
  { servicio: "Lavado de cojinería de carros", titulo: "Cojinería de carros", imagen: "photo-1507136566006-cfc505b114fc", textoAlternativo: "Asientos de automóvil" },
  { servicio: "Lavado de fachadas", titulo: "Lavado de fachadas", imagen: "photo-1487958449943-2429e8be8625", textoAlternativo: "Fachada de edificio" },
];

for (const ejemplo of ejemplosGaleria) {
  const urlImagen = `https://images.unsplash.com/${ejemplo.imagen}?auto=format&fit=crop&w=1000&q=85`;
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-resultado";
  tarjeta.dataset.serviciosResultado = ejemplo.servicio;
  tarjeta.innerHTML = `<div class="comparacion"><img class="comparacion-despues" src="${urlImagen}&sat=18" alt="${ejemplo.textoAlternativo} después del lavado" /><div class="comparacion-antes"><img src="${urlImagen}&sat=-70" alt="${ejemplo.textoAlternativo} antes del lavado" /></div><span class="etiqueta-comparacion etiqueta-antes">Antes</span><span class="etiqueta-comparacion etiqueta-despues">Después</span><input class="control-comparacion" type="range" min="0" max="100" value="50" aria-label="Comparar ${ejemplo.titulo} antes y después" /><span class="indicador-comparacion" aria-hidden="true">↔</span></div><h3>${ejemplo.titulo}</h3><a class="cotizar-resultado" href="https://wa.me/573112337811" data-servicio-cotizacion="${ejemplo.servicio}" target="_blank" rel="noopener noreferrer">Cotizar este servicio <span aria-hidden="true">↗</span></a>`;
  galeriaResultados.append(tarjeta);
}

const tituloResultados = document.querySelector("#titulo-resultados");
const descripcionResultados = document.querySelector("#descripcion-resultados");
const botonRestablecerResultados = document.querySelector(".restablecer-resultados");

function filtrarResultados(servicios) {
  const serviciosSeleccionados = new Set(servicios);
  let cantidadVisible = 0;
  for (const tarjeta of galeriaResultados.querySelectorAll(".tarjeta-resultado")) {
    const serviciosTarjeta = tarjeta.dataset.serviciosResultado.split("|");
    const estaVisible = serviciosTarjeta.some((servicio) => serviciosSeleccionados.has(servicio));
    tarjeta.hidden = !estaVisible;
    if (estaVisible) cantidadVisible += 1;
  }
  const etiqueta = servicios.join(" y ");
  tituloResultados.textContent = `Antes y después: ${etiqueta}`;
  descripcionResultados.textContent = `${cantidadVisible} resultado${cantidadVisible === 1 ? "" : "s"} de este servicio.`;
  botonRestablecerResultados.hidden = false;
}

for (const enlace of document.querySelectorAll("[data-servicio-galeria], [data-servicios-galeria]")) {
  enlace.addEventListener("click", (evento) => {
    evento.preventDefault();
    const servicios = enlace.dataset.serviciosGaleria?.split("|") ?? [enlace.dataset.servicioGaleria];
    filtrarResultados(servicios);
    document.querySelector("#resultados").scrollIntoView({ behavior: "smooth" });
  });
}

botonRestablecerResultados.addEventListener("click", () => {
  for (const tarjeta of galeriaResultados.querySelectorAll(".tarjeta-resultado")) tarjeta.hidden = false;
  tituloResultados.textContent = "Resultados que se notan";
  descripcionResultados.textContent = "Desliza cada control para comparar el antes y el después.";
  botonRestablecerResultados.hidden = true;
});

for (const comparacion of document.querySelectorAll(".comparacion")) {
  const controlComparacion = comparacion.querySelector(".control-comparacion");
  const capaAntes = comparacion.querySelector(".comparacion-antes");
  const indicadorComparacion = comparacion.querySelector(".indicador-comparacion");
  controlComparacion.addEventListener("input", () => {
    capaAntes.style.clipPath = `inset(0 ${100 - controlComparacion.value}% 0 0)`;
    indicadorComparacion.style.left = `${controlComparacion.value}%`;
  });
}

botonMenu.addEventListener("click", () => {
  const menuAbierto = botonMenu.getAttribute("aria-expanded") === "true";
  botonMenu.setAttribute("aria-expanded", String(!menuAbierto));
  botonMenu.setAttribute("aria-label", menuAbierto ? "Abrir menú" : "Cerrar menú");
  navegacionPrincipal.classList.toggle("esta-abierto", !menuAbierto);
});
navegacionPrincipal.addEventListener("click", (evento) => {
  if (evento.target.closest("a")) {
    botonMenu.setAttribute("aria-expanded", "false");
    botonMenu.setAttribute("aria-label", "Abrir menú");
    navegacionPrincipal.classList.remove("esta-abierto");
  }
});
