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
            const sound = micInput * 1000;
            if (sound > this.height){
                this.height = sound;
            }else{
                this.height -= this.height * 0.1
            }

        }
        draw(ctx){
            ctx.strokeStyle = this.color;
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(this.index * 0.05); 
            //Curvy abstract centre
            /*
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(0, this.height);
            ctx.stroke();*/

            //Big circle hole abstract 
            /*
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.y, this.height);
            ctx.stroke();
            */
           //Spiral Abstract
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.y, this.height);
            ctx.stroke();

            //Rectangles
            ctx.strokeRect(this.y,this.y,this.height/2, 5)





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
                0, 
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
            const samples = microphone.getSamples();
            const volume = microphone.getVolume();
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

