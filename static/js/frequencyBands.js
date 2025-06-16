function average(arr) {
    if (!arr.length) return 0;
    const sum = arr.reduce((sum, val) => sum + val, 0);
    return sum / arr.length;
}

const bassHistory = [];
const midsHistory = [];
const trebleHistory = [];
const MAX_HISTORY = 60;

function normalize(value, history) {
    if (!history.length) {
        return 0;
    }
    const min = Math.min(...history);
    const max = Math.max(...history);
    if (max === min) {
        return 0;
    }
    const normalized = (value - min) / (max - min);
    return normalized;
}

// Main function
export function getFrequencyBands(freqData, sampleRate, fftSize) {
    if (!freqData || !freqData.length || !sampleRate || !fftSize) {
        return { bass: 0, mids: 0, treble: 0, normBass: 0, normMids: 0, normTreble: 0 };
    }

    const nyquist = sampleRate / 2;
    const binCount = freqData.length; // Usually fftSize / 2
    const binWidth = nyquist / binCount;

    const freqRanges = {
        bass: [20, 250],
        mids: [250, 4000],
        treble: [4000, 16000]
    };

    const getRangeAvg = ([lowFreq, highFreq]) => {
        const startBin = Math.floor(lowFreq / binWidth);
        const endBin = Math.min(Math.floor(highFreq / binWidth), binCount);

        if (startBin >= endBin) {
            return 0;
        }

        const slice = freqData.slice(startBin, endBin);
        const avg = average(slice);
        return avg;
    };

    const bass = getRangeAvg(freqRanges.bass);
    const mids = getRangeAvg(freqRanges.mids);
    const treble = getRangeAvg(freqRanges.treble);

    bassHistory.push(bass);
    midsHistory.push(mids);
    trebleHistory.push(treble);

    if (bassHistory.length > MAX_HISTORY) bassHistory.shift();
    if (midsHistory.length > MAX_HISTORY) midsHistory.shift();
    if (trebleHistory.length > MAX_HISTORY) trebleHistory.shift();

    const normBass = normalize(bass, bassHistory);
    const normMids = normalize(mids, midsHistory);
    const normTreble = normalize(treble, trebleHistory);

    return { bass, mids, treble, normBass, normMids, normTreble };
}
