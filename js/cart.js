import { products, formatPrice } from "./store-data.js";

const STORAGE_KEY = "dark-sakura-cart-v1";

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) && item.quantity > 0
    );
  } catch {
    return [];
  }
}

export function createCart({ onChange, onNotice }) {
  let items = readSavedCart();

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Storage may be unavailable. */ }
    onChange(getSnapshot());
  };

  function getSnapshot() {
    const detailedItems = items.map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return { ...product, quantity: item.quantity, subtotal: product.price * item.quantity };
    });
    return {
      items: detailedItems,
      count: detailedItems.reduce((sum, item) => sum + item.quantity, 0),
      total: detailedItems.reduce((sum, item) => sum + item.subtotal, 0)
    };
  }

  function add(id) {
    const product = products.find((entry) => entry.id === id);
    if (!product) return;
    const existing = items.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else items.push({ id, quantity: 1 });
    persist();
    onNotice(`${product.name} добавлен в корзину`);
  }

  function changeQuantity(id, delta) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) items = items.filter((entry) => entry.id !== id);
    persist();
  }

  function remove(id) {
    const product = products.find((entry) => entry.id === id);
    items = items.filter((item) => item.id !== id);
    persist();
    if (product) onNotice(`${product.name} удалён из корзины`);
  }

  function clear() {
    items = [];
    persist();
  }

  function render() {
    const snapshot = getSnapshot();
    const countNodes = document.querySelectorAll("[data-cart-count]");
    countNodes.forEach((node) => { node.textContent = snapshot.count; });
    document.querySelector("[data-cart-heading-count]").textContent = `(${snapshot.count})`;
    document.querySelector("[data-cart-total]").textContent = formatPrice(snapshot.total);

    const list = document.querySelector("[data-cart-items]");
    const empty = document.querySelector("[data-cart-empty]");
    list.replaceChildren();
    empty.classList.toggle("is-visible", snapshot.items.length === 0);
    list.hidden = snapshot.items.length === 0;
    document.querySelector("[data-action='checkout']").disabled = snapshot.items.length === 0;

    snapshot.items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "cart-item";
      article.innerHTML = `
        <div class="cart-item__art" style="--art-bg:${item.artBg};--art-accent:${item.artAccent}" aria-hidden="true">${item.symbol}</div>
        <div class="cart-item__info">
          <h3>${item.name}</h3>
          <p>${formatPrice(item.price)} / шт.</p>
          <div class="cart-item__controls" aria-label="Количество">
            <button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Уменьшить количество">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <div class="cart-item__side">
          <strong class="cart-item__price">${formatPrice(item.subtotal)}</strong>
          <button class="cart-item__remove" type="button" data-cart-action="remove" data-product-id="${item.id}">Удалить</button>
        </div>`;
      list.append(article);
    });
  }

  return { add, changeQuantity, remove, clear, getSnapshot, render };
}
