/**
 * AniVault - Unified Reactive Store
 * Namespace: window.AniVault.store
 * Catálogo vacío por defecto para inserción manual limpia.
 */
window.AniVault = window.AniVault || {};

(function () {
  const STORAGE_KEY_ANIMES = 'anivault_library_data_v3';
  const STORAGE_KEY_USER = 'anivault_user_data_v3';

  class Store {
    constructor() {
      this.animes = [];
      this.user = {};
      this.listeners = new Set();
      this.init();
    }

    init() {
      // Limpiar versiones antiguas con datos de prueba si existieran
      localStorage.removeItem('anivault_library_data_v2');
      localStorage.removeItem('anivault_user_data_v2');
      localStorage.removeItem('anivault_library_data');
      localStorage.removeItem('anivault_user_data');

      const seed = window.AniVault.seedData || { SEED_ANIMES: [], DEFAULT_USER: {} };

      // 1. Cargar animes locales (por defecto vacío)
      const localAnimes = localStorage.getItem(STORAGE_KEY_ANIMES);
      if (localAnimes) {
        try {
          this.animes = JSON.parse(localAnimes);
        } catch (e) {
          this.animes = [];
        }
      } else {
        this.animes = [];
        this.saveLocal();
      }

      // 2. Cargar usuario local (por defecto limpio)
      const localUser = localStorage.getItem(STORAGE_KEY_USER);
      if (localUser) {
        try {
          this.user = { ...(seed.DEFAULT_USER || {}), ...JSON.parse(localUser) };
        } catch (e) {
          this.user = { ...(seed.DEFAULT_USER || {}) };
        }
      } else {
        this.user = { ...(seed.DEFAULT_USER || {}) };
        this.saveLocal();
      }

      // 3. Sincronizar en segundo plano si Supabase está activo
      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        this.syncWithSupabaseBackground();
      }
    }

    saveLocal() {
      localStorage.setItem(STORAGE_KEY_ANIMES, JSON.stringify(this.animes));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.user));
      this.notify();
    }

    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    notify() {
      this.listeners.forEach(cb => {
        try { cb(this); } catch (e) { console.error('Error en listener de Store:', e); }
      });
    }

    async syncWithSupabaseBackground() {
      const supabase = window.AniVault.supabaseService;
      if (!supabase || !supabase.isConfigured()) return;
      try {
        const cloudAnimes = await supabase.fetchAllAnimes();
        if (cloudAnimes && cloudAnimes.length > 0) {
          this.animes = cloudAnimes;
          this.saveLocal();
        }
      } catch (err) {
        console.warn('Sync background falló:', err);
      }
    }

    // --- CRUD ANIMES ---

    getAnimes({ filter = 'all', search = '', sort = 'rating', genre = 'all', format = 'all' } = {}) {
      let result = [...this.animes];

      // Filtro de estado
      if (filter === 'airing') {
        result = result.filter(a => a.status === 'airing');
      } else if (filter === 'completed') {
        result = result.filter(a => a.status === 'completed');
      } else if (filter === 'planning') {
        result = result.filter(a => a.status === 'planning');
      } else if (filter === 'dropped') {
        result = result.filter(a => a.status === 'dropped');
      } else if (filter === 'favorites') {
        result = result.filter(a => Boolean(a.favorite));
      }

      // Filtro por género
      if (genre && genre !== 'all') {
        const gLower = genre.toLowerCase();
        result = result.filter(a => (a.genres && a.genres.toLowerCase().includes(gLower)));
      }

      // Filtro por formato
      if (format && format !== 'all') {
        if (format === 'movies') {
          result = result.filter(a => a.movies && a.movies.length > 0);
        } else if (format === 'ovas') {
          result = result.filter(a => a.ovasCount && a.ovasCount > 0);
        }
      }

      // Buscador
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        result = result.filter(a => 
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.altTitle && a.altTitle.toLowerCase().includes(q)) ||
          (a.studio && a.studio.toLowerCase().includes(q)) ||
          (a.genres && a.genres.toLowerCase().includes(q))
        );
      }

      // Ordenación
      if (sort === 'rating') {
        result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      } else if (sort === 'title') {
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else if (sort === 'updated') {
        result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      } else if (sort === 'episodes') {
        result.sort((a, b) => {
          const epA = (a.seasons && a.seasons[0]) ? a.seasons[0].totalEps || 0 : 0;
          const epB = (b.seasons && b.seasons[0]) ? b.seasons[0].totalEps || 0 : 0;
          return epB - epA;
        });
      }

      return result;
    }

    getAnimeById(id) {
      return this.animes.find(a => a.id === id);
    }

    async addAnime(animeData) {
      const id = animeData.id || (animeData.title || 'anime').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `anime-${Date.now()}`;
      const newAnime = {
        id,
        title: animeData.title,
        altTitle: animeData.altTitle || '',
        studio: animeData.studio || '',
        genres: animeData.genres || '',
        status: animeData.status || 'airing',
        coverUrl: animeData.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
        bannerUrl: animeData.bannerUrl || animeData.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
        rating: Number(animeData.rating) || 8.0,
        favorite: Boolean(animeData.favorite),
        notes: animeData.notes || '',
        seasons: animeData.seasons && animeData.seasons.length > 0 ? animeData.seasons : [
          { name: 'Temporada 1', currentEp: 1, totalEps: Number(animeData.totalEps) || 12, status: animeData.status || 'airing' }
        ],
        movies: animeData.movies || [],
        ovasCount: Number(animeData.ovasCount) || 0,
        updatedAt: new Date().toISOString()
      };

      this.animes.unshift(newAnime);
      this.saveLocal();

      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        supabase.upsertAnime(newAnime);
      }

      return newAnime;
    }

    async updateAnime(id, patch) {
      const index = this.animes.findIndex(a => a.id === id);
      if (index === -1) return null;

      this.animes[index] = {
        ...this.animes[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };

      const updated = this.animes[index];
      this.saveLocal();

      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        supabase.upsertAnime(updated);
      }

      return updated;
    }

    async deleteAnime(id) {
      this.animes = this.animes.filter(a => a.id !== id);
      this.saveLocal();

      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        supabase.deleteAnime(id);
      }
    }

    async toggleFavorite(id) {
      const anime = this.getAnimeById(id);
      if (!anime) return false;
      const newStatus = !anime.favorite;
      await this.updateAnime(id, { favorite: newStatus });
      return newStatus;
    }

    async updateEpisode(id, seasonIndex = 0, delta = 1) {
      const anime = this.getAnimeById(id);
      if (!anime || !anime.seasons || !anime.seasons[seasonIndex]) return null;

      const seasons = JSON.parse(JSON.stringify(anime.seasons));
      const targetSeason = seasons[seasonIndex];
      let nextEp = (Number(targetSeason.currentEp) || 0) + delta;

      if (nextEp < 0) nextEp = 0;
      if (targetSeason.totalEps && nextEp > targetSeason.totalEps) {
        nextEp = targetSeason.totalEps;
      }

      targetSeason.currentEp = nextEp;
      if (targetSeason.totalEps && nextEp >= targetSeason.totalEps) {
        targetSeason.status = 'completed';
      } else {
        targetSeason.status = 'airing';
      }

      const updated = await this.updateAnime(id, { seasons });
      return {
        anime: updated,
        season: targetSeason,
        seasonIndex,
        currentEp: nextEp,
        totalEps: targetSeason.totalEps || 12,
        percent: targetSeason.totalEps ? Math.min(100, Math.round((nextEp / targetSeason.totalEps) * 100)) : 0
      };
    }

    async setEpisode(id, seasonIndex = 0, epNumber) {
      const anime = this.getAnimeById(id);
      if (!anime || !anime.seasons || !anime.seasons[seasonIndex]) return null;

      const seasons = JSON.parse(JSON.stringify(anime.seasons));
      const targetSeason = seasons[seasonIndex];
      targetSeason.currentEp = Math.max(0, Number(epNumber));
      if (targetSeason.totalEps && targetSeason.currentEp >= targetSeason.totalEps) {
        targetSeason.status = 'completed';
      } else {
        targetSeason.status = 'airing';
      }

      const updated = await this.updateAnime(id, { seasons });
      return {
        anime: updated,
        season: targetSeason,
        seasonIndex,
        currentEp: targetSeason.currentEp,
        totalEps: targetSeason.totalEps || 12,
        percent: targetSeason.totalEps ? Math.min(100, Math.round((targetSeason.currentEp / targetSeason.totalEps) * 100)) : 0
      };
    }

    async addSeason(id, seasonData) {
      const anime = this.getAnimeById(id);
      if (!anime) return null;
      const seasons = [...(anime.seasons || [])];
      seasons.push({
        name: seasonData.name || `Temporada ${seasons.length + 1}`,
        currentEp: 0,
        totalEps: Number(seasonData.totalEps) || 12,
        status: 'planning'
      });
      return await this.updateAnime(id, { seasons });
    }

    async addMovie(id, movieData) {
      const anime = this.getAnimeById(id);
      if (!anime) return null;
      const movies = [...(anime.movies || [])];
      movies.push({
        title: movieData.title,
        duration: movieData.duration || '1h 45m',
        synopsis: movieData.synopsis || '',
        completed: Boolean(movieData.completed)
      });
      return await this.updateAnime(id, { movies });
    }

    async toggleMovieStatus(id, movieIndex = 0) {
      const anime = this.getAnimeById(id);
      if (!anime || !anime.movies || !anime.movies[movieIndex]) return null;

      const movies = JSON.parse(JSON.stringify(anime.movies));
      movies[movieIndex].completed = !movies[movieIndex].completed;
      return await this.updateAnime(id, { movies });
    }

    // --- METRICS BENTO ---

    getMetrics() {
      let totalWatchedMinutes = 0;
      let totalEpisodesWatched = 0;
      let ratingsSum = 0;
      let ratedCount = 0;

      this.animes.forEach(a => {
        if (Array.isArray(a.seasons)) {
          a.seasons.forEach(s => {
            const ep = Number(s.currentEp) || 0;
            totalEpisodesWatched += ep;
            totalWatchedMinutes += ep * 24;
          });
        }
        if (Array.isArray(a.movies)) {
          a.movies.forEach(m => {
            if (m.completed) totalWatchedMinutes += 105;
          });
        }
        if (a.rating && a.rating > 0) {
          ratingsSum += Number(a.rating);
          ratedCount++;
        }
      });

      const totalHours = Math.round(totalWatchedMinutes / 60);
      const avgRating = ratedCount > 0 ? (ratingsSum / ratedCount).toFixed(1) : '0.0';

      return {
        totalHours,
        totalEpisodesWatched,
        avgRating,
        totalAnimes: this.animes.length,
        favoritesCount: this.animes.filter(a => a.favorite).length
      };
    }

    getUser() {
      return this.user;
    }

    updateUser(patch) {
      this.user = { ...this.user, ...patch };
      this.saveLocal();
      return this.user;
    }

    clearAll() {
      const seed = window.AniVault.seedData || { DEFAULT_USER: {} };
      this.animes = [];
      this.user = { ...(seed.DEFAULT_USER || {}) };
      this.saveLocal();
      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        supabase.syncAll(this.animes);
      }
    }

    exportBackup() {
      const backupData = {
        version: '3.0',
        timestamp: new Date().toISOString(),
        user: this.user,
        animes: this.animes
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anivault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    importBackup(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data.animes)) {
          this.animes = data.animes;
          const seed = window.AniVault.seedData || { DEFAULT_USER: {} };
          if (data.user) {
            this.user = { ...(seed.DEFAULT_USER || {}), ...data.user };
          }
          this.saveLocal();
          const supabase = window.AniVault.supabaseService;
          if (supabase && supabase.isConfigured()) {
            supabase.syncAll(this.animes);
          }
          return { success: true, count: this.animes.length };
        }
        return { success: false, message: 'El archivo JSON no tiene un formato válido de AniVault.' };
      } catch (err) {
        return { success: false, message: `Error al leer el archivo: ${err.message}` };
      }
    }

    async triggerSync() {
      const supabase = window.AniVault.supabaseService;
      if (supabase && supabase.isConfigured()) {
        const res = await supabase.syncAll(this.animes);
        this.notify();
        return res;
      } else {
        await new Promise(r => setTimeout(r, 600));
        this.user.lastSync = new Date().toISOString();
        this.saveLocal();
        return { success: true, simulated: true, timestamp: this.user.lastSync };
      }
    }
  }

  window.AniVault.store = new Store();
})();
