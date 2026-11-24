/**
 * AniVault - Universal SPA Router
 * Namespace: window.AniVault.router
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  class Router {
    constructor() {
      this.container = null;
      this.currentPath = '';
    }

    init(containerElement) {
      this.container = containerElement;
      window.addEventListener('hashchange', () => this.handleRoute());
      
      if (!window.location.hash || window.location.hash === '#/') {
        window.location.hash = '#/biblioteca';
      } else {
        this.handleRoute();
      }
    }

    parseHash() {
      const hash = (window.location.hash || '').slice(2) || 'biblioteca';
      const [path, queryString] = hash.split('?');
      const params = new URLSearchParams(queryString || '');
      return { path: path.toLowerCase(), params };
    }

    handleRoute() {
      const { path, params } = this.parseHash();
      this.currentPath = path;

      const views = window.AniVault.views;
      const routeMap = {
        'biblioteca': views.library,
        'favoritos': views.favorites,
        'anadir': views.add,
        'detalle': views.detail,
        'perfil': views.profile,
        'login': views.login
      };

      const view = routeMap[path] || views.library;

      // Actualizar título en el Header
      const sectionLabel = document.getElementById('header-section-label');
      if (sectionLabel) {
        const titles = {
          'biblioteca': 'Biblioteca',
          'favoritos': 'Mis Favoritos',
          'anadir': 'Nueva Entrada',
          'detalle': 'Ficha de Detalle',
          'perfil': 'Perfil & Sincronización',
          'login': 'Bienvenida'
        };
        sectionLabel.textContent = titles[path] || 'AniVault';
      }

      // Actualizar tabs activas en la barra de navegación inferior
      document.querySelectorAll('.nav-tab').forEach(tab => {
        const navTarget = tab.getAttribute('data-nav');
        if (navTarget === path) {
          tab.className = 'nav-tab flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all text-primary font-bold';
        } else {
          tab.className = 'nav-tab flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all text-on-surface-variant hover:text-on-surface';
        }
      });

      if (this.container && view && typeof view.render === 'function') {
        window.scrollTo(0, 0);
        view.render(this.container, params);
      }
    }

    navigate(path, params = {}) {
      let query = '';
      const entries = Object.entries(params);
      if (entries.length > 0) {
        query = '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      }
      window.location.hash = `#/${path}${query}`;
    }
  }

  window.AniVault.router = new Router();
})();
