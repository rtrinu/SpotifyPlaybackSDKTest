export async function fetchAudioAnalysis(trackId){
    try{
        const response = await fetch('/audio-analysis/${trackId');
        if (!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const analysis = await response.json();
        console.log('Audio Analysis Data:', analysis);
        return analysis
    }catch(error){
        console.error('Failed to fetch audio analysis:', error);
        throw error;
    }
}