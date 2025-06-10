import { autoCorrelate, PitchSmoother, normalisePitch } from './pitchDetection.js';


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
            //context.stroke();
            //context.bezierCurveTo(0,0,this.height,this.height,this.x,this.y);
            //context.rotate(this.index * -0.1);

            //rectangle Path
            context.strokeRect(this.y, this.y, this.height, this.height);

            //circle Path
            context.beginPath();
            context.arc(this.x + this.index*-1.5, this.y, this.height * 0.1, 0, Math.PI * 2);
            context.stroke()
            context.restore();
        }
    }

    class Ripple{
        constructor(pitch, canvasWidth, canvasHeight){
            this.x = canvasWidth / 2;
            this.y = canvasHeight / 2;
            this.radius = 10;
            this.alpha = 1;
            this.lineWidth = 0.5;
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
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${this.pitch % 360}, 100%, 50%, ${this.alpha})`;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
            ctx.restore();
        }
        isAlive(){
            return this.alpha > 0;
        }
    }


    const FFTSIZE = 128;
    const BARS = FFTSIZE/2
    const microphone = new Microphone(FFTSIZE);
    const pitchSmoother = new PitchSmoother(5);
    let bars = [];
    let ripples = [];
    let barWidth = canvas.width/BARS;
    function createBars(){
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
    let softVolume = 0;
    let hueRotation = 0;
    
    function animate(){
        if (microphone.initialized){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            
            
            const samples = microphone.getTimeDomainSamples();
            const volume = microphone.getVolume();
            const rawPitch = autoCorrelate(samples, microphone.audioContext.sampleRate);
            pitchSmoother.add(rawPitch);
            const smoothPitch = pitchSmoother.getAverage();
            const normalisedPitch = normalisePitch(smoothPitch);
            
            let pitchThreshold = 100;
            let pitchGap = 100;
            let lastRipplePitch = 0;
            

            if (smoothPitch && smoothPitch > pitchThreshold &&
                Math.abs(smoothPitch - lastRipplePitch) > pitchGap) {
                ripples.push(new Ripple(smoothPitch, canvas.width, canvas.height));
                lastRipplePitch = smoothPitch;
            }
            
            angle += 0.001 + (volume*0.005);
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2 )
            ctx.rotate(angle);
            
            
            bars.forEach(function(bar, i){
                bar.update(samples[i]);
                bar.draw(ctx, volume*0.2);
            });
            ctx.restore();
            ripples.forEach((ripple) => {
                ripple.update();
                ripple.draw(ctx);
            });
            ripples = ripples.filter((ripple) => ripple.isAlive());
    }


        
        
        requestAnimationFrame(animate)
        
    }
    animate();
}
main();
