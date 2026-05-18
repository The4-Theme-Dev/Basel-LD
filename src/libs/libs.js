import Lenis from "lenis";
import { register } from "swiper/element/bundle";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAnimations } from "./animation.js";

register();
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!window.__lenis) {
  window.__lenis = new Lenis({
    duration: 1.1,
    smoothWheel: !reduceMotion,
    syncTouch: false,
    anchors: true,
  });

  window.__lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    window.__lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

const bootAnimations = () => initAnimations();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAnimations);
} else {
  bootAnimations();
}