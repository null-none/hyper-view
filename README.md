# hyper-view
Full-featured HTMX-style micro library with WebSocket, history, spinner, and more


```html
<!-- Button with GET request -->
<button hv-get="/api/time" hv-target="#result" hv-swap="innerHTML">Show Time</button>
<div id="result">Result will appear here</div>

<!-- Button with POST request and parameters -->
<button hv-post="/api/hello" hv-params='{"name": "Ivan"}' hv-target="#greeting">Say Hello</button>
<div id="greeting"></div>

<!-- Form example -->
<form hv-post="/api/send" hv-target="#status">
  <input name="email" placeholder="Your email">
  <button type="submit">Send</button>
</form>
<div id="status"></div>

<!-- Auto-load content on page load -->
<div hv-get="/api/hello" hv-target="#autoload" hv-trigger="load"></div>
<div id="autoload"></div>

<!-- WebSocket connection -->
<div hv-ws="ws://localhost:8000/ws" hv-swap="innerHTML"></div>
```
