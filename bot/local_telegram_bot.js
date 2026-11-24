/**
 * AniVault - Bot de Telegram para Servidor Local o Router de Casa
 * Ejecutable con Node.js en tu router (OpenWrt/Entware), Raspberry Pi o PC.
 * 
 * Utiliza Long-Polling (no requiere IP pública ni abrir puertos en el router).
 * 
 * USO:
 * 1. Configura tus variables de entorno o edita este archivo:
 *    export TELEGRAM_BOT_TOKEN="tu_token_aqui"
 *    export SUPABASE_URL="https://tu_proyecto.supabase.co"
 *    export SUPABASE_ANON_KEY="tu_clave_anon"
 * 
 * 2. Ejecuta:
 *    node local_telegram_bot.js
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'TU_TELEGRAM_BOT_TOKEN';
const SUPABASE_URL = process.env.SUPABASE_URL || 'TU_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'TU_SUPABASE_KEY';

let lastUpdateId = 0;

console.log('🤖 Iniciando AniVault Telegram Daemon (Long Polling)...');
console.log('📡 Conectando con Supabase:', SUPABASE_URL);

async function callTelegram(method, params = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err) {
    console.error(`Error en Telegram ${method}:`, err.message);
    return null;
  }
}

async function querySupabase(endpoint, options = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error en Supabase:', err.message);
    return null;
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  const reply = async (replyText) => {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: replyText,
      parse_mode: 'Markdown'
    });
  };

  console.log(`[Telegram] Mensaje recibido de ${chatId}: "${text}"`);

  if (text.startsWith('/start') || text.startsWith('/ayuda')) {
    await reply(
      `🌸 *AniVault Router Daemon* 🌸\n\n` +
      `Bot de control para tu biblioteca Anime.\n\n` +
      `• \`/viendo\` - Animes en emisión y capítulo actual.\n` +
      `• \`/animes\` - Catálogo completo de tu bóveda.\n` +
      `• \`/ep <anime> <num>\` - Actualizar capítulo (ej: \`/ep Solo Leveling 5\`).\n` +
      `• \`/fav <anime>\` - Alternar favorito.\n`
    );
    return;
  }

  if (text.startsWith('/viendo')) {
    const animes = await querySupabase('animes?status=eq.airing&select=*');
    if (!animes || animes.length === 0) {
      await reply('📺 No tienes animes marcados como "En emisión".');
      return;
    }
    let out = `📺 *Animes que estás viendo:*\n\n`;
    animes.forEach((a, i) => {
      const s = Array.isArray(a.seasons) ? a.seasons[a.seasons.length - 1] : { currentEp: 1, totalEps: '?' };
      out += `${i + 1}. *${a.title}*\n   ▶️ Cap. *${s.currentEp}* / ${s.totalEps || '?'}\n\n`;
    });
    await reply(out);
    return;
  }

  if (text.startsWith('/animes')) {
    const animes = await querySupabase('animes?select=title,rating,favorite&order=rating.desc');
    if (!animes) {
      await reply('❌ Error consultando Supabase.');
      return;
    }
    let out = `📚 *Tu Bóveda Anime:*\n\n`;
    animes.forEach((a, i) => {
      out += `${i + 1}. *${a.title}* (${a.rating}★)${a.favorite ? ' ⭐' : ''}\n`;
    });
    await reply(out);
    return;
  }

  if (text.startsWith('/ep')) {
    const parts = text.replace('/ep', '').trim().split(' ');
    const ep = parseInt(parts.pop(), 10);
    const search = parts.join(' ').toLowerCase();

    if (isNaN(ep) || !search) {
      await reply('⚠️ Formato: `/ep <nombre> <cap>`');
      return;
    }

    const all = await querySupabase('animes?select=*');
    const match = all?.find(a => a.title.toLowerCase().includes(search));
    if (!match) {
      await reply(`🔍 No encontré "${search}".`);
      return;
    }

    const seasons = Array.isArray(match.seasons) ? match.seasons : [{ currentEp: 1, totalEps: 12 }];
    seasons[seasons.length - 1].currentEp = ep;

    await querySupabase(`animes?id=eq.${encodeURIComponent(match.id)}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({ seasons, updated_at: new Date().toISOString() })
    });

    await reply(`✅ Actualizado *${match.title}* al capítulo *${ep}*!`);
    return;
  }
}

async function poll() {
  const data = await callTelegram('getUpdates', {
    offset: lastUpdateId + 1,
    timeout: 30
  });

  if (data && data.ok && Array.isArray(data.result)) {
    for (const update of data.result) {
      lastUpdateId = update.update_id;
      if (update.message) {
        await handleMessage(update.message);
      }
    }
  }

  setTimeout(poll, 1000);
}

// Iniciar bucle de polling
poll();
