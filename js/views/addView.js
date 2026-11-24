/**
 * AniVault - Add Anime View
 * Namespace: window.AniVault.views.add
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const addView = {
    previewUrl: '',
    selectedStatus: 'airing',

    render(container) {
      this.previewUrl = '';
      this.selectedStatus = 'airing';

      container.innerHTML = `
        <div class="flex flex-col w-full pb-16 max-w-2xl mx-auto">
          
          <!-- Header bar -->
          <div class="py-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button onclick="window.history.back()" title="Cancelar" class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div>
                <span class="text-[10px] text-primary uppercase font-bold tracking-wider block">Bóveda Anime</span>
                <h2 class="font-display font-extrabold text-xl text-on-surface">Añadir Nuevo Anime</h2>
              </div>
            </div>

            <button id="btn-save-anime-top" class="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-bold shadow-[0_0_16px_rgba(208,188,255,0.25)] active:scale-95 transition-transform flex items-center gap-1.5" type="button">
              <span class="material-symbols-outlined text-[16px]">done</span>
              <span>Guardar</span>
            </button>
          </div>

          <form id="form-add-anime" class="flex flex-col gap-4 mt-2" onsubmit="event.preventDefault();">
            
            <!-- Bento Grid: Cover Uploader & Basic Metadata -->
            <div class="grid grid-cols-12 gap-3 items-start">
              
              <!-- Cover Art Frame (Aspect ~2:3) -->
              <div class="col-span-12 sm:col-span-5 relative group">
                <div id="cover-drop-zone" class="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-high flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-primary/40 cursor-pointer shadow-lg transition-all">
                  
                  <div id="cover-placeholder" class="flex flex-col items-center justify-center p-3 text-center gap-1.5">
                    <div class="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary shadow-inner">
                      <span class="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                    </div>
                    <p class="text-xs font-semibold text-on-surface-variant">Subir Carátula</p>
                    <span class="font-mono text-[10px] text-outline">Click o arrastra imagen</span>
                  </div>

                  <img id="cover-preview-img" class="absolute inset-0 w-full h-full object-cover hidden" alt="Vista previa carátula"/>
                  <input type="file" id="cover-file-input" accept="image/*" class="hidden"/>
                </div>

                <button id="btn-paste-cover-url" class="w-full mt-2 py-1 text-center text-xs text-secondary hover:underline flex items-center justify-center gap-1" type="button">
                  <span class="material-symbols-outlined text-[14px]">link</span> Pegar URL de imagen
                </button>
              </div>

              <!-- Primary Metadata Inputs -->
              <div class="col-span-12 sm:col-span-7 flex flex-col gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1" for="input-title">TÍTULO PRINCIPAL *</label>
                  <input id="input-title" required class="w-full bg-surface-container px-3 py-2.5 rounded-xl text-sm text-on-surface font-semibold placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-high border border-white/5" placeholder="Ej. Solo Leveling, Frieren, Bleach..." type="text"/>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1" for="input-alt-title">TÍTULO JAPONÉS / ROMAJI</label>
                  <input id="input-alt-title" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-high border border-white/5" placeholder="Ej. 俺だけレベルアップな件 / Sousou no Frieren" type="text"/>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1" for="input-studio">ESTUDIO DE ANIMACIÓN</label>
                  <input id="input-studio" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-high border border-white/5" placeholder="Ej. MAPPA, WIT Studio, A-1 Pictures..." type="text"/>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1" for="input-genres">GÉNEROS / ETIQUETAS</label>
                  <input id="input-genres" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-high border border-white/5" placeholder="Ej. Acción • Fantasía Oscura • Shonen" type="text"/>
                </div>
              </div>

            </div>

            <!-- General Status Selector -->
            <div class="bg-surface-container-low p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
              <span class="text-xs font-bold text-on-surface">Estado General en Catálogo</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="status-selection-group">
                <button type="button" data-status="airing" class="status-btn-choice py-2 px-2 rounded-xl bg-surface-container text-secondary flex flex-col items-center justify-center gap-1 border border-secondary/30 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_currentColor]"></span>
                  <span class="text-xs font-bold">En emisión</span>
                </button>
                <button type="button" data-status="completed" class="status-btn-choice py-2 px-2 rounded-xl bg-surface-container text-outline flex flex-col items-center justify-center gap-1 border border-white/5">
                  <span class="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span class="text-xs font-bold">Finalizada</span>
                </button>
                <button type="button" data-status="planning" class="status-btn-choice py-2 px-2 rounded-xl bg-surface-container text-outline flex flex-col items-center justify-center gap-1 border border-white/5">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span class="text-xs font-bold">Pendiente</span>
                </button>
                <button type="button" data-status="dropped" class="status-btn-choice py-2 px-2 rounded-xl bg-surface-container text-outline flex flex-col items-center justify-center gap-1 border border-white/5">
                  <span class="w-2 h-2 rounded-full bg-error"></span>
                  <span class="text-xs font-bold">Dropeada</span>
                </button>
              </div>
            </div>

            <!-- Episode & Rating Configuration Strip -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <label class="text-[11px] font-bold text-outline uppercase" for="input-total-eps">Capítulos Totales</label>
                <input id="input-total-eps" type="number" min="1" value="12" class="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-mono font-bold text-primary focus:outline-none border border-white/5"/>
              </div>
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1">
                <label class="text-[11px] font-bold text-outline uppercase" for="input-rating">Puntuación Inicial (1-10)</label>
                <input id="input-rating" type="number" step="0.1" min="1" max="10" value="8.5" class="w-full bg-surface-container px-3 py-2 rounded-xl text-sm font-mono font-bold text-amber-400 focus:outline-none border border-white/5"/>
              </div>
            </div>

            <!-- Personal Notes -->
            <div class="bg-surface-container-low p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1">
              <label class="text-[11px] font-bold text-outline uppercase" for="input-notes">Notas u Observaciones Iniciales</label>
              <textarea id="input-notes" rows="2" class="w-full bg-surface-container p-3 rounded-xl text-xs text-on-surface placeholder:text-outline border border-white/5 focus:outline-none resize-none" placeholder="Motivo de seguimiento, recomendaciones o teorías..."></textarea>
            </div>

            <!-- Favorite Checkbox -->
            <label class="flex items-center gap-2 px-2 py-1 cursor-pointer">
              <input type="checkbox" id="input-fav-check" class="w-4 h-4 rounded text-primary focus:ring-0 bg-surface-container border-white/10"/>
              <span class="text-xs font-semibold text-on-surface">Marcar como Favorito ⭐ de inmediato</span>
            </label>

            <!-- Bottom Save Button -->
            <button id="btn-save-anime-bottom" type="button" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold shadow-[0_8px_24px_rgba(160,120,255,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
              <span class="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Añadir a la Bóveda</span>
            </button>

          </form>

        </div>
      `;

      this.bindEvents(container);
    },

    bindEvents(container) {
      const store = window.AniVault.store;
      const dropZone = container.querySelector('#cover-drop-zone');
      const fileInput = container.querySelector('#cover-file-input');
      const previewImg = container.querySelector('#cover-preview-img');
      const placeholder = container.querySelector('#cover-placeholder');

      const applyImage = (url) => {
        this.previewUrl = url;
        previewImg.src = url;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };

      if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => applyImage(event.target.result);
            reader.readAsDataURL(file);
          }
        };

        // Drag and Drop
        dropZone.ondragover = (e) => {
          e.preventDefault();
          dropZone.classList.add('border-primary');
        };
        dropZone.ondragleave = () => {
          dropZone.classList.remove('border-primary');
        };
        dropZone.ondrop = (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-primary');
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => applyImage(event.target.result);
            reader.readAsDataURL(file);
          }
        };
      }

      // Pegar URL
      const pasteUrlBtn = container.querySelector('#btn-paste-cover-url');
      if (pasteUrlBtn) {
        pasteUrlBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: 'Pegar URL de Carátula',
            inputs: [
              { id: 'modal-cover-url', label: 'URL de la imagen (JPG, PNG, WebP)', placeholder: 'https://images.unsplash.com/...' }
            ],
            confirmText: 'Aplicar URL',
            onConfirm: (data) => {
              const url = (data['modal-cover-url'] || '').trim();
              if (url) applyImage(url);
            }
          });
        };
      }

      // Selección de Estado
      const statusStyles = {
        'airing': 'text-secondary border-secondary/30',
        'completed': 'text-tertiary border-tertiary/30',
        'planning': 'text-amber-400 border-amber-400/30',
        'dropped': 'text-error border-error/30'
      };

      container.querySelectorAll('.status-btn-choice').forEach(btn => {
        btn.onclick = () => {
          this.selectedStatus = btn.getAttribute('data-status');
          container.querySelectorAll('.status-btn-choice').forEach(b => {
            b.className = 'status-btn-choice py-2 px-2 rounded-xl bg-surface-container text-outline flex flex-col items-center justify-center gap-1 border border-white/5';
          });
          const colorClass = statusStyles[this.selectedStatus] || 'text-secondary border-secondary/30';
          btn.className = `status-btn-choice py-2 px-2 rounded-xl bg-surface-container ${colorClass} flex flex-col items-center justify-center gap-1 shadow-sm`;
        };
      });

      // Guardar Anime
      const handleSave = async () => {
        const title = (container.querySelector('#input-title')?.value || '').trim();
        if (!title) {
          window.AniVault.ui.showToast('Por favor introduce el título del anime', 'warning');
          container.querySelector('#input-title')?.focus();
          return;
        }

        const altTitle = (container.querySelector('#input-alt-title')?.value || '').trim();
        const studio = (container.querySelector('#input-studio')?.value || '').trim();
        const genres = (container.querySelector('#input-genres')?.value || '').trim();
        const totalEps = Number(container.querySelector('#input-total-eps')?.value) || 12;
        const rating = parseFloat(container.querySelector('#input-rating')?.value) || 8.0;
        const notes = (container.querySelector('#input-notes')?.value || '').trim();
        const favorite = container.querySelector('#input-fav-check')?.checked || false;

        const newAnime = await store.addAnime({
          title,
          altTitle,
          studio,
          genres,
          status: this.selectedStatus,
          coverUrl: this.previewUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
          bannerUrl: this.previewUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
          totalEps,
          rating,
          notes,
          favorite
        });

        window.AniVault.ui.showToast(`¡"${newAnime.title}" guardado en la bóveda! 🚀`, 'success');
        window.location.hash = '#/biblioteca';
      };

      const topSaveBtn = container.querySelector('#btn-save-anime-top');
      const bottomSaveBtn = container.querySelector('#btn-save-anime-bottom');
      if (topSaveBtn) topSaveBtn.onclick = handleSave;
      if (bottomSaveBtn) bottomSaveBtn.onclick = handleSave;
    }
  };

  window.AniVault.views.add = addView;
})();
