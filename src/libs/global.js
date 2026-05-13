if (!customElements.get("ethan-accordion")) {
  class EthanAccordion extends HTMLElement {

    connectedCallback() {
      if (this._inited) return;
      this._inited = true;

      this.button = this.querySelector(".accordion-btn");
      this.content = this.querySelector(".accordion-content");
      if (!this.button || !this.content) return;

      this.onResize();
      this.setupEventListeners();
      const isOpen = this.hasAttribute("open");
      this.setOpen(isOpen, false);
    }

    get open() {
      return this.hasAttribute("open");
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }
    onResize(){
      if(window.innerWidth > 1025){
        // this.addEventListener('mouseenter', this.onClick.bind(this));
      }
    }
    setupEventListeners(){
      this.button?.addEventListener("click", this.onClick.bind(this));
      window.addEventListener("resize", this.onResize.bind(this));
    }
    removeEventListeners(){
      this.button?.removeEventListener("click", this.onClick.bind(this));
      window.removeEventListener("resize", this.onResize.bind(this));
    }
    onClick = (event) => {
      if(event.target === this && this.open)return;
      const expanded = this.button?.getAttribute("aria-expanded") === "true";
      this.setOpen(!expanded, true);
    };

    setOpen(open, emit = false) {
      if (!this.button || !this.content) return;

      this.button.setAttribute("aria-expanded", String(open));
      this.toggleAttribute("open", open);

      const el = this.content;

      if (open) {
        el.style.height = "0px";
        const target = el.scrollHeight;
        requestAnimationFrame(() => {
          el.style.height = `${target}px`;
        });

        const onEnd = () => {
          el.style.height = "auto";
          el.removeEventListener("transitionend", onEnd);
        };
        el.addEventListener("transitionend", onEnd);
      } else {
        const start = el.scrollHeight;
        el.style.height = `${start}px`;
        requestAnimationFrame(() => {
          el.style.height = "0px";
        });
      }

      if (emit && open) {
        this.dispatchEvent(
          new CustomEvent("accordion:open", { bubbles: true, detail: { item: this } })
        );
      }
    }

    close() {
      this.setOpen(false, false);
    }
  }

  customElements.define("ethan-accordion", EthanAccordion);
}

if (!customElements.get("ethan-accordion-group")) {
  customElements.define(
    "ethan-accordion-group",
    class extends HTMLElement {

      get ariaControls(){
        return this.getAttribute("aria-controls") || "";
      }
      get currentActive(){
        return this.querySelector('ethan-accordion[open]');
      }
      connectedCallback() {
        this.items = Array.from(this.querySelectorAll("ethan-accordion"));
        this.currentIndex = Math.max(0, this.items.findIndex((it) => it.hasAttribute("open")));
        if (this.currentIndex < 0) this.currentIndex = 0;

        this.intervalMs = Number(this.dataset.interval || 3000);
        this.autoplay = this.dataset.autoplay !== "false";
        this.isPaused = false;
        this.timer = null;

        this.onItemOpenRef = this.onItemOpen.bind(this);
        this.onMouseEnterRef = () => {
          this.isPaused = true;
          this.stopAuto();
        };
        this.onMouseLeaveRef = () => {
          this.isPaused = false;
          this.startAuto();
        };

        this.addEventListener("accordion:open", this.onItemOpenRef);
        this.addEventListener("mouseenter", this.onMouseEnterRef);
        this.addEventListener("mouseleave", this.onMouseLeaveRef);
        this.addEventListener("click", this.handleClick.bind(this));

        this.io = new IntersectionObserver(
          ([entry]) => {
            if (!this.autoplay) return;
            if (entry.isIntersecting && !this.isPaused) {
              this.startAuto();
            } else {
              this.stopAuto();
            }
          },
          { threshold: 0.35 }
        );
        this.io.observe(this);
      }

      disconnectedCallback() {
        this.removeEventListener("accordion:open", this.onItemOpenRef);
        this.removeEventListener("mouseenter", this.onMouseEnterRef);
        this.removeEventListener("mouseleave", this.onMouseLeaveRef);
        this.removeEventListener("click", this.handleClick.bind(this));
        this.stopAuto();
        this.io?.disconnect();
      }

      onItemOpen(event) {
        const current = event.detail?.item;
        if (!current) return;

        const items = this.items || [];
        this.currentIndex = items.indexOf(current);

        items.forEach((item) => {
          if (item === current) return;
          if (typeof item.close === "function") item.close();
        });
      }

      startAuto() {
        if (this.timer || !this.items?.length) return;
        this.timer = window.setInterval(() => {
          if (this.isPaused) return;
          this.next();
        }, this.intervalMs);
      }

      stopAuto() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
      }

      next() {
        if (!this.items?.length) return;
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        const nextItem = this.items[this.currentIndex];
        if (nextItem && typeof nextItem.setOpen === "function") {
          nextItem.setOpen(true, true);
          this.nextMedia(this.currentIndex);
        }
      }
      nextMedia(index){
        if(!this.ariaControls) return;

        let mediaContent = Array.from(document.getElementById(this.ariaControls).children || []);
        if(!mediaContent.length === 0) return;
        
        mediaContent.forEach(item => {
          item.classList.remove('is-active');
        })
        mediaContent[index].classList.add('is-active');
      }
      handleClick(event){
        event.preventDefault();
        let item = event.target.closest('ethan-accordion');
        console.log(event.target);
        

        if(item && event.target.tagName == 'BUTTON'){
          let currentIndex = Number(item.dataset.index);
          this.nextMedia(currentIndex);
        }
      }
    }
  );
}

