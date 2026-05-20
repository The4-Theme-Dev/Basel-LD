import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Slider, tab, accordion — không dùng GSAP scroll animation */
const BLOCKED_ANIMATION_SELECTOR = [
  "ethan-slider",
  "swiper-container",
  "swiper-slide",
  "ethan-tabs",
  ".ethan-tabs",
  ".tabs-content",
  ".tabs-list",
  ".tabs-content-item",
  "ethan-accordion",
  "ethan-accordion-group",
  ".accordion-wrap",
  ".accordion-btn",
  ".accordion-content",
  "features-layout",
].join(", ");

const isBlockedElement = (el) => Boolean(el?.closest(BLOCKED_ANIMATION_SELECTOR));

/** Không animate CTA trừ khi có data-gsap-reveal (opt-in từ Button) */
const isNonAnimatedElement = (el) => {
  if (el?.closest("[data-no-gsap]")) return true;
  if (el?.hasAttribute("data-gsap-reveal")) return false;
  return Boolean(el?.matches("a.btn, .btn, button, [role='button']"));
};

const isBlockedContainer = (el) =>
  Boolean(
    el?.matches(BLOCKED_ANIMATION_SELECTOR) ||
      el?.querySelector(BLOCKED_ANIMATION_SELECTOR)
  );

/** Chạy tất cả animation sau khi DOM + Lenis sẵn sàng */
export function initAnimations() {
  if (reduceMotion) {
    resetMotionTargets();
    return;
  }

  initScrollReveals();
  initStaggerContainers();
  initSectionHeadings();
  initSectionContent();
  ScrollTrigger.refresh();
}

/** Reveal từng element: data-gsap-reveal */
export function initScrollReveals() {
  gsap.utils.toArray("[data-gsap-reveal]").forEach((el) => {
    if (isBlockedElement(el) || isNonAnimatedElement(el)) return;
    const y = Number(el.dataset.gsapY ?? 40);
    const delay = Number(el.dataset.gsapDelay ?? 0) / 1000;
    const duration = Number(el.dataset.gsapDuration ?? 0.8);

    gsap.from(el, {
      y,
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: el,
        start: el.dataset.gsapStart ?? "top 85%",
        once: true,
        // markers: true,
      },
    });
  });
}

/** Stagger children: data-gsap-stagger trên container */
export function initStaggerContainers() {
  gsap.utils.toArray("[data-gsap-stagger]").forEach((container) => {
    if (isBlockedContainer(container)) return;

    const children = [...container.children].filter(
      (child) => !isBlockedElement(child) && !isNonAnimatedElement(child)
    );
    if (!children.length) return;

    const y = Number(container.dataset.gsapY ?? 24);
    const stagger = Number(container.dataset.gsapStagger ?? 0.08);
    const duration = Number(container.dataset.gsapDuration ?? 0.6);

    gsap.from(children, {
      y,
      opacity: 0,
      duration,
      stagger,
      ease: "power2.out",
      scrollTrigger: {
        trigger: container,
        start: container.dataset.gsapStart ?? "top 80%",
        once: true,
      },
    });
  });
}

/** Section heading: data-gsap-heading trên wrapper */
export function initSectionHeadings() {
  gsap.utils.toArray("[data-gsap-heading]").forEach((heading) => {
    const items = heading.querySelectorAll(":scope > :not(.spacer)");
    const filtered = [...items].filter(
      (item) => !isBlockedElement(item) && !isNonAnimatedElement(item)
    );
    if (!filtered.length) return;

    gsap.from(filtered, {
      y: 28,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: heading,
        start: heading.dataset.gsapStart ?? "top 85%",
        once: true,
      },
    });
  });
}

