import Lenis from "lenis";
import { register } from "swiper/element/bundle";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAnimations } from "./animation.js";

register();
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Đồng bộ ScrollTrigger với scroll ảo của Lenis — tránh giật element khi cuộn */
function connectLenisScrollTrigger(lenis) {
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.documentElement.style.transform ? "transform" : "fixed",
  });

  ScrollTrigger.defaults({ scroller: document.documentElement });

  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.addEventListener("refresh", () => {
    lenis.resize();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

if (!window.__lenis) {
  window.__lenis = new Lenis({
    duration: 1.1,
    smoothWheel: !reduceMotion,
    syncTouch: false,
    anchors: true,
  });

  if (!reduceMotion) {
    connectLenisScrollTrigger(window.__lenis);
  }
}

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

const bootAnimations = () => {
  initAnimations();
  requestAnimationFrame(() => ScrollTrigger.refresh());
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAnimations);
} else {
  bootAnimations();
}

/** Recalc sau khi ảnh/font load — tránh layout shift làm trigger nhảy */
window.addEventListener("load", () => {
  window.__lenis?.resize();
  ScrollTrigger.refresh();
});

let resizeTimer;
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      window.__lenis?.resize();
      ScrollTrigger.refresh();
    }, 150);
  },
  { passive: true }
);
