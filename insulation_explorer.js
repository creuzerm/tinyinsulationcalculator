        // Global Data
        let MATERIALS = {};
        let stacks = { A: [], B: [] };
        let activeStackId = 'A';

        // Fetch data and initialize
        async function loadMaterials() {
            try {
                const response = await fetch('materials.json');
                if (!response.ok) throw new Error('Failed to load materials.json');
                const data = await response.json();

                // Flatten the structured JSON into a single lookup object for calculation logic
                MATERIALS = {};
                const menuContainer = document.getElementById('material-menu');
                menuContainer.innerHTML = ''; // Clear loading message

                // Iterate through categories to build UI and lookup table
                for (const [category, items] of Object.entries(data)) {
                    // Create Category Header
                    const header = document.createElement('h4');
                    header.className = 'col-span-full font-semibold text-xs text-gray-500 uppercase tracking-wider mt-2 mb-1 border-b pb-1';
                    header.textContent = category;
                    menuContainer.appendChild(header);

                    // Create Buttons
                    for (const [key, material] of Object.entries(items)) {
                        // Add to lookup
                        MATERIALS[key] = material;

                        // Add Button (skip placeholders if desired, but here we render them if they are valid options)
                        // If placeholder property exists and is true, we might want to disable it or mark it.
                        // For now, per requirements, we just render them.
                        const btn = document.createElement('button');
                        btn.className = 'add-btn shadow-sm transition-colors';
                        btn.onclick = () => addLayer(key);
                        btn.setAttribute('aria-label', `Add ${material.name}`);

                        // Icon mapping based on type
                        let icon = "🧱";
                        if(material.type === 'insulation') icon = "🟦";
                        if(material.name.includes("Fiberglass")) icon = "🧶";
                        if(material.name.includes("Rockwool")) icon = "🪨";
                        if(material.name.includes("Polyiso")) icon = "🟨";
                        if(material.name.includes("EPS")) icon = "⬜";
                        if(material.name.includes("Spray")) icon = "💨";
                        if(material.type === 'radiant') icon = "✨";
                        if(material.type === 'air') icon = "💨";
                        if(material.type === 'vapor') icon = "🛡️";
                        if(material.type === 'sheathing') icon = "🪵";
                        if(material.type === 'finish') icon = "⬜";
                        if(key.includes("Roof")) icon = "🏠";

                        btn.innerText = `${icon} ${material.name.replace(/Rigid Foam|Board|Spray Foam|Batt|Safe'n'Sound|ComfortBatt/g, "").replace(/\(.*\)/, "").trim()} (R-${material.r} | ${material.thickness}")`;

                        // Override concise labels for specific known items to match previous design if needed,
                        // or just use the generated one which is robust.
                        // Let's stick to the generated one for simplicity and consistency.

                        if (material.placeholder) {
                            btn.disabled = true;
                            btn.classList.add('opacity-50', 'cursor-not-allowed');
                            btn.title = "Coming Soon";
                        }

                        menuContainer.appendChild(btn);
                    }
                }

                // Initialize Default Stack
                if (!deserializeConfiguration()) {
                    initStack();
                }

            } catch (error) {
                console.error(error);
                document.getElementById('material-menu').innerHTML = `<p class="col-span-full text-red-500">Error loading materials: ${error.message}</p>`;
            }
        }

        function initStack() {
            // Pre-load a common scenario
            stacks.A = [];
            activeStackId = 'A';
            addLayer('OSB Sheathing');
            addLayer('2x6 Stud (16oc)');
            addLayer('Rockwool (5.5in)');
            addLayer('Drywall');
            stacks.B = [];
        }

        function addLayer(key) {
            const material = MATERIALS[key];
            if (!material) return;

            // Create a unique instance
            stacks[activeStackId].push({
                ...material,
                key: key,
                id: crypto.randomUUID()
            });
            render();
        }

        // Start Loading and store promise
        const materialsLoadedPromise = loadMaterials();

        function removeLayer(id) {
            // Find and remove from appropriate stack
            if (stacks.A.some(l => l.id === id)) {
                stacks.A = stacks.A.filter(l => l.id !== id);
            } else if (stacks.B.some(l => l.id === id)) {
                stacks.B = stacks.B.filter(l => l.id !== id);
            }
            render();
        }

        function moveLayer(index, direction, stackId = activeStackId) {
            const currentStack = stacks[stackId];
            if (!currentStack) return;

            if (direction === -1 && index > 0) {
                [currentStack[index], currentStack[index - 1]] = [currentStack[index - 1], currentStack[index]];
            } else if (direction === 1 && index < currentStack.length - 1) {
                [currentStack[index], currentStack[index + 1]] = [currentStack[index + 1], currentStack[index]];
            }
            render();
        }

        function resetStack() {
            stacks[activeStackId] = [];
            render();
        }

        // WebMCP Tool Registration
        // Note: webmcp.js is loaded as a module, so this script might run before it initializes.
        // We can wait for it or just check if it's there.
        // A robust implementation would wait for the 'webmcp-ready' event if one existed,
        // or we can use a small timeout or assume the module loading order.
        // Since we are in an inline script at the bottom of the body, and webmcp.js is a module in the head (or start of body),
        // let's rely on window.navigator.modelContext being present if the polyfill is immediate,
        // OR simply wrap it in a timeout or event listener if the polyfill is async.
        // Looking at webmcp.js (from memory), it polyfills navigator.modelContext immediately if it's not dynamic import.

        window.addEventListener('load', async () => {
             // Wait for materials to load so tool registration has correct enum
             await materialsLoadedPromise;

             // Menu Toggle Logic
             const menuBtn = document.getElementById('menu-btn');
             const menuDropdown = document.getElementById('menu-dropdown');
             if (menuBtn && menuDropdown) {
                 menuBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     menuDropdown.classList.toggle('hidden');
                 });
                 document.addEventListener('click', (event) => {
                    if (!menuDropdown.classList.contains('hidden') && !menuBtn.contains(event.target) && !menuDropdown.contains(event.target)) {
                        menuDropdown.classList.add('hidden');
                    }
                });
             }

             if (window.navigator && window.navigator.modelContext) {
                window.navigator.modelContext.registerTool({
                    name: "calculate_assembly",
                    description: "Calculate the effective R-value (Winter/Summer) of a wall or roof assembly given a list of layers.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            layers: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: Object.keys(MATERIALS),
                                    description: "The material key (e.g., '2x4 Stud (16oc)', 'Fiberglass Batt (3.5in)')"
                                },
                                description: "Ordered list of layers from Outside to Inside."
                            }
                        },
                        required: ["layers"]
                    },
                    execute: async (args) => {
                        const tempStack = args.layers.map(key => {
                            const mat = MATERIALS[key];
                            if (!mat) throw new Error(`Unknown material: ${key}`);
                            return { ...mat };
                        });
                        return calculate(tempStack);
                    }
                });
             }
        });

        function render() {
            renderStack('A');
            // Check if A/B is active
            if (document.getElementById('abToggle')?.checked) {
                renderStack('B');
            }
        }

        function renderStack(stackId) {
            const currentStack = stacks[stackId];
            const container = document.getElementById(`assembly-stack-${stackId}`);
            if (!container) return;

            container.innerHTML = '<div class="assembly-header">Exterior Air Film</div>';

            currentStack.forEach((layer, index) => {
                const div = document.createElement('div');
                div.className = `layer layer-type-${layer.type}`;
                div.innerHTML = `
                    <div>
                        <strong>${layer.name}</strong><br>
                        <span style="font-size:0.8em">R-${layer.r} | ${layer.thickness}"</span>
                    </div>
                    <div class="layer-controls">
                        <button onclick="moveLayer(${index}, -1, '${stackId}')" aria-label="Move Up">⬆️</button>
                        <button onclick="moveLayer(${index}, 1, '${stackId}')" aria-label="Move Down">⬇️</button>
                        <button onclick="removeLayer(${layer.id})" style="color:red" aria-label="Remove Layer">×</button>
                    </div>
                `;
                container.appendChild(div);
            });

            const results = calculate(currentStack);

            const rWinterEl = document.getElementById(`r-value-winter-${stackId}`);
            const rSummerEl = document.getElementById(`r-value-summer-${stackId}`);
            if (rWinterEl) rWinterEl.innerText = results.r_winter;
            if (rSummerEl) rSummerEl.innerText = results.r_summer;

            // Inspector
            const inspector = document.getElementById(`inspector-${stackId}`);
            const warningBox = document.getElementById(`warnings-${stackId}`);

            if (results.warnings.length > 0 && warningBox) {
                warningBox.style.display = 'block';
                warningBox.innerHTML = results.warnings.join('<br>');
            } else if (warningBox) {
                warningBox.style.display = 'none';
            }

            // Contextual tips
            let tips = "System looks stable.";
            if (currentStack.some(l => l.type === 'radiant')) {
                tips = "Reflectix Tip: In a 2x6 roof truss, using a 'Double Reflectix' method (two layers with two air gaps) can effectively block summer heat, but takes up about 2.5 inches of space. Ensure you have room!";
            }
            if (currentStack.length === 0) tips = "Start adding layers to see results.";

            if (inspector) inspector.innerHTML = `<strong>Inspector Notes:</strong><br>${tips}`;
        }

        function toggleABMode() {
            const isEnabled = document.getElementById('abToggle').checked;
            const containerB = document.getElementById('stack-container-B');
            const statsB = document.getElementById('stats-B');
            const labelA = document.getElementById('label-A');
            const targetSelector = document.getElementById('target-selector');

            if (isEnabled) {
                containerB.classList.remove('hidden');
                statsB.classList.remove('hidden');
                labelA.classList.remove('hidden');
                targetSelector.classList.remove('hidden');

                // If B is empty, clone A for convenience
                if (stacks.B.length === 0 && stacks.A.length > 0) {
                    stacks.B = stacks.A.map(l => ({ ...l, id: Date.now() + Math.random() }));
                }
            } else {
                containerB.classList.add('hidden');
                statsB.classList.add('hidden');
                labelA.classList.add('hidden');
                targetSelector.classList.add('hidden');
                setTarget('A'); // Reset to A
            }
            render();
        }

        function setTarget(stackId) {
            activeStackId = stackId;

            // UI Feedback
            const btnA = document.getElementById('btn-target-A');
            const btnB = document.getElementById('btn-target-B');

            if (stackId === 'A') {
                btnA.className = "flex-1 py-1 px-2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-300 shadow-inner";
                btnB.className = "flex-1 py-1 px-2 rounded bg-gray-100 text-gray-600 border border-gray-300 hover:bg-green-50";
            } else {
                btnA.className = "flex-1 py-1 px-2 rounded bg-gray-100 text-gray-600 border border-gray-300 hover:bg-blue-50";
                btnB.className = "flex-1 py-1 px-2 rounded bg-green-100 text-green-800 font-bold border border-green-300 shadow-inner";
            }
        }

        function serializeConfiguration() {
            const params = new URLSearchParams();

            const getKeys = (s) => s.map(l => l.key).filter(k => k).join(',');

            if (stacks.A.length > 0) params.set('a', getKeys(stacks.A));
            if (stacks.B.length > 0) params.set('b', getKeys(stacks.B));
            if (document.getElementById('abToggle').checked) params.set('ab', '1');

            return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        }

        function deserializeConfiguration() {
            const params = new URLSearchParams(window.location.search);
            // If no params, return false to let defaults load
            if (!params.has('a') && !params.has('b') && !params.has('ab')) return false;

            // Clear defaults
            stacks.A = [];
            stacks.B = [];

            const load = (param, stackId) => {
                const keysStr = params.get(param);
                if (keysStr) {
                    activeStackId = stackId; // temp switch to add
                    keysStr.split(',').forEach(key => addLayer(key));
                }
            };

            load('a', 'A');
            load('b', 'B');

            // After loading both stacks, reset the active stack to 'A' to ensure a consistent state.
            activeStackId = 'A';

            if (params.get('ab') === '1') {
                document.getElementById('abToggle').checked = true;
                toggleABMode();
                // Explicitly set the target UI to match the active stack.
                setTarget('A');
            } else {
                render();
            }

            return true;
        }

        function copyLink() {
            const url = serializeConfiguration();
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.getElementById('copyLinkBtn');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!`;
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy URL to clipboard');
            });
        }

    
// Attach core functions to window so inline HTML handlers (onclick, onchange) still work
window.initStack = initStack;
window.addLayer = addLayer;
window.removeLayer = removeLayer;
window.moveLayer = moveLayer;
window.resetStack = resetStack;
window.render = render;
window.renderStack = renderStack;
window.toggleABMode = toggleABMode;
window.setTarget = setTarget;
window.serializeConfiguration = serializeConfiguration;
window.deserializeConfiguration = deserializeConfiguration;
window.copyLink = copyLink;
window.loadMaterials = loadMaterials;

// Export functions for testability
export {
    initStack,
    addLayer,
    removeLayer,
    moveLayer,
    resetStack,
    render,
    renderStack,
    toggleABMode,
    setTarget,
    serializeConfiguration,
    deserializeConfiguration,
    copyLink,
    loadMaterials
};