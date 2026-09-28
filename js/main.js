import { products, formatPrice } from "./store-data.js";
import { createCart } from "./cart.js";
import { createModalController } from "./ui-modal.js";
import { createSakuraCanvas } from "./sakura-canvas.js";

const selectors = {
  grid: "[data-catalog-grid]",
  search: "[data-catalog-search]",
  sort: "[data-catalog-sort]",
  empty: "[data-catalog-empty]",
  results: "[data-results-count]",
  drawer: "[data-cart-drawer]",
  overlay: "[data-overlay]",
  toast: "[data-toast]"
};

const state = { category: "all", query: "", sort: "popular", toastTimer: 0 };

const toast = (message) => {
  const element = document.querySelector(selectors.toast);
  element.querySelector(".toast__message").textContent = message;
  element.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => element.classList.remove("is-visible"), 2800);
};

const cart = createCart({ onChange: () => cart.render?.(), onNotice: toast });
const modal = createModalController({ onNotice: toast });

function renderProducts() {
  const grid = document.querySelector(selectors.grid);
  const query = state.query.trim().toLocaleLowerCase("ru");
  let visibleProducts = products.filter((product) => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const searchable = [product.name, product.categoryLabel, product.description, ...product.tags].join(" ").toLocaleLowerCase("ru");
    return matchesCategory && searchable.includes(query);
  });

  if (state.sort === "price-asc") visibleProducts.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") visibleProducts.sort((a, b) => b.price - a.price);
  else if (state.sort === "name") visibleProducts.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  else visibleProducts.sort((a, b) => b.popularity - a.popularity);

  grid.replaceChildren();
  visibleProducts.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "sakura-card reveal is-revealed";
    card.style.setProperty("--art-bg", product.artBg);
    card.style.setProperty("--art-accent", product.artAccent);
    card.innerHTML = `
      <div class="sakura-card__art">
        <span class="sakura-card__badge">${product.badge}</span>
        <span class="sakura-card__symbol" aria-hidden="true">${product.symbol}</span>
        <span class="sakura-card__index">S / ${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="sakura-card__body">
        <div class="sakura-card__meta"><span>${product.categoryLabel}</span><span class="sakura-card__rating">★ ${product.rating.toFixed(1)}</span></div>
        <h3 class="sakura-card__title">${product.name}</h3>
        <p class="sakura-card__description">${product.description}</p>
        <div class="sakura-card__tags">${product.tags.map((tag) => `<span class="sakura-card__tag">${tag}</span>`).join("")}</div>
        <div class="sakura-card__footer"><span class="sakura-card__price">${formatPrice(product.price)}</span><button class="sakura-card__add" type="button" data-action="add-to-cart" data-product-id="${product.id}" aria-label="Добавить ${product.name} в корзину">+</button></div>
      </div>`;
    grid.append(card);
  });

  document.querySelector(selectors.empty).hidden = visibleProducts.length > 0;
  document.querySelector(selectors.results).textContent = `${visibleProducts.length} ${pluralize(visibleProducts.length, ["предложение", "предложения", "предложений"])}`;
}

function pluralize(number, forms) {
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  const mod10 = number % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function openCart() {
  document.querySelector(selectors.drawer).classList.add("is-open");
  document.querySelector(selectors.drawer).setAttribute("aria-hidden", "false");
  document.querySelector(selectors.overlay).classList.add("is-visible");
  document.body.classList.add("is-locked");
}

function closeCart() {
  document.querySelector(selectors.drawer).classList.remove("is-open");
  document.querySelector(selectors.drawer).setAttribute("aria-hidden", "true");
  document.querySelector(selectors.overlay).classList.remove("is-visible");
  if (!document.querySelector(".modal.is-open")) document.body.classList.remove("is-locked");
}

function handleClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement) {
    const { action } = actionElement.dataset;
    if (action === "add-to-cart") cart.add(actionElement.dataset.productId);
    if (action === "open-cart") openCart();
    if (action === "close-cart") closeCart();
    if (action === "continue-shopping") { closeCart(); document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" }); }
    if (action === "focus-search") { document.querySelector(selectors.search).focus(); document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" }); }
    if (action === "reset-catalog") {
      state.category = "all"; state.query = ""; state.sort = "popular";
      document.querySelector(selectors.search).value = "";
      document.querySelector(selectors.sort).value = "popular";
      document.querySelectorAll("[data-category]").forEach((button) => button.classList.toggle("is-active", button.dataset.category === "all"));
      renderProducts();
    }
    if (action === "toggle-mobile-menu") {
      const menu = document.querySelector("[data-mobile-navigation]");
      const isOpen = menu.classList.toggle("is-open");
      actionElement.setAttribute("aria-expanded", String(isOpen));
    }
    if (action === "checkout") {
      const snapshot = cart.getSnapshot();
      if (!snapshot.items.length) return;
      toast("Демо-заказ сформирован. Оплата и отправка не подключены.");
    }
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    document.querySelectorAll("[data-category]").forEach((button) => button.classList.toggle("is-active", button === categoryButton));
    renderProducts();
  }

  const cartControl = event.target.closest("[data-cart-action]");
  if (cartControl) {
    const { cartAction, productId } = cartControl.dataset;
    if (cartAction === "increase") cart.changeQuantity(productId, 1);
    if (cartAction === "decrease") cart.changeQuantity(productId, -1);
    if (cartAction === "remove") cart.remove(productId);
  }

  const modalTrigger = event.target.closest("[data-modal]");
  if (modalTrigger) modal.open(modalTrigger.dataset.modal);

  const mobileLink = event.target.closest("[data-mobile-navigation] a");
  if (mobileLink) {
    document.querySelector("[data-mobile-navigation]").classList.remove("is-open");
    document.querySelector("[data-action='toggle-mobile-menu']").setAttribute("aria-expanded", "false");
  }
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}

function initNavigationState() {
  const links = [...document.querySelectorAll(".main-navigation__link")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => observer.observe(section));
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const subject = encodeURIComponent(`Сообщение с сайта от ${formData.get("name")}`);
    const body = encodeURIComponent(`Имя: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`);
    status.textContent = "Откроется почтовое приложение с подготовленным сообщением. Сам сайт его не отправляет.";
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector(selectors.search).focus();
      document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" });
    }
    if (event.key === "Escape") closeCart();
  });
}

document.addEventListener("click", handleClick);
document.querySelector(selectors.search).addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});
document.querySelector(selectors.sort).addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

cart.render();
renderProducts();
initRevealAnimations();
initNavigationState();
initContactForm();
initKeyboardShortcuts();
createSakuraCanvas(document.querySelector("[data-sakura-canvas]"));
