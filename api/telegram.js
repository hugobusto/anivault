/**
 * AniVault - Vercel Serverless Function para Webhook de Telegram
 * Endpoint: /api/telegram
 * 
 * Permite gestionar la biblioteca de anime por chat desde Telegram:
 * /start, /viendo, /animes, /ep <serie> <numero>, /fav <serie>, /ayuda
 */

export default async function handler(req, res) {
  // Solo admitir método POST desde Telegram
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'AniVault Telegram Webhook is active' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const update = req.body;
  if (!update || !update.message || !update.message.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();

  // Función auxiliar para enviar mensaje a Telegram
  async function replyTelegram(replyText) {
    if (!token) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: 'Markdown'
        })
      });
    } catch (e) {
      console.error('Error enviando mensaje a Telegram:', e);
    }
  }

  // Función auxiliar para consultar Supabase vía REST API
  async function querySupabase(path, options = {}) {
    if (!supabaseUrl || !supabaseKey) return null;
    const url = `${supabaseUrl}/rest/v1/${path}`;
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    try {
      const resp = await fetch(url, { ...options, headers });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      console.error('Error consultando Supabase REST:', e);
      return null;
    }
  }

  try {
    // 1. Comando /start o /ayuda
    if (text.startsWith('/start') || text.startsWith('/ayuda') || text.startsWith('/help')) {
      const welcome = `🌸 *¡Bienvenido a AniVault Bot!* 🌸\n\n` +
        `Puedo ayudarte a consultar tu biblioteca anime y registrar tus capítulos vistos directamente desde Telegram.\n\n` +
        `📋 *Comandos Disponibles:*\n` +
        `• \`/viendo\` - Muestra los animes que estás siguiendo ahora y su capítulo actual.\n` +
        `• \`/animes\` - Lista completa de animes en tu bóveda.\n` +
        `• \`/ep <anime> <número>\` - Actualiza el capítulo visto (ej: \`/ep Solo Leveling 5\`).\n` +
        `• \`/fav <anime>\` - Alterna favorito (ej: \`/fav Chainsaw Man\`).\n` +
        `• \`/ayuda\` - Muestra esta ayuda.\n\n` +
        `✨ _Todos los cambios se reflejan al instante en tu web de AniVault en Vercel._`;
      await replyTelegram(welcome);
      return res.status(200).json({ ok: true });
    }

    // 2. Comando /viendo
    if (text.startsWith('/viendo')) {
      const animes = await querySupabase('animes?status=eq.airing&select=*');
      if (!animes || animes.length === 0) {
        await replyTelegram('📺 *No tienes animes marcados como "En emisión" en tu bóveda.*');
        return res.status(200).json({ ok: true });
      }

      let msg = `📺 *Animes que estás viendo actualmente:*\n\n`;
      animes.forEach((a, i) => {
        const seasons = Array.isArray(a.seasons) ? a.seasons : [];
        const activeSeason = seasons[seasons.length - 1] || { currentEp: 1, totalEps: '?' };
        msg += `${i + 1}. *${a.title}*\n`;
        msg += `   └ ▶️ *Capítulo ${activeSeason.currentEp}* / ${activeSeason.totalEps || '?'}\n`;
        msg += `   └ ⭐ Nota: ${a.rating || 'N/A'}/10\n\n`;
      });
      msg += `_Para actualizar usa:_ \`/ep <nombre> <cap>\``;

      await replyTelegram(msg);
      return res.status(200).json({ ok: true });
    }

    // 3. Comando /animes
    if (text.startsWith('/animes')) {
      const animes = await querySupabase('animes?select=title,status,rating,favorite&order=rating.desc');
      if (!animes || animes.length === 0) {
        await replyTelegram('📦 *Tu biblioteca está vacía o Supabase no está configurado todavía.*');
        return res.status(200).json({ ok: true });
      }

      let msg = `📚 *Tu Bóveda Anime (${animes.length} títulos):*\n\n`;
      animes.forEach((a, i) => {
        const statusEmoji = a.status === 'airing' ? '🟢' : a.status === 'completed' ? '🔵' : a.status === 'dropped' ? '🔴' : '🟡';
        const favStar = a.favorite ? ' ⭐' : '';
        msg += `${i + 1}. ${statusEmoji} *${a.title}* (${a.rating}★)${favStar}\n`;
      });

      await replyTelegram(msg);
      return res.status(200).json({ ok: true });
    }

    // 4. Comando /ep <anime> <capítulo>
    if (text.startsWith('/ep')) {
      const parts = text.replace('/ep', '').trim().split(' ');
      if (parts.length < 2) {
        await replyTelegram('⚠️ *Uso incorrecto.* Formato: `/ep <nombre del anime> <número de capítulo>`\nEjemplo: `/ep Solo Leveling 5`');
        return res.status(200).json({ ok: true });
      }

      const targetEp = parseInt(parts.pop(), 10);
      const searchTitle = parts.join(' ').toLowerCase();

      if (isNaN(targetEp)) {
        await replyTelegram('⚠️ El número de capítulo debe ser un valor entero.');
        return res.status(200).json({ ok: true });
      }

      // Buscar anime en Supabase
      const all = await querySupabase('animes?select=*');
      if (!all) {
        await replyTelegram('❌ Error conectando con la base de datos de Supabase.');
        return res.status(200).json({ ok: true });
      }

      const match = all.find(a => a.title.toLowerCase().includes(searchTitle) || (a.alt_title && a.alt_title.toLowerCase().includes(searchTitle)));
      if (!match) {
        await replyTelegram(`🔍 No encontré ningún anime que coincida con "${searchTitle}".`);
        return res.status(200).json({ ok: true });
      }

      // Actualizar temporada activa
      const seasons = Array.isArray(match.seasons) ? match.seasons : [{ name: 'Temporada 1', currentEp: 1, totalEps: 12 }];
      const lastSeason = seasons[seasons.length - 1];
      lastSeason.currentEp = targetEp;

      // Actualizar en Supabase
      await querySupabase(`animes?id=eq.${encodeURIComponent(match.id)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          seasons,
          updated_at: new Date().toISOString()
        })
      });

      await replyTelegram(`✅ *¡Actualizado con éxito!* 🎉\n\n*${match.title}*\nAhora vas por el *Capítulo ${targetEp}* / ${lastSeason.totalEps || '?'}.`);
      return res.status(200).json({ ok: true });
    }

    // 5. Comando /fav <anime>
    if (text.startsWith('/fav')) {
      const searchTitle = text.replace('/fav', '').trim().toLowerCase();
      if (!searchTitle) {
        await replyTelegram('⚠️ Indica el nombre del anime: `/fav Solo Leveling`');
        return res.status(200).json({ ok: true });
      }

      const all = await querySupabase('animes?select=*');
      const match = all?.find(a => a.title.toLowerCase().includes(searchTitle));
      if (!match) {
        await replyTelegram(`🔍 No encontré "${searchTitle}" en tu biblioteca.`);
        return res.status(200).json({ ok: true });
      }

      const newFav = !match.favorite;
      await querySupabase(`animes?id=eq.${encodeURIComponent(match.id)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ favorite: newFav, updated_at: new Date().toISOString() })
      });

      await replyTelegram(`${newFav ? '⭐ *¡Añadido a favoritos!*' : '❌ *Retirado de favoritos.*'}\n*${match.title}*`);
      return res.status(200).json({ ok: true });
    }

    // Comando no reconocido
    await replyTelegram('❓ No reconozco ese comando. Escribe `/ayuda` para ver la lista de comandos disponibles.');
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Error procesando webhook Telegram:', error);
    await replyTelegram('⚠️ Ocurrió un error interno al procesar tu solicitud.');
    return res.status(200).json({ ok: true });
  }
}
