/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('UI Skinning Logic & Non-Destructive DOM Injection', () => {
    let skinScript;
    let skinSubdirScript;

    beforeAll(() => {
        skinScript = fs.readFileSync(path.resolve(__dirname, '../skin.js'), 'utf8');
        skinSubdirScript = fs.readFileSync(path.resolve(__dirname, '../skin/skin.js'), 'utf8');
    });

    test('skin.js and skin/skin.js are identical and in sync', () => {
        expect(skinScript).toEqual(skinSubdirScript);
    });

    test('skin rendering does not utilize unsafe innerHTML assignment', () => {
        // Strip the first line security note which intentionally mentions innerHTML
        const codeLines = skinScript.split('\n').slice(1).join('\n');
        expect(codeLines).not.toContain('.innerHTML');

        const subdirCodeLines = skinSubdirScript.split('\n').slice(1).join('\n');
        expect(subdirCodeLines).not.toContain('.innerHTML');
    });

    test('non-destructively injects brand icon and run button without duplicating', () => {
        document.body.innerHTML = `
            <header>
                <h1>Tiny Home Heat Loss Calculator</h1>
                <p>Initial subtitle</p>
            </header>
            <div id="resultsGrid">Results Area</div>
        `;

        window.calculateAll = jest.fn();

        // First run
        eval(skinScript);

        const icon = document.getElementById('brand-icon');
        expect(icon).not.toBeNull();
        expect(icon.textContent).toBe('TC');

        const btn = document.getElementById('runThermalCheckBtn');
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe('Run Thermal Check');

        // Scroll and calculate on click
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.scrollIntoView = jest.fn();
        btn.click();
        expect(resultsGrid.scrollIntoView).toHaveBeenCalled();
        expect(window.calculateAll).toHaveBeenCalled();

        // Second run (idempotency check)
        eval(skinScript);
        const icons = document.querySelectorAll('#brand-icon');
        const btns = document.querySelectorAll('#runThermalCheckBtn');
        expect(icons.length).toBe(1);
        expect(btns.length).toBe(1);
    });
});
