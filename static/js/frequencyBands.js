function average(arr){
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

const bassHistory = [];
const midsHistory = [];
const trebleHistory = [];
const MAX_HISTORY = 60;

function normalize(value, history){
    if(history.length === 0) return 0;
    const min = Math.min(...history);
    const max = Math.max(...history);
    if(max === min) return 0;
    return (value - min) / (max - min);
}

export function getFrequencyBands(freqData){
    const bass = average(freqData.slice(0,3));
    const mids = average(freqData.slice(3,12));
    const treble = average(freqData.slice(35,70));

    bassHistory.push(bass);
    midsHistory.push(mids);
    trebleHistory.push(treble);

    if(bassHistory.length > MAX_HISTORY) bassHistory.shift();
    if(midsHistory.length > MAX_HISTORY) midsHistory.shift();
    if(trebleHistory.length > MAX_HISTORY) trebleHistory.shift();

    const normBass = normalize(bass, bassHistory);
    const normMids = normalize(mids, midsHistory);
    const normTreble = normalize(treble, trebleHistory);

    return {bass, mids, treble, normBass, normMids, normTreble};
}
