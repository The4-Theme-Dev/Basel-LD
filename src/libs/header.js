if (!customElements.get("ethan-header")) {
  customElements.define(
    "ethan-header",
    class EthanHeader extends HTMLElement {
      connectedCallback() {
        if (this._inited) return;
        this._inited = true;

        this._toggle = this.querySelector(".menu-mobile");
        this._drawer = this.querySelector(".nav-drawer");
        this._panel = this.querySelector(".nav-drawer-panel");
        this._overlay = this.querySelector(".nav-drawer-overlay");
        if (!this._toggle || !this._drawer || !this._panel) return;

        this._closeTargets = this.querySelectorAll("[data-drawer-close]");
        this._links = this._drawer.querySelectorAll(".nav-drawer-link");
        this._reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const durationRaw = getComputedStyle(this._panel).transitionDuration;
        const durationSec = parseFloat(durationRaw) || 0.4;
        this._duration = this._reduceMotion ? 0 : durationSec * 1000;

        this._onToggle = () => this.#toggleDrawer();
        this._onCloseClick = () => this.#closeDrawer();
        this._onLinkClick = () => this.#closeDrawer();
        this._onKeydown = (e) => {
          if (e.key === "Escape" && this.classList.contains("is-drawer-open")) {
            this.#closeDrawer();
          }
        };
        this._onPanelTransitionEnd = (e) => {
          if (!this._closing) return;
          if (e.target !== this._panel || e.propertyName !== "transform") return;
          this.#finishClose();
        };

        this._toggle.addEventListener("click", this._onToggle);
        document.addEventListener("keydown", this._onKeydown);
        this._panel.addEventListener("transitionend", this._onPanelTransitionEnd);

        this._closeTargets.forEach((el) => {
          el.addEventListener("click", this._onCloseClick);
        });
        this._links.forEach((link) => {
          link.addEventListener("click", this._onLinkClick);
        });
      }

      disconnectedCallback() {
        this._toggle?.removeEventListener("click", this._onToggle);
        document.removeEventListener("keydown", this._onKeydown);
        this._panel?.removeEventListener("transitionend", this._onPanelTransitionEnd);
        this._closeTimer && clearTimeout(this._closeTimer);
        this._closeTargets?.forEach((el) => {
          el.removeEventListener("click", this._onCloseClick);
        });
        this._links?.forEach((link) => {
          link.removeEventListener("click", this._onLinkClick);
        });
        this.#unlockScroll();
      }

      #toggleDrawer() {
        if (this.classList.contains("is-drawer-open")) {
          this.#closeDrawer();
        } else {
          this.#openDrawer();
        }
      }

      #openDrawer() {
        if (this._closing) return;

        this.classList.remove("is-drawer-closing");
        this._drawer.hidden = false;
        this._drawer.setAttribute("aria-hidden", "false");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.classList.add("is-drawer-open");
          });
        });

        this._toggle.setAttribute("aria-expanded", "true");
        this._toggle.setAttribute("aria-label", "Close navigation menu");
        document.body.classList.add("is-nav-drawer-open");
        window.__lenis?.stop?.();
        this._panel.focus();
      }

      #closeDrawer() {
        if (!this.classList.contains("is-drawer-open") || this._closing) return;

        this._closing = true;
        this.classList.remove("is-drawer-open");
        this.classList.add("is-drawer-closing");
        this._toggle.setAttribute("aria-expanded", "false");
        this._toggle.setAttribute("aria-label", "Open navigation menu");
        this.#unlockScroll();

        if (this._reduceMotion) {
          this.#finishClose();
          return;
        }

        this._panel.getBoundingClientRect();

        this._closeTimer = window.setTimeout(() => {
          if (this._closing) this.#finishClose();
        }, this._duration + 100);
      }

      #finishClose() {
        if (this._closeTimer) {
          clearTimeout(this._closeTimer);
          this._closeTimer = null;
        }

        this.classList.remove("is-drawer-closing");
        this._drawer.hidden = true;
        this._drawer.setAttribute("aria-hidden", "true");
        this._closing = false;
        this._toggle.focus();
      }

      #unlockScroll() {
        document.body.classList.remove("is-nav-drawer-open");
        window.__lenis?.start?.();
      }
    }
  );
}
