import { crearUrlWhatsApp } from "./quote.js";
import { ELEMENTOS_GALERIA } from "./galeria.js";

const botonMenu = document.querySelector(".boton-menu");
const navegacionPrincipal = document.querySelector("#navegacion-principal");
const galeriaResultados = document.querySelector(".rejilla-resultados");
const tituloResultados = document.querySelector("#titulo-resultados");
const descripcionResultados = document.querySelector("#descripcion-resultados");
const botonRestablecerResultados = document.querySelector(".restablecer-resultados");
const avisoResultadosVacios = document.querySelector("#resultados-vacios");
const visorGaleria = document.querySelector(".visor-galeria");
const tituloVisorGaleria = document.querySelector("#titulo-visor-galeria");
const contadorVisorGaleria = document.querySelector(".contador-visor-galeria");
const imagenAmpliada = document.querySelector(".espacio-despues img");
const avisoImagenPendiente = document.querySelector(".espacio-despues span");
const botonCerrarVisor = document.querySelector(".boton-cerrar-visor");
const botonImagenAnterior = document.querySelector(".boton-anterior-galeria");
const botonImagenSiguiente = document.querySelector(".boton-siguiente-galeria");
const selectorImagenesGaleria = document.querySelector(".selector-imagenes-galeria");

for (const enlace of document.querySelectorAll("[data-servicio-cotizacion]")) {
  enlace.href = crearUrlWhatsApp(enlace.dataset.servicioCotizacion);
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
}

function crearTarjetaResultado(elementoGaleria) {
  const servicios = elementoGaleria.servicio.split("|");
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-resultado";
  tarjeta.dataset.serviciosResultado = elementoGaleria.servicio;

  const botonPrevisualizacion = document.createElement("button");
  botonPrevisualizacion.className = "previsualizacion-resultado";
  botonPrevisualizacion.type = "button";
  botonPrevisualizacion.setAttribute("aria-label", `Ampliar comparación: ${elementoGaleria.textoAlternativo}`);
  botonPrevisualizacion.addEventListener("click", () => {
    const servicio = servicios.find((opcion) => serviciosSeleccionadosActuales.includes(opcion)) ?? servicios[0];
    abrirVisorGaleria(servicio, elementoGaleria, botonPrevisualizacion);
  });

  const imagen = document.createElement("img");
  imagen.src = `assets/results/${elementoGaleria.imagen}`;
  imagen.alt = elementoGaleria.textoAlternativo;
  imagen.loading = "lazy";
  botonPrevisualizacion.append(imagen);

  const titulo = document.createElement("h3");
  titulo.textContent = elementoGaleria.titulo;

  const enlaceCotizacion = document.createElement("a");
  enlaceCotizacion.className = "cotizar-resultado";
  enlaceCotizacion.href = crearUrlWhatsApp(servicios[0]);
  enlaceCotizacion.target = "_blank";
  enlaceCotizacion.rel = "noopener noreferrer";
  enlaceCotizacion.textContent = "Cotizar este servicio ↗";

  tarjeta.append(botonPrevisualizacion, titulo, enlaceCotizacion);
  return tarjeta;
}

galeriaResultados.replaceChildren(...ELEMENTOS_GALERIA.map(crearTarjetaResultado));

function filtrarResultados(servicios) {
  const serviciosSeleccionados = new Set(servicios);
  serviciosSeleccionadosActuales = servicios;
  let cantidadVisible = 0;

  for (const tarjeta of galeriaResultados.querySelectorAll(".tarjeta-resultado")) {
    const serviciosTarjeta = tarjeta.dataset.serviciosResultado.split("|");
    const estaVisible = serviciosTarjeta.some((servicio) => serviciosSeleccionados.has(servicio));
    tarjeta.hidden = !estaVisible;
    if (estaVisible) cantidadVisible += 1;
  }

  tituloResultados.textContent = `Antes y después: ${servicios.join(" y ")}`;
  descripcionResultados.textContent = cantidadVisible
    ? `${cantidadVisible} resultados de este servicio.`
    : "Aún no tenemos fotos de este servicio. Escríbenos para cotizarlo.";
  avisoResultadosVacios.hidden = cantidadVisible > 0;
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
  serviciosSeleccionadosActuales = [];
  tituloResultados.textContent = "Resultados que se notan";
  descripcionResultados.textContent = "Mira nuestros trabajos de antes y después.";
  avisoResultadosVacios.hidden = true;
  botonRestablecerResultados.hidden = true;
});