// Slider
if (!customElements.get("ethan-slider")) {
  customElements.define(
    "ethan-slider",
    class extends HTMLElement {
      connectedCallback() {
        
        if (this._inited) return;
        this._inited = true;

        const swiper = this.querySelector("swiper-container");
        if (!swiper) return;

        if (typeof swiper.initialize !== "function") {
          console.warn("[ethan-slider] Swiper Element chưa register");
          return;
        }

        let config = {};
        try {
          config = JSON.parse(this.dataset.config || "{}");
        } catch (e) {
          console.warn("[ethan-slider] Invalid data-config JSON", e);
        }

        // Hover pause/resume cho marquee
        this._onEnter = () => swiper.swiper?.autoplay?.stop?.();
        this._onLeave = () => swiper.swiper?.autoplay?.start?.();

        Object.assign(swiper, config);
        swiper.initialize();

        if (config.autoplay) {
          this.addEventListener("mouseenter", this._onEnter);
          this.addEventListener("mouseleave", this._onLeave);
        }
      }

      disconnectedCallback() {
        if (this._onEnter) this.removeEventListener("mouseenter", this._onEnter);
        if (this._onLeave) this.removeEventListener("mouseleave", this._onLeave);
      }
    }
  );
}

if (!customElements.get("ethan-tabs")) {
  customElements.define(
    "ethan-tabs",
    class extends HTMLElement {
      constructor() {
        super();
        if (this._inited) return;
        this._inited = true;
        this.indicator = this.querySelector('[data-indicator]');
        this.btns = this.querySelectorAll('button');
        this.section = document.getElementById(this.sectionID);
        this.contents = this.section.querySelectorAll('[data-content-index]');

        this.rootTab = this.querySelector('.tabs-list');

      }
      get itemActive(){
        return Array.from(this.btns || []).find(
          (btn) => btn.getAttribute('aria-selected') === 'true'
        );
      }
      get rootRect(){
        return this.rootTab.getBoundingClientRect();
      }
      get initIndicatorPos(){
        return{
          width: this.itemActive.getBoundingClientRect().width,
          left: this.itemActive.getBoundingClientRect().left - this.rootRect.left,
        }
      }
      get sectionID(){
        return this.getAttribute('section-id') || '';
      }
      
      connectedCallback(){
        
        this.setupEventListeners();
        this.initIndicator(this.initIndicatorPos.width, this.initIndicatorPos.left);
      }
      disconnectedCallback(){
        this.removeEventListener('click', this.handleChangeTab.bind(this));
      }
      setupEventListeners(){
        this.addEventListener('click', this.handleChangeTab.bind(this));
        window.addEventListener('resize', () => {
          this.initIndicator(this.initIndicatorPos.width, this.initIndicatorPos.left);
        });
      }

      initIndicator(width,left){
        this.indicator.style.setProperty('--width', width + 'px');
        this.indicator.style.setProperty('--left', left + 'px');
      }

      handleChangeTab(e){
        e.preventDefault();
        if(e.target.hasAttribute('disabled') || e.target.tagName !== 'BUTTON') return;
        let t_index = e.target.dataset.tabIndex;
        this.deActiveBtn();
        this.activeBtn(t_index);
        this.deActiveContent();
        this.activeContent(t_index);
        this.initIndicator(this.initIndicatorPos.width, this.initIndicatorPos.left);
      }
      deActiveBtn(){
        Array.from(this.btns || []).forEach(btn => {
          btn.setAttribute('aria-selected', 'false');
        });
      }
      activeBtn(index){
        let t_btn = this.btns[index];
        if(!t_btn) return;
        t_btn.setAttribute('aria-selected', 'true');
      }
      deActiveContent(){
        Array.from(this.contents || []).forEach(content => {
          content.setAttribute('is-selected', 'false');
        });
      }
      activeContent(index){
        let t_content = this.contents[index];
        if(!t_content) return;
        t_content.setAttribute('is-selected', 'true');
      }
    }
  );
}

if (!customElements.get("ethan-lazy-video")) {
  customElements.define(
    "ethan-lazy-video",
    class extends HTMLElement {
      connectedCallback() {
        if (this._inited) return;
        this._inited = true;

        this.video = this.querySelector("video");
        
        if (!this.video) return;

        this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const threshold = Number(this.dataset.threshold || "0.25");

        if (this.reduceMotion) {
          this.video.removeAttribute("autoplay");
          return;
        }
        if(this.video.hasAttribute('autoplay')){
          this.#safeVideo(true);
        }

        this.#safeVideo(false);

        this._io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!this.video) return;
              if (entry.isIntersecting) {
                this.#safeVideo(entry.intersectionRatio);
                this._io.unobserve(this.video);
              } else {
                // this.#safeVideo(false);
              }
            });
          },
          { threshold: Number.isFinite(threshold) ? threshold : 0.25 }
        );

        this._io.observe(this);
      }
      disconnectedCallback() {
        this._io?.disconnect();
        this._io = null;
      }
      #safeVideo(state = true) {
        if (!this.video) return;
        if (state) {
          this.video.play().catch(() => {});
        } else {
          this.video.pause();
        }
      }
    }
  );
}