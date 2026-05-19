if (!customElements.get("ethan-backtop")) {
  customElements.define(
    "ethan-backtop",
    class EthanBacktop extends HTMLElement {
      connectedCallback() {
        if (this._inited) return;
        this._inited = true;

        this._threshold = Math.max(
          0,
          Number(this.getAttribute("threshold") ?? 400)
        );
        this._reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        this._btn = this.querySelector(".backtop-btn");
        if (!this._btn) return;

        const hostLabel = this.getAttribute("aria-label");
        if (hostLabel && !this._btn.getAttribute("aria-label")) {
          this._btn.setAttribute("aria-label", hostLabel);
        }

        this._btn.hidden = true;
        this._onClickBound = this.#scrollToTop.bind(this);
        this._btn.addEventListener("click", this._onClickBound);

        this.#bindScroll();
        this.#onScroll();
      }

      disconnectedCallback() {
        this._btn?.removeEventListener("click", this._onClickBound);
        this._lenis?.off?.("scroll", this._onScrollBound);
        window.removeEventListener("scroll", this._onScrollBound);
      }

      #bindScroll() {
        this._onScrollBound = this.#onScroll.bind(this);
        this._lenis = window.__lenis;

        if (this._lenis?.on) {
          this._lenis.on("scroll", this._onScrollBound);
        } else {
          window.addEventListener("scroll", this._onScrollBound, {
            passive: true,
          });
        }
      }

      #getScrollY() {
        if (this._lenis) {
          return this._lenis.scroll ?? window.scrollY;
        }
        return window.scrollY;
      }

      #onScroll() {
        const visible = this.#getScrollY() > this._threshold;
        this.classList.toggle("is-visible", visible);
        if (this._btn) {
          this._btn.hidden = !visible;
        }
      }

      #scrollToTop() {
        const lenis = window.__lenis;
        if (lenis?.scrollTo) {
          lenis.scrollTo(0, {
            duration: this._reduceMotion ? 0 : 1.1,
            immediate: this._reduceMotion,
          });
          return;
        }

        window.scrollTo({
          top: 0,
          behavior: this._reduceMotion ? "auto" : "smooth",
        });
      }
    }
  );
}
