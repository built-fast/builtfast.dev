/**
 * Terminal Prompt Scramble Effect
 *
 * Alpine.js component for the logo prompt animation.
 * Uses requestAnimationFrame for smooth performance.
 */
function terminalPrompt(text = 'dev') {
  return {
    targetText: text,
    chars: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`01',
    isHovering: false,
    isDimmed: false,
    initialized: false,
    animationId: null,
    dimTimeout: null,
    hoverCount: 0,
    explosionCount: 0,
    isExploding: false,

    // Timing config (ms)
    timing: {
      hoverScrambleDuration: 350,
      leaveDelay: 800
    },

    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    isLightMode() {
      return Alpine?.store?.('theme')?.value === 'light';
    },

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Show text immediately in dimmed state
      this.showStatic();
      this.dim();
    },

    destroy() {
      this.cancelAnimation();
      if (this.dimTimeout) {
        clearTimeout(this.dimTimeout);
        this.dimTimeout = null;
      }
    },

    getSpans() {
      return this.$refs.text ? this.$refs.text.querySelectorAll('.prompt-char') : [];
    },

    showStatic() {
      const textEl = this.$refs.text;
      if (!textEl) return;

      textEl.innerHTML = '';
      for (const char of this.targetText) {
        const span = document.createElement('span');
        span.className = 'prompt-char';
        span.textContent = char;
        textEl.appendChild(span);
      }
    },

    dim() {
      this.isDimmed = true;
      this.$el.classList.add('dimmed');
      if (this.$refs.cursor) {
        this.$refs.cursor.classList.remove('visible', 'solid');
        this.$refs.cursor.style.filter = 'none';
      }
    },

    undim() {
      this.isDimmed = false;
      this.$el.classList.remove('dimmed');
      if (this.$refs.cursor) {
        this.$refs.cursor.style.filter = '';
      }
    },

    onHover() {
      if (this.isExploding) return;
      if (this.prefersReducedMotion()) {
        this.undim();
        return;
      }

      this.isHovering = true;
      if (this.dimTimeout) {
        clearTimeout(this.dimTimeout);
        this.dimTimeout = null;
      }

      if (this.isDimmed) {
        this.hoverCount++;
        this.undim();

        if (this.hoverCount >= 5) {
          this.hoverCount = 0;
          this.playExplosion();
        } else {
          this.playHoverScramble();
        }
      }
    },

    onLeave() {
      if (this.isExploding) return;

      this.isHovering = false;
      if (this.dimTimeout) {
        clearTimeout(this.dimTimeout);
      }

      this.dimTimeout = setTimeout(() => {
        this.dimTimeout = null;
        if (!this.isHovering && !this.isExploding) {
          this.dim();
        }
      }, this.timing.leaveDelay);
    },

    playHoverScramble() {
      this.cancelAnimation();

      const spans = this.getSpans();
      if (!spans.length) return;

      const startTime = performance.now();
      const duration = this.timing.hoverScrambleDuration;
      const totalChars = spans.length;

      const animate = (now) => {
        if (!this.$el.isConnected) return;

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        spans.forEach((span, i) => {
          const settlePoint = (i + 1) / totalChars;

          if (progress < settlePoint) {
            if (!span.classList.contains('scrambling')) {
              span.classList.add('scrambling');
            }
            span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
          } else if (span.classList.contains('scrambling')) {
            span.classList.remove('scrambling');
            span.textContent = this.targetText[i];
          }
        });

        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.animationId = null;
          if (this.$refs.cursor) {
            this.$refs.cursor.classList.add('visible');
          }
        }
      };

      this.animationId = requestAnimationFrame(animate);
    },

    playExplosion() {
      this.cancelAnimation();
      this.isExploding = true;
      this.explosionCount++;

      // Every 3rd explosion triggers the angry face
      if (this.explosionCount >= 3) {
        this.explosionCount = 0;
        this.playAngryFace();
        return;
      }

      const spans = this.getSpans();
      const textEl = this.$refs.text;
      const cursorEl = this.$refs.cursor;
      if (!textEl || !cursorEl || !spans.length) {
        this.isExploding = false;
        return;
      }

      const containerRect = this.$el.getBoundingClientRect();

      // Hide cursor during explosion
      cursorEl.classList.remove('visible', 'solid');

      // Viewport bounds (with padding)
      const padding = 20;
      const bounds = {
        left: -containerRect.left + padding,
        right: window.innerWidth - containerRect.left - padding,
        top: -containerRect.top + padding,
        bottom: window.innerHeight - containerRect.top - padding
      };

      // Physics constants
      const gravity = 0.15;
      const friction = 0.99;
      const bounceDamping = 0.7;

      // Store original positions and create physics data
      const particles = [];
      spans.forEach((span, i) => {
        const rect = span.getBoundingClientRect();
        const originalX = rect.left - containerRect.left;
        const originalY = rect.top - containerRect.top;

        // Random explosion velocity
        const angle = Math.random() * Math.PI * 2;
        const force = 8 + Math.random() * 12;

        particles.push({
          span,
          originalX,
          originalY,
          x: originalX,
          y: originalY,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force - 5, // slight upward bias
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 15,
          scale: 1,
          bounceCount: 0
        });

        // Set up for absolute positioning
        span.style.position = 'absolute';
        span.style.left = originalX + 'px';
        span.style.top = originalY + 'px';
        span.style.transition = 'none';
        span.style.zIndex = '9999';
        span.style.color = '#1dc9d8';
        span.style.textShadow = '0 0 10px #1dc9d8, 0 0 20px #1dc9d8, 0 0 40px #1dc9d8';
      });

      // Make container relative for absolute children
      textEl.style.position = 'relative';
      textEl.style.overflow = 'visible';

      // Animation phases
      const bounceDuration = 5000;
      const flightDuration = 350; // ms per letter to fly back
      const staggerDelay = 100; // ms between each letter starting
      const returnDuration = flightDuration + (particles.length - 1) * staggerDelay;
      const startTime = performance.now();
      let lastTime = startTime;
      let restingPositionsCaptured = false;

      const animate = (now) => {
        if (!this.$el.isConnected) return;

        const elapsed = now - startTime;
        const dt = Math.min((now - lastTime) / 16.67, 2); // normalize to ~60fps, cap at 2x
        lastTime = now;

        if (elapsed < bounceDuration) {
          // Physics simulation with bouncing
          particles.forEach((p) => {
            // Apply gravity
            p.vy += gravity * dt;

            // Apply friction
            p.vx *= Math.pow(friction, dt);
            p.vy *= Math.pow(friction, dt);

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Bounce off walls
            if (p.x < bounds.left) {
              p.x = bounds.left;
              p.vx = -p.vx * bounceDamping;
              p.bounceCount++;
            } else if (p.x > bounds.right) {
              p.x = bounds.right;
              p.vx = -p.vx * bounceDamping;
              p.bounceCount++;
            }

            if (p.y < bounds.top) {
              p.y = bounds.top;
              p.vy = -p.vy * bounceDamping;
              p.bounceCount++;
            } else if (p.y > bounds.bottom) {
              p.y = bounds.bottom;
              p.vy = -p.vy * bounceDamping;
              p.bounceCount++;
            }

            // Update rotation
            p.rotation += p.rotationSpeed * dt;

            // Scale based on velocity (faster = bigger)
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            p.scale = 1 + Math.min(speed * 0.05, 1.5);

            // Apply transform
            const dx = p.x - p.originalX;
            const dy = p.y - p.originalY;
            p.span.style.transform = `translate(${dx}px, ${dy}px) rotate(${p.rotation}deg) scale(${p.scale})`;

            // Scramble text
            p.span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];

            // Flash on bounce
            if (p.bounceCount > 0) {
              const glowIntensity = Math.max(0.3, 1 - p.bounceCount * 0.15);
              const blur1 = Math.round(10 * glowIntensity);
              const blur2 = Math.round(20 * glowIntensity);
              p.span.style.textShadow = `0 0 ${blur1}px #1dc9d8, 0 0 ${blur2}px #1dc9d8`;
            }
          });

          this.animationId = requestAnimationFrame(animate);
        } else if (elapsed < bounceDuration + returnDuration) {
          // Capture resting positions once at start of return phase
          if (!restingPositionsCaptured) {
            restingPositionsCaptured = true;
            particles.forEach((p) => {
              p.restX = p.x;
              p.restY = p.y;
              p.restRotation = p.rotation;
              p.restScale = p.scale;
              p.landed = false;
            });
          }

          // Return one by one with arc trajectory
          const returnElapsed = elapsed - bounceDuration;

          particles.forEach((p, i) => {
            // Skip already landed letters - they're back in normal flow
            if (p.landed) return;

            const letterStart = i * staggerDelay;
            const letterEnd = letterStart + flightDuration;

            if (returnElapsed < letterStart) {
              // Still waiting - keep at resting position, keep scrambling
              const dx = p.restX - p.originalX;
              const dy = p.restY - p.originalY;
              p.span.style.transform = `translate(${dx}px, ${dy}px) rotate(${p.restRotation}deg) scale(${p.restScale})`;
              p.span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
            } else if (returnElapsed < letterEnd) {
              // This letter is flying back
              const t = (returnElapsed - letterStart) / flightDuration;
              // Ease-out cubic
              const eased = 1 - Math.pow(1 - t, 3);

              // Arc trajectory - parabolic arc upward then down
              const startX = p.restX;
              const startY = p.restY;
              const endX = p.originalX;
              const endY = p.originalY;

              // Height of arc based on distance, clamped to viewport
              const dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
              const maxArcHeight = Math.min(dist * 0.4, 120);
              // Limit arc so letters don't fly above viewport during return
              const headroom = endY - bounds.top;
              const arcHeight = Math.min(maxArcHeight, Math.max(0, headroom - 10));

              // Parabolic arc: highest at t=0.5
              const arcOffset = -4 * arcHeight * t * (t - 1);

              const currentX = startX + (endX - startX) * eased;
              const currentY = startY + (endY - startY) * eased - arcOffset;

              // Spin during flight, settle at end
              const currentRotation = p.restRotation * (1 - eased);
              const currentScale = p.restScale + (1 - p.restScale) * eased;

              const dx = currentX - p.originalX;
              const dy = currentY - p.originalY;
              p.span.style.transform = `translate(${dx}px, ${dy}px) rotate(${currentRotation}deg) scale(${currentScale})`;

              // Glow brighter during flight
              const glowIntensity = Math.sin(t * Math.PI);
              p.span.style.textShadow = `0 0 ${15 + 15 * glowIntensity}px #1dc9d8, 0 0 ${30 + 20 * glowIntensity}px #1dc9d8`;
              p.span.style.color = '#1dc9d8';

              // Settle text near end
              if (t > 0.7) {
                p.span.textContent = this.targetText[i];
              } else {
                p.span.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
              }
            } else {
              // Just landed - return to normal document flow immediately
              p.landed = true;
              p.span.style.position = '';
              p.span.style.left = '';
              p.span.style.top = '';
              p.span.style.transform = '';
              p.span.style.opacity = '';
              p.span.style.zIndex = '';
              p.span.style.color = '';
              p.span.style.textShadow = '';
              p.span.textContent = this.targetText[i];
            }
          });

          this.animationId = requestAnimationFrame(animate);
        } else {
          // Animation complete - reset everything
          this.animationId = null;
          this.isExploding = false;

          // Reset spans to normal flow
          textEl.style.position = '';
          textEl.style.overflow = '';

          spans.forEach((span, i) => {
            span.style.position = '';
            span.style.left = '';
            span.style.top = '';
            span.style.transform = '';
            span.style.opacity = '';
            span.style.transition = '';
            span.style.zIndex = '';
            span.style.color = '';
            span.style.textShadow = '';
            span.textContent = this.targetText[i];
          });

          // Return to dimmed state
          this.dim();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    },

    playAngryFace() {
      const symbolEl = this.$el.querySelector('.prompt-symbol');
      const textEl = this.$refs.text;
      const cursorEl = this.$refs.cursor;
      if (!symbolEl || !textEl || !cursorEl) {
        this.isExploding = false;
        return;
      }

      const containerRect = this.$el.getBoundingClientRect();

      // Hide cursor and text
      cursorEl.classList.remove('visible', 'solid');
      textEl.style.opacity = '0';

      // Get symbol position
      const symbolRect = symbolEl.getBoundingClientRect();
      const originalX = symbolRect.left - containerRect.left;
      const originalY = symbolRect.top - containerRect.top;

      // Target: center of viewport (relative to container)
      const targetX = (window.innerWidth / 2) - containerRect.left - symbolRect.width / 2;
      const targetY = (window.innerHeight / 2) - containerRect.top - symbolRect.height / 2;

      // Set up symbol for animation
      const originalContent = symbolEl.textContent;
      symbolEl.style.position = 'absolute';
      symbolEl.style.left = originalX + 'px';
      symbolEl.style.top = originalY + 'px';
      symbolEl.style.transition = 'none';
      symbolEl.style.zIndex = '10000';
      symbolEl.style.display = 'inline-block';
      symbolEl.style.transformOrigin = 'center center';

      // Animation timing
      const growDuration = 400;
      const angryDuration = 2000;
      const shrinkDuration = 400;
      const startTime = performance.now();

      // Angry faces sequence
      const angryFaces = ['❯:(', '❯:O', '❯:❮', '❯:@', '!!!'];
      let faceIndex = 0;
      let lastFaceChange = 0;

      const animate = (now) => {
        if (!this.$el.isConnected) return;

        const elapsed = now - startTime;

        // Light mode uses darker colors for visibility
        const lightMode = this.isLightMode();
        const cyanColor = lightMode ? '#0891a2' : '#1dc9d8'; // darker cyan for light
        const cyanShadow = lightMode
          ? '0 0 8px rgba(8, 145, 162, 0.6)'
          : '0 0 20px #1dc9d8, 0 0 40px #1dc9d8';

        if (elapsed < growDuration) {
          // Phase 1: Grow and move to center
          const progress = elapsed / growDuration;
          const eased = 1 - Math.pow(1 - progress, 3);

          const x = originalX + (targetX - originalX) * eased;
          const y = originalY + (targetY - originalY) * eased;
          const scale = 1 + (8 - 1) * eased;
          const rotation = Math.sin(progress * Math.PI * 2) * 5;

          symbolEl.style.transform = `translate(${x - originalX}px, ${y - originalY}px) scale(${scale}) rotate(${rotation}deg)`;
          symbolEl.style.color = cyanColor;
          if (lightMode) {
            symbolEl.style.textShadow = `0 0 ${8 * eased}px rgba(8, 145, 162, 0.6)`;
          } else {
            symbolEl.style.textShadow = `0 0 ${20 * eased}px #1dc9d8, 0 0 ${40 * eased}px #1dc9d8`;
          }

          // Start morphing to angry face
          if (progress > 0.5) {
            symbolEl.textContent = '>:';
          }

          this.animationId = requestAnimationFrame(animate);
        } else if (elapsed < growDuration + angryDuration) {
          // Phase 2: Angry face with shaking
          const angryElapsed = elapsed - growDuration;
          const angryProgress = angryElapsed / angryDuration;

          // Shake intensity decreases over time
          const shakeIntensity = 15 * (1 - angryProgress * 0.5);
          const shakeX = (Math.random() - 0.5) * shakeIntensity;
          const shakeY = (Math.random() - 0.5) * shakeIntensity;
          const shakeRotation = (Math.random() - 0.5) * shakeIntensity;

          // Pulse scale
          const pulseScale = 8 + Math.sin(angryElapsed * 0.02) * 0.5;

          symbolEl.style.transform = `translate(${targetX - originalX + shakeX}px, ${targetY - originalY + shakeY}px) scale(${pulseScale}) rotate(${shakeRotation}deg)`;

          // Cycle through angry faces
          if (angryElapsed - lastFaceChange > 150) {
            lastFaceChange = angryElapsed;
            faceIndex = (faceIndex + 1) % angryFaces.length;
            symbolEl.textContent = angryFaces[faceIndex];
          }

          // Color shifts between cyan and red
          const redAmount = Math.sin(angryElapsed * 0.01) * 0.5 + 0.5;
          // Use darker base colors in light mode
          const baseR = lightMode ? 8 : 29;
          const baseG = lightMode ? 145 : 201;
          const baseB = lightMode ? 162 : 216;
          const r = Math.round(baseR + (220 - baseR) * redAmount);
          const g = Math.round(baseG * (1 - redAmount * 0.8));
          const b = Math.round(baseB * (1 - redAmount * 0.8));
          symbolEl.style.color = `rgb(${r}, ${g}, ${b})`;
          if (lightMode) {
            symbolEl.style.textShadow = `0 0 8px rgba(${r}, ${g}, ${b}, 0.5)`;
          } else {
            symbolEl.style.textShadow = `0 0 20px rgb(${r}, ${g}, ${b}), 0 0 40px rgb(${r}, ${g}, ${b}), 0 0 60px rgb(${r}, ${g}, ${b})`;
          }

          this.animationId = requestAnimationFrame(animate);
        } else if (elapsed < growDuration + angryDuration + shrinkDuration) {
          // Phase 3: Calm down and shrink back
          const shrinkProgress = (elapsed - growDuration - angryDuration) / shrinkDuration;
          const eased = shrinkProgress * shrinkProgress; // ease-in

          const x = targetX + (originalX - targetX) * eased;
          const y = targetY + (originalY - targetY) * eased;
          const scale = 8 + (1 - 8) * eased;

          symbolEl.style.transform = `translate(${x - originalX}px, ${y - originalY}px) scale(${scale})`;

          // Fade back to normal color
          const cyanAmount = eased;
          if (lightMode) {
            symbolEl.style.color = cyanAmount > 0.7 ? '#0891a2' : `rgb(${Math.round(220 * (1 - cyanAmount))}, ${Math.round(145 * cyanAmount)}, ${Math.round(162 * cyanAmount)})`;
          } else {
            symbolEl.style.color = cyanAmount > 0.7 ? 'var(--accent-cyan)' : `rgb(${Math.round(255 * (1 - cyanAmount))}, ${Math.round(201 * cyanAmount)}, ${Math.round(216 * cyanAmount)})`;
          }

          // Morph back to original symbol
          if (eased > 0.3) {
            symbolEl.textContent = originalContent;
          }

          // Fade glow
          const glowIntensity = 1 - eased;
          if (glowIntensity > 0.1) {
            if (lightMode) {
              symbolEl.style.textShadow = `0 0 ${8 * glowIntensity}px rgba(8, 145, 162, 0.5)`;
            } else {
              symbolEl.style.textShadow = `0 0 ${20 * glowIntensity}px #1dc9d8`;
            }
          } else {
            symbolEl.style.textShadow = '';
          }

          this.animationId = requestAnimationFrame(animate);
        } else {
          // Animation complete - reset everything
          this.animationId = null;
          this.isExploding = false;

          // Reset symbol
          symbolEl.style.position = '';
          symbolEl.style.left = '';
          symbolEl.style.top = '';
          symbolEl.style.transform = '';
          symbolEl.style.zIndex = '';
          symbolEl.style.color = '';
          symbolEl.style.textShadow = '';
          symbolEl.style.display = '';
          symbolEl.style.transformOrigin = '';
          symbolEl.textContent = originalContent;

          // Show text again
          textEl.style.opacity = '';

          // Return to dimmed state
          this.dim();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    },

    cancelAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  };
}