const imagenesPorServicio = new Map();
let serviciosSeleccionadosActuales = [];
for (const elementoGaleria of ELEMENTOS_GALERIA) {
  for (const servicio of elementoGaleria.servicio.split("|")) {
    if (!imagenesPorServicio.has(servicio)) imagenesPorServicio.set(servicio, []);
    imagenesPorServicio.get(servicio).push(elementoGaleria);
  }
}

let servicioEnVisor = "";
let indiceImagenEnVisor = 0;
let elementoQueAbrioVisor = null;

function actualizarVisorGaleria() {
  const imagenes = imagenesPorServicio.get(servicioEnVisor);
  const imagenActual = imagenes[indiceImagenEnVisor];
  tituloVisorGaleria.textContent = servicioEnVisor;
  contadorVisorGaleria.textContent = `Imagen ${indiceImagenEnVisor + 1} de ${imagenes.length}`;
  imagenAmpliada.hidden = !imagenActual.imagen;
  avisoImagenPendiente.hidden = Boolean(imagenActual.imagen);

  if (imagenActual.imagen) {
    imagenAmpliada.src = `assets/results/${imagenActual.imagen}`;
    imagenAmpliada.alt = imagenActual.textoAlternativo;
  } else {
    imagenAmpliada.removeAttribute("src");
    imagenAmpliada.alt = "";
  }

  selectorImagenesGaleria.replaceChildren();
  imagenes.forEach((elemento, indice) => {
    const botonImagen = document.createElement("button");
    botonImagen.className = "punto-imagen-galeria";
    botonImagen.type = "button";
    botonImagen.setAttribute("aria-label", `Ver imagen ${indice + 1} de ${servicioEnVisor}`);
    botonImagen.setAttribute("aria-current", String(indice === indiceImagenEnVisor));
    botonImagen.addEventListener("click", () => {
      indiceImagenEnVisor = indice;
      actualizarVisorGaleria();
    });
    selectorImagenesGaleria.append(botonImagen);
  });
}

function moverVisorGaleria(direccion) {
  const cantidadImagenes = imagenesPorServicio.get(servicioEnVisor).length;
  indiceImagenEnVisor = (indiceImagenEnVisor + direccion + cantidadImagenes) % cantidadImagenes;
  actualizarVisorGaleria();
}

function abrirVisorGaleria(servicio, imagenInicial, elementoActivador) {
  servicioEnVisor = servicio;
  const imagenes = imagenesPorServicio.get(servicio);
  indiceImagenEnVisor = imagenInicial ? imagenes.indexOf(imagenInicial) : 0;
  if (indiceImagenEnVisor < 0) indiceImagenEnVisor = 0;

  // Mantiene cuatro posiciones para servicios con menos fotos, listas para agregar nuevas rutas.
  while (imagenes.length < 4) {
    imagenes.push({
      imagen: "",
      titulo: `Imagen ${imagenes.length + 1} pendiente`,
      textoAlternativo: `Comparación pendiente de ${servicio}`,
      servicio,
    });
  }

  elementoQueAbrioVisor = elementoActivador;
  actualizarVisorGaleria();
  visorGaleria.showModal();
  botonCerrarVisor.focus();
}

botonCerrarVisor.addEventListener("click", () => visorGaleria.close());
botonImagenAnterior.addEventListener("click", () => moverVisorGaleria(-1));
botonImagenSiguiente.addEventListener("click", () => moverVisorGaleria(1));
visorGaleria.addEventListener("click", (evento) => {
  if (evento.target === visorGaleria) visorGaleria.close();
});
visorGaleria.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft") {
    evento.preventDefault();
    moverVisorGaleria(-1);
  } else if (evento.key === "ArrowRight") {
    evento.preventDefault();
    moverVisorGaleria(1);
  }
});
visorGaleria.addEventListener("close", () => {
  if (elementoQueAbrioVisor?.isConnected) elementoQueAbrioVisor.focus();
});

const escenarioVisorGaleria = document.querySelector(".escenario-visor-galeria");
let posicionInicialDeslizamiento = null;
escenarioVisorGaleria.addEventListener("pointerdown", (evento) => {
  if (evento.target.closest(".boton-navegacion-galeria")) return;
  posicionInicialDeslizamiento = evento.clientX;
});
escenarioVisorGaleria.addEventListener("pointerup", (evento) => {
  if (posicionInicialDeslizamiento === null) return;
  const desplazamiento = evento.clientX - posicionInicialDeslizamiento;
  posicionInicialDeslizamiento = null;
  if (evento.target.closest(".boton-navegacion-galeria")) return;
  if (Math.abs(desplazamiento) > 50) moverVisorGaleria(desplazamiento > 0 ? -1 : 1);
});
escenarioVisorGaleria.addEventListener("pointercancel", () => {
  posicionInicialDeslizamiento = null;
});

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
