class AudioVisualizer {
    constructor(canvasId, fftSize = 128) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.microphone = new Microphone(fftSize);
        this.bars = [];
        this.angle = 0;
        this.smoothVolume = 0;
        this.hueRotation = 0;
        this.animationId = null;
        
        this.init();
    }

    async init() {
        try {
            await this.microphone.initPromise;
            this.setupCanvas();
            this.createBars();
            this.startAnimation();
            
            // Add debug panel
            this.addDebugPanel();
        } catch (err) {
            console.error('Visualizer initialization failed:', err);
        }
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.createBars(); // Recreate bars on resize
        };
        
        resize();
        window.addEventListener('resize', resize);
    }

    createBars() {
        this.bars = [];
        const barCount = this.microphone.fftSize / 2;
        const maxDimension = Math.max(this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < barCount; i++) {
            this.bars.push({
                x: 0,
                y: 0,
                width: 2,
                height: 1,
                color: `hsl(${(i * 360 / barCount) % 360}, 100%, 50%)`,
                index: i,
                targetHeight: 1
            });
        }
    }

    startAnimation() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const samples = this.microphone.getSamples();
            const volume = this.microphone.getVolume();
            this.smoothVolume = this.smoothVolume * 0.9 + volume * 0.1;
            
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.angle += 0.0005 + this.smoothVolume * 0.3;
            this.ctx.rotate(this.angle);
            
            this.bars.forEach((bar, i) => {
                // Update bar properties
                const soundValue = samples[i] || this.smoothVolume;
                bar.targetHeight = Math.max(1, Math.abs(soundValue) * 300);
                bar.height = bar.height * 0.7 + bar.targetHeight * 0.3;
                
                // Draw bar
                this.ctx.save();
                this.ctx.rotate((i / this.bars.length) * Math.PI * 2);
                this.ctx.translate(50 + this.smoothVolume * 5, 0);
                
                // Dynamic color based on volume
                const hue = (this.hueRotation + i * 360 / this.bars.length) % 360;
                this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.2 + this.smoothVolume * 0.8})`;
                
                // Draw shape
                this.ctx.fillRect(0, -bar.height/2, bar.width, bar.height);
                
                this.ctx.restore();
            });
            
            this.ctx.restore();
            this.hueRotation = (this.hueRotation + 0.5) % 360;
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    addDebugPanel() {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.bottom = '10px';
        panel.style.left = '10px';
        panel.style.backgroundColor = 'rgba(0,0,0,0.7)';
        panel.style.color = 'white';
        panel.style.padding = '10px';
        panel.style.borderRadius = '5px';
        panel.style.zIndex = '100';
        
        const volumeText = document.createElement('div');
        const statusText = document.createElement('div');
        
        panel.appendChild(statusText);
        panel.appendChild(volumeText);
        document.body.appendChild(panel);
        
        // Update debug info periodically
        setInterval(() => {
            statusText.textContent = `Status: ${this.microphone.initialized ? 'Active' : 'Inactive'}`;
            volumeText.textContent = `Volume: ${this.smoothVolume.toFixed(4)}`;
        }, 100);
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.microphone.stop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new AudioVisualizer('background-canvas', 256);
    
    // Expose for debugging
    window.visualizer = visualizer;
});