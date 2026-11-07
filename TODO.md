# Codebase Gap & Improvement Backlog (TODO Scratchpad)

This scratchpad tracks point-in-time codebase gaps, missing parities, edge-case defects, and out-of-scope architectural improvements discovered during repository maintenance. In accordance with project governance, timeless requirements remain in `PRD.md`, while tactical tasks and implementation roadmaps reside here.

---

### [COMPLETED] GAP-001: Implement Solar Kiln & Greenhouse Calculator Engine in `calculator.js`
* **Affected Files**: `calculator.js`, `calculator.test.js`
* **Completed State**: The zero-dependency mathematical engine (`calculateGlazingProps`, `calculatePsychrometrics`, `calculateWoodMoistureLoad`, `calculateSolarKilnBalance`, `calculateKilnHeatPumpROI`) is fully implemented in `calculator.js`, exported to Node/Jest via `module.exports`, and bound to `window` for browser runtimes. Full Jest unit test suite added and passing in `calculator.test.js`.

---

### [COMPLETED] GAP-002: Ingest Solar Kiln Material and Preset Definitions into `materials.json`
* **Affected Files**: `materials.json`, `insulation_explorer.js`
* **Completed State**: Ingested `solar_kiln_materials` into `materials.json` with multi-layer glazing optical transmittances and R-values, Appalachian hardwood species dry densities, and standardized firewood volume presets (cords, pallets, basement bays). Updated `insulation_explorer.js` category parser to safely bypass non-wall material arrays.

---

### [COMPLETED] GAP-003: Register `calculate_solar_kiln_performance` WebMCP & MCP Tools
* **Affected Files**: `webmcp.js`, `webmcp.test.js`, `mcp-server/tools.ts`, `mcp-server/mcp_server.test.ts`, `llms.txt`
* **Completed State**: Registered `calculate_solar_kiln_performance` tool in `webmcp.js` with structured executive summaries (`summaryStats`, `woodLoad`, `kilnBalance`, `heatPumpRoi`) satisfying WebMCP protocol requirements. Registered the tool in the TypeScript MCP server (`mcp-server/tools.ts`) with Zod schemas. Full integration tests added and verified in both test suites. Documented in `llms.txt`.

---

### [COMPLETED] GAP-004: Create Dedicated User Interface for Solar Kiln & Greenhouse Simulator
* **Affected Files**: `solar_kiln.html`, `solar_kiln.js`, `styles.css`, `tests/solar_kiln.test.js`, `index.html`, `existing_building_estimator.html`, `insulationexplorer.html`
* **Completed State**: Created `solar_kiln.html` and modular script `solar_kiln.js` adhering to `docs/SKINNING.md` contracts (`data-model`, `data-action`, `data-output`, semantic solar CSS variables). Features progressive disclosure accordions, standard presets, 2-stage basement finisher toggle, live calculations, psychrometric downdraft density buoyancy display, and WebMCP agent integration (`e.agentInvoked` / `e.respondWith`). Linked across the persistent suite navigation header. Verified with 4 unit tests in `tests/solar_kiln.test.js`.

---

### [COMPLETED] GAP-005: Standardize Duplicate `skin.js` vs `skin/skin.js`
* **Affected Files**: `skin.js`, `skin/skin.js`, `skin/skin.css`, `tests/skin_ui.test.js`
* **Completed State**: Copied `skin.css` into `skin/skin.css` alongside `skin/skin.js` to establish a standalone canonical skin package. Created `tests/skin_ui.test.js` verifying exact file content parity and non-destructive idempotent DOM insertion of custom palettes and typography fonts.

---

### [COMPLETED] GAP-006: JSDOM `window.location` Navigation Error in WebMCP Test Harness
* **Affected Files**: `existing_building_estimator_webmcp.test.js`
* **Completed State**: Replaced direct assignment of non-configurable `window.location` with `window.history.pushState({}, '', 'http://localhost/')`, completely eliminating `Error: Not implemented: navigation` from JSDOM test output while retaining complete search param parsing fidelity.

---

### [COMPLETED] GAP-007: Align Dual-Mode Module System (CommonJS vs Native ES Modules)
* **Affected Files**: `insulation_calculator.js`, `existing_building_estimator.js`, `solar_kiln.js`, `calculator.js`
* **Completed State**: Harmonized dual-mode export guards (`typeof window !== 'undefined'` for browser global bindings and `typeof module !== 'undefined' && module.exports` for Node/Jest CommonJS) across all modules, ensuring deterministic cross-runtime execution without collisions.

---

### [COMPLETED] GAP-008: End-to-End Suite Lifecycle, Asset Integrity & Navigation Testing
* **Affected Files**: `tests/e2e_pages.test.js`, `index.html`, `existing_building_estimator.html`, `insulationexplorer.html`, `solar_kiln.html`
* **Completed State**: Added `tests/e2e_pages.test.js` verifying that all 4 primary application HTML files exist and have valid structure, persistent navigation is 100% symmetric across all pages, all referenced local scripts and stylesheets physically exist on disk, and data configuration files are valid JSON. Missing `skin.js` script in `existing_building_estimator.html` was caught and corrected.

---

### [COMPLETED] GAP-009: WebMCP 19-Check Compliance Audit & Edge Manifest Route
* **Affected Files**: `.well-known/webmcp.json`, `index.html`, `existing_building_estimator.html`, `solar_kiln.html`, `tests/e2e_pages.test.js`
* **Completed State**: Created official discovery manifest `.well-known/webmcp.json` defining all 6 WebMCP tools (`apply_preset`, `set_dimensions`, `run_simulation`, `get_detailed_results`, `estimate_r_value`, `calculate_solar_kiln_performance`). Enriched all form elements in `index.html` and `existing_building_estimator.html` with explicit `toolaction` attributes and mapped all interactive controls to `data-model` attributes. Verified in `tests/e2e_pages.test.js`.

---

### [COMPLETED] GAP-010: Document Architecture Consolidation for `methods.md`
* **Affected Files**: `docs/methods.md`
* **Completed State**: Appended Section 11 ("Solar Kiln & Greenhouse Drying Physics: Glazing Optics, Moisture Load, Daily Heat Balance, Psychrometric Downdraft Buoyancy, and Heat Pump Payback Math") to `docs/methods.md`, incorporating Section 2 of the specification as part of the unified single source of truth engineering physics reference.
