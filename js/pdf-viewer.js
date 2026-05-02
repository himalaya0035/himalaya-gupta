/**
 * pdf-viewer.js
 * Lazy-loads PDF.js and renders PDF pages onto canvases.
 * PDF.js is only fetched when the resume window is first opened.
 */

let pdfJsLoaded = false;

function loadPdfJs() {
  return new Promise(function(resolve, reject) {
    if (pdfJsLoaded) { resolve(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = function() {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfJsLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.initPDFViewer = async function(url) {
  var container = document.getElementById('pdf-viewer-container');
  var loader = document.getElementById('pdf-loader');
  if (!container) return;

  try {
    await loadPdfJs();

    var loadingTask = pdfjsLib.getDocument(url);
    var pdf = await loadingTask.promise;

    if (loader) loader.style.display = 'none';

    for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      var page = await pdf.getPage(pageNum);
      var canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      container.appendChild(canvas);

      var context = canvas.getContext('2d');
      var scale = 2;
      var viewport = page.getViewport({ scale: scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      await page.render({ canvasContext: context, viewport: viewport }).promise;
    }
  } catch (error) {
    console.error('Error rendering PDF:', error);
    if (loader) {
      loader.innerHTML = '<p style="color:#ff6b6b; font-size: 14px;">Error: PDF could not be rendered inline.</p>' +
        '<button class="safari-btn" onclick="window.open(\'' + url + '\', \'_blank\')" style="margin-top:10px; padding: 8px 16px;">Open in New Tab</button>';
    }
  }
};

// Lazy init: only load when resume window is first opened
document.addEventListener("DOMContentLoaded", function() {
  var win = document.getElementById('resume-window');
  if (!win) return;

  var initialized = false;
  var observer = new MutationObserver(function() {
    if (!win.classList.contains('hidden') && !initialized) {
      initialized = true;
      window.initPDFViewer('assets/resume.pdf');
      observer.disconnect();
    }
  });
  observer.observe(win, { attributes: true, attributeFilter: ['class'] });
});
