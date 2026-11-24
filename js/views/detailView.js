/**
 * AniVault - Detail View (Micro-Reactive Engine)
 * Namespace: window.AniVault.views.detail
 * Ficha cinematográfica completa con Hero banner, Stepper táctil sin recarga de pantalla,
 * matriz de episodios reactiva, gestión de temporadas y películas, y notas con autoguardado.
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const detailView = {
    currentAnime: null,
    activeSeasonIndex: 0,
    notesDebounceTimer: null,

    render(container, params) {
      const store = window.AniVault.store;
      const id = params ? params.get('id') : null;
      const anime = id ? store.getAnimeById(id) : null;

      if (!anime) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <span class="material-symbols-outlined text-5xl text-outline mb-3">error_outline</span>
            <h2 class="text-xl font-bold font-display text-on-surface">Anime no encontrado</h2>
            <p class="text-xs text-on-surface-variant max-w-xs mt-1">El título solicitado no existe en tu bóveda de anime.</p>
            <a href="#/biblioteca" class="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md">Volver a la biblioteca</a>
          </div>
        `;
        return;
      }

      this.currentAnime = anime;
      const seasons = anime.seasons && anime.seasons.length > 0 
        ? anime.seasons 
        : [{ name: 'Temporada 1', currentEp: 1, totalEps: 12, status: 'airing' }];
      
      this.activeSeasonIndex = Math.min(this.activeSeasonIndex, seasons.length - 1);
      if (this.activeSeasonIndex < 0) this.activeSeasonIndex = 0;

      const activeSeason = seasons[this.activeSeasonIndex];
      const progressPercent = activeSeason.totalEps > 0 
        ? Math.min(100, Math.round(((Number(activeSeason.currentEp) || 0) / activeSeason.totalEps) * 100)) 
        : 0;

      container.innerHTML = `
        <div class="flex flex-col w-full pb-16">
          
          <!-- Hero Banner with atmospheric depth & scrim overlay -->
          <div class="relative w-full -mx-4 md:mx-0 md:rounded-3xl overflow-hidden shadow-2xl">
            <div class="w-full h-72 md:h-96 bg-cover bg-center transition-transform duration-700 ease-out scale-105" style="background-image: url('${anime.bannerUrl || anime.coverUrl}');"></div>
            
            <!-- Atmospheric Scrim Gradients -->
            <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 via-transparent to-surface-container-lowest/40"></div>

            <!-- Top Action Bar -->
            <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <button onclick="window.history.back()" title="Volver atrás" class="w-10 h-10 rounded-full bg-surface-container-lowest/70 hover:bg-surface-container backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg transition-all active:scale-90 border border-white/10">
                <span class="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>

              <div class="flex items-center gap-2">
                <!-- Favorite Toggle -->
                <button id="detail-btn-fav" title="Marcar como favorito" class="w-10 h-10 rounded-full bg-surface-container-lowest/70 hover:bg-surface-container backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-90 border border-white/10">
                  <span class="material-symbols-outlined text-[20px] ${anime.favorite ? 'text-amber-400' : 'text-outline'}" style="font-variation-settings: 'FILL' ${anime.favorite ? 1 : 0};">star</span>
                </button>
                <!-- Share Button -->
                <button id="detail-btn-share" title="Copiar ficha" class="w-10 h-10 rounded-full bg-surface-container-lowest/70 hover:bg-surface-container backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg transition-all active:scale-90 border border-white/10">
                  <span class="material-symbols-outlined text-[20px]">share</span>
                </button>
                <!-- Delete Button -->
                <button id="detail-btn-delete" title="Eliminar anime" class="w-10 h-10 rounded-full bg-surface-container-lowest/70 hover:bg-red-500/20 backdrop-blur-md flex items-center justify-center text-error shadow-lg transition-all active:scale-90 border border-white/10">
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

            <!-- Hero Content Overlay Box -->
            <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-semibold text-secondary bg-surface-container-high/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">${anime.studio || 'Estudio Oficial'}</span>
                <span class="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                  <span class="material-symbols-outlined text-[14px] text-tertiary">verified</span> Canon Oficial
                </span>
              </div>
              
              <h1 class="font-display font-extrabold text-2xl md:text-4xl text-on-surface drop-shadow-md tracking-tight leading-tight">${anime.title}</h1>
              <p class="text-xs md:text-sm text-on-surface-variant flex items-center gap-2">
                <span class="text-primary font-medium">${anime.altTitle || ''}</span>
                ${anime.genres ? `<span class="text-outline-variant">•</span><span class="truncate">${anime.genres}</span>` : ''}
              </p>

              <!-- Rating & Status Strip -->
              <div class="flex items-center justify-between mt-3 bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-lg">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
                    <span class="material-symbols-outlined text-[20px]">hotel_class</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] text-on-surface-variant font-medium">Mi Puntuación</span>
                    <div class="flex items-center gap-1">
                      <span class="font-display font-bold text-lg text-on-surface leading-none" id="score-display">${Number(anime.rating || 8.0).toFixed(1)}</span>
                      <span class="text-xs text-outline">/10</span>
                      <button id="btn-edit-score" class="ml-1 text-primary hover:text-primary-fixed p-0.5">
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="h-8 w-[1px] bg-white/10"></div>

                <!-- Status Selector Dropdown -->
                <div class="relative">
                  <button id="btn-status-dropdown" type="button" class="flex items-center gap-1.5 bg-surface-container-highest hover:bg-surface-bright px-3 py-1.5 rounded-xl text-on-surface shadow-inner active:scale-95 transition-all border border-white/10 text-xs font-bold">
                    <span id="status-dot-indicator" class="w-2 h-2 rounded-full ${anime.status === 'completed' ? 'bg-tertiary' : anime.status === 'planning' ? 'bg-amber-400' : anime.status === 'dropped' ? 'bg-error' : 'bg-secondary'}"></span>
                    <span id="status-label-text">${anime.status === 'completed' ? 'Finalizada' : anime.status === 'planning' ? 'Pendiente' : anime.status === 'dropped' ? 'Dropeada' : 'En Emisión'}</span>
                    <span class="material-symbols-outlined text-[16px] text-outline">expand_more</span>
                  </button>
                  <!-- Pop-up upwards to avoid clipping inside overflow-hidden banner -->
                  <div id="status-menu" class="hidden absolute right-0 bottom-full mb-2 w-44 bg-surface-container-high/95 backdrop-blur-xl rounded-2xl shadow-2xl p-1.5 z-50 border border-white/15 flex-col gap-1">
                    <button type="button" data-status="airing" class="status-option flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-bright text-secondary font-medium transition-colors">
                      <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-secondary"></span> En Emisión
                      </span>
                      <span class="status-check-icon material-symbols-outlined text-[16px] text-secondary ${anime.status === 'airing' || !anime.status ? '' : 'hidden'}">check</span>
                    </button>
                    <button type="button" data-status="completed" class="status-option flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-bright text-tertiary font-medium transition-colors">
                      <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-tertiary"></span> Finalizada
                      </span>
                      <span class="status-check-icon material-symbols-outlined text-[16px] text-tertiary ${anime.status === 'completed' ? '' : 'hidden'}">check</span>
                    </button>
                    <button type="button" data-status="planning" class="status-option flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-bright text-amber-400 font-medium transition-colors">
                      <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-amber-400"></span> Pendiente
                      </span>
                      <span class="status-check-icon material-symbols-outlined text-[16px] text-amber-400 ${anime.status === 'planning' ? '' : 'hidden'}">check</span>
                    </button>
                    <button type="button" data-status="dropped" class="status-option flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-bright text-error font-medium transition-colors">
                      <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-error"></span> Dropeada
                      </span>
                      <span class="status-check-icon material-symbols-outlined text-[16px] text-error ${anime.status === 'dropped' ? '' : 'hidden'}">check</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Seasons Tabs & Episode Tracker Section -->
          <div class="flex flex-col gap-3 mt-4">
            
            <!-- Season Navigation Tabs Bar -->
            <div id="season-tabs-bar" class="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
              ${seasons.map((s, idx) => `
                <button data-season-idx="${idx}" class="season-tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shrink-0 ${idx === this.activeSeasonIndex ? 'bg-surface-container-high text-on-surface shadow-md border border-white/10' : 'text-on-surface-variant hover:text-on-surface border border-transparent'}">
                  <span class="season-dot w-1.5 h-1.5 rounded-full ${s.status === 'completed' ? 'bg-tertiary' : 'bg-secondary'}"></span>
                  <span class="season-name-label">${s.name}</span>
                  <span class="season-ep-counter text-[10px] text-outline font-normal">(${s.currentEp}/${s.totalEps || '?'})</span>
                </button>
              `).join('')}
              <button id="btn-add-season" title="Añadir nueva temporada" class="p-2 rounded-xl text-primary hover:bg-surface-container-high shrink-0">
                <span class="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>

            <!-- Active Season Controller (Micro-Reactive Core) -->
            <div class="bg-surface-container-low rounded-2xl p-4 border border-white/5 shadow-md flex flex-col gap-4">
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col">
                  <span class="text-[10px] text-primary font-bold uppercase tracking-wider">Temporada Seleccionada</span>
                  <h3 id="active-season-title" class="font-display font-bold text-base text-on-surface">${activeSeason.name}</h3>
                </div>
                <div id="season-status-chip" class="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full text-secondary text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-secondary ${activeSeason.status === 'completed' ? '' : 'animate-ping'}"></span>
                  <span id="season-status-chip-text">${activeSeason.status === 'completed' ? 'Completada' : 'En Curso'}</span>
                </div>
              </div>

              <!-- Large Stepper Controller -->
              <div class="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-3 border border-white/5 shadow-inner">
                <div class="flex flex-col pl-2">
                  <span class="text-xs text-on-surface-variant">Progreso del arco</span>
                  <div class="flex items-baseline gap-1.5 mt-0.5">
                    <span class="text-xs text-outline">Capítulo</span>
                    <span class="font-display font-extrabold text-2xl text-primary" id="stepper-current-ep">${activeSeason.currentEp}</span>
                    <span class="text-xs text-outline" id="stepper-total-ep">de ${activeSeason.totalEps || '?'}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button id="btn-step-dec" aria-label="Decrementar episodio" class="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center active:scale-95 transition-all border border-white/5">
                    <span class="material-symbols-outlined text-[24px]">remove</span>
                  </button>
                  <button id="btn-step-inc" aria-label="Incrementar episodio" class="w-12 h-12 rounded-xl bg-primary-container hover:bg-primary-container/80 text-on-primary-container flex items-center justify-center active:scale-95 transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)]">
                    <span class="material-symbols-outlined text-[24px]">add</span>
                  </button>
                </div>
              </div>

              <!-- Progress Meter Bar -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between text-xs">
                  <span id="season-ep-summary-text" class="text-on-surface-variant">Capítulo ${activeSeason.currentEp} de ${activeSeason.totalEps || '?'} emitidos</span>
                  <span class="text-secondary font-bold font-mono" id="season-percent-label">${progressPercent}% completado</span>
                </div>
                <div class="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div id="season-progress-bar" class="h-full bg-secondary transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
                </div>
              </div>

              <!-- Episode Quick Matrix Chips Container -->
              <div class="flex flex-col gap-2 pt-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-outline uppercase font-bold tracking-wider">Acceso Directo a Capítulos</span>
                  <span class="text-[11px] font-mono text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">bolt</span> Autoguardado Instantáneo
                  </span>
                </div>
                <div class="grid grid-cols-6 sm:grid-cols-12 gap-1.5" id="episode-chips-container">
                  ${this.renderEpisodeChips(activeSeason)}
                </div>
              </div>

            </div>
          </div>

          <!-- Movies & OVAs Linked Section -->
          <div class="flex flex-col gap-3 mt-4">
            <div class="flex items-center justify-between">
              <h2 class="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[22px]">movie</span>
                Películas y Especiales
              </h2>
              <span id="movies-counter-label" class="text-xs text-outline font-mono">${(anime.movies || []).length} vinculadas</span>
            </div>

            <div id="movies-list-container" class="flex flex-col gap-2">
              ${this.renderMoviesList(anime.movies)}
            </div>

            <button id="btn-add-movie-prompt" class="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/5">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Vincular Película u OVA</span>
            </button>
          </div>

          <!-- Personal Notes Section with Micro-Autosave -->
          <div class="bg-surface-container-low rounded-2xl p-4 border border-white/5 shadow-md flex flex-col gap-2.5 mt-4">
            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[18px]">sticky_note_2</span>
                Notas Personales y Teorías
              </span>
              <span id="notes-status" class="text-[11px] font-mono text-outline">Guardado</span>
            </div>
            <textarea id="notes-textarea" rows="3" class="w-full bg-surface-container rounded-xl p-3 text-xs md:text-sm text-on-surface placeholder:text-outline border border-white/5 focus:outline-none focus:border-primary/40 resize-none transition-all" placeholder="Escribe observaciones, fechas de estreno o enlaces...">${anime.notes || ''}</textarea>
          </div>

        </div>
      `;

      this.bindEvents(container);
    },

    renderEpisodeChips(season) {
      const total = Number(season.totalEps) || 12;
      const current = Number(season.currentEp) || 1;
      let html = '';
      for (let i = 1; i <= total; i++) {
        const isDone = i <= current;
        const isCurrent = i === current;
        const pad = i < 10 ? '0' + i : i;
        html += `
          <button data-ep="${i}" class="chip-ep flex flex-col items-center justify-center py-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border ${
            isCurrent 
              ? 'bg-secondary-container text-on-secondary-container border-secondary/40 shadow-[0_0_10px_rgba(76,215,246,0.3)]' 
              : isDone 
                ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20' 
                : 'bg-surface-container-high text-on-surface-variant/70 border-transparent hover:text-on-surface'
          }">
            <span class="text-[11px]">E${pad}</span>
          </button>
        `;
      }
      return html;
    },

    renderMoviesList(movies) {
      if (!movies || movies.length === 0) {
        return `
          <div class="p-4 rounded-xl bg-surface-container-low/60 border border-dashed border-white/10 text-center text-xs text-outline">
            No hay películas u OVAs vinculadas a este anime todavía.
          </div>
        `;
      }
      return movies.map((m, mIdx) => `
        <div class="bg-surface-container-low rounded-2xl p-3 border border-white/5 shadow-md flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-14 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-secondary shrink-0 border border-white/5">
              <span class="material-symbols-outlined text-[20px]">theaters</span>
              <span class="text-[9px] font-bold font-mono uppercase mt-0.5">${m.duration || 'FILM'}</span>
            </div>
            <div class="flex flex-col min-w-0">
              <h4 class="font-display font-bold text-sm text-on-surface truncate">${m.title}</h4>
              <p class="text-xs text-on-surface-variant truncate">${m.synopsis || 'Película oficial vinculada'}</p>
            </div>
          </div>
          <button data-movie-idx="${mIdx}" class="btn-toggle-movie px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${m.completed ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}">
            <span class="material-symbols-outlined text-[14px]">${m.completed ? 'check_circle' : 'schedule'}</span>
            <span>${m.completed ? 'Visto' : 'Pendiente'}</span>
          </button>
        </div>
      `).join('');
    },

    // Micro-parche del DOM sin reconstruir la vista
    patchEpisodeDOM(patchData) {
      const epEl = document.getElementById('stepper-current-ep');
      const percentEl = document.getElementById('season-percent-label');
      const barEl = document.getElementById('season-progress-bar');
      const summaryEl = document.getElementById('season-ep-summary-text');
      const chipsContainer = document.getElementById('episode-chips-container');

      if (epEl) epEl.textContent = patchData.currentEp;
      if (percentEl) percentEl.textContent = `${patchData.percent}% completado`;
      if (barEl) barEl.style.width = `${patchData.percent}%`;
      if (summaryEl) summaryEl.textContent = `Capítulo ${patchData.currentEp} de ${patchData.totalEps} emitidos`;

      if (chipsContainer) {
        chipsContainer.innerHTML = this.renderEpisodeChips(patchData.season);
        this.bindChipClicks();
      }

      // Actualizar contador en la pestaña activa
      const activeTab = document.querySelector(`.season-tab-btn[data-season-idx="${patchData.seasonIndex}"]`);
      if (activeTab) {
        const counterEl = activeTab.querySelector('.season-ep-counter');
        if (counterEl) counterEl.textContent = `(${patchData.currentEp}/${patchData.totalEps})`;
        const dot = activeTab.querySelector('.season-dot');
        if (dot) {
          dot.className = `season-dot w-1.5 h-1.5 rounded-full ${patchData.season.status === 'completed' ? 'bg-tertiary' : 'bg-secondary'}`;
        }
      }
    },

    bindChipClicks() {
      const store = window.AniVault.store;
      const anime = this.currentAnime;
      if (!anime) return;

      document.querySelectorAll('.chip-ep').forEach(chip => {
        chip.onclick = async () => {
          const ep = Number(chip.getAttribute('data-ep'));
          const patchData = await store.setEpisode(anime.id, this.activeSeasonIndex, ep);
          if (patchData) {
            this.patchEpisodeDOM(patchData);
            window.AniVault.ui.showToast(`Fijado en capítulo ${ep}`, 'info', 1500);
          }
        };
      });
    },

    bindEvents(container) {
      const store = window.AniVault.store;
      const anime = this.currentAnime;
      if (!anime) return;

      // 1. Favorito
      const favBtn = container.querySelector('#detail-btn-fav');
      if (favBtn) {
        favBtn.onclick = async () => {
          const isFav = await store.toggleFavorite(anime.id);
          anime.favorite = isFav;
          const icon = favBtn.querySelector('.material-symbols-outlined');
          if (icon) {
            icon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
            icon.className = `material-symbols-outlined text-[20px] ${isFav ? 'text-amber-400' : 'text-outline'}`;
          }
          window.AniVault.ui.showToast(isFav ? 'Añadido a favoritos ⭐' : 'Retirado de favoritos', 'star');
        };
      }

      // 2. Compartir
      const shareBtn = container.querySelector('#detail-btn-share');
      if (shareBtn) {
        shareBtn.onclick = () => {
          const text = `${anime.title} - ${anime.altTitle || ''} (Viendo en AniVault)`;
          navigator.clipboard?.writeText?.(text);
          window.AniVault.ui.showToast('¡Ficha copiada al portapapeles!', 'info');
        };
      }

      // 3. Eliminar anime
      const deleteBtn = container.querySelector('#detail-btn-delete');
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: '¿Eliminar de tu Bóveda?',
            message: `¿Estás seguro de que quieres eliminar "${anime.title}"? Esta acción retirará el anime de tu biblioteca.`,
            confirmText: 'Sí, eliminar',
            confirmClass: 'bg-red-500 text-white',
            onConfirm: async () => {
              await store.deleteAnime(anime.id);
              window.AniVault.ui.showToast('Anime eliminado de la biblioteca', 'info');
              window.location.hash = '#/biblioteca';
            }
          });
        };
      }

      // 4. Stepper Episodio (+) y (-) con micro-reactividad DOM
      const incBtn = container.querySelector('#btn-step-inc');
      if (incBtn) {
        incBtn.onclick = async () => {
          const patchData = await store.updateEpisode(anime.id, this.activeSeasonIndex, 1);
          if (patchData) {
            this.patchEpisodeDOM(patchData);
            window.AniVault.ui.showToast('Capítulo incrementado (+1)', 'info', 1200);
          }
        };
      }

      const decBtn = container.querySelector('#btn-step-dec');
      if (decBtn) {
        decBtn.onclick = async () => {
          const patchData = await store.updateEpisode(anime.id, this.activeSeasonIndex, -1);
          if (patchData) {
            this.patchEpisodeDOM(patchData);
          }
        };
      }

      // 5. Clics en los chips de episodios
      this.bindChipClicks();

      // 6. Pestañas de temporadas
      container.querySelectorAll('.season-tab-btn').forEach(tab => {
        tab.onclick = () => {
          this.activeSeasonIndex = Number(tab.getAttribute('data-season-idx'));
          const seasons = anime.seasons || [];
          const season = seasons[this.activeSeasonIndex];
          if (!season) return;

          // Actualizar títulos y estado de la temporada activa en el DOM
          document.querySelectorAll('.season-tab-btn').forEach(t => {
            t.className = 'season-tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shrink-0 text-on-surface-variant hover:text-on-surface border border-transparent';
          });
          tab.className = 'season-tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shrink-0 bg-surface-container-high text-on-surface shadow-md border border-white/10';

          const titleEl = document.getElementById('active-season-title');
          if (titleEl) titleEl.textContent = season.name;

          const chipText = document.getElementById('season-status-chip-text');
          if (chipText) chipText.textContent = season.status === 'completed' ? 'Completada' : 'En Curso';

          const percent = season.totalEps ? Math.min(100, Math.round(((Number(season.currentEp) || 0) / season.totalEps) * 100)) : 0;
          this.patchEpisodeDOM({
            season,
            seasonIndex: this.activeSeasonIndex,
            currentEp: season.currentEp,
            totalEps: season.totalEps || 12,
            percent
          });
        };
      });

      // 7. Añadir nueva temporada
      const addSeasonBtn = container.querySelector('#btn-add-season');
      if (addSeasonBtn) {
        addSeasonBtn.onclick = () => {
          const nextNum = (anime.seasons ? anime.seasons.length : 1) + 1;
          window.AniVault.ui.showModal({
            title: `Añadir Temporada ${nextNum}`,
            inputs: [
              { id: 'modal-season-name', label: 'Nombre de la temporada', value: `Temporada ${nextNum}` },
              { id: 'modal-season-total', label: 'Número total de capítulos', type: 'number', value: 12 }
            ],
            confirmText: 'Añadir Temporada',
            onConfirm: async (data) => {
              const updated = await store.addSeason(anime.id, {
                name: data['modal-season-name'] || `Temporada ${nextNum}`,
                totalEps: Number(data['modal-season-total']) || 12
              });
              if (updated) {
                this.currentAnime = updated;
                this.activeSeasonIndex = updated.seasons.length - 1;
                this.render(container, new URLSearchParams(`id=${anime.id}`));
                window.AniVault.ui.showToast('Nueva temporada añadida con éxito', 'success');
              }
            }
          });
        };
      }

      // 8. Películas: alternar estado
      const bindMovieToggles = () => {
        container.querySelectorAll('.btn-toggle-movie').forEach(btn => {
          btn.onclick = async () => {
            const mIdx = Number(btn.getAttribute('data-movie-idx'));
            const updated = await store.toggleMovieStatus(anime.id, mIdx);
            if (updated) {
              this.currentAnime = updated;
              const moviesList = container.querySelector('#movies-list-container');
              if (moviesList) {
                moviesList.innerHTML = this.renderMoviesList(updated.movies);
                bindMovieToggles();
              }
            }
          };
        });
      };
      bindMovieToggles();

      // 9. Vincular película modal
      const addMovieBtn = container.querySelector('#btn-add-movie-prompt');
      if (addMovieBtn) {
        addMovieBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: 'Vincular Película u OVA',
            inputs: [
              { id: 'movie-title-val', label: 'Título de la película o especial', placeholder: 'Ej. Mugen Train' },
              { id: 'movie-dur-val', label: 'Duración (opcional)', placeholder: 'Ej. 1h 55m' },
              { id: 'movie-syn-val', label: 'Sinopsis o descripción breve', placeholder: 'Ej. Continuación directa de T1' }
            ],
            confirmText: 'Vincular',
            onConfirm: async (data) => {
              if (!data['movie-title-val']) return;
              const updated = await store.addMovie(anime.id, {
                title: data['movie-title-val'].trim(),
                duration: data['movie-dur-val'] ? data['movie-dur-val'].trim() : '1h 30m',
                synopsis: data['movie-syn-val'] ? data['movie-syn-val'].trim() : '',
                completed: false
              });
              if (updated) {
                this.currentAnime = updated;
                const moviesList = container.querySelector('#movies-list-container');
                const counter = container.querySelector('#movies-counter-label');
                if (moviesList) {
                  moviesList.innerHTML = this.renderMoviesList(updated.movies);
                  bindMovieToggles();
                }
                if (counter) counter.textContent = `${(updated.movies || []).length} vinculadas`;
                window.AniVault.ui.showToast('Película vinculada correctamente', 'success');
              }
            }
          });
        };
      }

      // 10. Notas personales: autoguardado debounced
      const notesTextarea = container.querySelector('#notes-textarea');
      const notesStatus = container.querySelector('#notes-status');
      if (notesTextarea) {
        notesTextarea.oninput = () => {
          if (notesStatus) notesStatus.textContent = 'Guardando...';
          clearTimeout(this.notesDebounceTimer);
          this.notesDebounceTimer = setTimeout(async () => {
            await store.updateAnime(anime.id, { notes: notesTextarea.value });
            if (notesStatus) notesStatus.textContent = 'Guardado';
          }, 500);
        };
      }

      // 11. Editor de Puntuación
      const editScoreBtn = container.querySelector('#btn-edit-score');
      if (editScoreBtn) {
        editScoreBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: 'Editar Mi Puntuación',
            inputs: [
              { id: 'score-num-val', label: 'Puntuación personal (de 1.0 a 10.0)', type: 'number', step: '0.1', min: '1', max: '10', value: anime.rating || 8.5 }
            ],
            confirmText: 'Guardar Nota',
            onConfirm: async (data) => {
              const val = parseFloat(data['score-num-val']);
              if (!isNaN(val)) {
                await store.updateAnime(anime.id, { rating: val });
                anime.rating = val;
                const scoreDisplay = document.getElementById('score-display');
                if (scoreDisplay) scoreDisplay.textContent = val.toFixed(1);
                window.AniVault.ui.showToast(`Puntuación actualizada a ${val.toFixed(1)} ★`, 'star');
              }
            }
          });
        };
      }

      // 12. Desplegable de Estado
      const statusBtn = container.querySelector('#btn-status-dropdown');
      const statusMenu = container.querySelector('#status-menu');
      if (statusBtn && statusMenu) {
        statusBtn.onclick = (e) => {
          e.stopPropagation();
          const isHidden = statusMenu.classList.contains('hidden');
          if (isHidden) {
            statusMenu.classList.remove('hidden');
            statusMenu.classList.add('flex');
          } else {
            statusMenu.classList.add('hidden');
            statusMenu.classList.remove('flex');
          }
        };

        const closeStatusMenu = (e) => {
          if (!statusMenu.contains(e.target) && e.target !== statusBtn && !statusBtn.contains(e.target)) {
            statusMenu.classList.add('hidden');
            statusMenu.classList.remove('flex');
          }
        };
        document.addEventListener('click', closeStatusMenu);

        const statusNames = { 'airing': 'En Emisión', 'completed': 'Finalizada', 'planning': 'Pendiente', 'dropped': 'Dropeada' };
        const statusColors = { 'airing': 'bg-secondary', 'completed': 'bg-tertiary', 'planning': 'bg-amber-400', 'dropped': 'bg-error' };

        container.querySelectorAll('.status-option').forEach(opt => {
          opt.onclick = async (e) => {
            e.stopPropagation();
            const newStatus = opt.getAttribute('data-status');
            await store.updateAnime(anime.id, { status: newStatus });
            anime.status = newStatus;

            const labelEl = document.getElementById('status-label-text');
            const dotEl = document.getElementById('status-dot-indicator');

            if (labelEl) labelEl.textContent = statusNames[newStatus] || newStatus;
            if (dotEl) dotEl.className = `w-2 h-2 rounded-full ${statusColors[newStatus] || 'bg-secondary'}`;

            // Actualizar marcas de verificación (checkmarks) dentro del menú
            container.querySelectorAll('.status-option').forEach(o => {
              const checkIcon = o.querySelector('.status-check-icon');
              const oStatus = o.getAttribute('data-status');
              if (checkIcon) {
                if (oStatus === newStatus) {
                  checkIcon.classList.remove('hidden');
                } else {
                  checkIcon.classList.add('hidden');
                }
              }
            });

            statusMenu.classList.add('hidden');
            statusMenu.classList.remove('flex');
            window.AniVault.ui.showToast(`Estado cambiado a ${statusNames[newStatus]}`, 'info');
          };
        });
      }
    }
  };

  window.AniVault.views.detail = detailView;
})();
