if (!customElements.get("ethan-counter")) {
  customElements.define(
    "ethan-counter",
    class EthanCounter extends HTMLElement {
      static get observedAttributes() {
        return ["value"];
      }

      connectedCallback() {
        if (this._inited) return;
        this._inited = true;
        this._played = false;

        this.#readConfig();
        this.#buildDom();

        if (this._reduceMotion) {
          this.#setValue(this._target);
          return;
        }

        this.setAttribute("aria-live", "polite");
        this.#observe();
      }

      disconnectedCallback() {
        this.#stop();
        this._io?.disconnect();
        this._io = null;
      }

      attributeChangedCallback(name, _oldVal, newVal) {
        if (!this._inited || name !== "value" || newVal == null) return;
        this.#readConfig();
        this.#setValue(this._target);
      }

      #readConfig() {
        this._target = Math.max(0, Number(this.getAttribute("value") ?? 0));
        this._suffix = this.getAttribute("suffix") ?? "+";
        this._duration = Math.max(300, Number(this.getAttribute("duration") ?? 1800));
        this._threshold = Number(this.getAttribute("threshold") ?? 0.35);
        this._format = this.getAttribute("format");
        this._reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
      }

      #formatNumber(n) {
        const rounded = Math.round(n);
        if (this._format === "locale") {
          return rounded.toLocaleString("en-US");
        }
        return String(rounded);
      }

      #buildDom() {
        while (this.firstChild) {
          this.removeChild(this.firstChild);
        }
        this._valueNode = document.createTextNode("0");
        this._suffixNode = document.createTextNode(this._suffix);
        this.append(this._valueNode, this._suffixNode);
      }

      #setValue(n) {
        if (this._valueNode) {
          this._valueNode.textContent = this.#formatNumber(n);
        }
      }

      #observe() {
        this._io = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting || this._played) return;
            this._played = true;
            this.#animate();
            this._io?.disconnect();
          },
          { threshold: this._threshold }
        );
        this._io.observe(this);
      }

      #animate() {
        this.#stop();
        const to = this._target;
        const duration = this._duration;
        const start = performance.now();

        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - t) ** 3;
          this.#setValue(to * eased);
          if (t < 1) {
            this._raf = requestAnimationFrame(tick);
          } else {
            this.#setValue(to);
            this._raf = null;
          }
        };

        this._raf = requestAnimationFrame(tick);
      }

      #stop() {
        if (!this._raf) return;
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
    }
  );
}