/** Block nội dung section: data-gsap-content */
export function initSectionContent() {
  gsap.utils.toArray("[data-gsap-content]").forEach((el) => {
    if (isBlockedContainer(el) || isBlockedElement(el)) return;
    const y = Number(el.dataset.gsapY ?? 32);
    const duration = Number(el.dataset.gsapDuration ?? 0.8);

    gsap.from(el, {
      y,
      opacity: 0,
      duration,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: el.dataset.gsapStart ?? "top 80%",
        once: true,
      },
    });
  });
}

function resetMotionTargets() {
  gsap.set(
    "[data-gsap-reveal], [data-gsap-stagger] > *, [data-gsap-heading] > :not(.spacer), [data-gsap-content], .btn[data-gsap-reveal]",
    {
      opacity: 1,
      y: 0,
      clearProps: "transform,opacity",
    }
  );
}

if (!customElements.get("ethan-tilt-card")) {
  customElements.define(
    "ethan-tilt-card",
    class EthanTiltCard extends HTMLElement {
      connectedCallback() {
        if (this._inited) return;
        this._inited = true;

        this._surface = this.firstElementChild;
        if (!this._surface) return;

        this._reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const noHover = window.matchMedia("(hover: none)").matches;
        if (this._reduceMotion || noHover) return;

        this._maxTilt = Number(this.getAttribute("max-tilt") ?? 10);
        this._smooth = Number(this.getAttribute("smooth") ?? 0.14);
        this._maxLift = Number(this.getAttribute("max-lift") ?? 16);

        this._currentRx = 0;
        this._currentRy = 0;
        this._targetRx = 0;
        this._targetRy = 0;
        this._raf = null;

        this._onEnter = () => {
          this.classList.add("is-tilt-active");
        };
        this._onLeave = () => {
          this.classList.remove("is-tilt-active");
          this._targetRx = 0;
          this._targetRy = 0;
          this.#scheduleTick();
        };
        this._onMove = (e) => {
          const rect = this.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const nx = (e.clientX - cx) / Math.max(rect.width / 2, 1);
          const ny = (e.clientY - cy) / Math.max(rect.height / 2, 1);
          this._targetRy = Math.max(-1, Math.min(1, nx)) * this._maxTilt;
          this._targetRx =
            -Math.max(-1, Math.min(1, ny)) * this._maxTilt;
          this.#scheduleTick();
        };

        this.addEventListener("pointerenter", this._onEnter);
        this.addEventListener("pointerleave", this._onLeave);
        this.addEventListener("pointermove", this._onMove);
      }

      disconnectedCallback() {
        this.removeEventListener("pointerenter", this._onEnter);
        this.removeEventListener("pointerleave", this._onLeave);
        this.removeEventListener("pointermove", this._onMove);
        if (this._raf) {
          cancelAnimationFrame(this._raf);
          this._raf = null;
        }
        if (this._surface) {
          this._surface.style.transform = "";
        }
      }

      #scheduleTick() {
        if (this._raf != null) return;
        const tick = () => {
          this._currentRx +=
            (this._targetRx - this._currentRx) * this._smooth;
          this._currentRy +=
            (this._targetRy - this._currentRy) * this._smooth;

          const dx = this._targetRx - this._currentRx;
          const dy = this._targetRy - this._currentRy;

          if (this._surface) {
            const tilt = Math.hypot(this._currentRx, this._currentRy);
            const z = Math.min(
              this._maxLift,
              (tilt / Math.max(this._maxTilt, 1)) * this._maxLift
            );
            this._surface.style.transform = `rotateX(${this._currentRx.toFixed(3)}deg) rotateY(${this._currentRy.toFixed(3)}deg) translateZ(${z.toFixed(2)}px)`;
          }

          const moving = Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02;

          if (moving) {
            this._raf = requestAnimationFrame(tick);
          } else {
            if (this._surface) {
              this._surface.style.transform = "";
            }
            this._currentRx = 0;
            this._currentRy = 0;
            this._raf = null;
          }
        };
        this._raf = requestAnimationFrame(tick);
      }
    }
  );
}
