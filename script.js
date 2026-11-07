"use strict";

    const CAMPAIGNS = {
      game: {
        name: "BeamNG.drive",
        url: "https://zrzutka.pl/xz22x3"
      },
      vd: {
        name: "12 500 V-Dolców",
        url: "https://pomagam.pl/9y7mhn"
      }
    };

    const state = {
      selectedGoal: "game",
      selectedAmount: 99
    };

    const elements = {
      chosenLabel: document.getElementById("chosen-label"),
      donateButton: document.getElementById("donate-button"),
      customAmount: document.getElementById("custom-amount"),
      toast: document.getElementById("toast"),
      backTop: document.getElementById("back-top")
    };

    let toastTimer;

    function showToast(message) {
      elements.toast.textContent = message;
      elements.toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2800);
    }

    function selectGoal(goalKey) {
      if (!Object.hasOwn(CAMPAIGNS, goalKey)) return;
      state.selectedGoal = goalKey;
      const campaign = CAMPAIGNS[goalKey];

      document.querySelectorAll(".goal-card").forEach((card) => {
        card.classList.toggle("selected", card.id === `card-${goalKey}`);
      });
      document.querySelectorAll(".select-goal").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.goal === goalKey));
      });

      elements.chosenLabel.innerHTML = `<span aria-hidden="true">✓</span> Wybrano: ${campaign.name}`;
      elements.donateButton.textContent = `Przejdź do zbiórki: ${campaign.name} ↗`;
    }

    async function copyText(value) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = value;
          textArea.setAttribute("readonly", "");
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.select();
          const copied = document.execCommand("copy");
          textArea.remove();
          if (!copied) throw new Error("Kopiowanie niedostępne");
        }
        showToast("Link skopiowany do schowka.");
      } catch (error) {
        showToast("Nie udało się skopiować. Otwórz zbiórkę przyciskiem obok.");
      }
    }

    document.querySelectorAll(".select-goal").forEach((button) => {
      button.addEventListener("click", () => {
        selectGoal(button.dataset.goal);
        document.getElementById("wplata").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    document.querySelectorAll(".copy-goal").forEach((button) => {
      button.addEventListener("click", () => {
        const campaign = CAMPAIGNS[button.dataset.goal];
        if (campaign) copyText(campaign.url);
      });
    });

    document.querySelectorAll(".amount").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedAmount = Number(button.dataset.amount);
        elements.customAmount.value = "";
        document.querySelectorAll(".amount").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
      });
    });

    elements.customAmount.addEventListener("input", () => {
      const value = Number(elements.customAmount.value);
      state.selectedAmount = Number.isFinite(value) && value > 0 && value <= 100000 ? value : 0;
      document.querySelectorAll(".amount").forEach((button) => button.setAttribute("aria-pressed", "false"));
    });

    elements.donateButton.addEventListener("click", () => {
      const campaign = CAMPAIGNS[state.selectedGoal];
      const enteredValue = elements.customAmount.value.trim();
      if (enteredValue && (!Number.isFinite(Number(enteredValue)) || Number(enteredValue) <= 0 || Number(enteredValue) > 100000)) {
        showToast("Wpisz prawidłową kwotę większą od 0 zł.");
        elements.customAmount.focus();
        return;
      }
      if (!campaign || !/^https:\/\//i.test(campaign.url)) {
        showToast("Link do tej zbiórki jest nieprawidłowy.");
        return;
      }
      window.open(campaign.url, "_blank", "noopener,noreferrer");
      showToast("Otwieram zbiórkę. Kwotę ustawisz już na stronie serwisu.");
    });

    document.getElementById("share-page").addEventListener("click", async () => {
      const shareData = { title: document.title, text: "Zobacz dwie zbiórki: BeamNG.drive i V-Dolce.", url: window.location.href };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await copyText(window.location.href);
        }
      } catch (error) {
        if (error && error.name !== "AbortError") showToast("Nie udało się udostępnić strony.");
      }
    });

    window.addEventListener("scroll", () => {
      elements.backTop.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });

    document.getElementById("year").textContent = new Date().getFullYear();
    selectGoal("game");
