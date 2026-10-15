/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const originalFile = fs.readFileSync(path.resolve(__dirname, './insulation_explorer.js'), 'utf8');

describe('Insulation Explorer tests', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="material-menu"></div>
            <input type="checkbox" id="abToggle" />
            <div id="assembly-stack-A"></div>
            <div id="assembly-stack-B"></div>
            <div id="r-value-winter-A"></div>
            <div id="r-value-summer-A"></div>
            <div id="r-value-winter-B"></div>
            <div id="r-value-summer-B"></div>
            <div id="inspector-A"></div>
            <div id="inspector-B"></div>
            <div id="warnings-A"></div>
            <div id="warnings-B"></div>
            <div id="stack-container-B"></div>
            <div id="stats-B"></div>
            <div id="label-A"></div>
            <div id="target-selector"></div>
            <button id="btn-target-A"></button>
            <button id="btn-target-B"></button>
        `;

        window.calculate = jest.fn(() => ({
            r_winter: 1,
            r_summer: 2,
            warnings: []
        }));
    });

    describe('calculateStack', () => {
        it('calculates totals correctly with vapor barrier', () => {
            const stack = [
                { r: 2.5, type: 'insulation', thickness: 2, cost: 10 },
                { r: 5, type: 'vapor', thickness: 0.1, cost: 2 }
            ];
            
            function calculateStack(stack) {
                let totalR = 0;
                let totalCost = 0;
                let totalThickness = 0;
                let hasVaporBarrier = false;
                for (const layer of stack) {
                    totalR += (layer.r || 0);
                    totalCost += (layer.cost || 0);
                    totalThickness += (layer.thickness || 0);
                    if (layer.type === 'vapor') {
                        hasVaporBarrier = true;
                    }
                }
                return { totalR, totalCost, totalThickness, hasVaporBarrier };
            }
            
            const results = calculateStack(stack);
            
            expect(results.totalR).toBe(7.5);
            expect(results.totalCost).toBe(12);
            expect(results.totalThickness).toBe(2.1);
            expect(results.hasVaporBarrier).toBe(true);
        });

        it('calculates totals correctly without vapor barrier', () => {
            const stack = [
                { r: 2.5, type: 'insulation', thickness: 2, cost: 10 },
                { r: 0.5, type: 'sheathing', thickness: 0.5, cost: 5 }
            ];
            
            function calculateStack(stack) {
                let totalR = 0;
                let totalCost = 0;
                let totalThickness = 0;
                let hasVaporBarrier = false;
                for (const layer of stack) {
                    totalR += (layer.r || 0);
                    totalCost += (layer.cost || 0);
                    totalThickness += (layer.thickness || 0);
                    if (layer.type === 'vapor') {
                        hasVaporBarrier = true;
                    }
                }
                return { totalR, totalCost, totalThickness, hasVaporBarrier };
            }

            const results = calculateStack(stack);
            
            expect(results.totalR).toBe(3.0);
            expect(results.totalCost).toBe(15);
            expect(results.totalThickness).toBe(2.5);
            expect(results.hasVaporBarrier).toBe(false);
        });
    });

    describe('Layer manipulation', () => {
        let stacks;
        let MATERIALS;

        beforeEach(() => {
            stacks = { A: [], B: [] };
            MATERIALS = {
                'Material1': { r: 2.5, type: 'insulation', thickness: 2, name: 'Mat1', cost: 10 },
                'Material2': { r: 5, type: 'vapor', thickness: 0.1, name: 'Vapor1', cost: 2 }
            };
        });

        function addLayer(key, activeStackId = 'A') {
            const material = MATERIALS[key];
            if (!material) return;
            stacks[activeStackId].push({
                ...material,
                key: key,
                id: Math.random().toString(36).substring(2)
            });
        }

        function removeLayer(id) {
            if (stacks.A.some(l => l.id === id)) {
                stacks.A = stacks.A.filter(l => l.id !== id);
            } else if (stacks.B.some(l => l.id === id)) {
                stacks.B = stacks.B.filter(l => l.id !== id);
            }
        }

        function moveLayer(index, direction, stackId = 'A') {
            const currentStack = stacks[stackId];
            if (!currentStack) return;

            if (direction === -1 && index > 0) {
                [currentStack[index], currentStack[index - 1]] = [currentStack[index - 1], currentStack[index]];
            } else if (direction === 1 && index < currentStack.length - 1) {
                [currentStack[index], currentStack[index + 1]] = [currentStack[index + 1], currentStack[index]];
            }
        }

        function updateThickness(id, newThickness) {
            let layer = stacks.A.find(l => l.id === id);
            if (!layer) {
                layer = stacks.B.find(l => l.id === id);
            }
            if (layer) {
                layer.thickness = parseFloat(newThickness) || 0;
            }
        }

        it('adds a layer to the active stack', () => {
            addLayer('Material1');
            expect(stacks.A.length).toBe(1);
            expect(stacks.A[0].key).toBe('Material1');
        });

        it('removes a layer from the stack', () => {
            addLayer('Material1');
            const layerId = stacks.A[0].id;
            
            removeLayer(layerId);
            expect(stacks.A.length).toBe(0);
        });

        it('moves a layer in the stack', () => {
            addLayer('Material1');
            addLayer('Material2');
            
            expect(stacks.A[0].key).toBe('Material1');
            expect(stacks.A[1].key).toBe('Material2');
            
            moveLayer(0, 1, 'A');
            
            expect(stacks.A[0].key).toBe('Material2');
            expect(stacks.A[1].key).toBe('Material1');
            
            moveLayer(1, -1, 'A');
            
            expect(stacks.A[0].key).toBe('Material1');
            expect(stacks.A[1].key).toBe('Material2');
        });

        it('updates layer thickness', () => {
            addLayer('Material1');
            const layerId = stacks.A[0].id;
            
            expect(stacks.A[0].thickness).toBe(2);
            
            updateThickness(layerId, '3.5');
            expect(stacks.A[0].thickness).toBe(3.5);
        });
    });

    describe('Serialization and Deserialization', () => {
        let stacks;

        beforeEach(() => {
            stacks = { A: [], B: [] };
        });

        function serializeConfiguration(isABEnabled = false) {
            const params = new URLSearchParams();

            const getKeys = (s) => s.map(l => l.key).filter(k => k).join(',');

            if (stacks.A.length > 0) params.set('a', getKeys(stacks.A));
            if (stacks.B.length > 0) params.set('b', getKeys(stacks.B));
            if (isABEnabled) params.set('ab', '1');

            return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        }

        function deserializeConfiguration(searchParams) {
            const params = new URLSearchParams(searchParams);
            if (!params.has('a') && !params.has('b') && !params.has('ab')) return false;

            stacks.A = [];
            stacks.B = [];

            const load = (param, stackId) => {
                const keysStr = params.get(param);
                if (keysStr) {
                    keysStr.split(',').forEach(key => {
                        stacks[stackId].push({ key });
                    });
                }
            };

            load('a', 'A');
            load('b', 'B');

            return { success: true, isABEnabled: params.get('ab') === '1' };
        }

        it('serializes empty configuration correctly', () => {
            const url = serializeConfiguration();
            expect(url).toBe('http://localhost/?');
        });

        it('serializes single stack configuration correctly', () => {
            stacks.A.push({ key: 'Material1' });
            const url = serializeConfiguration();
            expect(url).toBe('http://localhost/?a=Material1');
        });
        
        it('serializes both stacks and AB toggle correctly', () => {
            stacks.A.push({ key: 'Material1' });
            stacks.B.push({ key: 'Material2' });
            
            const url = serializeConfiguration(true);
            expect(url).toContain('a=Material1');
            expect(url).toContain('b=Material2');
            expect(url).toContain('ab=1');
        });

        it('deserializes configuration correctly', () => {
            const searchParams = '?a=Material1,Material2&b=Material3&ab=1';
            
            const result = deserializeConfiguration(searchParams);
            
            expect(result.success).toBe(true);
            expect(result.isABEnabled).toBe(true);
            expect(stacks.A.length).toBe(2);
            expect(stacks.A[0].key).toBe('Material1');
            expect(stacks.A[1].key).toBe('Material2');
            expect(stacks.B.length).toBe(1);
            expect(stacks.B[0].key).toBe('Material3');
        });

        it('returns false when no configuration params are present', () => {
            const searchParams = '?other=param';
            const result = deserializeConfiguration(searchParams);
            expect(result).toBe(false);
        });
    });
});
