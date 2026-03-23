var BULANCI = BULANCI || {};
BULANCI.Audio = BULANCI.Audio || {};

(function(namespace) {
    var ambient = new Audio();
    var ambientToggle = document.getElementById('toggle-audio');
    var audioContext;
    var noiseBuffer;
    var lastTauntAt = 0;
    var fartPresets = [
        {
            name: 'lehkyPsouk',
            pitchJitter: 0.08,
            gainJitter: 0.1,
            segments: [
                { delay: 0, duration: 0.14, attack: 0.008, baseFrequency: 156, endFrequency: 104, wobble: 19, wobbleDepth: 8, gain: 0.08, noise: 0.03, filter: 980, noiseFilter: 240, toneType: 'triangle' }
            ]
        },
        {
            name: 'bublavySprd',
            pitchJitter: 0.12,
            gainJitter: 0.14,
            segments: [
                { delay: 0, duration: 0.16, baseFrequency: 122, endFrequency: 76, wobble: 11, wobbleDepth: 14, gain: 0.12, noise: 0.08, filter: 720, noiseFilter: 180, toneType: 'triangle' },
                { delay: 0.11, duration: 0.14, baseFrequency: 102, endFrequency: 64, wobble: 8, wobbleDepth: 16, gain: 0.11, noise: 0.1, filter: 650, noiseFilter: 150, toneType: 'triangle' },
                { delay: 0.22, duration: 0.12, baseFrequency: 92, endFrequency: 58, wobble: 7, wobbleDepth: 18, gain: 0.1, noise: 0.12, filter: 620, noiseFilter: 130, toneType: 'sine' }
            ]
        },
        {
            name: 'dlouhyTrumpet',
            pitchJitter: 0.07,
            gainJitter: 0.12,
            segments: [
                { delay: 0, duration: 0.42, attack: 0.014, baseFrequency: 98, endFrequency: 42, wobble: 9, wobbleDepth: 22, gain: 0.24, noise: 0.11, filter: 610, noiseFilter: 170, toneType: 'sawtooth' }
            ]
        },
        {
            name: 'mokryPrd',
            pitchJitter: 0.12,
            gainJitter: 0.16,
            segments: [
                { delay: 0, duration: 0.18, baseFrequency: 110, endFrequency: 62, wobble: 10, wobbleDepth: 20, gain: 0.16, noise: 0.14, filter: 680, noiseFilter: 160, toneType: 'sawtooth' },
                { delay: 0.12, duration: 0.18, baseFrequency: 82, endFrequency: 44, wobble: 7, wobbleDepth: 24, gain: 0.15, noise: 0.16, filter: 520, noiseFilter: 130, toneType: 'triangle' }
            ]
        },
        {
            name: 'prujem',
            pitchJitter: 0.15,
            gainJitter: 0.18,
            segments: [
                { delay: 0.00, duration: 0.16, baseFrequency: 76, endFrequency: 36, wobble: 6, wobbleDepth: 22, gain: 0.18, noise: 0.18, filter: 440, noiseFilter: 120, toneType: 'sawtooth' },
                { delay: 0.10, duration: 0.15, baseFrequency: 70, endFrequency: 32, wobble: 5, wobbleDepth: 24, gain: 0.18, noise: 0.2, filter: 420, noiseFilter: 110, toneType: 'triangle' },
                { delay: 0.19, duration: 0.14, baseFrequency: 66, endFrequency: 30, wobble: 5, wobbleDepth: 25, gain: 0.17, noise: 0.22, filter: 400, noiseFilter: 100, toneType: 'triangle' },
                { delay: 0.28, duration: 0.12, baseFrequency: 62, endFrequency: 28, wobble: 4, wobbleDepth: 26, gain: 0.16, noise: 0.2, filter: 380, noiseFilter: 95, toneType: 'sine' }
            ]
        },
        {
            name: 'dvojityVystrel',
            pitchJitter: 0.09,
            gainJitter: 0.1,
            segments: [
                { delay: 0, duration: 0.12, baseFrequency: 138, endFrequency: 84, wobble: 16, wobbleDepth: 11, gain: 0.11, noise: 0.06, filter: 820, noiseFilter: 220, toneType: 'square' },
                { delay: 0.16, duration: 0.13, baseFrequency: 126, endFrequency: 72, wobble: 14, wobbleDepth: 12, gain: 0.1, noise: 0.05, filter: 760, noiseFilter: 210, toneType: 'square' }
            ]
        },
        {
            name: 'skripavyPsouk',
            pitchJitter: 0.1,
            gainJitter: 0.12,
            segments: [
                { delay: 0, duration: 0.11, baseFrequency: 188, endFrequency: 138, wobble: 24, wobbleDepth: 7, gain: 0.08, noise: 0.02, filter: 1180, noiseFilter: 260, toneType: 'square' }
            ]
        },
        {
            name: 'gargl',
            pitchJitter: 0.13,
            gainJitter: 0.16,
            segments: [
                { delay: 0, duration: 0.2, baseFrequency: 116, endFrequency: 74, wobble: 8, wobbleDepth: 18, gain: 0.13, noise: 0.12, filter: 700, noiseFilter: 160, toneType: 'triangle' },
                { delay: 0.14, duration: 0.17, baseFrequency: 90, endFrequency: 50, wobble: 6, wobbleDepth: 20, gain: 0.12, noise: 0.14, filter: 560, noiseFilter: 135, toneType: 'sine' },
                { delay: 0.26, duration: 0.13, baseFrequency: 72, endFrequency: 40, wobble: 5, wobbleDepth: 18, gain: 0.1, noise: 0.12, filter: 500, noiseFilter: 120, toneType: 'triangle' }
            ]
        },
        {
            name: 'kratsiRozstrel',
            pitchJitter: 0.14,
            gainJitter: 0.15,
            segments: [
                { delay: 0, duration: 0.09, baseFrequency: 132, endFrequency: 96, wobble: 20, wobbleDepth: 10, gain: 0.08, noise: 0.07, filter: 840, noiseFilter: 240, toneType: 'triangle' },
                { delay: 0.08, duration: 0.1, baseFrequency: 112, endFrequency: 70, wobble: 17, wobbleDepth: 11, gain: 0.09, noise: 0.08, filter: 760, noiseFilter: 220, toneType: 'triangle' },
                { delay: 0.16, duration: 0.12, baseFrequency: 92, endFrequency: 52, wobble: 13, wobbleDepth: 13, gain: 0.1, noise: 0.1, filter: 680, noiseFilter: 180, toneType: 'sawtooth' }
            ]
        }
    ];

    if (ambient.canPlayType && ambient.canPlayType('audio/mpeg')) {
        ambient.src = 'resources/audio/gyears.mp3';
        ambient.loop = true;
        ambient.volume = 0.15;
    }

    namespace.toggleAmbient = function() {
        if (!ambient.src) {
            return;
        }

        if (ambient.paused) {
            var playResult = ambient.play();

            if (playResult && playResult.then) {
                playResult.then(function() {
                    if (ambientToggle) {
                        ambientToggle.innerHTML = 'zastavit ventilaci';
                    }
                }).catch(function() {
                    if (ambientToggle) {
                        ambientToggle.innerHTML = 'ventilace blokovana';
                    }
                });
            } else if (ambientToggle) {
                ambientToggle.innerHTML = 'zastavit ventilaci';
            }
            return;
        }

        ambient.pause();
        if (ambientToggle) {
            ambientToggle.innerHTML = 'spustit ventilaci';
        }
    };

    namespace.playRandomFart = function() {
        var preset = fartPresets[Math.floor(Math.random() * fartPresets.length)];
        var ctx = getAudioContext();

        if (!ctx) {
            return;
        }

        ensureAudioReady(ctx);
        playPreset(ctx, preset);
    };

    namespace.playFlush = function() {
        var ctx = getAudioContext();
        var now;
        var noise;
        var lowpass;
        var bandpass;
        var gain;
        var rumble;
        var rumbleGain;

        if (!ctx) {
            return;
        }

        ensureAudioReady(ctx);
        now = ctx.currentTime;

        noise = ctx.createBufferSource();
        lowpass = ctx.createBiquadFilter();
        bandpass = ctx.createBiquadFilter();
        gain = ctx.createGain();
        rumble = ctx.createOscillator();
        rumbleGain = ctx.createGain();

        noise.buffer = getNoiseBuffer(ctx);
        noise.loop = true;

        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2200, now);
        lowpass.frequency.exponentialRampToValueAtTime(260, now + 1.6);

        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(620, now);
        bandpass.frequency.exponentialRampToValueAtTime(170, now + 1.6);
        bandpass.Q.value = 0.7;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.24, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(78, now);
        rumble.frequency.exponentialRampToValueAtTime(38, now + 1.6);

        rumbleGain.gain.setValueAtTime(0.0001, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.08, now + 0.07);
        rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);

        noise.connect(lowpass);
        lowpass.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(ctx.destination);

        rumble.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);

        noise.start(now);
        rumble.start(now);

        scheduleFlushBubble(ctx, now + 0.5, 186, 0.045);
        scheduleFlushBubble(ctx, now + 0.72, 164, 0.04);
        scheduleFlushBubble(ctx, now + 1.03, 148, 0.035);

        noise.stop(now + 1.65);
        rumble.stop(now + 1.6);
    };

    namespace.playNearMissTaunt = function(text) {
        var synth;
        var utterance;

        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
            return;
        }

        if (Date.now() - lastTauntAt < 700) {
            return;
        }

        lastTauntAt = Date.now();
        synth = window.speechSynthesis;
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'cs-CZ';
        utterance.pitch = 1.08;
        utterance.rate = 1.03;
        utterance.volume = 0.9;

        if (synth.speaking) {
            synth.cancel();
        }

        synth.speak(utterance);
    };

    namespace.stopTaunt = function() {
        if (!window.speechSynthesis) {
            return;
        }

        window.speechSynthesis.cancel();
    };

    function getAudioContext() {
        if (audioContext) {
            return audioContext;
        }

        var Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) {
            return null;
        }

        audioContext = new Context();
        return audioContext;
    }

    function ensureAudioReady(ctx) {
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function getNoiseBuffer(ctx) {
        if (noiseBuffer) {
            return noiseBuffer;
        }

        var length = ctx.sampleRate;
        var data;
        var i;

        noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
        data = noiseBuffer.getChannelData(0);

        for (i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return noiseBuffer;
    }

    function playPreset(ctx, preset) {
        var masterGain = 1 + randomSpread(preset.gainJitter || 0);
        var pitchFactor = 1 + randomSpread(preset.pitchJitter || 0);
        var i;

        for (i = 0; i < preset.segments.length; i++) {
            playFartSegment(ctx, preset.segments[i], masterGain, pitchFactor);
        }
    }

    function playFartSegment(ctx, segment, masterGain, pitchFactor) {
        var now = ctx.currentTime + (segment.delay || 0);
        var duration = segment.duration || 0.18;
        var attack = segment.attack || 0.012;
        var startFrequency = Math.max(30, (segment.baseFrequency || 110) * pitchFactor);
        var endFrequency = Math.max(24, (segment.endFrequency || 60) * pitchFactor);
        var tone = ctx.createOscillator();
        var wobble = ctx.createOscillator();
        var wobbleGain = ctx.createGain();
        var toneFilter = ctx.createBiquadFilter();
        var envelope = ctx.createGain();
        var noise = ctx.createBufferSource();
        var noiseFilter = ctx.createBiquadFilter();
        var noiseGain = ctx.createGain();

        tone.type = segment.toneType || 'sawtooth';
        tone.frequency.setValueAtTime(startFrequency, now);
        tone.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);

        wobble.type = 'sine';
        wobble.frequency.setValueAtTime(segment.wobble || 10, now);
        wobbleGain.gain.setValueAtTime(segment.wobbleDepth || 12, now);

        toneFilter.type = 'lowpass';
        toneFilter.frequency.setValueAtTime(segment.filter || 700, now);
        toneFilter.Q.value = 1.4;

        envelope.gain.setValueAtTime(0.0001, now);
        envelope.gain.exponentialRampToValueAtTime(Math.max(0.02, (segment.gain || 0.1) * masterGain), now + attack);
        envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.buffer = getNoiseBuffer(ctx);
        noise.loop = true;

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(segment.noiseFilter || 180, now);
        noiseFilter.Q.value = 0.6;

        noiseGain.gain.setValueAtTime(segment.noise || 0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        wobble.connect(wobbleGain);
        wobbleGain.connect(tone.frequency);

        tone.connect(toneFilter);
        toneFilter.connect(envelope);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(envelope);

        envelope.connect(ctx.destination);

        tone.start(now);
        wobble.start(now);
        noise.start(now);

        tone.stop(now + duration);
        wobble.stop(now + duration);
        noise.stop(now + duration);
    }

    function scheduleFlushBubble(ctx, time, frequency, volume) {
        var bubble = ctx.createOscillator();
        var gain = ctx.createGain();

        bubble.type = 'triangle';
        bubble.frequency.setValueAtTime(frequency, time);
        bubble.frequency.exponentialRampToValueAtTime(frequency * 0.55, time + 0.11);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);

        bubble.connect(gain);
        gain.connect(ctx.destination);

        bubble.start(time);
        bubble.stop(time + 0.11);
    }

    function randomSpread(amount) {
        return (Math.random() * 2 - 1) * amount;
    }

    if (ambientToggle) {
        ambientToggle.addEventListener('click', namespace.toggleAmbient);
        ambientToggle.innerHTML = 'spustit ventilaci';
    }
})(BULANCI.Audio);
