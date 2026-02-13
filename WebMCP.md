# WebMCP Implementation Guidelines for AI Agents

## 0. Architectural Directive

* **Target Environment:** This project utilizes the client-side Web Machine Context Protocol (WebMCP).

* **Restriction:** DO NOT create backend Model Context Protocol (MCP) servers using Python, Node.js, or Go. All tool execution logic must remain within the frontend client-side JavaScript context.

## 1. Dependencies and Setup

* Install the global polyfill dependency: `npm install @mcp-b/global`.

* Import the polyfill at the top of the relevant component or application entry point: `import '@mcp-b/global';`.

## 2. Imperative API Implementation (JavaScript Tools)

Expose programmatic capabilities by registering tools via the global navigator object.

* **Registration:** Use `window.navigator.modelContext.registerTool(toolObject)`.

* **Tool Dictionary Schema:**

* `name`: A unique string identifier for the tool (e.g., `calculate\_sum`). Tool name collisions will throw synchronous errors.

* `description`: A clear, positive natural language prompt explaining the tool's purpose and the logic behind its parameters.

* `inputSchema`: A strictly typed object adhering to JSON Schema Draft 2020-12 defining all expected arguments. Use specific enums, required arrays, and primitives.

* `execute(args)`: An asynchronous callback function that executes the logic and MUST return a `Promise` resolving to the content payload.

* **Lifecycle Management (React/Vue):** Tools must be registered inside component lifecycle hooks (e.g., `useEffect` in React). You must implement cleanup logic using `unregisterTool(name)` when the component unmounts to prevent context collisions.

* **Performance:** For long-running tasks, stream intermediate updates or logs to prevent the agent from timing out. For database queries, enforce limits and pagination to avoid exceeding context windows.

## 3. Declarative API Implementation (HTML Forms)

When refactoring existing HTML forms, convert them into agent-callable tools by injecting declarative attributes.

* Add `toolname="unique\_identifier"` directly to the `<form>` tag.

* Add `tooldescription="Description of the form's purpose"` to the `<form>` tag.

* Add `toolparamdescription="Description of expected data"` to individual `<input>`, `<select>`, or `<textarea>` elements to automatically generate the tool's schema properties.

* *(Optional)* Add the `toolautosubmit` boolean attribute to the `<form>` if the agent is authorized to submit the payload without waiting for manual human confirmation.

## 4. Implicit Actuation Optimization (Fallback)

Ensure the User Interface remains accessible for fallback agents relying on Document Object Model parsing rather than explicit APIs.

* Strictly utilize semantic HTML5 elements (`<main>`, `<article>`, `<section>`, `<nav>`, and native `<button>` tags).

* Apply explicit `aria-label` attributes to custom interactive elements (e.g., visually styled calculator operators). Do not use ARIA attributes if a native HTML element accomplishes the same task.

## 5. Testing Protocols

* When generating unit tests that execute in headless virtual machines, utilize the `window.navigator.modelContextTesting.setMockToolResponse("tool\_name", mockResponse)` method. This bypasses the live `execute()` callback and simulates a successful agent execution loop.

## 6. Discovery Integration

* Upon creating a new WebMCP tool or exposing a new declarative form, you must update the `llms.txt` file located at the repository/domain root. Ensure the new tool endpoints and capabilities are documented in the markdown index so navigating agents can discover them.
