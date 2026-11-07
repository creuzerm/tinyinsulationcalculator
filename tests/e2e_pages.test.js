/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const PAGES = [
    'index.html',
    'existing_building_estimator.html',
    'insulationexplorer.html',
    'solar_kiln.html'
];

describe('Suite End-to-End Page Lifecycle & Asset Integrity', () => {

    test('all 4 primary application HTML files exist and have valid structure', () => {
        PAGES.forEach(page => {
            const filePath = path.resolve(__dirname, '..', page);
            expect(fs.existsSync(filePath)).toBe(true);

            const content = fs.readFileSync(filePath, 'utf8');
            expect(content).toContain('<!DOCTYPE html>');
            expect(content).toContain('<html');
            expect(content).toContain('<head>');
            expect(content).toContain('<body');
            expect(content).toContain('styles.css');
            expect(content).toContain('skin.css');
            expect(content).toContain('skin.js');
        });
    });

    test('persistent suite navigation is symmetric across all 4 pages', () => {
        PAGES.forEach(page => {
            const content = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf8');
            document.body.innerHTML = content;

            const nav = document.querySelector('.app-nav');
            expect(nav).not.toBeNull();

            const links = Array.from(nav.querySelectorAll('a')).map(a => a.getAttribute('href'));
            expect(links).toContain('index.html');
            expect(links).toContain('existing_building_estimator.html');
            expect(links).toContain('insulationexplorer.html');
            expect(links).toContain('solar_kiln.html');
            expect(links).toContain('#'); // Help / Documentation modal trigger
        });
    });

    test('all referenced local scripts and stylesheets physically exist', () => {
        PAGES.forEach(page => {
            const content = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf8');
            document.body.innerHTML = content;

            // Check stylesheets
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .map(l => l.getAttribute('href'))
                .filter(href => !href.startsWith('http'));

            links.forEach(href => {
                const cleanHref = href.split('?')[0];
                const assetPath = path.resolve(__dirname, '..', cleanHref);
                expect(fs.existsSync(assetPath)).toBe(true);
            });

            // Check script tags
            const scripts = Array.from(document.querySelectorAll('script[src]'))
                .map(s => s.getAttribute('src'))
                .filter(src => !src.startsWith('http'));

            scripts.forEach(src => {
                const cleanSrc = src.split('?')[0];
                const scriptPath = path.resolve(__dirname, '..', cleanSrc);
                expect(fs.existsSync(scriptPath)).toBe(true);
            });
        });
    });

    test('all interactive forms define compliant WebMCP metadata', () => {
        PAGES.forEach(page => {
            const content = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf8');
            document.body.innerHTML = content;

            const forms = Array.from(document.querySelectorAll('form[toolname]'));
            forms.forEach(form => {
                expect(form.getAttribute('tooldescription')).toBeTruthy();
                expect(form.getAttribute('toolaction')).toBeTruthy();

                // Form fields should have toolparamdescription
                const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
                inputs.forEach(input => {
                    if (input.type !== 'submit' && input.type !== 'button') {
                        expect(input.hasAttribute('toolparamdescription') || input.hasAttribute('data-model')).toBe(true);
                    }
                });
            });
        });
    });

    test('data files materials.json and internal_gains.json are valid JSON schemas', () => {
        const materialsPath = path.resolve(__dirname, '../materials.json');
        const gainsPath = path.resolve(__dirname, '../internal_gains.json');

        const materials = JSON.parse(fs.readFileSync(materialsPath, 'utf8'));
        const gains = JSON.parse(fs.readFileSync(gainsPath, 'utf8'));

        expect(materials.Structure).toBeDefined();
        expect(materials['Batt Insulation']).toBeDefined();
        expect(materials['Foam Boards']).toBeDefined();
        expect(materials['Spray Foam']).toBeDefined();
        expect(materials['Radiant & Films']).toBeDefined();
        expect(materials.solar_kiln_materials).toBeDefined();

        expect(gains.appliances).toBeDefined();
    });

    test('.well-known/webmcp.json discovery manifest exists and registers all tools', () => {
        const manifestPath = path.resolve(__dirname, '../.well-known/webmcp.json');
        expect(fs.existsSync(manifestPath)).toBe(true);

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        expect(manifest.name).toBeDefined();
        expect(Array.isArray(manifest.tools)).toBe(true);

        const toolNames = manifest.tools.map(t => t.name);
        expect(toolNames).toContain('apply_preset');
        expect(toolNames).toContain('set_dimensions');
        expect(toolNames).toContain('run_simulation');
        expect(toolNames).toContain('get_detailed_results');
        expect(toolNames).toContain('estimate_r_value');
        expect(toolNames).toContain('calculate_solar_kiln_performance');
    });
});
