# 🏯 AniVault - Gestor de Biblioteca Anime Otaku-Grade

> Gestor de biblioteca anime personal inspirado en los prototipos de **Stitch AI** con estética *Dark Minimalist* y *Luminous Glassmorphism* (paleta Midnight Violet, acentos Neon Violet `#8B5CF6`, Cyan `#06B6D4` y Emerald `#10B981`).

---

## ⚡ Arquitectura Zero-Cost Domain (Sin Comprar Dominios)

Este proyecto está diseñado para funcionar **al 100% gratis** sin tener que pagar por dominios ni servidores dedicados:

```
[ Navegador Web / Móvil ] <---> [ Vercel Hosting (*.vercel.app Gratuito) ]
                                    |                ^
                                    v                | Webhook
                        [ Supabase PostgreSQL ] <---> [ Telegram Bot ]
                         (Base de Datos Cloud)
```

1. **Vercel (Dominio y Hosting Gratis):** Te proporciona un subdominio HTTPS gratuito del tipo `https://tu-anivault.vercel.app` con CDN global y certificados SSL automáticos.
2. **Supabase (Base de Datos en la Nube):** PostgreSQL cloud con 500 MB gratuitos permanentes y APIs REST instantáneas.
3. **Bot de Telegram:** Controla tu biblioteca desde el chat del móvil (`/viendo`, `/animes`, `/ep <serie> <cap>`) ejecutándose como Serverless Function en Vercel o en tu router.
4. **Router / Servidor Doméstico (Opcional):** Si quieres correr el daemon o servir la web en tu router de casa (OpenWrt) sin abrir puertos, puedes usar **Cloudflare Tunnel**.

---

## 🚀 Inicio Rápido en Local

Puedes probar la aplicación inmediatamente en tu ordenador sin necesidad de instalar Node.js ni compilar nada:

1. Ve a la carpeta `C:\proyectos\AniVault`.
2. Haz doble clic en **`index.html`** (o ábrelo con Chrome, Edge o Firefox).
3. ¡Listo! La aplicación arrancará en **Modo Local Resiliente** con el catálogo inicial de prueba (*Solo Leveling*, *Attack on Titan*, *Chainsaw Man*, *Frieren*, *Jujutsu Kaisen*).

---

## ☁️ Paso 1: Configurar la Base de Datos en Supabase (Gratis)

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (ejemplo: `anivault-db`).
3. En el panel izquierdo de Supabase, ve a **SQL Editor**.
4. Abre el archivo **`supabase_schema.sql`** incluido en este proyecto, copia todo su contenido y pégalo en el editor SQL de Supabase. Pulsa en **Run**.
   - Esto creará la tabla `animes` y configurará la seguridad (RLS) para que tu web y tu bot puedan leer y escribir.
5. Ve a **Project Settings > API** y copia:
   - **Project URL** (ejemplo: `https://xyzcompany.supabase.co`)
   - **Project API Key (anon / public)**
6. En tu web AniVault, ve a la pestaña **Perfil**, pega la URL y la Anon Key, y pulsa en **Guardar Credenciales** y **Subir y Sincronizar Todo el Catálogo**.

---

## 🌐 Paso 2: Desplegar en Vercel con Dominio Gratis (`*.vercel.app`)

1. Sube esta carpeta `C:\proyectos\AniVault` a un repositorio de GitHub (público o privado).
2. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **Add New Project** e importa tu repositorio `AniVault`.
4. En la sección **Environment Variables**, añade:
   - `SUPABASE_URL` = (Tu URL de Supabase)
   - `SUPABASE_ANON_KEY` = (Tu clave anon de Supabase)
   - `TELEGRAM_BOT_TOKEN` = (El token de tu bot de Telegram, ver Paso 3)
5. Haz clic en **Deploy**.
6. En menos de 1 minuto tendrás tu dominio activo:
   👉 **`https://anivault-tu-usuario.vercel.app`**

---

## 🤖 Paso 3: Configurar el Bot de Telegram

### 1. Crear el Bot
1. Abre Telegram y busca a **`@BotFather`**.
2. Envía el comando `/newbot` y sigue las instrucciones para ponerle nombre y usuario (ej: `MiAniVault_Bot`).
3. Copia el **HTTP API Token** que te proporciona BotFather.

