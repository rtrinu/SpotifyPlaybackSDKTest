export function autoCorrelate(buffer, sampleRate){
  let SIZE = buffer.length;
  let maxSamples = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet, no pitch

  let correlations = new Array(maxSamples);

  for (let offset = 1; offset < maxSamples; offset++) {
    let correlation = 0;
    for (let i = 0; i < maxSamples; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / maxSamples;
    correlations[offset] = correlation;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

    if (bestCorrelation > 0.9 && bestOffset > 3) {
    const pitch = sampleRate / bestOffset;
    if (pitch > 50 && pitch < 2000) {
        return pitch;
    }
    }

    return -1; // invalid pitch
}

export class PitchSmoother{
    constructor(size=5){
        this.size = size;
        this.values = [];
    }
    add(value){
        if(value === -1) return;
        this.values.push(value);
        if(this.values.length > this.size){
            this.values.shift();
        }
    }
    getAverage(){
        if (this.values.length === 0) return -1;
        const sum = this.values.reduce((a, b) => a + b, 0);
        return sum / this.values.length;
    }
}
