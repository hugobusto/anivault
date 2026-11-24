/**
 * AniVault - Global Application Orchestrator
 * Namespace: window.AniVault.app
 * Inicializa router, sincronización y telemetría de cabecera.
 */
window.AniVault = window.AniVault || {};

(function () {
  function updateHeaderTelemetry() {
    const syncBtn = document.getElementById('header-sync-btn');
    const syncIcon = document.getElementById('header-sync-icon');
    const syncText = document.getElementById('header-sync-text');
    const syncTextMobile = document.getElementById('header-sync-text-mobile');
    const avatarImg = document.getElementById('header-avatar-img');
    const avatarIcon = document.getElementById('header-avatar-icon');

    const supabase = window.AniVault.supabaseService;
    const store = window.AniVault.store;

    if (!store) return;

    const isConfigured = supabase && supabase.isConfigured();
    const user = store.getUser();

    if (avatarImg && avatarIcon) {
      if (user && user.avatarUrl) {
        avatarImg.src = user.avatarUrl;
        avatarImg.classList.remove('hidden');
        avatarIcon.classList.add('hidden');
      } else {
        avatarImg.classList.add('hidden');
        avatarIcon.classList.remove('hidden');
      }
    }

    if (syncIcon && syncText && syncTextMobile) {
      if (isConfigured) {
        syncIcon.textContent = 'cloud_done';
        syncIcon.className = 'material-symbols-outlined text-[15px] text-tertiary';
        syncText.textContent = 'Supabase Conectado';
        syncText.className = 'font-sans text-[11px] font-semibold text-tertiary hidden sm:inline';
        syncTextMobile.textContent = 'Cloud';
        syncTextMobile.className = 'font-sans text-[11px] font-semibold text-tertiary sm:hidden';
      } else {
        syncIcon.textContent = 'cloud_off';
        syncIcon.className = 'material-symbols-outlined text-[15px] text-secondary';
        syncText.textContent = 'Modo Local (Offline)';
        syncText.className = 'font-sans text-[11px] font-semibold text-secondary hidden sm:inline';
        syncTextMobile.textContent = 'Local';
        syncTextMobile.className = 'font-sans text-[11px] font-semibold text-secondary sm:hidden';
      }
    }

    if (syncBtn) {
      syncBtn.onclick = () => {
        window.location.hash = '#/perfil';
      };
    }
  }

  function bootstrap() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Inicializar router con el contenedor principal
    if (window.AniVault.router) {
      window.AniVault.router.init(container);
    }

    updateHeaderTelemetry();

    // Escuchar cambios del store para mantener la cabecera sincronizada
    if (window.AniVault.store) {
      window.AniVault.store.subscribe(() => {
        updateHeaderTelemetry();
      });
    }

    console.log('🏯 AniVault iniciado correctamente en el namespace universal window.AniVault');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
