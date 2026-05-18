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