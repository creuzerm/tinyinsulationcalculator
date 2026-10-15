# tinyinsulationcalculator - Autonomous Agent Context & Invariants

## Repository Overview
`tinyinsulationcalculator` is the core building science and passive thermal simulation engine for small structures (tiny homes, sheds, cabins). It models thermal mass, assembly R-values, and degree-day heating requirements.

## Invariant Directives for AI Agents (Jules, Gemini, Ollama)
1. **Default Git Branch**: Always target and push to `main`.
2. **Modular Architecture**: Pure math calculations and state algorithms must be modularized into standalone ES modules (`calculator.js`, `insulation_explorer.js`) and imported by HTML pages via `<script type="module">`. Never put monolithic application math directly into inline HTML `<script>` tags.
3. **WebMCP Protocol**: All WebMCP tools registered in `webmcp.js` (`applyPreset`, `getDetailedResults`, `runSimulation`) must return JSON-serializable payloads containing executive summary statistics (`peakHeatingLoadBTUPerHour`, `annualHeatingDegreeHours`, etc.) rather than only raw time-series arrays.
4. **Testing Standards**:
   - Run unit tests with Jest: `npx jest --ci --runInBand`.
   - Any test touching DOM or `window` must declare `/** @jest-environment jsdom */` at the very top of the test file.
5. **No Debug Evaluation Leftovers**: Never commit scratch evaluation files (`debug_eval.js`, `debug_error.txt`, `debug_success.txt`).
