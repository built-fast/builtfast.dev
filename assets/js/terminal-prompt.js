// Terminal prompt scramble effect using requestAnimationFrame
function terminalPrompt(text = 'dev') {
    return {
        targetText: text,
        chars: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`01',
        isHovering: false,
        isDimmed: false,
        initialized: false,
        animationId: null,
        dimTimeout: null,

        // Timing config (ms)
        timing: {
            charDelay: 120,
            scrambleDuration: 200,
            postTypePause: 300,
            glowDuration: 400,
            dimDelay: 1500,
            hoverScrambleDuration: 350,
            leaveDelay: 800
        },

        prefersReducedMotion() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        init() {
            if (this.initialized) return;
            this.initialized = true;

            // Skip animation for reduced motion preference
            if (this.prefersReducedMotion()) {
                this.showStatic();
                return;
            }

            this.$el.addEventListener('mouseenter', () => this.onHover());
            this.$el.addEventListener('mouseleave', () => this.onLeave());

            // Start intro animation
            requestAnimationFrame(() => this.playIntro());
        },

        showStatic() {
            const textEl = this.$refs.text;
            for (const char of this.targetText) {
                const span = document.createElement('span');
                span.className = 'prompt-char';
                span.textContent = char;
                textEl.appendChild(span);
            }
        },

        playIntro() {
            const textEl = this.$refs.text;
            const cursorEl = this.$refs.cursor;
            const totalChars = this.targetText.length;

            cursorEl.classList.add('solid');

            // Pre-create all character spans
            const spans = [];
            for (let i = 0; i < totalChars; i++) {
                const span = document.createElement('span');
                span.className = 'prompt-char';
                span.style.visibility = 'hidden';
                textEl.appendChild(span);
                spans.push(span);
            }

            const startTime = performance.now();
            const { charDelay, scrambleDuration, postTypePause, glowDuration, dimDelay } = this.timing;
            const totalTypeTime = totalChars * charDelay + scrambleDuration;
            const totalAnimTime = totalTypeTime + postTypePause + glowDuration + dimDelay;

            const animate = (now) => {
                const elapsed = now - startTime;

                // Animate each character
                for (let i = 0; i < totalChars; i++) {
                    const charStart = i * charDelay;
                    const charEnd = charStart + scrambleDuration;
                    const span = spans[i];

                    if (elapsed < charStart) {
                        // Not started yet
                        span.style.visibility = 'hidden';
                    } else if (elapsed < charEnd) {
                        // Scrambling
                        span.style.visibility = 'visible';
                        span.className = 'prompt-char scrambling';
                        span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
                    } else {
                        // Settled
                        span.style.visibility = 'visible';
                        span.className = 'prompt-char';
                        span.textContent = this.targetText[i];
                    }
                }

                // Post-type phases
                if (elapsed >= totalTypeTime && elapsed < totalTypeTime + postTypePause) {
                    cursorEl.classList.remove('solid');
                    cursorEl.classList.add('visible');
                }

                if (elapsed >= totalTypeTime + postTypePause && elapsed < totalTypeTime + postTypePause + glowDuration) {
                    textEl.classList.add('glow');
                } else {
                    textEl.classList.remove('glow');
                }

                // Continue or finish
                if (elapsed < totalAnimTime) {
                    this.animationId = requestAnimationFrame(animate);
                } else {
                    // Animation complete - dim if not hovering
                    if (!this.isHovering) {
                        this.dim();
                    }
                }
            };

            this.animationId = requestAnimationFrame(animate);
        },

        dim() {
            this.isDimmed = true;
            this.$el.classList.add('dimmed');
            this.$refs.cursor.classList.remove('visible');
        },

        undim() {
            this.isDimmed = false;
            this.$el.classList.remove('dimmed');
        },

        onHover() {
            this.isHovering = true;
            clearTimeout(this.dimTimeout);

            if (this.isDimmed) {
                this.undim();
                this.playHoverScramble();
            }
        },

        playHoverScramble() {
            const chars = this.$refs.text.querySelectorAll('.prompt-char');
            const startTime = performance.now();
            const duration = this.timing.hoverScrambleDuration;

            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);

                chars.forEach((span, i) => {
                    const target = this.targetText[i];
                    // Each char settles at different time
                    const settlePoint = (i + 1) / chars.length;

                    if (progress < settlePoint) {
                        span.className = 'prompt-char scrambling';
                        span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
                    } else {
                        span.className = 'prompt-char';
                        span.textContent = target;
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.$refs.cursor.classList.add('visible');
                }
            };

            requestAnimationFrame(animate);
        },

        onLeave() {
            this.isHovering = false;
            clearTimeout(this.dimTimeout);

            this.dimTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.dim();
                }
            }, this.timing.leaveDelay);
        },

        destroy() {
            if (this.animationId) cancelAnimationFrame(this.animationId);
            clearTimeout(this.dimTimeout);
        }
    };
}
