import { autoCorrelate, PitchSmoother } from './pitchDetection.js';
import { getFrequencyBands } from './frequencyBands.js';

let fpsCounter = 0;
let lastTime = performance.now();
function trackFPS() {
    const now = performance.now();
    fpsCounter++;
    if (now - lastTime >= 1000) {
        console.log("FPS:", fpsCounter);
        fpsCounter = 0;
        lastTime = now;
    }
}

function main(){
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize',()=>{
        resizeCanvas();
        createBars();
    })

    function resizeCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Bar{
        constructor(x,y,width,height,color, index){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.index = index;
            this.baseHue = index*2;

        }
        update(micInput){
            const sound = micInput * 1000;
            if (sound > this.height){
                this.height = sound;
            }else{
                this.height -= this.height * 0.05
            }
            this.baseHue = (this.baseHue + 0.2) % 360;
            this.color = `hsl(${this.baseHue}, 100%, 50%)`;
        }

        draw(context, volume){
            context.strokeStyle = this.color;
            context.save();
            context.translate(0,0);
            context.rotate(this.index * 0.3);
            context.scale(1+ volume* 0.002,1 + volume * 0.002);

            //Centre Path
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(0,this.height);

            //rectangle Path
            context.strokeRect(this.y, this.y, this.height, this.height);

            //circle Path
            context.beginPath();
            context.arc(this.x + this.index*-1.5, this.y, this.height * 0.1, 0, Math.PI * 2);
            context.stroke();
            context.restore();
        }
    }

    class Ripple{
        constructor(pitch, canvasWidth, canvasHeight){
            this.x = canvasWidth / 2;
            this.y = canvasHeight / 2;
            this.radius = 10;
            this.alpha = 1;
            this.lineWidth = 0.7;
            this.pitch = pitch;
            this.growthRate = 2 + (pitch / 300);
        }
        update(){
            this.radius += this.growthRate;
            this.alpha -= 0.01;
        }
        draw(ctx){
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${this.pitch % 360}, 100%, 50%, ${this.alpha})`;
            ctx.globalAlpha = this.alpha;
            ctx.lineWidth = this.lineWidth;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        isAlive(){
            return this.alpha > 0;
        }
    }

    function drawBassCircle(ctx, bassValue, canvasWidth, canvasHeight){
        const radius = bassValue * 2;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle= `hsl(0, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    function drawMidOrbiters(ctx, midsValue, time, canvasWidth, canvasHeight) {
        const numDots = 5;
        const radius = midsValue * 1.5 + 50;
        for (let i = 0; i < numDots; i++) {
            const angle = time * 0.001 + (i * (Math.PI * 2 / numDots));
            const x = canvasWidth / 2 + radius * Math.cos(angle);
            const y = canvasHeight / 2 + radius * Math.sin(angle);
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = `hsl(220, 100%, 60%)`;
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            }
        }

    let trebleParticles = [];

    function updateTrebleParticles(trebleValue, canvasWidth, canvasHeight) {
        console.log('Treble value: ', trebleValue);
        if (trebleValue > 0.3) {
            for (let i = 0; i < 5; i++) {
            trebleParticles.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
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
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }


    const FFTSIZE = 256;
    const BARS = FFTSIZE/2
    const microphone = new Microphone(FFTSIZE);
    
    let bars = [];

    const pitchSmoother = new PitchSmoother(5);
    let ripples = [];
    let firstRippleTriggered = false;
    let pitchThreshold = 50;
    let pitchGap = 50;

    let barWidth = canvas.width/BARS;
    function createBars(){
        bars = [];
        for(let i = 0; i <BARS; i++){
            let color = 'hsl('+i*2+',100%,50%)'
            bars.push(new Bar(
                i * barWidth/2, 
                i*1.5, 
                1, 
                0, 
                color,
                i
            ));
        }
    }

    createBars();
    let angle = 0;
    let frameCount = 0;
    
    function animate(){
        if (microphone.initialized){
            frameCount++;
            //trackFPS();
            ctx.clearRect(0,0,canvas.width, canvas.height);
            
            const samples = microphone.getTimeDomainSamples();
            const volume = microphone.getVolume();
            let rawPitch = 0;
            
            if (frameCount % 3 === 0){
                rawPitch = autoCorrelate(samples, microphone.audioContext.sampleRate);
                pitchSmoother.add(rawPitch);
            }
            const smoothPitch = pitchSmoother.getAverage();
            let lastRipplePitch = 0;
            let currentThreshold = firstRippleTriggered ? pitchThreshold : 10;
            
            if (smoothPitch && smoothPitch > currentThreshold &&
                Math.abs(smoothPitch - lastRipplePitch) > pitchGap) {
                ripples.push(new Ripple(smoothPitch, canvas.width, canvas.height));
                lastRipplePitch = smoothPitch;
                firstRippleTriggered = true;
            }

            const freqData = microphone.getFrequencyData();
            const {bass, mids, treble, normBass, normMids, normTreble} = getFrequencyBands(freqData);

            
            
            angle += 0.001 + (volume*0.005);
            ctx.save();
            
            ctx.translate(canvas.width/2, canvas.height/2 )
            ctx.rotate(angle);
            
            
            bars.forEach(function(bar, i){
                bar.update(samples[i]);
                bar.draw(ctx, volume*0.5);
            });
            ctx.restore();
            ripples.forEach((ripple) => {
                ripple.update();
                ripple.draw(ctx);
            });
            ripples = ripples.filter((ripple) => ripple.isAlive());
            
            drawBassCircle(ctx, bass, canvas.width, canvas.height);
            drawMidOrbiters(ctx, mids, Date.now(), canvas.width, canvas.height);
            
            updateTrebleParticles(normTreble, canvas.width, canvas.height);
            drawTrebleParticles(ctx);
    }


        
        
        requestAnimationFrame(animate)
        
    }
    animate();
}
main();
