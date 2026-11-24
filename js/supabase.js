/**
 * AniVault - Cliente y Sincronización con Supabase (PostgreSQL)
 * Namespace: window.AniVault.supabaseService
 */
window.AniVault = window.AniVault || {};

(function () {
  const STORAGE_KEYS = {
    SUPABASE_URL: 'anivault_supabase_url',
    SUPABASE_KEY: 'anivault_supabase_key',
    LAST_SYNC: 'anivault_supabase_last_sync'
  };

  class SupabaseService {
    constructor() {
      this.client = null;
      this.url = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
      this.key = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';
      this.initClient();
    }

    initClient() {
      if (this.url && this.key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          this.client = window.supabase.createClient(this.url, this.key);
        } catch (err) {
          console.warn('Error al inicializar cliente Supabase:', err);
          this.client = null;
        }
      } else {
        this.client = null;
      }
    }

    isConfigured() {
      return Boolean(this.client);
    }

    getCredentials() {
      return {
        url: this.url,
        key: this.key
      };
    }

    saveCredentials(url, key) {
      this.url = (url || '').trim();
      this.key = (key || '').trim();
      if (this.url && this.key) {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.url);
        localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, this.key);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
      }
      this.initClient();
    }

    async testConnection() {
      if (!this.isConfigured()) {
        return { success: false, message: 'Faltan credenciales de Supabase (URL y Anon Key).' };
      }
      try {
        const { data, error } = await this.client.from('animes').select('id').limit(1);
        if (error) {
          return { success: false, message: `Error de Supabase: ${error.message}` };
        }
        return { success: true, message: '¡Conexión con Supabase establecida con éxito!' };
      } catch (err) {
        return { success: false, message: `No se pudo conectar: ${err.message}` };
      }
    }

    async fetchAllAnimes() {
      if (!this.isConfigured()) return null;
      try {
        const { data, error } = await this.client.from('animes').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(row => ({
          id: row.id,
          title: row.title,
          altTitle: row.alt_title,
          studio: row.studio,
          genres: row.genres,
          status: row.status,
          coverUrl: row.cover_url,
          bannerUrl: row.banner_url,
          seasons: row.seasons || [],
          movies: row.movies || [],
          rating: Number(row.rating) || 0,
          favorite: Boolean(row.favorite),
          notes: row.notes || '',
          updatedAt: row.updated_at
        }));
      } catch (err) {
        console.warn('Error al obtener animes de Supabase:', err);
        return null;
      }
    }

    async upsertAnime(anime) {
      if (!this.isConfigured()) return false;
      try {
        const payload = {
          id: anime.id,
          title: anime.title,
          alt_title: anime.altTitle || '',
          studio: anime.studio || '',
          genres: anime.genres || '',
          status: anime.status || 'airing',
          cover_url: anime.coverUrl || '',
          banner_url: anime.bannerUrl || '',
          seasons: anime.seasons || [],
          movies: anime.movies || [],
          rating: anime.rating || 0,
          favorite: Boolean(anime.favorite),
          notes: anime.notes || '',
          updated_at: new Date().toISOString()
        };
        const { error } = await this.client.from('animes').upsert(payload);
        if (error) throw error;
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        return true;
      } catch (err) {
        console.warn('Error al guardar anime en Supabase:', err);
        return false;
      }
    }

    async deleteAnime(id) {
      if (!this.isConfigured()) return false;
      try {
        const { error } = await this.client.from('animes').delete().eq('id', id);
        if (error) throw error;
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        return true;
      } catch (err) {
        console.warn('Error al eliminar anime de Supabase:', err);
        return false;
      }
    }

    async syncAll(localAnimes) {
      if (!this.isConfigured()) return { success: false, message: 'Supabase no configurado' };
      try {
        const rows = localAnimes.map(a => ({
          id: a.id,
          title: a.title,
          alt_title: a.altTitle || '',
          studio: a.studio || '',
          genres: a.genres || '',
          status: a.status || 'airing',
          cover_url: a.coverUrl || '',
          banner_url: a.bannerUrl || '',
          seasons: a.seasons || [],
          movies: a.movies || [],
          rating: a.rating || 0,
          favorite: Boolean(a.favorite),
          notes: a.notes || '',
          updated_at: a.updatedAt || new Date().toISOString()
        }));

        const { error } = await this.client.from('animes').upsert(rows);
        if (error) throw error;
        const now = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
        return { success: true, timestamp: now };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    getLastSync() {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    }
  }

  window.AniVault.supabaseService = new SupabaseService();
})();
