import { autoCorrelate, PitchSmoother } from './pitchDetection.js';
import { getFrequencyBands } from './frequencyBands.js';
import { settings } from './settings.js';

async function main() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let FFTSIZE = settings.bars.count;
    let BARS = FFTSIZE / 2;
    const pitchSmoother = new PitchSmoother(5);
    const TWO_PI = Math.PI * 2;
    let microphone = new Microphone(FFTSIZE);
    await microphone.initPromise;

    let barWidth = canvas.width / BARS;
    let bars = [];
    let ripples = [];
    let trebleParticles = [];
    let frameCount = 0;
    let angle = 0;
    let firstRippleTriggered = false;
    const pitchThreshold = settings.ripples.sens
    const pitchGap = 50;

    window.addEventListener('resize', () => {
        resizeCanvas();
        createBars();
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        barWidth = canvas.width / BARS;
    }

    async function updateAudioSettings() {
        // Update BARS and FFTSIZE from current settings
        BARS = settings.bars.count;
        FFTSIZE = BARS * 2;

        // Update barWidth based on new number of bars and canvas size
        barWidth = canvas.width / BARS;

        // Destroy old microphone if exists
        if (microphone) {
            microphone.stop();
        }

        // Create new microphone instance with new FFTSIZE
        microphone = new Microphone(FFTSIZE);

        // Rebuild bars array for new bar count
        console.log(`Updating audio settings: BARS = ${BARS}, FFTSIZE = ${FFTSIZE}`);
        createBars();
    }
    window.updateAudioSettings = updateAudioSettings;

    class Bar {
        constructor(x, y, width, index) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = 0;
            this.index = index;
            this.baseHue = settings.bars.defaultHue;
            this.smoothedInput = 0;
            this.smoothingFactor = settings.bars.smoothingFactor;
            this.rotation = settings.rotation.speed;
            this.colourSpeed = settings.bars.hueSpeed;
            this.lineWidth = settings.bars.lineWidth;
        }

        update(input) {
            this.smoothingFactor = settings.bars.smoothingFactor;
            this.colourSpeed = settings.bars.hueSpeed;

            if (settings.bars.mode === 'hue'){
                this.baseHue = (this.baseHue + this.colourSpeed) % 360;
                this.rotation = this.index * settings.rotation.speed;
                this.solidColor = null;
            }else{
                this.solidColor = settings.bars.solidColor;
            }
            
            this.smoothedInput += (input - this.smoothedInput) * this.smoothingFactor;
            const sound = this.smoothedInput * 200;
            if (sound > this.height) {
                this.height = sound;
            } else {
                this.height -= this.height * 0.05;
            }
            this.height = Math.min(Math.max(this.height, 2), 1000);
            this.baseHue = (this.baseHue + this.colourSpeed) % 360;
        }

        draw(context, normMids) {
            this.lineWidth = settings.bars.lineWidth;
            const scale = 1 + normMids * 0.02;

            if (settings.bars.mode === 'hue') {
                context.strokeStyle = `hsl(${this.baseHue}, 100%, 50%)`;
            } else {
                context.strokeStyle = this.solidColor;
            }
            
            context.lineWidth = this.lineWidth;
            context.save();
            context.rotate(this.rotation);
            context.scale(scale, scale);

            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, this.height);
            

            context.strokeRect(this.y, this.y, this.height, this.height);

            context.beginPath();
            context.arc(this.x + this.index * -1.5, this.y, this.height * 0.1, 0, TWO_PI);
            context.stroke();
            context.restore();
        }
    }

    class Ripple {
        constructor(pitch, cx, cy) {
            this.x = cx;
            this.y = cy;
            this.radius = 10;
            this.alpha = 1;
            this.lineWidth = 0.7;
            this.pitch = pitch;
            this.growthRate = 1 + (pitch / 100);
            const sensitivity = settings.ripples.sens
            this.growthRate = Math.max(1, Math.min(this.growthRate, sensitivity / 10));
            
        }

        update() {
            const sensitivity = settings.ripples.sens;
            this.radius += this.growthRate;
            this.alpha -= 0.01 * sensitivity;
        }

        draw(ctx) {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.strokeStyle = `hsla(${this.pitch % 360}, 100%, 50%, ${this.alpha})`;
            ctx.globalAlpha = this.alpha;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
            ctx.stroke();
            ctx.restore();
        }

        isAlive() {
            return this.alpha > 0;
        }
    }

    function updateTrebleParticles(trebleValue, width, height) {
        if (trebleValue > 0.3) {
            for (let i = 0; i < 5; i++) {
                trebleParticles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    alpha: 1,
                    size: Math.random() * 2 + 1,
                });
            }
        }

        trebleParticles.forEach(p => {
            p.alpha -= 0.02;
            p.y -= 0.5;
        });

        trebleParticles = trebleParticles.filter(p => p.alpha > 0);
    }

    function drawTrebleParticles(ctx) {
        trebleParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `hsl(60, 100%, 80%)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
            ctx.fill();
            ctx.restore();
        });
    }

    function createBars() {
        bars = [];
        for (let i = 0; i < BARS; i++) {
            bars.push(new Bar(
                i * barWidth / 2,
                i * 1.5,
                1,
                i
            ));
        }
    }

    resizeCanvas();
    createBars();
    await updateAudioSettings();

    function animate() {
        if (microphone.initialized) {
            
            const width = canvas.width;
            const height = canvas.height;
            frameCount++;

            ctx.fillStyle = settings.background.color;
            ctx.fillRect(0, 0, width, height);

            const samples = microphone.getTimeDomainSamples();
            const volume = microphone.getVolume();
            let rawPitch = 0;

            if (frameCount % 3 === 0) {
                rawPitch = autoCorrelate(samples, microphone.audioContext.sampleRate);
                pitchSmoother.add(rawPitch);
            }

            const smoothPitch = pitchSmoother.getAverage();
            let lastRipplePitch = 0;
            const currentThreshold = firstRippleTriggered ? pitchThreshold: settings.ripples.sens; ;

            if (smoothPitch && smoothPitch > currentThreshold &&
                Math.abs(smoothPitch - lastRipplePitch) > pitchGap) {
                ripples.push(new Ripple(smoothPitch, width / 2, height / 2));
                lastRipplePitch = smoothPitch;
                firstRippleTriggered = true;
            }
            console.log("Ripple Threshold:", currentThreshold)

            const freqData = microphone.getFrequencyData();
            const { normBass, normMids, normTreble } = getFrequencyBands(freqData, microphone.audioContext.sampleRate, FFTSIZE);

            
            ctx.save();
            ctx.translate(width / 2, height / 2);
            if(settings.rotation.speed !== 0){
                angle += (settings.rotation.speed * 0.05) + (volume * 0.00005);
                ctx.rotate(angle);
            }
            

            bars.forEach((bar, i) => {
                const barAngle = (i / BARS) * TWO_PI + angle;
                const oscillation = Math.sin(i * 0.3 + angle * 10) * 0.1;
                ctx.rotate(barAngle);
                bar.update(normBass + oscillation);
                bar.draw(ctx, normMids);
            });
            ctx.restore();

            ripples.forEach(ripple => {
                ripple.update();
                ripple.draw(ctx);
            });
            ripples = ripples.filter(r => r.isAlive());
            updateTrebleParticles(normTreble, width, height);
            drawTrebleParticles(ctx);
        }
        requestAnimationFrame(animate);
    }

    animate();
}

main();
