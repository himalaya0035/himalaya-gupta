/**
 * pdf-viewer.js
 * Uses PDF.js to render PDF pages onto canvases for a high-quality inline experience on both desktop and mobile.
 */

window.initPDFViewer = async function(url) {
  const container = document.getElementById('pdf-viewer-container');
  const loader = document.getElementById('pdf-loader');
  
  if (!container) return;

  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    // Hide loader
    if (loader) loader.style.display = 'none';
    
    // Render all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      container.appendChild(canvas);
      
      const context = canvas.getContext('2d');
      // Scale based on pixel ratio for sharpness
      const dpr = window.devicePixelRatio || 1;
      const scale = 2; // Fixed high density scale
      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Ensure it displays well on high-DPI screens but is responsive
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    }
  } catch (error) {
    console.error('Error rendering PDF:', error);
    if (loader) {
      loader.innerHTML = `<p style="color:#ff6b6b; font-size: 14px;">Error: PDF could not be rendered inline on this device.</p>
                          <button class="safari-btn" onclick="window.open('${url}', '_blank')" style="margin-top:10px; padding: 8px 16px;">Open in New Tab</button>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // We can call this whenever the preview window is first opened
  // or just auto-load for the resume.pdf
  if (document.getElementById('pdf-viewer-container')) {
    window.initPDFViewer('assets/resume.pdf');
  }
});
