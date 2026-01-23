// Konami Code Easter Egg - CHAOS MODE
(function() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  let konamiIndex = 0;
  let chaosActive = false;

  document.addEventListener('keydown', (e) => {
    // Escape key exits chaos mode
    if (e.code === 'Escape' && chaosActive) {
      deactivateChaosMode();
      return;
    }

    if (e.code === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        if (!chaosActive) {
          activateChaosMode();
        }
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activateChaosMode() {
    chaosActive = true;

    // Inject styles
    const style = document.createElement('style');
    style.id = 'chaos-styles';
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-30px); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px) rotate(-5deg); }
        75% { transform: translateX(10px) rotate(5deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(10deg); }
        66% { transform: translateY(10px) rotate(-10deg); }
      }
      @keyframes hat-wobble {
        0%, 100% { transform: rotate(0deg) scaleX(1); }
        25% { transform: rotate(-15deg) scaleX(1.1); }
        50% { transform: rotate(0deg) scaleX(0.9); }
        75% { transform: rotate(15deg) scaleX(1.1); }
      }
      @keyframes flarhgunnstow {
        0% { transform: perspective(500px) rotateY(0deg) scale(1); filter: hue-rotate(0deg); }
        25% { transform: perspective(500px) rotateY(90deg) scale(1.5); filter: hue-rotate(90deg); }
        50% { transform: perspective(500px) rotateY(180deg) scale(0.5); filter: hue-rotate(180deg); }
        75% { transform: perspective(500px) rotateY(270deg) scale(1.2); filter: hue-rotate(270deg); }
        100% { transform: perspective(500px) rotateY(360deg) scale(1); filter: hue-rotate(360deg); }
      }
      @keyframes tayne-4d3d3d3 {
        0% { transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0); }
        20% { transform: perspective(800px) rotateX(30deg) rotateY(-30deg) translateZ(100px); }
        40% { transform: perspective(800px) rotateX(-20deg) rotateY(45deg) translateZ(-50px); }
        60% { transform: perspective(800px) rotateX(15deg) rotateY(-60deg) translateZ(80px); }
        80% { transform: perspective(800px) rotateX(-25deg) rotateY(30deg) translateZ(-30px); }
        100% { transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0); }
      }
      .hat-wobble {
        animation: hat-wobble 0.3s ease-in-out infinite !important;
        transform-origin: center bottom;
      }
      .flarhgunnstow {
        animation: flarhgunnstow 1s ease-in-out infinite !important;
      }
      .tayne-4d3d3d3 {
        animation: tayne-4d3d3d3 2s ease-in-out infinite !important;
        transform-style: preserve-3d;
      }
      .chaos-ui-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100002;
      }
      .chaos-ui-container > * {
        pointer-events: auto;
      }
      .computer-prompt {
        position: absolute;
        bottom: 80px;
        left: 20px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #0f0;
        background: #000;
        padding: 15px 20px;
        border: 2px solid #0f0;
        border-radius: 0;
        max-width: 350px;
        box-shadow: 0 0 20px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.1);
      }
      .computer-prompt::before {
        content: "> ";
      }
      @keyframes disco {
        0% { background: #ff0000; }
        16% { background: #ff8800; }
        33% { background: #ffff00; }
        50% { background: #00ff00; }
        66% { background: #0088ff; }
        83% { background: #8800ff; }
        100% { background: #ff0000; }
      }
      @keyframes neon-glow {
        0%, 100% { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff; }
        50% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff; }
      }
      .chaos-mode {
        animation: rainbow 2s linear infinite !important;
      }
      .chaos-spin {
        animation: spin 1s linear infinite !important;
        display: inline-block !important;
      }
      .chaos-bounce {
        animation: bounce 0.5s ease-in-out infinite !important;
      }
      .chaos-shake {
        animation: shake 0.3s ease-in-out infinite !important;
      }
      .chaos-float {
        animation: float 2s ease-in-out infinite !important;
      }
      .chaos-neon {
        animation: neon-glow 1s ease-in-out infinite !important;
      }
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        pointer-events: none;
        z-index: 99999;
      }
      .chaos-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 99998;
        animation: disco 1s linear infinite;
        opacity: 0.1;
      }
      .chaos-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', 'Courier New', monospace;
        font-size: 48px;
        color: #fff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff, 4px 4px 0 #000;
        z-index: 100000;
        animation: bounce 0.5s ease-in-out infinite, neon-glow 0.5s ease-in-out infinite;
        white-space: nowrap;
      }
      .chaos-exit {
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 15px 30px;
        background: linear-gradient(45deg, #ff00ff, #00ffff);
        color: white;
        font-weight: bold;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        z-index: 100001;
        font-size: 16px;
        animation: bounce 1s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(255,0,255,0.5);
      }
      .chaos-exit:hover {
        transform: scale(1.1);
      }
      .party-parrot {
        position: fixed;
        width: 60px;
        height: 60px;
        z-index: 99999;
        pointer-events: none;
        image-rendering: pixelated;
      }
      .cursor-party {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='24' font-size='24'%3E🎉%3C/text%3E%3C/svg%3E") 16 16, auto !important;
      }
    `;
    document.head.appendChild(style);

    // Load retro font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Play activation sound (8-bit style)
    playPowerUp();

    // === 4D3D3D3 SEQUENCE ===
    const computerPrompts = [
      { text: "LOADING CELERY MAN...", delay: 0 },
      { text: "4D3D3D3 ENGAGED", delay: 1500 },
      { text: "ADDING SEQUENCE: OYSTER", delay: 3000 },
      { text: "HAT WOBBLE ACTIVATED", delay: 4500, action: 'hatWobble' },
      { text: "FLARHGUNNSTOW", delay: 6000, action: 'flarhgunnstow' },
      { text: "NOW TAYNE I CAN GET INTO", delay: 8000, action: '4d3d3d3' },
      { text: "CAN I GET A PRINTOUT OF OYSTER SMILING?", delay: 10000 },
      { text: "OKAY", delay: 11500 },
    ];

    computerPrompts.forEach(({ text, delay, action }) => {
      setTimeout(() => {
        if (!chaosActive) return;
        showComputerPrompt(text);
        if (action === 'hatWobble') {
          document.querySelectorAll('img').forEach(img => {
            img.classList.remove('chaos-spin', 'chaos-bounce');
            img.classList.add('hat-wobble');
          });
        } else if (action === 'flarhgunnstow') {
          document.querySelectorAll('img').forEach(img => {
            img.classList.remove('hat-wobble');
            img.classList.add('flarhgunnstow');
          });
        } else if (action === '4d3d3d3') {
          document.body.classList.add('tayne-4d3d3d3');
        }
      }, delay);
    });

    // Show initial message
    const message = document.createElement('div');
    message.className = 'chaos-message';
    message.textContent = 'COMPUTER: LOAD UP CELERY MAN PLEASE';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 1500);

    // Add disco overlay
    const overlay = document.createElement('div');
    overlay.className = 'chaos-overlay';
    overlay.id = 'chaos-overlay';
    document.body.appendChild(overlay);

    // Add party cursor
    document.body.classList.add('cursor-party');

    // Apply chaos to body
    document.body.classList.add('chaos-mode');

    // Make images spin
    document.querySelectorAll('img').forEach((img, i) => {
      img.classList.add(i % 2 === 0 ? 'chaos-spin' : 'chaos-bounce');
    });

    // Make headings go wild
    document.querySelectorAll('h1, h2, h3').forEach((h, i) => {
      h.classList.add(['chaos-shake', 'chaos-float', 'chaos-neon'][i % 3]);
    });

    // Make buttons bounce
    document.querySelectorAll('button, a.btn, [class*="button"]').forEach(btn => {
      btn.classList.add('chaos-bounce');
    });

    // Spawn confetti
    const confettiInterval = setInterval(spawnConfetti, 50);
    window.chaosConfettiInterval = confettiInterval;

    // Spawn party parrots
    const parrotInterval = setInterval(spawnPartyParrot, 800);
    window.chaosParrotInterval = parrotInterval;

    // Make everything slightly rotate on mousemove
    document.addEventListener('mousemove', chaosMouseMove);

    // Create UI container (outside body to avoid transform issues)
    const uiContainer = document.createElement('div');
    uiContainer.className = 'chaos-ui-container';
    uiContainer.id = 'chaos-ui-container';
    document.documentElement.appendChild(uiContainer);

    // Add exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'chaos-exit';
    exitBtn.textContent = '🛑 STOP THE MADNESS';
    exitBtn.onclick = deactivateChaosMode;
    exitBtn.id = 'chaos-exit-btn';
    uiContainer.appendChild(exitBtn);

    // Start the background music
    startChaosMusic();
  }

  function spawnConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);

    const duration = 2000 + Math.random() * 2000;
    const drift = (Math.random() - 0.5) * 200;

    confetti.animate([
      { top: '-10px', left: confetti.style.left, opacity: 1 },
      { top: window.innerHeight + 'px', left: `calc(${confetti.style.left} + ${drift}px)`, opacity: 0, transform: `rotate(${Math.random() * 720}deg)` }
    ], {
      duration: duration,
      easing: 'ease-in'
    }).onfinish = () => confetti.remove();
  }

  function spawnPartyParrot() {
    const emojis = ['🦜', '🎉', '🔥', '✨', '💥', '🌈', '🚀', '⚡', '🎸', '🎺', '🥁', '🪩'];
    const parrot = document.createElement('div');
    parrot.className = 'party-parrot';
    parrot.style.fontSize = '40px';
    parrot.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    parrot.style.left = Math.random() * (window.innerWidth - 60) + 'px';
    parrot.style.top = Math.random() * (window.innerHeight - 60) + 'px';
    document.body.appendChild(parrot);

    parrot.animate([
      { transform: 'scale(0) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.5) rotate(360deg)', opacity: 1, offset: 0.5 },
      { transform: 'scale(0) rotate(720deg)', opacity: 0 }
    ], {
      duration: 1500,
      easing: 'ease-in-out'
    }).onfinish = () => parrot.remove();
  }

  function chaosMouseMove(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    document.body.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
  }

  function playPowerUp() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // 🪙 Mario coin sound - B5 -> E6
      const coinNotes = [988, 1319];
      coinNotes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        const startTime = audioCtx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + (i === 0 ? 0.08 : 0.4));
        osc.start(startTime);
        osc.stop(startTime + (i === 0 ? 0.08 : 0.4));
      });
    } catch(e) {}
  }

  function startChaosMusic() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.chaosAudioCtx = audioCtx;

      // Simple 8-bit style beat
      const bassNotes = [130.81, 146.83, 164.81, 146.83]; // C3, D3, E3, D3
      let noteIndex = 0;

      function playBeat() {
        if (!chaosActive) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.value = bassNotes[noteIndex % bassNotes.length];
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialDecayToValueAtTime && gain.gain.exponentialDecayToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);

        noteIndex++;
        window.chaosMusicTimeout = setTimeout(playBeat, 200);
      }

      playBeat();
    } catch(e) {}
  }

  function showComputerPrompt(text) {
    // Remove existing prompt
    document.querySelector('.computer-prompt')?.remove();

    const prompt = document.createElement('div');
    prompt.className = 'computer-prompt';
    prompt.textContent = text;
    const container = document.getElementById('chaos-ui-container');
    if (container) container.appendChild(prompt);
    else document.body.appendChild(prompt);

    // Play a little beep
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}

    setTimeout(() => prompt.remove(), 1400);
  }

  function deactivateChaosMode() {
    chaosActive = false;

    // Stop intervals
    clearInterval(window.chaosConfettiInterval);
    clearInterval(window.chaosParrotInterval);
    clearTimeout(window.chaosMusicTimeout);

    // Stop audio
    if (window.chaosAudioCtx) {
      window.chaosAudioCtx.close();
    }

    // Remove styles and elements
    document.getElementById('chaos-styles')?.remove();
    document.getElementById('chaos-overlay')?.remove();
    document.getElementById('chaos-ui-container')?.remove();

    // Remove all confetti, parrots, and prompts
    document.querySelectorAll('.confetti, .party-parrot, .computer-prompt').forEach(el => el.remove());

    // Remove classes
    document.body.classList.remove('chaos-mode', 'cursor-party', 'tayne-4d3d3d3');
    document.body.style.transform = '';
    document.querySelectorAll('.chaos-spin, .chaos-bounce, .chaos-shake, .chaos-float, .chaos-neon, .hat-wobble, .flarhgunnstow, .tayne-4d3d3d3').forEach(el => {
      el.classList.remove('chaos-spin', 'chaos-bounce', 'chaos-shake', 'chaos-float', 'chaos-neon', 'hat-wobble', 'flarhgunnstow', 'tayne-4d3d3d3');
    });

    // Remove event listener
    document.removeEventListener('mousemove', chaosMouseMove);

    // Show goodbye message
    const bye = document.createElement('div');
    bye.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;z-index:99999;background:#000;color:#0f0;padding:20px 40px;border-radius:0;font-family:monospace;border:2px solid #0f0;';
    bye.textContent = 'COMPUTER: CELERY MAN SIGNING OFF';
    document.body.appendChild(bye);
    setTimeout(() => bye.remove(), 1500);
  }
})();
