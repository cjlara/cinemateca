# 🎬 Cinemateca

Recomendador personal de cine y series, estilo Netflix, con IA integrada.

## Stack

- **Frontend:** React + Vite
- **Hosting:** Netlify (gratis)
- **Datos:** TMDB API (gratis)
- **IA:** Anthropic Claude Sonnet (pay-per-use, ~1-3€/mes)
- **Persistencia personal:** localStorage (sin backend)

## Coste mensual estimado

| Servicio | Coste |
|----------|-------|
| Netlify  | 0 €   |
| TMDB API | 0 €   |
| Anthropic API | ~1-3 € |
| **Total** | **~1-3 €/mes** |

---

## 🚀 Setup paso a paso

### 1. Clonar y preparar

```bash
git clone https://github.com/TU_USUARIO/cinemateca.git
cd cinemateca
npm install
```

### 2. Obtener las API keys

#### TMDB (obligatoria, gratis)
1. Regístrate en [themoviedb.org](https://www.themoviedb.org/signup)
2. Ve a **Configuración → API**
3. Solicita una API key de tipo "Developer"
4. Copia la **API Key** (la corta, no el token JWT)

#### Anthropic (para el chat IA)
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una API key en **API Keys**
3. Añade crédito (mínimo $5, dura meses con uso personal)

#### OMDB (opcional, para Rotten Tomatoes score)
1. Regístrate en [omdbapi.com](https://www.omdbapi.com/apikey.aspx)
2. El plan gratuito da 1.000 peticiones/día

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:
```
VITE_TMDB_API_KEY=tu_key_de_tmdb
ANTHROPIC_API_KEY=tu_key_de_anthropic
OMDB_API_KEY=tu_key_de_omdb  # opcional
```

> ⚠️ **NUNCA subas `.env` a GitHub.** Ya está en `.gitignore`.

### 4. Desarrollo local

```bash
npm install -g netlify-cli   # solo la primera vez
netlify dev                  # arranca frontend + functions juntos
```

La app estará en `http://localhost:8888`

### 5. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial Cinemateca setup"
git remote add origin https://github.com/TU_USUARIO/cinemateca.git
git push -u origin main
```

### 6. Desplegar en Netlify

1. Ve a [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
2. Conecta tu cuenta de GitHub y selecciona el repo `cinemateca`
3. Netlify detecta automáticamente la configuración de `netlify.toml`
4. En **Site settings → Environment variables**, añade:
   - `TMDB_API_KEY` = tu key de TMDB
   - `ANTHROPIC_API_KEY` = tu key de Anthropic
   - `OMDB_API_KEY` = tu key de OMDB (si la tienes)
5. Pulsa **Deploy site**

A partir de ahora, cada `git push` despliega automáticamente. ✅

---

## 📁 Estructura del proyecto

```
cinemateca/
├── netlify/
│   └── functions/
│       ├── tmdb.js      # Proxy TMDB (oculta API key)
│       └── ai.js        # Proxy Anthropic (oculta API key)
├── src/
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # TMDB client, constants, storage
│   ├── App.jsx          # Shell principal
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── netlify.toml
├── .env.example
└── .gitignore
```

## Características

- 🎬 Carátulas reales de TMDB con +1M de títulos
- 🔍 Búsqueda en tiempo real (películas + series)
- 📺 Secciones por género, plataforma y novedades
- ⭐ Valoración personal con estrellas
- ♥ Favoritas, lista de pendientes, vistas
- ✨ Chat IA para recomendaciones personalizadas
- 🎦 Hero banner con recomendación semanal basada en gustos
- 👤 Fichas de director/actor con filmografía clickable
- 📱 Responsive: PC, tablet y móvil
