function average(arr) {
    if (!arr.length) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

const bassHistory = [];
const midsHistory = [];
const trebleHistory = [];
const MAX_HISTORY = 60;

function normalize(value, history) {
    if (!history.length) return 0;
    const min = Math.min(...history);
    const max = Math.max(...history);
    if (max === min) return 0;
    return (value - min) / (max - min);
}

export function getFrequencyBands(freqData, sampleRate, FFTSIZE) {
    if (!freqData || !freqData.length || !sampleRate || !FFTSIZE) {
        return { bass: 0, mids: 0, treble: 0, normBass: 0, normMids: 0, normTreble: 0 };
    }

    const nyquist = sampleRate / 2;
    const bins = freqData.length; // Usually FFTSIZE / 2

    // Convert frequency (Hz) to bin index
    const binFor = (freq) => Math.floor((freq / nyquist) * bins);

    const bassStart = binFor(20);
    const bassEnd = binFor(250);
    const midsStart = binFor(250);
    const midsEnd = binFor(4000);
    const trebleStart = binFor(4000);
    const trebleEnd = binFor(16000);

    // Guard against invalid ranges
    const safeSlice = (start, end) => {
        if (start >= end || start >= freqData.length) return [];
        return freqData.slice(start, Math.min(end, freqData.length));
    };

    const bass = average(safeSlice(bassStart, bassEnd));
    const mids = average(safeSlice(midsStart, midsEnd));
    const treble = average(safeSlice(trebleStart, trebleEnd));

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
