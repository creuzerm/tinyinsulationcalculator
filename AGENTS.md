# tinyinsulationcalculator - Autonomous Agent Context & Invariants

## Repository Overview
`tinyinsulationcalculator` is the core building science and passive thermal simulation engine for small structures (tiny homes, sheds, cabins, solar kilns). It models thermal mass, assembly R-values, degree-day heating requirements, psychrometric solar firewood drying balances, and heat pump economic ROI.

## Invariant Directives for AI Agents (Jules, Gemini, Ollama)
1. **Default Git Branch**: Always target and push to `main`.
2. **Modular Architecture**: Pure math calculations and state algorithms must be modularized into standalone modules (`calculator.js`, `insulation_explorer.js`, `existing_building_estimator.js`, `solar_kiln.js`) and imported by HTML pages via `<script type="module">` or script tags. Never put monolithic application math directly into inline HTML `<script>` tags.
3. **WebMCP Protocol**:
   - All WebMCP tools registered in `webmcp.js` (`apply_preset`, `set_dimensions`, `run_simulation`, `get_detailed_results`, `estimate_r_value`, `calculate_solar_kiln_performance`) must return JSON-serializable payloads containing executive summary statistics rather than only raw time-series arrays.
   - The edge manifest `/.well-known/webmcp.json` is the canonical discovery manifest and must register all available tools matching `webmcp.js` schemas.
   - All interactive forms must declare `toolname`, `toolaction`, and `tooldescription`, and input elements must bind via `data-model` or `toolparamdescription`.
4. **Testing Standards**:
   - Run unit tests with Jest: `npx jest --ci --runInBand`.
   - Any test touching DOM or `window` must declare `/** @jest-environment jsdom */` at the very top of the test file.
   - In JSDOM test files, mock URL parameters using `window.history.pushState({}, '', '<url>')` rather than mutating `window.location`.
5. **Skinning Contract**:
   - Custom branding, typography, and color variables reside in `skin/skin.css` and `skin/skin.js` (with root `skin.css` and `skin.js` maintained in parity).
6. **No Debug Evaluation Leftovers**: Never commit scratch evaluation files (`debug_eval.js`, `debug_error.txt`, `debug_success.txt`).
