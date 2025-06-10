class Microphone {
    constructor(fftSize) {
        this.initialized = false;
        this.audioContext = null;
        this.microphone = null;
        this.timeDomainAnalyser = null;
        this.freqDomainAnalyser = null;
        this.timeDataArray = null;
        this.freqDataArray = null;
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

            this.timeDomainAnalyser = this.audioContext.createAnalyser();
            this.timeDomainAnalyser.fftSize = this.fftSize;
            this.timeDomainAnalyser.smoothingTimeConstant = 0.8;
            this.timeDataArray = new Uint8Array(this.timeDomainAnalyser.frequencyBinCount);

            this.freqDomainAnalyser = this.audioContext.createAnalyser();
            this.freqDomainAnalyser.fftSize = this.fftSize;
            this.freqDomainAnalyser.smoothingTimeConstant = 0.8;
            this.freqDataArray = new Uint8Array(this.freqDomainAnalyser.frequencyBinCount);


            this.microphone.connect(this.timeDomainAnalyser);
            this.microphone.connect(this.freqDomainAnalyser);

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

    getTimeDomainSamples(){
        if(!this.initialized) return new Array(this.fftSize).fill(0);
        this.timeDomainAnalyser.getByteTimeDomainData(this.timeDataArray);
        return Array.from(this.timeDataArray).map(e => e /128 - 1);
    }
    getFrequencyData() {
        if (!this.initialized) return new Array(this.freqDomainAnalyser.frequencyBinCount).fill(0);
        this.freqDomainAnalyser.getByteFrequencyData(this.freqDataArray);
        return Array.from(this.freqDataArray);
    }
    

    getVolume() {
        if (!this.initialized) return 0;
        this.timeDomainAnalyser.getByteTimeDomainData(this.timeDataArray);
        const sum = this.timeDataArray.reduce((acc, val) => acc + Math.pow(val / 128 - 1, 2), 0);
        return Math.sqrt((sum / this.timeDataArray.length) * 1000);
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