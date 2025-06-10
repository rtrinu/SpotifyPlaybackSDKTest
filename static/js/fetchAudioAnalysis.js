export async function fetchAudioAnalysis(trackId, accessToken) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const analysis = await response.json();
        console.log('Audio Analysis Data:', analysis);
        return analysis;
    } catch (error) {
        console.error('Failed to fetch audio analysis:', error);
        throw error;
    }
}