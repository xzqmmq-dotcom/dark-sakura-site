export function createModalController({ onNotice }) {
  const modal = document.querySelector("[data-modal-window='auth']");
  const message = modal.querySelector("[data-auth-message]");
  let lastFocusedElement = null;

  function open(name) {
    const target = document.querySelector(`[data-modal-window="${name}"]`);
    if (!target) return;
    lastFocusedElement = document.activeElement;
    target.classList.add("is-open");
    target.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    const firstInput = target.querySelector("input");
    window.setTimeout(() => firstInput?.focus(), 50);
  }

  function close(target = modal) {
    if (!target) return;
    target.classList.remove("is-open");
    target.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.is-open") && !document.querySelector(".cart-drawer.is-open")) {
      document.body.classList.remove("is-locked");
    }
    lastFocusedElement?.focus?.();
  }

  function selectTab(tabName) {
    modal.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      const active = tab.dataset.authTab === tabName;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    modal.querySelectorAll("[data-auth-form]").forEach((form) => {
      form.classList.toggle("is-active", form.dataset.authForm === tabName);
    });
    message.textContent = "";
  }

  modal.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-modal-close]");
    if (closeButton) close(modal);
    const tab = event.target.closest("[data-auth-tab]");
    if (tab) selectTab(tab.dataset.authTab);
    const socialButton = event.target.closest("[data-social-auth]");
    if (socialButton) {
      message.textContent = `Вход через ${socialButton.dataset.socialAuth} не подключён в демо-версии.`;
    }
  });

  modal.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-auth-form]");
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const mode = form.dataset.authForm === "login" ? "Вход" : "Регистрация";
    message.textContent = `${mode} проверен локально. Для настоящей авторизации нужен сервер.`;
    onNotice(`${mode}: демонстрационный режим`);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close(modal);
  });

  return { open, close, selectTab };
}
