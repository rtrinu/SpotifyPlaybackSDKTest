export const settings = {
    backgroundColor: '#000000',
    smoothingFactor: 0.1,
    baseHue: 0,
    solidColor: '#ffffff',
    rotationMultipler: 0.3,
    colorMode: 'hue',
    defaultBaseHue: 0,
    defaultRotationMultipler: 0.3
};

export function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
}