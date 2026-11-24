/**
 * AniVault - Library View
 * Namespace: window.AniVault.views.library
 * Catálogo, búsqueda en vivo con debounce, filtros rápidos, modal de filtros avanzados (tune)
 * y tarjetas de anime interactivas.
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const libraryView = {
    currentFilter: 'all',
    currentSearch: '',
    currentSort: 'rating',
    currentGenre: 'all',
    currentFormat: 'all',
    debounceTimer: null,

    render(container) {
      const store = window.AniVault.store;
      const animes = store.getAnimes({
        filter: this.currentFilter,
        search: this.currentSearch,
        sort: this.currentSort,
        genre: this.currentGenre,
        format: this.currentFormat
      });

      const supabase = window.AniVault.supabaseService;
      const isCloudConnected = supabase && supabase.isConfigured();
      const lastSyncTime = (supabase && supabase.getLastSync()) || store.getUser().lastSync;
      const formattedSync = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'reciente';

      const allCount = store.animes.length;
      const airingCount = store.animes.filter(a => a.status === 'airing').length;
      const completedCount = store.animes.filter(a => a.status === 'completed').length;
      const planningCount = store.animes.filter(a => a.status === 'planning').length;
      const droppedCount = store.animes.filter(a => a.status === 'dropped').length;

      const hasActiveAdvancedFilters = this.currentGenre !== 'all' || this.currentFormat !== 'all';

      container.innerHTML = `
        <div class="flex flex-col w-full gap-4 pb-12">
          
          <!-- Cloud Status Banner -->
          <div class="flex items-center justify-between bg-surface-container-low px-4 py-2.5 rounded-xl border border-white/5 shadow-sm">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full ${isCloudConnected ? 'bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)]' : 'bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]'} animate-pulse shrink-0"></span>
              <span class="text-xs text-on-surface-variant truncate">
                ${isCloudConnected ? `Sincronizado con Supabase Cloud (${formattedSync})` : `Modo Local Activo · Cambios guardados en navegador`}
              </span>
            </div>
            <button id="btn-force-sync" title="Sincronizar ahora" class="flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container-high" type="button">
              <span class="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>

          <!-- Search & Controls Strip -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <!-- Live Search Input -->
              <div class="relative flex-1 flex items-center">
                <span class="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant pointer-events-none">search</span>
                <input id="library-search-input" value="${this.currentSearch}" class="w-full bg-surface-container pl-10 pr-10 py-2.5 rounded-xl text-xs md:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-all border border-white/5 shadow-inner" placeholder="Buscar anime por título, estudio o género..." type="text"/>
                ${this.currentSearch ? `
                  <button id="library-clear-search" class="absolute right-3 text-outline hover:text-on-surface" type="button">
                    <span class="material-symbols-outlined text-[18px]">cancel</span>
                  </button>
                ` : ''}
              </div>

              <!-- Advanced Filters Button (Tune) -->
              <button id="btn-advanced-filters" title="Filtros avanzados y ordenación" class="relative flex items-center justify-center w-11 h-11 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary rounded-xl transition-all border border-white/5 shrink-0 shadow-sm active:scale-95" type="button">
                <span class="material-symbols-outlined text-[20px]">tune</span>
                ${hasActiveAdvancedFilters ? `<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-ping"></span>` : ''}
              </button>
            </div>

            <!-- Status Quick Pills -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button data-filter="all" class="filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${this.currentFilter === 'all' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">
                <span>Todos</span>
                <span class="px-1.5 py-0.2 rounded-full font-mono text-[10px] ${this.currentFilter === 'all' ? 'bg-on-primary/20 text-on-primary' : 'bg-white/10 text-outline'}">${allCount}</span>
              </button>
              <button data-filter="airing" class="filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${this.currentFilter === 'airing' ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">
                <span>En emisión</span>
                <span class="px-1.5 py-0.2 rounded-full font-mono text-[10px] ${this.currentFilter === 'airing' ? 'bg-on-secondary/20 text-on-secondary' : 'bg-secondary-container/20 text-secondary'}">${airingCount}</span>
              </button>
              <button data-filter="completed" class="filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${this.currentFilter === 'completed' ? 'bg-tertiary text-on-tertiary shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">
                <span>Finalizadas</span>
                <span class="px-1.5 py-0.2 rounded-full font-mono text-[10px] ${this.currentFilter === 'completed' ? 'bg-on-tertiary/20 text-on-tertiary' : 'bg-tertiary-container/30 text-tertiary'}">${completedCount}</span>
              </button>
              <button data-filter="planning" class="filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${this.currentFilter === 'planning' ? 'bg-amber-400 text-black shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">
                <span>Pendientes</span>
                <span class="px-1.5 py-0.2 rounded-full font-mono text-[10px] ${this.currentFilter === 'planning' ? 'bg-black/20 text-black' : 'bg-surface-container-highest text-amber-400'}">${planningCount}</span>
              </button>
              <button data-filter="dropped" class="filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${this.currentFilter === 'dropped' ? 'bg-error text-on-error shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">
                <span>Dropeadas</span>
                <span class="px-1.5 py-0.2 rounded-full font-mono text-[10px] ${this.currentFilter === 'dropped' ? 'bg-on-error/20 text-on-error' : 'bg-error-container/20 text-error'}">${droppedCount}</span>
              </button>
            </div>
          </div>

          <!-- Active filters badge bar if any -->
          ${hasActiveAdvancedFilters ? `
            <div class="flex items-center gap-2 text-xs bg-surface-container px-3 py-1.5 rounded-xl border border-white/5">
              <span class="text-outline">Filtros activos:</span>
              ${this.currentGenre !== 'all' ? `<span class="bg-secondary/20 text-secondary px-2 py-0.5 rounded font-bold">${this.currentGenre}</span>` : ''}
              ${this.currentFormat !== 'all' ? `<span class="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">${this.currentFormat}</span>` : ''}
              <button id="btn-clear-advanced-filters" class="ml-auto text-outline hover:text-white flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[14px]">close</span> Quitar
              </button>
            </div>
          ` : ''}

          <!-- Anime Catalog Cards Container -->
          <div id="library-cards-container" class="flex flex-col gap-3 mt-1">
            ${this.renderCardsHtml(animes)}
          </div>

          <!-- Floating Action Button (+ Añadir anime) -->
          <div class="fixed bottom-20 right-4 z-40 md:right-8">
            <button onclick="window.location.hash='#/anadir'" aria-label="Añadir nuevo anime" class="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-3 rounded-full shadow-[0_8px_24px_rgba(160,120,255,0.45)] hover:shadow-[0_12px_28px_rgba(160,120,255,0.65)] active:scale-95 transition-all group" type="button">
              <span class="material-symbols-outlined text-[22px] group-hover:rotate-90 transition-transform">add</span>
              <span class="text-xs font-bold tracking-wide">Añadir Anime</span>
            </button>
          </div>

        </div>
      `;

      this.bindEvents(container);
    },

    renderCardsHtml(animes) {
      const store = window.AniVault.store;
      if (store.animes.length === 0) {
        return `
          <div class="flex flex-col items-center justify-center p-8 md:p-14 text-center bg-surface-container-low rounded-3xl border border-dashed border-white/10 mt-3 shadow-xl">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5 shadow-[0_0_24px_rgba(208,188,255,0.2)]">
              <span class="material-symbols-outlined text-3xl">video_library</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-on-surface">Tu Bóveda está vacía</h3>
            <p class="text-xs text-on-surface-variant max-w-sm mt-1.5 leading-relaxed">
              Comienza a construir tu biblioteca anime personal. Añade manualmente tus series en emisión, finalizadas o pendientes.
            </p>
            <button onclick="window.location.hash='#/anadir'" class="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-bold shadow-lg hover:shadow-[0_8px_20px_rgba(160,120,255,0.4)] active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Añadir mi primer anime</span>
            </button>
          </div>
        `;
      }

      if (animes.length === 0) {
        return `
          <div class="flex flex-col items-center justify-center p-10 text-center bg-surface-container-low rounded-2xl border border-dashed border-white/10 mt-2">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <h3 class="font-display font-semibold text-base text-on-surface">No se encontraron animes</h3>
            <p class="text-xs text-on-surface-variant max-w-xs mt-1">Intenta con otro término de búsqueda o restablece los filtros.</p>
          </div>
        `;
      }

      return animes.map(anime => {
        const seasons = anime.seasons || [];
        const activeSeason = seasons[seasons.length - 1] || { name: 'T1', currentEp: 1, totalEps: 12 };
        const seasonIndex = seasons.length > 0 ? seasons.length : 1;
        const progressPercent = activeSeason.totalEps > 0 ? Math.min(100, Math.round((activeSeason.currentEp / activeSeason.totalEps) * 100)) : 0;

        const statusBadges = {
          'airing': { label: 'En emisión', bg: 'bg-secondary-container/20', text: 'text-secondary' },
          'completed': { label: 'Finalizada', bg: 'bg-tertiary-container/30', text: 'text-tertiary' },
          'planning': { label: 'Pendiente', bg: 'bg-surface-container-highest', text: 'text-outline' },
          'dropped': { label: 'Dropeada', bg: 'bg-error-container/30', text: 'text-error' }
        };
        const statusMeta = statusBadges[anime.status] || statusBadges.airing;

        return `
          <div class="anime-card relative bg-surface-container-low hover:bg-surface-container rounded-2xl p-3 border border-white/5 shadow-md hover:border-primary/20 transition-all group cursor-pointer overflow-hidden" data-id="${anime.id}">
            <div class="flex gap-3">
              
              <!-- Thumbnail Cover -->
              <div class="relative w-24 h-36 rounded-xl overflow-hidden shrink-0 shadow-md bg-surface-container-highest">
                <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${anime.coverUrl}" alt="${anime.title}" onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80'"/>
                <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
                <div class="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono text-amber-300 flex items-center gap-0.5">
                  <span>${anime.rating || '8.0'}</span>
                  <span class="material-symbols-outlined text-[10px]">star</span>
                </div>
              </div>

              <!-- Content & Metadata -->
              <div class="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                <div>
                  <div class="flex items-start justify-between gap-1">
                    <h3 class="font-display font-bold text-base text-on-surface truncate leading-tight group-hover:text-primary transition-colors">${anime.title}</h3>
                    <button class="btn-card-fav p-1 text-on-surface-variant hover:text-amber-400 active:scale-125 transition-transform shrink-0" data-id="${anime.id}" type="button" title="Marcar como favorito">
                      <span class="material-symbols-outlined text-[20px] ${anime.favorite ? 'text-amber-400' : 'text-outline'}" style="font-variation-settings: 'FILL' ${anime.favorite ? 1 : 0};">star</span>
                    </button>
                  </div>
                  <p class="text-xs text-on-surface-variant truncate">${anime.altTitle || anime.studio || 'Anime'}</p>

                  <div class="flex flex-wrap gap-1 mt-2">
                    <span class="bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-mono">${seasons.length} Temp.</span>
                    <span class="bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-mono">${(anime.movies || []).length} Pelis</span>
                    <span class="bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-mono">${anime.ovasCount || 0} OVAs</span>
                  </div>
                </div>

                <!-- Bottom Progress Bar & Episode Count -->
                <div class="mt-2.5">
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="material-symbols-outlined text-[14px] text-primary">play_circle</span>
                      <span class="font-mono text-xs text-on-surface font-semibold truncate">T${seasonIndex}: Cap. ${activeSeason.currentEp} / ${activeSeason.totalEps || '?'}</span>
                    </div>
                    <span class="${statusMeta.bg} ${statusMeta.text} px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">${statusMeta.label}</span>
                  </div>

                  <div class="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300 ${anime.status === 'completed' ? 'bg-tertiary' : 'bg-primary'}" style="width: ${progressPercent}%"></div>
                  </div>
                </div>

              </div>

              <!-- Chevron indicator -->
              <div class="flex items-center justify-center pl-1 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                <span class="material-symbols-outlined text-[20px]">chevron_right</span>
              </div>

            </div>
          </div>
        `;
      }).join('');
    },

    bindEvents(container) {
      const store = window.AniVault.store;

      // Delegación de clics en las tarjetas para máxima eficiencia
      const cardsContainer = container.querySelector('#library-cards-container');
      if (cardsContainer) {
        cardsContainer.onclick = async (e) => {
          const favBtn = e.target.closest('.btn-card-fav');
          if (favBtn) {
            e.stopPropagation();
            const id = favBtn.getAttribute('data-id');
            const isFav = await store.toggleFavorite(id);
            const icon = favBtn.querySelector('.material-symbols-outlined');
            if (icon) {
              icon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
              icon.className = `material-symbols-outlined text-[20px] ${isFav ? 'text-amber-400' : 'text-outline'}`;
            }
            window.showToast?.(isFav ? 'Añadido a favoritos ⭐' : 'Retirado de favoritos');
            return;
          }

          const card = e.target.closest('.anime-card');
          if (card) {
            const id = card.getAttribute('data-id');
            window.location.hash = `#/detalle?id=${id}`;
          }
        };
      }

      // Píldoras de estado
      container.querySelectorAll('.filter-pill').forEach(pill => {
        pill.onclick = () => {
          this.currentFilter = pill.getAttribute('data-filter');
          this.render(container);
        };
      });

      // Búsqueda en vivo con debounce
      const searchInput = container.querySelector('#library-search-input');
      if (searchInput) {
        searchInput.oninput = (e) => {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            this.currentSearch = e.target.value;
            const filtered = store.getAnimes({
              filter: this.currentFilter,
              search: this.currentSearch,
              sort: this.currentSort,
              genre: this.currentGenre,
              format: this.currentFormat
            });
            if (cardsContainer) {
              cardsContainer.innerHTML = this.renderCardsHtml(filtered);
            }
          }, 150);
        };
      }

      // Botón limpiar búsqueda
      const clearSearchBtn = container.querySelector('#library-clear-search');
      if (clearSearchBtn) {
        clearSearchBtn.onclick = () => {
          this.currentSearch = '';
          this.render(container);
        };
      }

      // Botón de Filtros Avanzados (tune)
      const tuneBtn = container.querySelector('#btn-advanced-filters');
      if (tuneBtn) {
        tuneBtn.onclick = () => {
          window.AniVault.ui.showFilterModal({
            currentSort: this.currentSort,
            currentGenre: this.currentGenre,
            currentFormat: this.currentFormat,
            onApply: (filters) => {
              this.currentSort = filters.sort;
              this.currentGenre = filters.genre;
              this.currentFormat = filters.format;
              this.render(container);
              window.showToast?.('Filtros avanzados aplicados');
            }
          });
        };
      }

      // Quitar filtros avanzados
      const clearAdvBtn = container.querySelector('#btn-clear-advanced-filters');
      if (clearAdvBtn) {
        clearAdvBtn.onclick = () => {
          this.currentGenre = 'all';
          this.currentFormat = 'all';
          this.render(container);
        };
      }

      // Botón forzar sincronización
      const forceSyncBtn = container.querySelector('#btn-force-sync');
      if (forceSyncBtn) {
        forceSyncBtn.onclick = async () => {
          const icon = forceSyncBtn.querySelector('.material-symbols-outlined');
          if (icon) icon.classList.add('animate-spin');
          const res = await store.triggerSync();
          if (icon) icon.classList.remove('animate-spin');
          window.showToast?.(res.simulated ? 'Sincronizado en almacenamiento local' : '¡Catálogo sincronizado con Supabase Cloud! ☁️');
          this.render(container);
        };
      }
    }
  };

  window.AniVault.views.library = libraryView;
})();
