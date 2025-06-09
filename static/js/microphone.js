class Microphone {
    constructor(fftSize) {
        this.initialized = false;
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.dataArray = null;
        this.stream = null;
        this.fftSize = fftSize;
        
        this.initPromise = this._initializeMicrophone();
    }

    async _initializeMicrophone() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }, 
                video: false 
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = 0.8; // Smoother transitions
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.microphone.connect(this.analyser);
            this.initialized = true;
            
            return this;
        } catch (err) {
            console.error('Microphone initialization failed:', err);
            this._showPermissionError();
            throw err;
        }
    }

    _showPermissionError() {
        const errorElement = document.createElement('div');
        errorElement.style.position = 'fixed';
        errorElement.style.top = '0';
        errorElement.style.left = '0';
        errorElement.style.right = '0';
        errorElement.style.backgroundColor = 'red';
        errorElement.style.color = 'white';
        errorElement.style.padding = '1rem';
        errorElement.style.zIndex = '1000';
        errorElement.textContent = 'Microphone access required. Please refresh and allow permission.';
        document.body.appendChild(errorElement);
    }

    getSamples() {
        if (!this.initialized) return new Array(this.fftSize/2).fill(0);
        this.analyser.getByteTimeDomainData(this.dataArray);
        return Array.from(this.dataArray).map(e => e/128 - 1);
    }

    getVolume() {
        if (!this.initialized) return 0;
        this.analyser.getByteTimeDomainData(this.dataArray);
        const sum = this.dataArray.reduce((acc, val) => acc + Math.pow(val/128 - 1, 2), 0);
        return Math.sqrt((sum / this.dataArray.length)*1000);
    }

    async stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            await this.audioContext.close();
        }
        this.initialized = false;
    }
}