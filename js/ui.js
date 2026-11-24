/**
 * AniVault - Centralized UI Service
 * Namespace: window.AniVault.ui
 * Maneja notificaciones flotantes (Toasts), modales accesibles y el modal de filtros avanzados.
 */
window.AniVault = window.AniVault || {};

(function () {
  class UIService {
    constructor() {
      this.toastContainer = null;
      this.modalContainer = null;
      this.initDom();
    }

    initDom() {
      // Buscar o crear contenedores globales
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.ensureContainers());
      } else {
        this.ensureContainers();
      }
    }

    ensureContainers() {
      this.toastContainer = document.getElementById('toast-container');
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4';
        document.body.appendChild(this.toastContainer);
      }

      this.modalContainer = document.getElementById('modal-container');
      if (!this.modalContainer) {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'modal-container';
        this.modalContainer.className = 'hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4';
        document.body.appendChild(this.modalContainer);
      }
    }

    showToast(message, type = 'info', duration = 3000) {
      this.ensureContainers();
      if (!this.toastContainer) return;

      const icons = {
        'info': 'info',
        'success': 'check_circle',
        'star': 'star',
        'warning': 'warning',
        'error': 'error'
      };
      const icon = icons[type] || 'info';

      const toast = document.createElement('div');
      toast.className = 'toast-enter flex items-center gap-2 bg-surface-container-high/95 backdrop-blur-md px-4 py-3 rounded-2xl text-xs font-semibold text-on-surface shadow-2xl border border-white/10 pointer-events-auto';
      toast.innerHTML = `
        <span class="material-symbols-outlined text-primary text-[18px]">${icon}</span>
        <span class="flex-1">${message}</span>
      `;

      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.className = toast.className.replace('toast-enter', 'toast-exit');
        setTimeout(() => {
          if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, 260);
      }, duration);
    }

    showModal({
      title = '',
      message = '',
      inputs = [],
      confirmText = 'Confirmar',
      confirmClass = 'bg-primary text-on-primary',
      cancelText = 'Cancelar',
      onConfirm = () => {}
    }) {
      this.ensureContainers();
      if (!this.modalContainer) return;

      let inputsHtml = '';
      if (inputs.length > 0) {
        inputsHtml = inputs.map(input => `
          <div class="flex flex-col gap-1 text-left">
            <label class="text-[11px] font-bold text-outline uppercase" for="${input.id}">${input.label}</label>
            <input 
              id="${input.id}" 
              type="${input.type || 'text'}" 
              step="${input.step || ''}" 
              min="${input.min || ''}" 
              max="${input.max || ''}" 
              value="${input.value !== undefined ? input.value : ''}" 
              placeholder="${input.placeholder || ''}" 
              class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>
        `).join('');
      }

      this.modalContainer.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-5 border border-white/10 shadow-2xl w-full max-w-sm flex flex-col gap-3 scale-95 transition-transform" onclick="event.stopPropagation()">
          <h3 class="font-display font-extrabold text-base text-on-surface">${title}</h3>
          ${message ? `<p class="text-xs text-on-surface-variant leading-relaxed">${message}</p>` : ''}
          ${inputsHtml ? `<div class="flex flex-col gap-2.5 my-1">${inputsHtml}</div>` : ''}
          <div class="flex items-center justify-end gap-2 mt-2">
            <button id="modal-cancel-btn" class="px-3 py-2 rounded-xl text-xs font-semibold text-outline hover:text-on-surface">${cancelText}</button>
            <button id="modal-confirm-btn" class="px-4 py-2 rounded-xl text-xs font-bold ${confirmClass} active:scale-95 transition-transform shadow-md">${confirmText}</button>
          </div>
        </div>
      `;

      this.modalContainer.classList.remove('hidden');

      const closeModal = () => {
        this.modalContainer.classList.add('hidden');
        this.modalContainer.innerHTML = '';
        window.removeEventListener('keydown', onKeyDown);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
      };
      window.addEventListener('keydown', onKeyDown);

      this.modalContainer.onclick = closeModal;
      this.modalContainer.querySelector('#modal-cancel-btn').onclick = closeModal;

      this.modalContainer.querySelector('#modal-confirm-btn').onclick = () => {
        const formData = {};
        inputs.forEach(input => {
          const el = this.modalContainer.querySelector(`#${input.id}`);
          if (el) formData[input.id] = el.value;
        });
        closeModal();
        onConfirm(formData);
      };

      // Foco automático en el primer input
      if (inputs.length > 0) {
        setTimeout(() => {
          const firstInput = this.modalContainer.querySelector(`#${inputs[0].id}`);
          if (firstInput) firstInput.focus();
        }, 50);
      }
    }

    showFilterModal({ currentSort = 'rating', currentGenre = 'all', currentFormat = 'all', onApply = () => {} }) {
      this.ensureContainers();
      if (!this.modalContainer) return;

      const genres = ['all', 'Acción', 'Fantasía', 'Sobrenatural', 'Misterio', 'Drama', 'Aventura', 'Shonen'];
      const formats = [
        { id: 'all', label: 'Todos los formatos' },
        { id: 'movies', label: 'Con Películas vinculadas' },
        { id: 'ovas', label: 'Con OVAs' }
      ];
      const sorts = [
        { id: 'rating', label: 'Puntuación más alta', icon: 'star' },
        { id: 'title', label: 'Alfabético (A - Z)', icon: 'sort_by_alpha' },
        { id: 'updated', label: 'Última actualización', icon: 'history' },
        { id: 'episodes', label: 'Más episodios', icon: 'list_alt' }
      ];

      this.modalContainer.innerHTML = `
        <div class="bg-surface-container-low rounded-2xl p-5 border border-white/10 shadow-2xl w-full max-w-md flex flex-col gap-4 scale-95 transition-transform" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
              <h3 class="font-display font-extrabold text-base text-on-surface">Filtros Avanzados y Ordenación</h3>
            </div>
            <button id="filter-modal-close" class="text-outline hover:text-on-surface p-1">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Ordenación -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-outline uppercase tracking-wider">Criterio de Ordenación</span>
            <div class="grid grid-cols-2 gap-2">
              ${sorts.map(s => `
                <button type="button" data-sort="${s.id}" class="filter-sort-choice p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all text-left ${s.id === currentSort ? 'bg-primary/20 text-primary border-primary/40' : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'}">
                  <span class="material-symbols-outlined text-[15px]">${s.icon}</span>
                  <span>${s.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Géneros -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-outline uppercase tracking-wider">Filtrar por Género</span>
            <div class="flex flex-wrap gap-1.5">
              ${genres.map(g => `
                <button type="button" data-genre="${g}" class="filter-genre-choice px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${g === currentGenre ? 'bg-secondary/20 text-secondary border-secondary/40 font-bold' : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'}">
                  ${g === 'all' ? 'Todos los géneros' : g}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Formato -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-outline uppercase tracking-wider">Formato de Contenido</span>
            <div class="flex flex-col gap-1">
              ${formats.map(f => `
                <label class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-white/5 cursor-pointer hover:bg-surface-container-high text-xs font-medium text-on-surface">
                  <input type="radio" name="filter-format" value="${f.id}" ${f.id === currentFormat ? 'checked' : ''} class="text-primary focus:ring-0 bg-surface-container-highest border-white/20"/>
                  <span>${f.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button id="btn-reset-filters" class="text-xs font-semibold text-outline hover:text-on-surface p-2">Restablecer Todo</button>
            <div class="flex items-center gap-2">
              <button id="btn-cancel-filters" class="px-3 py-2 rounded-xl text-xs font-semibold text-outline hover:text-on-surface">Cancelar</button>
              <button id="btn-apply-filters" class="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary shadow-md active:scale-95 transition-all">Aplicar Filtros</button>
            </div>
          </div>
        </div>
      `;

      this.modalContainer.classList.remove('hidden');

      let selectedSort = currentSort;
      let selectedGenre = currentGenre;

      // Eventos de selección
      this.modalContainer.querySelectorAll('.filter-sort-choice').forEach(btn => {
        btn.onclick = () => {
          selectedSort = btn.getAttribute('data-sort');
          this.modalContainer.querySelectorAll('.filter-sort-choice').forEach(b => {
            b.className = 'filter-sort-choice p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all text-left bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high';
          });
          btn.className = 'filter-sort-choice p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all text-left bg-primary/20 text-primary border-primary/40';
        };
      });

      this.modalContainer.querySelectorAll('.filter-genre-choice').forEach(btn => {
        btn.onclick = () => {
          selectedGenre = btn.getAttribute('data-genre');
          this.modalContainer.querySelectorAll('.filter-genre-choice').forEach(b => {
            b.className = 'filter-genre-choice px-2.5 py-1 rounded-full text-xs font-medium border transition-all bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high';
          });
          btn.className = 'filter-genre-choice px-2.5 py-1 rounded-full text-xs font-medium border transition-all bg-secondary/20 text-secondary border-secondary/40 font-bold';
        };
      });

      const closeModal = () => {
        this.modalContainer.classList.add('hidden');
        this.modalContainer.innerHTML = '';
      };

      this.modalContainer.querySelector('#filter-modal-close').onclick = closeModal;
      this.modalContainer.querySelector('#btn-cancel-filters').onclick = closeModal;

      this.modalContainer.querySelector('#btn-reset-filters').onclick = () => {
        closeModal();
        onApply({ sort: 'rating', genre: 'all', format: 'all' });
      };

      this.modalContainer.querySelector('#btn-apply-filters').onclick = () => {
        const checkedFormat = this.modalContainer.querySelector('input[name="filter-format"]:checked')?.value || 'all';
        closeModal();
        onApply({ sort: selectedSort, genre: selectedGenre, format: checkedFormat });
      };
    }
  }

  window.AniVault.ui = new UIService();
  // Helpers globales para compatibilidad
  window.showToast = (msg, type, dur) => window.AniVault.ui.showToast(msg, type, dur);
  window.showModal = (opts) => window.AniVault.ui.showModal(opts);
})();
