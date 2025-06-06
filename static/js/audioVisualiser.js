function main(){
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Bar{
        constructor(x,y,width,height,color, index){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.index = index;

        }
        update(micInput){
            this.height = micInput * 1000;

        }
        draw(ctx){
            ctx.strokeStyle = this.color;
            ctx.save();

            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(this.index);
            ctx.beginPath();
            ctx.moveTo(this.x, this.height);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();

            ctx.restore();
        }
    }
    
    const microphone = new Microphone(512);
    let bars = [];
    let barWidth = canvas.width/256;
    function createBars(){
        for(let i = 0; i <256; i++){
            let color = 'hsl('+i*2+',100%,50%)'
            bars.push(new Bar(
                i * barWidth, 
                canvas.height/2, 
                1, 
                20, 
                color,
                i
            ));
        }
    }
    createBars();
    function animate(){
        if (microphone.initialized){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            const samples = microphone.getSamples();
            console.log(samples);
            bars.forEach(function(bar, i){
                bar.update(samples[i]);
                bar.draw(ctx);
        });

        }
        
        requestAnimationFrame(animate)
        
    }
    animate();
}

