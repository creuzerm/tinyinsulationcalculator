/**
 * @jest-environment jsdom
 */


const { serializeConfig, deserializeConfig } = require('../existing_building_estimator.js');


// Use pushState to set mock search params safely in JSDOM
function setMockUrl(searchParams) {
    const url = new URL(window.location.href);
    url.search = searchParams;
    window.history.pushState({}, '', url);
}
setMockUrl('');



const CONFIG_FIELDS = [
    'spaceLength', 'spaceWidth', 'spaceHeight', 'tIndoorAir', 'tOutdoorAir',
    'qHvac', 'hvacMode', 'targetComponentType', 'targetComponentArea',
    'tTargetSurfaceIndoor', 'tTargetSurfaceOutdoor', 'achRate',
    'areaWindows', 'areaOtherWallsCeilings', 'areaFloor'
];

describe('URL Configuration Serialization', () => {


    beforeEach(() => {
        // Setup mock DOM
        document.body.innerHTML = CONFIG_FIELDS.map(id =>
            `<input type="text" id="${id}" value="">`
        ).join('');



setMockUrl('');
    });

    test('serializeConfig returns correct query string', () => {
        document.getElementById('spaceLength').value = '100';
        document.getElementById('tIndoorAir').value = '72';
        document.getElementById('hvacMode').value = 'heating';

        const queryString = serializeConfig();
        const params = new URLSearchParams(queryString);

        expect(params.get('spaceLength')).toBe('100');
        expect(params.get('tIndoorAir')).toBe('72');
        expect(params.get('hvacMode')).toBe('heating');

        // Ensure unset values are not serialized
        expect(params.has('spaceWidth')).toBe(false);
    });

    test('deserializeConfig correctly populates DOM fields', () => {


setMockUrl('?spaceLength=200&tIndoorAir=68&hvacMode=cooling');

        const hasParams = deserializeConfig();

        expect(hasParams).toBe(true);
        expect(document.getElementById('spaceLength').value).toBe('200');
        expect(document.getElementById('tIndoorAir').value).toBe('68');
        expect(document.getElementById('hvacMode').value).toBe('cooling');
        expect(document.getElementById('spaceWidth').value).toBe('');
    });

    test('deserializeConfig ignores prototype poisoning attempts', () => {
        setMockUrl('?__proto__[polluted]=true&constructor[polluted]=true&spaceLength=50');
        const hasParams = deserializeConfig();

        expect(hasParams).toBe(false); // Returns false on early abort
        expect({}.polluted).toBeUndefined();
    });

    test('deserializeConfig returns false when no parameters are present', () => {


setMockUrl('');

        const hasParams = deserializeConfig();
        expect(hasParams).toBe(false);
    });

    test('round-trip serialization/deserialization', () => {
        const testData = {
            spaceLength: '150',
            spaceWidth: '200',
            spaceHeight: '10',
            tIndoorAir: '70',
            tOutdoorAir: '32',
            qHvac: '5000',
            hvacMode: 'heating',
            targetComponentType: 'wall',
            targetComponentArea: '500',
            tTargetSurfaceIndoor: '68',
            tTargetSurfaceOutdoor: '30',
            achRate: '0.5',
            areaWindows: '50',
            areaOtherWallsCeilings: '1000',
            areaFloor: '1500'
        };

        // Populate DOM with initial data
        for (const [key, value] of Object.entries(testData)) {
            document.getElementById(key).value = value;
        }

        // Serialize
        const serialized = serializeConfig();

        // Clear DOM
        for (const key of Object.keys(testData)) {
            document.getElementById(key).value = '';
        }

        // Deserialize


setMockUrl(`?${serialized}`);
        deserializeConfig();

        // Verify that original data is restored
        for (const [key, value] of Object.entries(testData)) {
            expect(document.getElementById(key).value).toBe(value);
        }
    });
});
