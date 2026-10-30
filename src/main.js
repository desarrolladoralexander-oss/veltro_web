import { createWhatsAppUrl } from "./quote.js";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

for (const link of document.querySelectorAll("[data-quote-service]")) {
  link.href = createWhatsAppUrl(link.dataset.quoteService);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

const gallery = document.querySelector(".results-grid");
const galleryExamples = [
  { service: "Lavado de comedores y sillas", title: "Comedores y sillas", image: "photo-1617806118233-18e1de247200", alt: "Sillas de comedor" },
  { service: "Lavado de tapetes", title: "Lavado de tapetes", image: "photo-1600166898405-da9535204843", alt: "Tapete" },
  { service: "Lavado de cojinería de carros", title: "Cojinería de carros", image: "photo-1507136566006-cfc505b114fc", alt: "Asientos de automóvil" },
  { service: "Lavado de fachadas", title: "Lavado de fachadas", image: "photo-1487958449943-2429e8be8625", alt: "Fachada de edificio" },
];

for (const example of galleryExamples) {
  const imageUrl = `https://images.unsplash.com/${example.image}?auto=format&fit=crop&w=1000&q=85`;
  const card = document.createElement("article");
  card.className = "result-card";
  card.dataset.resultServices = example.service;
  card.innerHTML = `<div class="comparison"><img class="comparison-after" src="${imageUrl}&sat=18" alt="${example.alt} después del lavado" /><div class="comparison-before"><img src="${imageUrl}&sat=-70" alt="${example.alt} antes del lavado" /></div><span class="comparison-label label-before">Antes</span><span class="comparison-label label-after">Después</span><input class="comparison-range" type="range" min="0" max="100" value="50" aria-label="Comparar ${example.title} antes y después" /><span class="comparison-handle" aria-hidden="true">↔</span></div><h3>${example.title}</h3><a class="result-quote" href="https://wa.me/573112337811" data-quote-service="${example.service}" target="_blank" rel="noopener noreferrer">Cotizar este servicio <span aria-hidden="true">↗</span></a>`;
  gallery.append(card);
}

const resultsTitle = document.querySelector("#results-title");
const resultsDescription = document.querySelector("#results-description");
const resultsReset = document.querySelector(".results-reset");

function filterResults(services) {
  const selected = new Set(services);
  let visibleCount = 0;
  for (const card of gallery.querySelectorAll(".result-card")) {
    const cardServices = card.dataset.resultServices.split("|");
    const isVisible = cardServices.some((service) => selected.has(service));
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  }
  const label = services.join(" y ");
  resultsTitle.textContent = `Antes y después: ${label}`;
  resultsDescription.textContent = `${visibleCount} resultado${visibleCount === 1 ? "" : "s"} de este servicio.`;
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
  resultsReset.hidden = true;
});

for (const comparison of document.querySelectorAll(".comparison")) {
  const range = comparison.querySelector(".comparison-range");
  const before = comparison.querySelector(".comparison-before");
  const handle = comparison.querySelector(".comparison-handle");
  range.addEventListener("input", () => {
    before.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
    handle.style.left = `${range.value}%`;
  });
}

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
