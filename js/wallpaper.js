/**
 * wallpaper.js
 * Manages the desktop wallpaper:
 * - Rendering the wallpaper selection grid
 * - Updating the background image
 * - Persisting selection via localStorage
 */

const WALLPAPERS = [
  { id: 'monterey', name: 'Monterey', path: 'assets/background.webp' },
  { id: 'ventura', name: 'Ventura', path: 'assets/background2.jpg' },
  { id: 'sonoma', name: 'Sonoma', path: 'assets/background3.jpg' },
  { id: 'bigsur', name: 'Big Sur', path: 'assets/background4.jpg' },
  { id: 'catalina', name: 'Catalina', path: 'assets/background5.jpg' },
  { id: 'mojave', name: 'Mojave', path: 'assets/background6.jpg' },
  { id: 'highsierra', name: 'High Sierra', path: 'assets/background7.jpg' },
  { id: 'sierra', name: 'Sierra', path: 'assets/background8.jpeg' }
];

function applyWallpaper(path) {
  const wallpaperEl = document.getElementById('desktop-wallpaper');
  if (wallpaperEl) {
    wallpaperEl.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${path}')`;
    localStorage.setItem('desktopWallpaper', path);
  }

}

function initWallpaperApp() {
  const container = document.getElementById('wallpaper-grid');
  if (!container) return;

  const currentPath = localStorage.getItem('desktopWallpaper') || 'assets/background.webp';

  container.innerHTML = WALLPAPERS.map(wp => `
    <div class="wallpaper-item ${wp.path === currentPath ? 'active' : ''}" data-path="${wp.path}">
      <div class="wallpaper-thumb" style="background-image: url('${wp.path}')"></div>
      <div class="wallpaper-name">${wp.name}</div>
    </div>
  `).join('');

  // Add click listeners
  container.querySelectorAll('.wallpaper-item').forEach(item => {
    item.addEventListener('click', () => {
      const path = item.dataset.path;
      applyWallpaper(path);
      
      // Update UI active state
      container.querySelectorAll('.wallpaper-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Initial load from storage
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('desktopWallpaper');
  if (saved) {
    applyWallpaper(saved);
  }
  
  // Initialize app if the window is open (or will be opened)
  initWallpaperApp();
});
