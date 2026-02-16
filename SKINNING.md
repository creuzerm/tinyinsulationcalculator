# Skinning Guide

This repository (`core`) is designed to be the logic and structural foundation for `tinycalc` (the skinnable child project).

## 1. The "Clean Contract"
To skin this application **without breaking core logic**, you must adhere to the following contract.

### Do NOT:
*   Rename ID attributes of inputs or buttons (The logical core depends on them, for now).
*   Remove `data-model` or `data-action` attributes.
*   Drastically change the DOM hierarchy if it affects `nextElementSibling` or specific traversal logic (though we aim to minimize this dependency).

### DO:
*   Override CSS Variables in your own `skin.css`.
*   Hide elements via CSS if not needed (e.g., `.hidden-in-skin { display: none; }`).
*   Inject new content via `skin.js` if necessary.

## 2. CSS Variables (The Theme API)

The `styles.css` file defines the default "Core Theme". You can override these in your `skin.css`.

### Colors - Semantic
| Variable | Default (Core) | Description |
| :--- | :--- | :--- |
| `--color-primary` | `#2563eb` (Blue 600) | Primary action buttons, active states, key highlights. |
| `--color-primary-hover` | `#1d4ed8` (Blue 700) | Hover state for primary actions. |
| `--color-primary-subtle` | `#eff6ff` (Blue 50) | Backgrounds for primary content areas (Scenario A). |
| `--color-secondary` | `#10b981` (Green 500) | Secondary actions or Scenario B highlights. |
| `--color-secondary-subtle` | `#ecfdf5` (Green 50) | Backgrounds for secondary content areas (Scenario B). |
| `--color-accent` | `#f59e0b` (Amber 500) | Warnings, highlights, or "Passive Loss" result text. |
| `--color-text-main` | `#1f2937` (Gray 800) | Main body text. |
| `--color-text-sub` | `#4b5563` (Gray 600) | Labels, helper text. |
| `--color-bg-app` | `#f3f4f6` (Gray 100) | The main page background. |
| `--color-bg-card` | `#ffffff` (White) | Content card background. |
| `--color-border` | `#e5e7eb` (Gray 200) | Borders for inputs and cards. |

### Geometry
| Variable | Default (Core) | Description |
| :--- | :--- | :--- |
| `--radius-card` | `0.5rem` | Border radius for main containers. |
| `--radius-input` | `0.375rem` | Border radius for form inputs and buttons. |
| `--spacing-base` | `1rem` | Base padding/margin unit. |
| `--font-heading` | `'Inter', sans-serif` | Font family for headings. |
| `--font-body` | `'Inter', sans-serif` | Font family for body text. |

## 3. Data Attributes (The Logic API)

We are transitioning to `data-` attributes to decouple styling classes from JavaScript logic.

### Actions
*   `[data-action="calculate"]`: Triggers the main calculation.
*   `[data-action="toggle-ab"]`: Toggles the A/B comparison mode.

### Bindings
*   `[data-model="indoorTemp"]`: Binds to the calculation engine's `indoorTemp` parameter.
*   `[data-model="..."]`: (See `calculator.js` implementation for full list).

## 4. Feature Flags / Visibility
The Core HTML includes "Scenario B" markup by default.
*   **To hide A/B testing permanently in a skin:**
    *   CSS: `#abToggleContainer { display: none; }`
    *   JS: Ensure `abToggle` is unchecked by default.

## 5. Build Process
**There is no build process in this Core repo.**
The `tinycalc` child project is responsible for any bundling or minification.
core `index.html` + `styles.css` + `calculator.js` = A working, deployable "Basic Theme" app.
