document.addEventListener("DOMContentLoaded", () => {
  const swapModes = {
    innerHTML: (target, html) => (target.innerHTML = html),
    beforebegin: (target, html) =>
      target.insertAdjacentHTML("beforebegin", html),
    afterend: (target, html) => target.insertAdjacentHTML("afterend", html),
  };

  const spinner = document.createElement("div");
  spinner.innerHTML = `<div id="hyperview-spinner" style="
        position:fixed; top:10px; right:10px; padding:6px 12px;
        background:#000; color:#fff; font-size:12px;
        border-radius:6px; z-index:9999; display:none;">Loading...</div>`;
  document.body.appendChild(spinner);

  function showSpinner() {
    document.getElementById("hyperview-spinner").style.display = "block";
  }

  function hideSpinner() {
    document.getElementById("hyperview-spinner").style.display = "none";
  }

  async function handleElement(el, isPopState = false) {
    const methodAttr = ["hv-get", "hv-post", "hv-put", "hv-delete"].find(
      (attr) => el.hasAttribute(attr)
    );
    if (!methodAttr) return;

    const method = methodAttr.split("-")[1].toUpperCase();
    let url = el.getAttribute(methodAttr);
    const targetSelector = el.getAttribute("hv-target");
    const target = targetSelector ? document.querySelector(targetSelector) : el;
    const swap = el.getAttribute("hv-swap") || "innerHTML";
    const params = el.getAttribute("hv-params");
    const pushUrl = el.hasAttribute("hv-push-url");

    let body = null;
    let headers = {};

    // Handle form data
    if (el.tagName === "FORM") {
      const formData = new FormData(el);
      const data = Object.fromEntries(formData.entries());

      if (method === "GET") {
        const query = new URLSearchParams(data).toString();
        url += (url.includes("?") ? "&" : "?") + query;
      } else {
        body = JSON.stringify(data);
        headers["Content-Type"] = "application/json";
      }
    }

    // Handle hv-params JSON
    if (params) {
      try {
        const parsed = JSON.parse(params);
        if (method === "GET") {
          const query = new URLSearchParams(parsed).toString();
          url += (url.includes("?") ? "&" : "?") + query;
        } else {
          body = JSON.stringify(parsed);
          headers["Content-Type"] = "application/json";
        }
      } catch (e) {
        console.warn("Invalid hv-params JSON");
      }
    }

    showSpinner();
    try {
      const response = await fetch(url, { method, headers, body });
      const html = await response.text();

      if (swap in swapModes && target) {
        swapModes[swap](target, html);
      }

      if (pushUrl && !isPopState) {
        history.pushState({ html, targetSelector, url }, "", url);
      }
    } catch (err) {
      console.error("HyperView error:", err);
    } finally {
      hideSpinner();
    }
  }

  // Handle clicks
  document.body.addEventListener("click", (e) => {
    const el = e.target.closest("[hv-get], [hv-post], [hv-put], [hv-delete]");
    if (!el || el.tagName === "FORM") return;
    e.preventDefault();
    handleElement(el);
  });

  // Handle form submissions
  document.body.addEventListener("submit", (e) => {
    const el = e.target;
    if (
      !el.matches("form[hv-get], form[hv-post], form[hv-put], form[hv-delete]")
    )
      return;
    e.preventDefault();
    handleElement(el);
  });

  // Handle auto-load trigger
  document.querySelectorAll('[hv-trigger="load"]').forEach((el) => {
    handleElement(el);
  });

  // Handle browser history back/forward
  window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (state && state.targetSelector && state.html) {
      const target = document.querySelector(state.targetSelector);
      if (target) {
        target.innerHTML = state.html;
      }
    }
  });

  // WebSocket bindings
  const wsTargets = document.querySelectorAll("[hv-ws]");
  wsTargets.forEach((el) => {
    const url = el.getAttribute("hv-ws");
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const swap = el.getAttribute("hv-swap") || "innerHTML";
      if (swap in swapModes) {
        swapModes[swap](el, event.data);
      }
    };

    ws.onerror = (e) => console.warn("WebSocket error:", e);
  });
});
