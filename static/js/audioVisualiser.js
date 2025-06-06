const fftSize =128;
const microphone = new Microphone(fftSize);
let bars = [];
let canvas, ctx;

class Bar {
    constructor(x, y, width, height, color, index) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.index = index;
    }
    
    update(micInput) {
        const sound = micInput * 1000;
        if (sound>this.height){
            this.height = sound;
        }else{
            this.height -=  this.height * 0.015;

        }
    }
        draw(context, volume) {
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

function init() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    resizeCanvas();
    
    createBars();
    animate();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        createBars();
    });
}
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function createBars() {
    bars = [];
    const barWidth = canvas.width / fftSize;
    
    for (let i = 0; i < fftSize; i++) {
        const color = `hsl(${i}, 100%, 50%)`;
        //const color = 'hsl(0, 100%, 50%)'; // Fixed color for all bars
        bars.push(new Bar(
            i * barWidth/2,
            i,
            barWidth * 0.5,
            1,
            color, i
        ));
    }
}
let angle = 0;
let softVolume = 0;
let hueRotation = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const samples = microphone.getSamples();
    const volume = microphone.getVolume();
    angle += 0.0001 + softVolume*0.3; // Increment angle for rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle*0.5 + softVolume * 0.01); // Apply rotation based on angle and volume
    bars.forEach((bar, i) => {
        bar.update(samples[i] || softVolume);
        //bar.color = `hsl(${(i + hueRotation) % 360}, 100%, 50%)`;
        bar.draw(ctx, softVolume*0.4);
    });
    ctx.restore();
    softVolume = softVolume * 0.90 + volume * 0.1; // Smooth volume transition
    
    requestAnimationFrame(animate);
}

window.addEventListener('load', init);