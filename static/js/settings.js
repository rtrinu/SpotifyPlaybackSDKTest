export const settings = {
    backgroundColor: '#000000',
};

export function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
}