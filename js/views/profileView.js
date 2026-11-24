/**
 * AniVault - Profile & Cloud Sync View
 * Namespace: window.AniVault.views.profile
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const profileView = {
    render(container) {
      const store = window.AniVault.store;
      const supabase = window.AniVault.supabaseService;
      const user = store.getUser();
      const creds = supabase ? supabase.getCredentials() : { url: '', key: '' };
      const isSupabaseConfigured = supabase && supabase.isConfigured();
      const lastSync = (supabase && supabase.getLastSync()) || user.lastSync;
      const formattedDate = lastSync ? new Date(lastSync).toLocaleString() : 'Pendiente';

      container.innerHTML = `
        <div class="flex flex-col w-full pb-16 max-w-2xl mx-auto gap-4">
          
          <!-- User Profile Card -->
          <div class="relative w-full rounded-2xl bg-surface-container-low p-5 border border-white/5 shadow-xl overflow-hidden mt-1">
            <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-16 -left-12 w-40 h-40 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none"></div>

            <div class="relative flex flex-col items-center text-center">
              
              <!-- Avatar Frame with Camera Edit Button -->
              <div class="relative mb-3">
                <div class="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary via-primary-container to-secondary shadow-[0_0_24px_rgba(160,120,255,0.45)]">
                  <div class="w-full h-full rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
                    ${user.avatarUrl ? `
                      <img id="profile-avatar-img" class="w-full h-full object-cover" src="${user.avatarUrl}" alt="${user.username}"/>
                    ` : `
                      <span class="material-symbols-outlined text-primary text-[38px]">person</span>
                    `}
                  </div>
                </div>
                <button id="btn-edit-avatar" aria-label="Cambiar foto de perfil" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                  <span class="material-symbols-outlined text-[17px]">photo_camera</span>
                </button>
              </div>

              <!-- Username & Title -->
              <div class="flex items-center justify-center gap-1.5 mb-1">
                <h2 class="font-display font-extrabold text-xl text-on-surface tracking-tight" id="profile-username-display">${user.username}</h2>
                <button id="btn-edit-username" title="Editar nombre" class="text-on-surface-variant hover:text-primary p-0.5">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/80 text-primary text-xs font-semibold mb-3 border border-white/5">
                <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                <span id="profile-level-display">${user.levelTitle}</span>
              </div>

              <!-- Cloud Status Indicator -->
              <div class="w-full rounded-xl bg-surface-container/70 p-3 flex items-center justify-between border border-white/5 shadow-inner">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[20px] ${isSupabaseConfigured ? 'text-tertiary' : 'text-outline'}">database</span>
                  </div>
                  <div class="flex flex-col text-left min-w-0">
                    <span class="text-xs font-bold text-on-surface truncate">${isSupabaseConfigured ? 'Supabase PostgreSQL Cloud' : 'Almacenamiento Local (Offline)'}</span>
                    <span class="text-[11px] text-on-surface-variant truncate">Último sync: ${formattedDate}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 px-2.5 py-1 rounded-full ${isSupabaseConfigured ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-high text-outline'} text-xs font-bold shrink-0">
                  <span class="material-symbols-outlined text-[13px] ${isSupabaseConfigured ? 'animate-pulse' : ''}">check_circle</span>
                  <span>${isSupabaseConfigured ? 'Activo' : 'Local'}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Supabase Configuration Section (Zero-Cost Database) -->
          <div class="bg-surface-container-low rounded-2xl p-4 border border-white/5 shadow-md flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px]">cloud_sync</span>
                </div>
                <h3 class="font-display font-bold text-sm text-on-surface">Base de Datos Supabase (Gratis)</h3>
              </div>
              <span class="text-[10px] font-mono font-bold text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full">Cloud PostgreSQL</span>
            </div>

            <p class="text-xs text-on-surface-variant leading-relaxed">
              Conecta tu proyecto gratuito de Supabase para tener tu biblioteca 100% online y sincronizada entre tu ordenador, tu móvil y tu bot de Telegram.
            </p>

            <div class="flex flex-col gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-outline uppercase mb-1" for="profile-supabase-url">SUPABASE URL</label>
                <input id="profile-supabase-url" value="${creds.url}" placeholder="https://tu-proyecto.supabase.co" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs font-mono text-on-surface placeholder:text-outline border border-white/5 focus:outline-none focus:bg-surface-container-high"/>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-outline uppercase mb-1" for="profile-supabase-key">SUPABASE ANON KEY</label>
                <input id="profile-supabase-key" type="password" value="${creds.key}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs font-mono text-on-surface placeholder:text-outline border border-white/5 focus:outline-none focus:bg-surface-container-high"/>
              </div>

              <div class="flex items-center gap-2 mt-1">
                <button id="btn-save-supabase-creds" class="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md">
                  <span class="material-symbols-outlined text-[16px]">save</span> Guardar Credenciales
                </button>
                <button id="btn-test-supabase-conn" class="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-white/5">
                  <span class="material-symbols-outlined text-[16px]">bolt</span> Probar
                </button>
              </div>

              <button id="btn-sync-all-action" class="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-secondary/20 shadow-sm">
                <span class="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>Subir y Sincronizar Todo el Catálogo Ahora</span>
              </button>
            </div>
          </div>

          <!-- Telegram Bot Section -->
          <div class="bg-surface-container-low rounded-2xl p-4 border border-white/5 shadow-md flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                </div>
                <h3 class="font-display font-bold text-sm text-on-surface">Bot de Telegram (@AniVaultBot)</h3>
              </div>
              <span class="text-[10px] font-mono font-bold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">Telegram API</span>
            </div>

            <p class="text-xs text-on-surface-variant leading-relaxed">
              Puedes consultar tus series y sumar capítulos directamente chateando con tu bot de Telegram desde el móvil.
            </p>

            <div class="bg-surface-container p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 font-mono text-[11px]">
              <span class="text-secondary font-bold">Comandos disponibles en Telegram:</span>
              <div class="text-on-surface-variant flex flex-col gap-0.5">
                <div><strong class="text-primary">/viendo</strong> - Lista tus animes en curso con su capítulo actual.</div>
                <div><strong class="text-primary">/animes</strong> - Lista completa de tu biblioteca.</div>
                <div><strong class="text-primary">/ep [anime] [cap]</strong> - Actualiza el capítulo visto al instante.</div>
                <div><strong class="text-primary">/fav [anime]</strong> - Conmuta si una serie es favorita.</div>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-outline uppercase mb-1" for="profile-telegram-token">TELEGRAM BOT TOKEN (Opcional)</label>
              <input id="profile-telegram-token" type="password" value="${localStorage.getItem('anivault_telegram_token') || ''}" placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz..." class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs font-mono text-on-surface placeholder:text-outline border border-white/5 focus:outline-none"/>
              <span class="text-[10px] text-outline mt-1 block">Consíguelo gratis hablando con @BotFather en Telegram.</span>
            </div>

            <button id="btn-save-telegram-token" class="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-secondary transition-all flex items-center justify-center gap-1 border border-white/5">
              <span class="material-symbols-outlined text-[16px]">save</span> Guardar Token de Telegram
            </button>
          </div>

          <!-- Backup & Data (JSON) -->
          <div class="bg-surface-container-low rounded-2xl p-4 border border-white/5 shadow-md flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">folder_zip</span>
              </div>
              <h3 class="font-display font-bold text-sm text-on-surface">Copias de Seguridad y Datos (JSON)</h3>
            </div>

            <p class="text-xs text-on-surface-variant">
              Exporta tu biblioteca completa en un archivo JSON o restáurala en cualquier navegador sin depender de ningún servicio externo.
            </p>

            <div class="grid grid-cols-2 gap-2 mt-1">
              <button id="btn-export-backup-json" class="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 border border-white/5">
                <span class="material-symbols-outlined text-[16px] text-primary">download</span> Exportar Backup
              </button>
              
              <button id="btn-import-backup-json-trigger" class="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 border border-white/5">
                <span class="material-symbols-outlined text-[16px] text-secondary">upload</span> Importar Backup
              </button>
              <input type="file" id="profile-import-file-input" accept=".json" class="hidden"/>
            </div>

            <button id="btn-reset-demo-data" class="w-full py-2 rounded-xl text-outline hover:text-error hover:bg-error-container/20 text-xs font-semibold transition-all mt-1 flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>Vaciar toda la biblioteca</span>
            </button>
          </div>

        </div>
      `;

      this.bindEvents(container);
    },

    bindEvents(container) {
      const store = window.AniVault.store;
      const supabase = window.AniVault.supabaseService;

      // Editar Avatar
      const editAvatarBtn = container.querySelector('#btn-edit-avatar');
      if (editAvatarBtn) {
        editAvatarBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: 'Cambiar Foto de Perfil',
            inputs: [
              { id: 'modal-avatar-url', label: 'URL de tu nueva foto de avatar', placeholder: 'https://...', value: store.getUser().avatarUrl }
            ],
            confirmText: 'Actualizar Foto',
            onConfirm: (data) => {
              const url = (data['modal-avatar-url'] || '').trim();
              if (url) {
                store.updateUser({ avatarUrl: url });
                this.render(container);
                window.AniVault.ui.showToast('Foto de perfil actualizada', 'success');
              }
            }
          });
        };
      }

      // Editar Nombre
      const editUsernameBtn = container.querySelector('#btn-edit-username');
      if (editUsernameBtn) {
        editUsernameBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: 'Editar Perfil de Coleccionista',
            inputs: [
              { id: 'modal-username-val', label: 'Nombre de usuario', value: store.getUser().username },
              { id: 'modal-level-val', label: 'Rango / Título Otaku', value: store.getUser().levelTitle }
            ],
            confirmText: 'Guardar Cambios',
            onConfirm: (data) => {
              const username = (data['modal-username-val'] || '').trim();
              const levelTitle = (data['modal-level-val'] || '').trim();
              if (username) {
                store.updateUser({ username, levelTitle: levelTitle || 'Otaku Curator' });
                this.render(container);
                window.AniVault.ui.showToast('Perfil actualizado correctamente', 'success');
              }
            }
          });
        };
      }

      // Guardar credenciales Supabase
      const saveSupabaseBtn = container.querySelector('#btn-save-supabase-creds');
      if (saveSupabaseBtn && supabase) {
        saveSupabaseBtn.onclick = () => {
          const url = (container.querySelector('#profile-supabase-url')?.value || '').trim();
          const key = (container.querySelector('#profile-supabase-key')?.value || '').trim();
          supabase.saveCredentials(url, key);
          window.AniVault.ui.showToast('Credenciales de Supabase guardadas', 'success');
          this.render(container);
        };
      }

      // Probar conexión Supabase
      const testSupabaseBtn = container.querySelector('#btn-test-supabase-conn');
      if (testSupabaseBtn && supabase) {
        testSupabaseBtn.onclick = async () => {
          testSupabaseBtn.disabled = true;
          testSupabaseBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Probando...';
          const res = await supabase.testConnection();
          testSupabaseBtn.disabled = false;
          testSupabaseBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">bolt</span> Probar';
          window.AniVault.ui.showModal({
            title: res.success ? '¡Conexión Exitosa con Supabase!' : 'Fallo de Conexión',
            message: res.message,
            confirmText: 'Entendido'
          });
        };
      }

      // Sincronizar catálogo
      const syncAllBtn = container.querySelector('#btn-sync-all-action');
      if (syncAllBtn && supabase) {
        syncAllBtn.onclick = async () => {
          syncAllBtn.disabled = true;
          syncAllBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Sincronizando...';
          const res = await supabase.syncAll(store.animes);
          syncAllBtn.disabled = false;
          syncAllBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">cloud_upload</span> <span>Subir y Sincronizar Todo el Catálogo Ahora</span>';
          if (res.success) {
            window.AniVault.ui.showToast('¡Catálogo sincronizado con Supabase Cloud! ☁️', 'success');
            this.render(container);
          } else {
            window.AniVault.ui.showToast('Error al sincronizar: ' + res.message, 'error');
          }
        };
      }

      // Guardar token Telegram
      const saveTelegramBtn = container.querySelector('#btn-save-telegram-token');
      if (saveTelegramBtn) {
        saveTelegramBtn.onclick = () => {
          const token = (container.querySelector('#profile-telegram-token')?.value || '').trim();
          if (token) {
            localStorage.setItem('anivault_telegram_token', token);
          } else {
            localStorage.removeItem('anivault_telegram_token');
          }
          window.AniVault.ui.showToast('Token de Telegram guardado', 'info');
        };
      }

      // Exportar Backup
      const exportBtn = container.querySelector('#btn-export-backup-json');
      if (exportBtn) {
        exportBtn.onclick = () => {
          store.exportBackup();
          window.AniVault.ui.showToast('Archivo JSON de copia de seguridad descargado', 'success');
        };
      }

      // Importar Backup
      const importTrigger = container.querySelector('#btn-import-backup-json-trigger');
      const importInput = container.querySelector('#profile-import-file-input');
      if (importTrigger && importInput) {
        importTrigger.onclick = () => importInput.click();

        importInput.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const res = store.importBackup(event.target.result);
              if (res.success) {
                window.AniVault.ui.showToast(`¡Restaurados ${res.count} animes con éxito!`, 'success');
                this.render(container);
              } else {
                window.AniVault.ui.showToast(res.message, 'error');
              }
            };
            reader.readAsText(file);
          }
        };
      }

      // Vaciar biblioteca
      const resetBtn = container.querySelector('#btn-reset-demo-data');
      if (resetBtn) {
        resetBtn.onclick = () => {
          window.AniVault.ui.showModal({
            title: '¿Vaciar toda la biblioteca?',
            message: 'Esta acción eliminará todos los animes guardados y dejará la bóveda completamente vacía para empezar de cero.',
            confirmText: 'Sí, vaciar todo',
            confirmClass: 'bg-red-500 text-white',
            onConfirm: () => {
              store.clearAll();
              this.render(container);
              window.AniVault.ui.showToast('La biblioteca ha sido vaciada', 'info');
            }
          });
        };
      }
    }
  };

  window.AniVault.views.profile = profileView;
})();
