/**
 * AniVault - Login / Welcome View
 * Namespace: window.AniVault.views.login
 */
window.AniVault = window.AniVault || {};
window.AniVault.views = window.AniVault.views || {};

(function () {
  const loginView = {
    render(container) {
      container.innerHTML = `
        <div class="flex flex-col w-full max-w-md mx-auto items-center text-center py-6 pb-20">
          
          <!-- Glowing Emblem -->
          <div class="relative mb-4 group cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary via-secondary to-tertiary rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div class="relative w-20 h-20 bg-surface-container-high rounded-2xl p-2 flex items-center justify-center shadow-2xl border border-white/10">
              <div class="w-full h-full rounded-xl bg-surface-container-lowest flex items-center justify-center overflow-hidden relative">
                <span class="material-symbols-outlined text-[42px] text-primary" style="font-variation-settings: 'FILL' 1;">cloud_sync</span>
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-tertiary-container rounded-full flex items-center justify-center text-on-tertiary-container shadow-md">
                  <span class="material-symbols-outlined text-[14px]">verified_user</span>
                </div>
              </div>
            </div>
          </div>

          <h1 class="font-display font-extrabold text-2xl md:text-3xl text-on-surface tracking-tight mb-2">
            Tu Biblioteca Anime siempre contigo
          </h1>
          <p class="text-xs text-on-surface-variant max-w-sm px-2 leading-relaxed">
            Sincroniza tus animes, temporadas, películas y capítulos en la nube con Supabase y Vercel. Accede desde tu móvil o PC sin perder nada.
          </p>

          <!-- Primary Actions -->
          <div class="mt-6 flex flex-col items-center w-full gap-3">
            <button id="btn-login-google-action" class="w-full relative group overflow-hidden bg-white text-surface py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition-all">
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>Continuar con Google</span>
            </button>

            <a href="#/biblioteca" class="py-2 px-4 text-on-surface-variant hover:text-secondary text-xs font-semibold transition-colors flex items-center gap-1 group">
              <span>Explorar en modo local (sin sincronizar)</span>
              <span class="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </a>
          </div>

          <!-- Highlights -->
          <div class="mt-8 flex flex-col gap-2.5 w-full text-left">
            <div class="p-3 bg-surface-container rounded-xl flex items-center gap-3 border border-white/5">
              <span class="material-symbols-outlined text-primary text-[22px]">database</span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">Base de datos Supabase</span>
                <span class="text-[11px] text-on-surface-variant">PostgreSQL gratuito con sincronización automática.</span>
              </div>
            </div>

            <div class="p-3 bg-surface-container rounded-xl flex items-center gap-3 border border-white/5">
              <span class="material-symbols-outlined text-secondary text-[22px]">send</span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">Bot de Telegram</span>
                <span class="text-[11px] text-on-surface-variant">Consulta y suma capítulos desde Telegram por chat.</span>
              </div>
            </div>

            <div class="p-3 bg-surface-container rounded-xl flex items-center gap-3 border border-white/5">
              <span class="material-symbols-outlined text-tertiary text-[22px]">devices</span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">Despliegue Vercel Gratis</span>
                <span class="text-[11px] text-on-surface-variant">Dominio *.vercel.app sin pagar un solo euro.</span>
              </div>
            </div>
          </div>

        </div>
      `;

      container.querySelector('#btn-login-google-action')?.addEventListener('click', () => {
        window.AniVault.ui.showToast('Sesión iniciada con éxito ✨', 'success');
        window.location.hash = '#/biblioteca';
      });
    }
  };

  window.AniVault.views.login = loginView;
})();
