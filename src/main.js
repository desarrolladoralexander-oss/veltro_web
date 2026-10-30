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
];

for (const ejemplo of ejemplosGaleria) {
  const urlImagen = `https://images.unsplash.com/${ejemplo.imagen}?auto=format&fit=crop&w=1000&q=85`;
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-resultado";
  tarjeta.dataset.serviciosResultado = ejemplo.servicio;
  tarjeta.innerHTML = `<div class="comparacion"><img class="comparacion-despues" src="${urlImagen}&sat=18" alt="${ejemplo.textoAlternativo} después del lavado" /><div class="comparacion-antes"><img src="${urlImagen}&sat=-70" alt="${ejemplo.textoAlternativo} antes del lavado" /></div><span class="etiqueta-comparacion etiqueta-antes">Antes</span><span class="etiqueta-comparacion etiqueta-despues">Después</span><input class="control-comparacion" type="range" min="0" max="100" value="50" aria-label="Comparar ${ejemplo.titulo} antes y después" /><span class="indicador-comparacion" aria-hidden="true">↔</span><button class="boton-ampliar-galeria" type="button" aria-label="Ampliar imágenes comparativas de ${ejemplo.titulo}">Ampliar</button></div><h3>${ejemplo.titulo}</h3><a class="cotizar-resultado" href="https://wa.me/573112337811" data-servicio-cotizacion="${ejemplo.servicio}" target="_blank" rel="noopener noreferrer">Cotizar este servicio <span aria-hidden="true">↗</span></a>`;
  galeriaResultados.append(tarjeta);
}

for (const tarjeta of galeriaResultados.querySelectorAll(".tarjeta-resultado")) {
  const serviciosDeTarjeta = tarjeta.dataset.serviciosResultado.split("|");
  const botonAmpliar = tarjeta.querySelector(".boton-ampliar-galeria");
  botonAmpliar.dataset.servicioVisor = serviciosDeTarjeta[0];

  if (serviciosDeTarjeta.length > 1) {
    botonAmpliar.textContent = "Alfombras";
    botonAmpliar.setAttribute("aria-label", "Ampliar imágenes comparativas de lavado de alfombras");
    const botonTapetes = botonAmpliar.cloneNode(true);
    botonTapetes.textContent = "Tapetes";
    botonTapetes.dataset.servicioVisor = serviciosDeTarjeta[1];
    botonTapetes.setAttribute("aria-label", "Ampliar imágenes comparativas de lavado de tapetes");
    botonAmpliar.after(botonTapetes);
  }
}

const visorGaleria = document.querySelector(".visor-galeria");
const tituloVisorGaleria = document.querySelector("#titulo-visor-galeria");
const contadorVisorGaleria = document.querySelector(".contador-visor-galeria");
const imagenAntesAmpliada = document.querySelector(".espacio-antes img");
const imagenDespuesAmpliada = document.querySelector(".espacio-despues img");
const avisoAntesPendiente = document.querySelector(".espacio-antes span");
const avisoDespuesPendiente = document.querySelector(".espacio-despues span");
const botonCerrarVisor = document.querySelector(".boton-cerrar-visor");
const botonImagenAnterior = document.querySelector(".boton-anterior-galeria");
const botonImagenSiguiente = document.querySelector(".boton-siguiente-galeria");
const selectorImagenesGaleria = document.querySelector(".selector-imagenes-galeria");
const imagenesPorServicio = new Map();
let servicioEnVisor = "";
let indiceImagenEnVisor = 0;
let elementoQueAbrioVisor = null;

for (const tarjeta of galeriaResultados.querySelectorAll(".tarjeta-resultado")) {
  const serviciosDeTarjeta = tarjeta.dataset.serviciosResultado.split("|");
  const imagenDespues = tarjeta.querySelector(".comparacion-despues");
  const imagenAntes = tarjeta.querySelector(".comparacion-antes img");
  const imagenInicial = {
    antes: imagenAntes.currentSrc || imagenAntes.src,
    despues: imagenDespues.currentSrc || imagenDespues.src,
    textoAlternativoAntes: imagenAntes.alt,
    textoAlternativoDespues: imagenDespues.alt,
  };

  for (const servicio of serviciosDeTarjeta) {
    if (!imagenesPorServicio.has(servicio)) {
      imagenesPorServicio.set(servicio, [
        imagenInicial,
        // Imagen 2: agrega aquí las rutas de las fotos del antes y del después.
        { antes: "", despues: "", textoAlternativo: `Comparación 2 de ${servicio}` },
        // Imagen 3: agrega aquí las rutas de las fotos del antes y del después.
        { antes: "", despues: "", textoAlternativo: `Comparación 3 de ${servicio}` },
        // Imagen 4: agrega aquí las rutas de las fotos del antes y del después.
        { antes: "", despues: "", textoAlternativo: `Comparación 4 de ${servicio}` },
      ]);
    }
  }
}

function mostrarImagenVisor(imagen, lado, avisoPendiente) {
  const elementoImagen = lado === "antes" ? imagenAntesAmpliada : imagenDespuesAmpliada;
  const rutaImagen = imagen[lado];
  elementoImagen.hidden = !rutaImagen;
  avisoPendiente.hidden = Boolean(rutaImagen);
  if (rutaImagen) {
    elementoImagen.src = rutaImagen;
    elementoImagen.alt = lado === "antes" ? imagen.textoAlternativoAntes : imagen.textoAlternativoDespues;
  } else {
    elementoImagen.removeAttribute("src");
    elementoImagen.alt = "";
  }
}

function actualizarVisorGaleria() {
  const imagenes = imagenesPorServicio.get(servicioEnVisor);
  const imagen = imagenes[indiceImagenEnVisor];
  tituloVisorGaleria.textContent = servicioEnVisor;
  contadorVisorGaleria.textContent = `Imagen ${indiceImagenEnVisor + 1} de ${imagenes.length}`;
  mostrarImagenVisor(imagen, "antes", avisoAntesPendiente);
  mostrarImagenVisor(imagen, "despues", avisoDespuesPendiente);
  selectorImagenesGaleria.replaceChildren();

  imagenes.forEach((_, indice) => {
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

function abrirVisorGaleria(servicio, elementoActivador) {
  servicioEnVisor = servicio;
  indiceImagenEnVisor = 0;
  elementoQueAbrioVisor = elementoActivador;
  actualizarVisorGaleria();
  visorGaleria.showModal();
  botonCerrarVisor.focus();
}

for (const botonAmpliar of document.querySelectorAll(".boton-ampliar-galeria")) {
  botonAmpliar.addEventListener("click", () => {
    abrirVisorGaleria(botonAmpliar.dataset.servicioVisor, botonAmpliar);
  });
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
  let posicionInicialControl = null;
  controlComparacion.addEventListener("pointerdown", (evento) => {
    posicionInicialControl = { x: evento.clientX, y: evento.clientY };
  });
  controlComparacion.addEventListener("pointercancel", () => {
    posicionInicialControl = null;
  });
  controlComparacion.addEventListener("click", (evento) => {
    if (!posicionInicialControl) return;
    const movimiento = Math.hypot(evento.clientX - posicionInicialControl.x, evento.clientY - posicionInicialControl.y);
    posicionInicialControl = null;
    if (movimiento < 6) {
      const tarjeta = comparacion.closest(".tarjeta-resultado");
      const servicio = tarjeta.dataset.serviciosResultado.split("|")[0];
      abrirVisorGaleria(servicio, controlComparacion);
    }
  });
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
