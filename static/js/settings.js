export const settings = {
    background:{
        color: '#000000',
    },
    rotation:{
        speed: 0.003,
        defaultSpeed: 0.003,
        volumeMultiplier: 0.003,
        defaultVolumeMultiplier: 0.003,
    },
    bars:{
        mode: 'hue',
        hueSpeed: 0.2,
        solidColor: '#ffffff',
        defaultHue: 0,
        smoothingFactor: 0.1,
    },
    ripples:{},
    particles:{},
};

export function updateSettings(newSettings) {
    mergeDeep(settings, newSettings);
}

function mergeDeep(target, source) {
    for (const feature in source){
        if (source[feature] instanceof Object &&
            feature in target &&
            target[feature] instanceof Object) {
            mergeDeep(target[feature], source[feature]);
        } else{
            target[feature] = source[feature];
        }
    }
}

export function printSettings() {
    console.log('Current Settings:');
    console.log(JSON.stringify(settings, null, 2));
}