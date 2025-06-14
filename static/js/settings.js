export const settings = {
    backgroundColor: '#000000',
    smoothingFactor: 0.1,
    baseHue: 0,
    solidColor: '#ffffff',
    rotationMultiplier: 0.003,
    colorMode: 'hue',
    defaultBaseHue: 0,
    defaultRotationMultiplier: 0.3,
    volumeRotationMultiplier: 0.003,
};

export function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
}