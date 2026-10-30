import { createWhatsAppUrl } from "./quote.js";
import { GALLERY_ITEMS } from "./gallery.js";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const gallery = document.querySelector(".results-grid");
const resultsTitle = document.querySelector("#results-title");
const resultsDescription = document.querySelector("#results-description");
const resultsReset = document.querySelector(".results-reset");
const resultsEmpty = document.querySelector("#results-empty");

function makeResultCard(item) {
  const card = document.createElement("article");
  card.className = "result-card";
  card.dataset.resultServices = item.service;

  const preview = document.createElement("a");
  preview.className = "result-preview";
  preview.href = `assets/results/${item.image}`;
  preview.target = "_blank";
  preview.rel = "noopener noreferrer";
  preview.setAttribute("aria-label", `Abrir imagen: ${item.alt}`);

  const image = document.createElement("img");
  image.src = preview.href;
  image.alt = item.alt;
  image.loading = "lazy";
  preview.append(image);

  const title = document.createElement("h3");
  title.textContent = item.title;

  const quote = document.createElement("a");
  quote.className = "result-quote";
  quote.href = createWhatsAppUrl(item.service.split("|")[0]);
  quote.target = "_blank";
  quote.rel = "noopener noreferrer";
  quote.textContent = "Cotizar este servicio ↗";

  card.append(preview, title, quote);
  return card;
}

for (const item of GALLERY_ITEMS) gallery.append(makeResultCard(item));

function filterResults(services) {
  const selectedServices = new Set(services);
  let visibleCount = 0;

  for (const card of gallery.querySelectorAll(".result-card")) {
    const cardServices = card.dataset.resultServices.split("|");
    const isVisible = cardServices.some((service) => selectedServices.has(service));
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  }

  resultsTitle.textContent = `Antes y después: ${services.join(" y ")}`;
  resultsDescription.textContent = visibleCount
    ? `${visibleCount} resultados de este servicio.`
    : "Aún no tenemos fotos de este servicio. Escríbenos para cotizarlo.";
  resultsEmpty.hidden = visibleCount > 0;
  resultsReset.hidden = false;
}

for (const link of document.querySelectorAll("[data-gallery-service], [data-gallery-services]")) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const services = link.dataset.galleryServices?.split("|") ?? [link.dataset.galleryService];
    filterResults(services);
    document.querySelector("#resultados").scrollIntoView({ behavior: "smooth" });
  });
}

resultsReset.addEventListener("click", () => {
  for (const card of gallery.querySelectorAll(".result-card")) card.hidden = false;
  resultsTitle.textContent = "Resultados que se notan";
  resultsDescription.textContent = "Desliza cada control para comparar el antes y el después.";
  resultsEmpty.hidden = true;
  resultsReset.hidden = true;
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    mainNav.classList.remove("is-open");
  }
});