### 2. Conectar el Bot con Vercel (Opción Recomendada - 24/7 en la Nube)
Para que el bot responda al instante mediante la Serverless Function de Vercel (`api/telegram.js`), configura el Webhook con una simple petición en tu navegador o terminal:

```bash
https://api.telegram.org/bot<TU_BOT_TOKEN>/setWebhook?url=https://<TU_PROYECTO>.vercel.app/api/telegram
```

### 3. Comandos Soportados en Telegram:
- `/start` o `/ayuda` — Muestra el menú de bienvenida y los comandos disponibles.
- `/viendo` — Lista los animes en emisión y el capítulo por el que vas.
- `/animes` — Lista completa de todos los animes de tu bóveda.
- `/ep Solo Leveling 5` — Actualiza directamente el capítulo al número 5.
- `/fav Chainsaw Man` — Marca o desmarca como favorito.

---

## 🏠 Paso 4: Alojar en Router Doméstico o Mini-PC (Opcional)

Si deseas correr el bot de Telegram o servir la web en tu router doméstico (ej. router con OpenWrt, AsusWRT o una Raspberry Pi/Mini-PC en casa):

### Opción A: Bot Local (Long-Polling, sin abrir puertos)
En la carpeta `bot/` tienes `local_telegram_bot.js`. No requiere IP pública ni abrir puertos en el router:
```bash
cd C:\proyectos\AniVault\bot
export TELEGRAM_BOT_TOKEN="tu_token"
export SUPABASE_URL="tu_url"
export SUPABASE_ANON_KEY="tu_key"
node local_telegram_bot.js
```

### Opción B: Servir la Web desde el Router con Cloudflare Tunnel
1. Si tu router corre OpenWrt con uHTTPd, Nginx o Lighttpd, copia el contenido de `C:\proyectos\AniVault` a la carpeta web (ej. `/www`).
2. Para acceder desde fuera de casa **sin abrir puertos ni pagar dominio**:
   - Instala `cloudflared` (Cloudflare Tunnel).
   - Crea un túnel gratuito en el panel de Cloudflare Zero Trust.
   - Apunta el túnel a `http://localhost:80` de tu router.
   - Tendrás un subdominio HTTPS seguro y gratuito gestionado por Cloudflare.

---

## 📁 Estructura del Código

```
C:\proyectos\AniVault\
├── index.html                      # Single Page Application principal (Tailwind + Glassmorphism)
├── vercel.json                     # Configuración de despliegue Vercel (SPA rewrites + API routes)
├── supabase_schema.sql             # Esquema PostgreSQL con tablas, RLS y triggers
├── README.md                       # Esta guía de documentación
├── css\
│   └── styles.css                  # Animaciones neon, scrollbars personalizados y safe areas
├── js\
│   ├── app.js                      # Inicialización global, barra de navegación y modales
│   ├── supabase.js                 # Cliente y sincronización con Supabase (con fallback local)
│   ├── store.js                    # Almacén reactivo de datos (Supabase <-> LocalStorage)
│   ├── seedData.js                 # Catálogo inicial con animes del diseño Stitch AI
│   ├── router.js                   # Enrutador SPA hash (#/biblioteca, #/favoritos, #/detalle, #/anadir, #/perfil, #/login)
│   └── views\
│       ├── libraryView.js          # Catálogo con buscador reactivo, filtros y cards
│       ├── detailView.js           # Ficha de detalle, stepper episodios, temporadas, películas y notas
│       ├── favoritesView.js        # Favoritos, selector Grid/Lista y métricas Bento del santuario
│       ├── addView.js              # Formulario con carga de carátula (URL/archivo base64)
│       ├── profileView.js          # Ajustes de perfil, configuración Supabase, Telegram y backups JSON
│       └── loginView.js            # Bienvenida, login Google/Supabase y modo local
├── api\
│   └── telegram.js                 # Vercel Serverless Function (Webhook para Bot de Telegram)
└── bot\
    └── local_telegram_bot.js       # Script long-polling para correr en router o PC local
```

---

## 🔒 Privacidad y Respaldo de Datos (JSON)

En todo momento puedes ir a la vista de **Perfil** y pulsar en **Exportar Backup** para descargar un archivo `.json` con todas tus series, temporadas, notas y puntuaciones. Si cambias de navegador o dispositivo, solo tienes que pulsar en **Importar Backup** para restaurar tu bóveda al completo.
