class Microphone {
    constructor(fftSize) {
        this.initialized = false;
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.dataArray = null;
        
        this.initPromise = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = fftSize;
                const bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(bufferLength);
                this.microphone.connect(this.analyser);
                this.initialized = true;
                return this;
            })
            .catch(err => {
                console.error('Microphone access error:', err);
                alert('Microphone access required for visualization');
                throw err;
            });
    }

    getSamples() {
        if (!this.initialized || !this.analyser) return new Array(256).fill(0);
        this.analyser.getByteTimeDomainData(this.dataArray);
        return [...this.dataArray].map(e => e/128 - 1);
    }

    getVolume() {
        if (!this.initialized || !this.analyser) return 0;
        this.analyser.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e/128 - 1);
        let sum = normSamples.reduce((acc, val) => acc + val * val, 0);
        return Math.sqrt(sum / normSamples.length);
    }
}