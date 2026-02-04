// Skin Logic
(function() {
    // 1. Non-Destructive Header Updates
    const header = document.querySelector('header');
    if (header) {
        const h1 = header.querySelector('h1');
        const p = header.querySelector('p');

        if (h1) {
             // Update Text Content (Tone of Voice)
             h1.innerText = "Tiny Home Heat Loss Calculator";

             // Inject Branding Icon (Prepend instead of Replace)
             if (!document.getElementById('brand-icon')) {
                const icon = document.createElement('div');
                icon.id = 'brand-icon';
                icon.textContent = 'TC'; // Or your SVG
                icon.className = 'my-brand-class';
                // Insert before the H1
                h1.parentNode.insertBefore(icon, h1);
            }
        }

        if (p) {
            p.innerText = "Estimate heating load and thermal battery capacity...";
        }
    }

    // 2. Inject "Run Thermal Check" Button
    const resultsGrid = document.getElementById('resultsGrid');
    if (resultsGrid && !document.getElementById('runThermalCheckBtn')) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'text-center mb-6';

        const btn = document.createElement('button');
        btn.id = 'runThermalCheckBtn';
        btn.innerText = 'Run Thermal Check';
        btn.className = 'bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded shadow-md transition-colors duration-200';

        btn.addEventListener('click', () => {
             // Scroll to results
             resultsGrid.scrollIntoView({ behavior: 'smooth' });
             // Trigger calculation
             if (window.calculateAll) window.calculateAll();
        });

        btnContainer.appendChild(btn);

        // Insert before resultsGrid
        resultsGrid.parentNode.insertBefore(btnContainer, resultsGrid);
    }
})();
