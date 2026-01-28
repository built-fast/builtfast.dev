/**
 * Hero Scramble Effect
 *
 * Alpine.js component for hero text scramble animation.
 * Supports single text or array of texts that cycle.
 */
function heroScramble(text = 'Developers.', options = {}) {
  const defaults = {
    animateOnLoad: true,
    cycle: false,
    cycleDelay: 3000
  };
  const opts = typeof options === 'boolean'
    ? { ...defaults, animateOnLoad: options }
    : { ...defaults, ...options };

  const texts = Array.isArray(text) ? text : [text];
  // Half-width katakana (Matrix-style) + digits + punctuation
  const chars = 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789!@#$%^&*+-=[]{}|;:<>?/~';
  const charsLen = chars.length;
  const charDelay = 60;
  const scrambleDuration = 100;

  return {
    currentIndex: 0,
    initialized: false,
    animationId: null,
    cycleTimeoutId: null,

    get targetText() {
      return texts[this.currentIndex];
    },

    init() {
      if (this.initialized) return;
      this.initialized = true;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        this.showStatic();
        if (opts.cycle && texts.length > 1) {
          this.cycleTimeoutId = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % texts.length;
            this.showStatic();
          }, opts.cycleDelay);
        }
        return;
      }

      if (opts.animateOnLoad) {
        this.playScramble();
      } else {
        this.showStatic();
        this.scheduleCycle();
      }
    },

    showStatic() {
      const text = this.targetText;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'hero-char';
        span.textContent = text[i];
        frag.appendChild(span);
      }
      this.$el.textContent = '';
      this.$el.appendChild(frag);
    },

    scheduleCycle() {
      if (!opts.cycle || texts.length <= 1) return;
      this.cycleTimeoutId = setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % texts.length;
        this.playScramble();
      }, opts.cycleDelay);
    },

    playScramble() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.cycleTimeoutId) {
        clearTimeout(this.cycleTimeoutId);
        this.cycleTimeoutId = null;
      }

      const text = this.targetText;
      const len = text.length;

      // Pre-create all spans
      const frag = document.createDocumentFragment();
      const spans = new Array(len);
      for (let i = 0; i < len; i++) {
        const span = document.createElement('span');
        span.className = 'hero-char';
        spans[i] = span;
        frag.appendChild(span);
      }
      this.$el.textContent = '';
      this.$el.appendChild(frag);

      // State: 0 = waiting, 1 = scrambling, 2 = done
      const state = new Uint8Array(len);

      // Pre-compute timing
      const timings = new Array(len);
      for (let i = 0; i < len; i++) {
        timings[i] = { start: i * charDelay, end: i * charDelay + scrambleDuration };
      }
      const totalTime = len * charDelay + scrambleDuration;

      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;

        for (let i = 0; i < len; i++) {
          if (state[i] === 2) continue;

          const { start, end } = timings[i];

          if (elapsed < start) continue;

          if (elapsed < end) {
            if (state[i] === 0) {
              state[i] = 1;
              spans[i].classList.add('scrambling');
            }
            spans[i].textContent = chars[(Math.random() * charsLen) | 0];
          } else if (state[i] !== 2) {
            state[i] = 2;
            spans[i].classList.remove('scrambling');
            spans[i].textContent = text[i];
          }
        }

        if (elapsed < totalTime) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.animationId = null;
          this.scheduleCycle();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    }
  };
}
