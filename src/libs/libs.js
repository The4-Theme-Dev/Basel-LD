import Lenis from "lenis";
import { register } from "swiper/element/bundle";
register(); 

if (!window.__lenis) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.__lenis = new Lenis({
    duration: 1.1,
    smoothWheel: !reduceMotion,
    syncTouch: false,
  });

  const raf = (time) => {
    window.__lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}