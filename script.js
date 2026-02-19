document.addEventListener('DOMContentLoaded', () => {
    let audioCtx, activeOsc, activeGain, analyser, vizRAF, melodyTimeout;
    let isFirstActionTaken = false;
    
    // Application State
    let currentHz = 49;
    let mainMode = 'generator'; 
    let genMode = null; 
    let isSongPlaying = false;

    // Constants
    const MIN_HZ = 25;
    const MAX_HZ = 75;
    const APP_TITLE = "Oobleck Dance Generator 1.6g";
    const README_TEXT = "\"Boomer\" Hughes,\n\"Spooky\" Hamilton,\nEric Wright aka \"chozo\",\nGlen Carter aka \"Thee DJ Q\"";

    // --- Core Audio Initialization ---
    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        triggerFirstAction();
        return audioCtx;
    }

    function triggerFirstAction() {
        if (!isFirstActionTaken) {
            isFirstActionTaken = true;
            document.getElementById('leftArrow').style.display = 'none';
            document.getElementById('rightArrow').style.display = 'none';
            updateHeaderUI(currentHz, APP_TITLE);
        }
    }

    // --- Safe & Silent Stop All ---
    window.stopAll = function(manualClick = false) {
        if (melodyTimeout) clearTimeout(melodyTimeout);
        isSongPlaying = false;
        
        // Anti-pop fade out
        if (activeGain && audioCtx) {
            const now = audioCtx.currentTime;
            activeGain.gain.cancelScheduledValues(now);
            activeGain.gain.setValueAtTime(activeGain.gain.value, now);
            activeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); // 50ms quick fade
            if (activeOsc) {
                try { activeOsc.stop(now + 0.06); } catch(e){}
            }
        }
        activeOsc = null;
        activeGain = null;

        if (vizRAF) cancelAnimationFrame(vizRAF);
        const canvas = document.getElementById('waveCanvas');
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // UI Resets
        document.querySelectorAll('.playing, .active-key').forEach(el => el.classList.remove('playing', 'active-key'));
        document.getElementById('readmeDisplay').classList.remove('visible');

        if (isFirstActionTaken) {
            updateHeaderUI(currentHz, APP_TITLE);
        }

        if (manualClick && mainMode === 'generator') {
            document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active-tab', 'flashing'));
            genMode = 'off';
        }
    }

    // --- Header & Visualizer Updates ---
    function updateHeaderUI(hz, overrideLabel = null) {
        if (!isFirstActionTaken) return;

        const clampedHz = Math.max(MIN_HZ, Math.min(MAX_HZ, hz));
        const pct = ((clampedHz - MIN_HZ) / (MAX_HZ - MIN_HZ)) * 100;
        
        // Freq Background Fill
        document.getElementById('freqFill').style.width = `${pct}%`;

        // Text
        const headerText = document.getElementById('headerText');
        if (overrideLabel) {
            headerText.innerHTML = overrideLabel;
        } else {
            headerText.innerHTML = `${APP_TITLE}<br><small>${hz.toFixed(1)} Hz</small>`;
        }

        // Knob Update
        const angle = -135 + (pct / 100) * 270;
        document.getElementById('knobPointer').style.transform = `translateX(-50%) rotate(${angle}deg)`;
        document.getElementById('toneHzReadout').textContent = hz.toFixed(1);
    }

    function startViz() {
        const canvas = document.getElementById('waveCanvas');
        const ctx = canvas.getContext('2d');
        const draw = () => {
            if (!analyser) return;
            vizRAF = requestAnimationFrame(draw);
            
            // Handle dynamic resizing
            if (canvas.width !== canvas.clientWidth) canvas.width = canvas.clientWidth;
            if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;
            
            const buffer = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(buffer);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath(); 
            ctx.strokeStyle = '#0ea5e9'; // Accent color for wave
            ctx.lineWidth = 3;
            for(let i=0; i<buffer.length; i++) {
                const x = (i/buffer.length)*canvas.width;
                const y = (buffer[i]/255)*canvas.height;
                i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
            }
            ctx.stroke();
        };
        draw();
    }

    // --- Play Tone Core ---
    function playTone(freq, loop = false) {
        const ctx = initAudio();
        stopAll();
        activeOsc = ctx.createOscillator();
        activeGain = ctx.createGain();
        analyser = ctx.createAnalyser();

        activeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Fade in to avoid pop
        activeGain.gain.setValueAtTime(0, ctx.currentTime);
        activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        
        activeOsc.connect(activeGain).connect(analyser).connect(ctx.destination);
        activeOsc.start();
        startViz();
    }

    // --- Navigation Logic ---
    window.switchMainMode = (mode) => {
        stopAll(true);
        mainMode = mode;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
        document.getElementById(`tab-${mode}`).classList.add('active-tab');
        
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active-panel'));
        document.getElementById(`mode-${mode}`).classList.add('active-panel');
    };

    window.setGeneratorMode = (mode) => {
        document.getElementById('sub-tone').classList.remove('flashing');
        stopAll(); // Not a manual override so we don't clear UI
        genMode = mode;
        
        document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active-tab'));
        document.getElementById(`sub-${mode}`).classList.add('active-tab');

        document.querySelectorAll('.gen-ui').forEach(ui => ui.classList.remove('active-gen-ui'));
        document.getElementById(`ui-${mode}`).classList.add('active-gen-ui');

        if (mode === 'tone') {
            playTone(currentHz, true);
            updateHeaderUI(currentHz);
        }
    };

    // --- Tone Mode: Knob & Nudge Logic ---
    const updateHz = (newHz) => {
        currentHz = Math.max(MIN_HZ, Math.min(MAX_HZ, newHz));
        updateHeaderUI(currentHz);
        if (activeOsc && genMode === 'tone') {
            activeOsc.frequency.setTargetAtTime(currentHz, audioCtx.currentTime, 0.05);
        }
    };

    document.getElementById('btnFreqDown').onclick = () => updateHz(currentHz - 0.5);
    document.getElementById('btnFreqUp').onclick = () => updateHz(currentHz + 0.5);

    // Knob Dragging
    const knob = document.getElementById('mainKnob');
    let isDragging = false, startY = 0, startHz = 49;
    
    knob.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startHz = currentHz;
        knob.setPointerCapture(e.pointerId);
    });
    
    knob.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const deltaY = startY - e.clientY; // Up is positive
        updateHz(startHz + (deltaY * 0.25)); // Scale movement
    });
    
    knob.addEventListener('pointerup', () => isDragging = false);

    // --- Sweep Logic ---
    const slMedian = document.getElementById('slMedian');
    const slRange = document.getElementById('slRange');
    const slTime = document.getElementById('slTime');
    
    const updateSweepUI = () => {
        document.getElementById('valMedian').innerText = slMedian.value;
        document.getElementById('valRange').innerText = slRange.value;
        document.getElementById('valTime').innerText = slTime.value;
    };
    
    [slMedian, slRange, slTime].forEach(el => el.addEventListener('input', updateSweepUI));

    const triggerSweep = () => {
        const median = parseFloat(slMedian.value);
        const range = parseFloat(slRange.value);
        const time = parseFloat(slTime.value);
        const start = median - (range / 2);
        const end = median + (range / 2);

        stopAll();
        const ctx = initAudio();
        activeOsc = ctx.createOscillator();
        activeGain = ctx.createGain();
        analyser = ctx.createAnalyser();

        activeOsc.frequency.setValueAtTime(start, ctx.currentTime);
        activeOsc.frequency.linearRampToValueAtTime(end, ctx.currentTime + time);
        
        activeGain.gain.setValueAtTime(0, ctx.currentTime);
        activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        activeGain.gain.setValueAtTime(0.3, ctx.currentTime + time - 0.05);
        activeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + time);
        
        activeOsc.connect(activeGain).connect(analyser).connect(ctx.destination);
        activeOsc.start();
        activeOsc.stop(ctx.currentTime + time + 0.1);
        startViz();
        updateHeaderUI(median, `${APP_TITLE} - Sweeping`);
    };

    [slMedian, slRange, slTime].forEach(el => el.addEventListener('change', triggerSweep));

    // --- Keyboard Logic ---
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    function getNoteLabel(freq) {
        const n = Math.round(12 * Math.log2(freq / 440)) + 48; // A4=440 is index 48
        return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12)}`;
    }

    function buildKeyboard() {
        const piano = document.getElementById('pianoContainer');
        const keys = [
            { f: 27.50, t: 'white' }, { f: 29.14, t: 'black' }, { f: 30.87, t: 'white' }, // A0, A#0, B0
            { f: 32.70, t: 'white' }, { f: 34.65, t: 'black' }, { f: 36.71, t: 'white' }, { f: 38.89, t: 'black' }, { f: 41.20, t: 'white' }, // C1-E1
            { f: 43.65, t: 'white' }, { f: 46.25, t: 'black' }, { f: 49.00, t: 'white' }, { f: 51.91, t: 'black' }, { f: 55.00, t: 'white' }  // F1-A1
        ];

        let lastWhiteWrapper = null;

        keys.forEach(k => {
            const el = document.createElement('div');
            el.className = `key ${k.t}`;
            
            const handlePress = (e) => {
                e.preventDefault();
                playTone(k.f);
                el.classList.add('active-key');
                updateHeaderUI(k.f, `${getNoteLabel(k.f)} - ${k.f.toFixed(2)} Hz`);
            };

            el.onpointerdown = handlePress;
            el.onpointerup = el.onpointerleave = stopAll;

            if (k.t === 'white') {
                const wrap = document.createElement('div');
                wrap.className = 'white-key-wrapper';
                wrap.appendChild(el);
                piano.appendChild(wrap);
                lastWhiteWrapper = wrap;
            } else {
                if (lastWhiteWrapper) lastWhiteWrapper.appendChild(el);
            }
        });
    }
    buildKeyboard();

    // --- Song Mode Logic ---
    function initSongs() {
        const grid = document.getElementById('songGrid');
        if (typeof SONG_LIBRARY === 'undefined') return;
        
        Object.keys(SONG_LIBRARY).forEach(id => {
            const btn = document.createElement('button');
            btn.innerText = SONG_LIBRARY[id].title;
            btn.onclick = () => {
                if (btn.classList.contains('playing')) {
                    stopAll(true);
                } else {
                    stopAll();
                    btn.classList.add('playing');
                    playSongLoop(id);
                }
            };
            grid.appendChild(btn);
        });
    }
    
    async function playSongLoop(id) {
        isSongPlaying = true;
        const song = SONG_LIBRARY[id];
        
        while (isSongPlaying) {
            for (const note of song.notes) {
                if (!isSongPlaying) break;
                const freq = NOTES[note.n] * Math.pow(2, (TRANSPOSE_SEMITONES + song.trim) / 12);
                if (freq > 0) {
                    playTone(freq);
                    updateHeaderUI(freq, `${getNoteLabel(freq)} - ${freq.toFixed(1)} Hz`);
                } else {
                    stopAll(); // It's a rest
                }
                await new Promise(r => melodyTimeout = setTimeout(r, note.d));
            }
        }
    }
    initSongs();

    // --- Toy Mode Logic ---
    window.triggerToyMacro = (type) => {
        stopAll();
        const ctx = initAudio();
        activeOsc = ctx.createOscillator();
        activeGain = ctx.createGain();
        analyser = ctx.createAnalyser();

        const start = type === 'rise' ? 25 : 75;
        const end = type === 'rise' ? 75 : 25;

        activeOsc.frequency.setValueAtTime(start, ctx.currentTime);
        activeOsc.frequency.linearRampToValueAtTime(end, ctx.currentTime + 7);
        
        activeGain.gain.setValueAtTime(0, ctx.currentTime);
        activeGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        activeGain.gain.setValueAtTime(0.3, ctx.currentTime + 6.9);
        activeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 7);
        
        activeOsc.connect(activeGain).connect(analyser).connect(ctx.destination);
        activeOsc.start();
        activeOsc.stop(ctx.currentTime + 7.1);
        startViz();
        updateHeaderUI(50, type === 'rise' ? "Bass Rise" : "mmm Drop");
    };

    window.showReadme = () => {
        const box = document.getElementById('readmeDisplay');
        box.innerText = README_TEXT + "\n\n(Tap anywhere to dismiss)";
        box.classList.add('visible');
        box.onclick = () => box.classList.remove('visible');
    };
});