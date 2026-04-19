document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("safari-url-input");
  const localView = document.getElementById("safari-local-view");
  const externalView = document.getElementById("safari-external-view");
  const errorView = document.getElementById("safari-error-view");
  const safariFrame = document.getElementById("safari-frame");
  const errorUrlSpan = document.getElementById("error-url");
  
  const navBack = document.querySelector('[title="Back"]');
  const navForward = document.querySelector('[title="Forward"]');
  const navRefresh = document.querySelector('[title="Refresh"]');
  const navTab = document.querySelector('[title="New Tab"]');

  let history = ["himalaya-gupta.online"];
  let historyIndex = 0;

  function setView(viewName, url = "") {
    // Hide all
    localView.classList.remove("active");
    externalView.classList.remove("active");
    errorView.classList.remove("active");

    if (viewName === "local") {
      localView.classList.add("active");
      urlInput.value = "himalaya-gupta.online";
    } else if (viewName === "external") {
      externalView.classList.add("active");
      safariFrame.src = url;
      urlInput.value = url;
    } else if (viewName === "error") {
      errorView.classList.add("active");
      errorUrlSpan.textContent = url;
      urlInput.value = url;
    }
  }

  function navigate(input) {
    let url = input.trim();
    if (!url) return;

    // Simulate internal navigation
    if (url === "himalaya-gupta.online" || url === "home") {
      setView("local");
    } 
    // Handle external URLs
    else if (url.startsWith("http://") || url.startsWith("https://") || url.includes(".com") || url.includes(".org") || url.includes(".net")) {
      if (!url.startsWith("http")) url = "https://" + url;
      
      // We simulate an error for common restricted sites or just anything non-local
      // to keep the simulation feeling like a real Safari "Refused Connection"
      const blockedSites = ["google.com", "github.com", "facebook.com", "instagram.com", "twitter.com"];
      const isBlocked = blockedSites.some(site => url.toLowerCase().includes(site));

      if (isBlocked) {
        setView("error", url);
      } else {
        setView("external", url);
      }
    } 
    // Handle Search
    else {
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
      setView("external", searchUrl);
    }

    // Add to history
    if (history[historyIndex] !== urlInput.value) {
      history = history.slice(0, historyIndex + 1);
      history.push(urlInput.value);
      historyIndex++;
    }
    updateNavButtons();
  }

  function updateNavButtons() {
    navBack.style.opacity = historyIndex > 0 ? "1" : "0.3";
    navForward.style.opacity = historyIndex < history.length - 1 ? "1" : "0.3";
  }

  /* Manual navigation disabled as per user request (Locked URL bar) */
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Manual navigation blocked
    }
  });

  navBack.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex--;
      navigate(history[historyIndex]);
    }
  });

  navForward.addEventListener("click", () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      navigate(history[historyIndex]);
    }
  });

  navRefresh.addEventListener("click", () => {
    const current = urlInput.value;
    if (current === "himalaya-gupta.online") {
      location.reload(); // Simple refresh for local
    } else {
      safariFrame.src = safariFrame.src;
    }
  });

  navTab.addEventListener("click", () => {
    setView("local");
    urlInput.focus();
    urlInput.select();
  });

  updateNavButtons();
});
