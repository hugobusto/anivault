/**
 * AniVault - Favorites View
 * Namespace: window.AniVault.views.favorites
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const favoritesView = {
    viewMode: 'grid', // 'grid' | 'list'
    searchQuery: '',
    sortMode: 'rating',

    render(container) {
      const store = window.AniVault.store;
      const favorites = store.getAnimes({
        filter: 'favorites',
        search: this.searchQuery,
        sort: this.sortMode
      });

      const metrics = store.getMetrics();

      container.innerHTML = `
        <div class="flex flex-col w-full gap-4 pb-12">
          
          <!-- Header Context & View Switcher -->
          <div class="flex flex-col gap-2 pt-2">
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[24px] text-amber-400" style="font-variation-settings: 'FILL' 1;">favorite</span>
                  <h1 class="font-display font-extrabold text-2xl text-on-surface tracking-tight">Mis Favoritos</h1>
                </div>
                <span class="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span class="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span id="fav-count-label">${metrics.favoritesCount} animes guardados en tu santuario</span>
                </span>
              </div>

              <!-- View Switcher (Grid vs List) -->
              <div class="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-white/5 shadow-inner">
                <button id="btn-view-grid" title="Vista Cuadrícula" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all ${this.viewMode === 'grid' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">
                  <span class="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button id="btn-view-list" title="Vista Lista" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all ${this.viewMode === 'list' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}">
                  <span class="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>

            <!-- Metrics Bento Banner -->
            <div class="relative overflow-hidden rounded-2xl bg-surface-container-low p-3.5 border border-white/5 shadow-md mt-1">
              <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
              <div class="grid grid-cols-3 divide-x divide-white/5 text-center">
                <div class="flex flex-col items-center px-1">
                  <span class="font-mono text-base font-bold text-secondary">${metrics.totalHours}h</span>
                  <span class="text-[11px] text-on-surface-variant">Tiempo total</span>
                </div>
                <div class="flex flex-col items-center px-1">
                  <span class="font-mono text-base font-bold text-tertiary">${metrics.totalEpisodesWatched} eps</span>
                  <span class="text-[11px] text-on-surface-variant">Vistos</span>
                </div>
                <div class="flex flex-col items-center px-1">
                  <span class="font-mono text-base font-bold text-primary flex items-center gap-1 justify-center">
                    ${metrics.avgRating}
                    <span class="material-symbols-outlined text-[14px] text-amber-400" style="font-variation-settings: 'FILL' 1;">star</span>
                  </span>
                  <span class="text-[11px] text-on-surface-variant">Media valor</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Search & Sorting Row -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline pointer-events-none">search</span>
              <input id="fav-search-input" value="${this.searchQuery}" class="w-full pl-9 pr-8 py-2 bg-surface-container rounded-xl text-xs text-on-surface placeholder:text-outline border border-white/5 focus:outline-none focus:bg-surface-container-high transition-all" placeholder="Buscar en favoritos..." type="text"/>
              ${this.searchQuery ? `
                <button id="fav-clear-search" class="absolute right-2.5 top-2 text-outline hover:text-on-surface">
                  <span class="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              ` : ''}
            </div>

            <!-- Sort Dropdown Trigger -->
            <div class="relative">
              <button id="fav-sort-btn" class="flex items-center gap-1 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold border border-white/5 shadow-sm">
                <span class="material-symbols-outlined text-[16px] text-primary">swap_vert</span>
                <span class="hidden sm:inline">Ordenar</span>
              </button>
              <div id="fav-sort-menu" class="hidden absolute right-0 mt-2 w-40 bg-surface-container-highest rounded-xl shadow-2xl p-1 z-30 border border-white/10 flex-col gap-1">
                <button data-sort="rating" class="fav-sort-opt w-full px-3 py-1.5 text-xs text-left rounded-lg ${this.sortMode === 'rating' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-surface-bright'}">Por Puntuación</button>
                <button data-sort="title" class="fav-sort-opt w-full px-3 py-1.5 text-xs text-left rounded-lg ${this.sortMode === 'title' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-surface-bright'}">Alfabético</button>
                <button data-sort="updated" class="fav-sort-opt w-full px-3 py-1.5 text-xs text-left rounded-lg ${this.sortMode === 'updated' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-surface-bright'}">Recientes</button>
              </div>
            </div>
          </div>

          <!-- Favorites Display -->
          <div id="fav-items-container">
            ${this.renderFavoritesHtml(favorites)}
          </div>

        </div>
      `;

      this.bindEvents(container);
    },

    renderFavoritesHtml(favorites) {
      if (favorites.length === 0) {
        return `
          <div class="flex flex-col items-center justify-center p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-white/10 mt-2">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">star_border</span>
            <h3 class="font-display font-semibold text-base text-on-surface">No hay favoritos guardados</h3>
            <p class="text-xs text-on-surface-variant max-w-xs mt-1">Marca la estrella ⭐ en cualquier anime de tu catálogo para santificarlo aquí.</p>
            <a href="#/biblioteca" class="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md">Explorar Biblioteca</a>
          </div>
        `;
      }

      if (this.viewMode === 'grid') {
        return `
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
            ${favorites.map(a => this.renderGridCard(a)).join('')}
          </div>
        `;
      }

      return `
        <div class="flex flex-col gap-2 mt-1">
          ${favorites.map(a => this.renderListCard(a)).join('')}
        </div>
      `;
    },

    renderGridCard(anime) {
      const activeSeason = (anime.seasons && anime.seasons[anime.seasons.length - 1]) || { name: 'T1', currentEp: 1, totalEps: 12 };
      const progressPercent = activeSeason.totalEps > 0 ? Math.min(100, Math.round((activeSeason.currentEp / activeSeason.totalEps) * 100)) : 0;

      return `
        <div class="fav-card relative rounded-2xl overflow-hidden bg-surface-container-low border border-white/5 shadow-md hover:border-primary/30 transition-all group cursor-pointer flex flex-col" data-id="${anime.id}">
          <div class="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-highest">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${anime.coverUrl}" alt="${anime.title}" onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80'"/>
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
            
            <div class="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono text-amber-300 flex items-center gap-0.5">
              <span>${Number(anime.rating || 8.0).toFixed(1)}</span>
              <span class="material-symbols-outlined text-[10px]">star</span>
            </div>

            <button class="btn-fav-unstar absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-amber-400 hover:text-white transition-transform active:scale-90" data-id="${anime.id}" title="Quitar de favoritos">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
            </button>
          </div>

          <div class="p-2.5 flex flex-col justify-between flex-1 gap-1">
            <h3 class="font-display font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">${anime.title}</h3>
            <span class="text-[10px] text-outline font-mono truncate">T${anime.seasons ? anime.seasons.length : 1}: Cap ${activeSeason.currentEp}/${activeSeason.totalEps || '?'}</span>
            
            <div class="w-full bg-surface-container-highest rounded-full h-1 overflow-hidden mt-1">
              <div class="h-full rounded-full bg-primary" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
      `;
    },

    renderListCard(anime) {
      const activeSeason = (anime.seasons && anime.seasons[anime.seasons.length - 1]) || { name: 'T1', currentEp: 1, totalEps: 12 };
      return `
        <div class="fav-card bg-surface-container-low hover:bg-surface-container rounded-xl p-2.5 border border-white/5 shadow-sm flex items-center justify-between gap-3 cursor-pointer group" data-id="${anime.id}">
          <div class="flex items-center gap-2.5 min-w-0">
            <img class="w-10 h-14 object-cover rounded-lg shrink-0" src="${anime.coverUrl}" alt="${anime.title}"/>
            <div class="flex flex-col min-w-0">
              <h4 class="font-display font-bold text-xs text-on-surface truncate group-hover:text-primary">${anime.title}</h4>
              <span class="text-[11px] text-on-surface-variant truncate">${anime.altTitle || anime.studio || ''}</span>
              <span class="text-[10px] font-mono text-outline">Capítulo ${activeSeason.currentEp} / ${activeSeason.totalEps || '?'}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-0.5 font-mono text-xs font-bold text-amber-400">
              <span>${Number(anime.rating || 8.0).toFixed(1)}</span>
              <span class="material-symbols-outlined text-[13px]">star</span>
            </div>
            <button class="btn-fav-unstar text-amber-400 p-1" data-id="${anime.id}" title="Quitar de favoritos">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            </button>
          </div>
        </div>
      `;
    },

    bindEvents(container) {
      const store = window.AniVault.store;

      const itemsContainer = container.querySelector('#fav-items-container');
      if (itemsContainer) {
        itemsContainer.onclick = async (e) => {
          const unstarBtn = e.target.closest('.btn-fav-unstar');
          if (unstarBtn) {
            e.stopPropagation();
            const id = unstarBtn.getAttribute('data-id');
            await store.toggleFavorite(id);
            window.AniVault.ui.showToast('Retirado de favoritos', 'star');
            this.render(container);
            return;
          }

          const card = e.target.closest('.fav-card');
          if (card) {
            const id = card.getAttribute('data-id');
            window.location.hash = `#/detalle?id=${id}`;
          }
        };
      }

      // Conmutador Grid / List
      const gridBtn = container.querySelector('#btn-view-grid');
      const listBtn = container.querySelector('#btn-view-list');
      if (gridBtn && listBtn) {
        gridBtn.onclick = () => {
          this.viewMode = 'grid';
          this.render(container);
        };
        listBtn.onclick = () => {
          this.viewMode = 'list';
          this.render(container);
        };
      }

      // Buscador en favoritos
      const searchInput = container.querySelector('#fav-search-input');
      if (searchInput) {
        searchInput.oninput = (e) => {
          this.searchQuery = e.target.value;
          const filtered = store.getAnimes({ filter: 'favorites', search: this.searchQuery, sort: this.sortMode });
          if (itemsContainer) itemsContainer.innerHTML = this.renderFavoritesHtml(filtered);
        };
      }

      const clearSearch = container.querySelector('#fav-clear-search');
      if (clearSearch) {
        clearSearch.onclick = () => {
          this.searchQuery = '';
          this.render(container);
        };
      }

      // Menú de ordenación
      const sortBtn = container.querySelector('#fav-sort-btn');
      const sortMenu = container.querySelector('#fav-sort-menu');
      if (sortBtn && sortMenu) {
        sortBtn.onclick = (e) => {
          e.stopPropagation();
          sortMenu.classList.toggle('hidden');
          sortMenu.classList.toggle('flex');
        };

        const closeSortMenu = () => {
          sortMenu.classList.add('hidden');
          sortMenu.classList.remove('flex');
        };
        window.addEventListener('click', closeSortMenu);

        container.querySelectorAll('.fav-sort-opt').forEach(opt => {
          opt.onclick = () => {
            this.sortMode = opt.getAttribute('data-sort');
            this.render(container);
          };
        });
      }
    }
  };

  window.AniVault.views.favorites = favoritesView;
})();
