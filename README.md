# Jerson Achicanoy — Portfolio

Sitio personal y portafolio profesional **bilingüe (EN por defecto en `/`, ES en `/es/`)**. **Astro 7** con salida 100 % estática, desplegado en **GitHub Pages** mediante GitHub Actions.

Paleta: híbrido Japandi + azules del WFP UI Kit (`brand-01 #007dbc`, `brand-01-40 #409ecd`, escala `navy-gray`), con contraste AA verificado en ambos temas.

## Arquitectura

```
.
├── .github/workflows/deploy.yml   # CI/CD: build + deploy a Pages en cada push a main
├── astro.config.mjs               # SITE/BASE_PATH inyectados por el workflow
├── public/
│   ├── cv/                        # ← coloca aquí CV_Jerson_Achicanoy.pdf
│   └── favicon.svg
└── src/
    ├── data/portfolio.json        # ★ ÚNICA fuente de contenido; campos localizados {"en","es"}
    ├── data/images.ts             # Resuelve miniaturas de src/assets/work/<id>.webp
    ├── i18n/index.ts              # Textos de interfaz EN/ES y helpers L(), t(), homeUrl()
    ├── assets/work/               # Miniaturas de productos (optimizadas por astro:assets)
    ├── assets/fonts/              # Lato 300/400/700 .woff2 auto-hospedada (OFL)
    ├── styles/global.css          # Tokens de diseño (oscuro por defecto + claro) y base
    ├── scripts/filter.ts          # Filtro cruzado Stack ⇄ Proyectos
    ├── layouts/BaseLayout.astro   # <head>, SEO, JSON-LD, preload de fuentes
    ├── components/
    │   ├── Nav.astro              # Navegación sticky, scroll-spy, tema, menú móvil
    │   ├── Hero.astro             # Curvas de nivel generadas en build (0 KB JS)
    │   ├── About.astro
    │   ├── StackMatrix.astro      # Matriz tecnológica interactiva
    │   ├── Projects.astro         # Casos de estudio
    │   ├── Products.astro         # Galería de apps GEE, Power BI, ArcGIS, infografías
    │   ├── FootprintMap.astro     # Leaflet + mapa base vectorial local (lazy)
    │   ├── Research.astro         # Research & Academic Hub
    │   ├── Timeline.astro         # Línea de tiempo desplegable
    │   ├── Footer.astro           # Contacto
    │   └── Icon.astro
    ├── components/Home.astro      # Composición de la página por idioma
    └── pages/index.astro (EN) · pages/es/index.astro (ES)
```

### Decisiones de rendimiento
- **Cero framework en cliente.** Astro emite HTML estático; el único JS son scripts pequeños (nav, filtro, revelado).
- **Mapa diferido.** Leaflet, `topojson-client` y la geometría (Natural Earth 1:110m, ~40 KB gzip) solo se descargan cuando el mapa se acerca al viewport. Sin teselas de terceros ni API keys; los países con operaciones se sombrean desde `iso` en el JSON y el mapa sigue el tema claro/oscuro.
- **Fuentes.** Lato latin 300/400/700 en `.woff2`, hasheadas por Vite, `font-display: swap` y preload de los pesos visibles above-the-fold.
- **Accesibilidad.** HTML semántico, skip link, `aria-pressed` en filtros, `<details>` nativo en la línea de tiempo, `prefers-reduced-motion` respetado.

## Editar contenido

Todo vive en `src/data/portfolio.json`:

| Bloque | Qué controla |
|---|---|
| `profile` | Hero, resumen, estadísticas |
| `links` | Email, GitHub, LinkedIn, ORCID, Scholar, ruta del CV |
| `stack.domains[].items[]` | Tecnologías (el `id` es la clave del filtro) |
| `projects[]` | Casos de estudio. `tech` = ids del stack; `featured: true` = tarjeta ancha; `links: [{label, url}]`; `image` opcional |
| `products[]` | Galería. `type`: `gee` · `powerbi` · `arcgis` · `infographic` · `code`; `url`, `repo`, `image` = nombre del .webp en `src/assets/work/` |
| `footprint.places[]` | Puntos del mapa. `type`: `lead` · `regional` · `academic`; `iso` = ISO 3166-1 numérico para sombrear el país |
| `research` | Tesis doctoral y producción técnica |
| `experience[]` | Línea de tiempo (`current: true` = abierto y resaltado) |

Cualquier texto puede ser compartido (`"texto"`) o localizado (`{"en": "...", "es": "..."}`). El botón **Descargar CV** usa `public/cv/CV_Jerson_Achicanoy_EN.pdf` / `_ES.pdf` según el idioma; si no existen, enlaza a LinkedIn.

### Pendiente
- [ ] Versión pública del CV (EN/ES) en `public/cv/` — sin teléfono ni tablas específicas de una convocatoria
- [ ] Ejemplos concretos de Power Apps / Power Automate para la galería
- [ ] Enlaces públicos de los reportes Power BI que hoy solo tienen captura (RMRP 2023, Afganistán, OEF)
- [ ] ORCID / Google Scholar si aplica

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera ./dist
npm run preview
```

## Despliegue en GitHub Pages

1. Repositorio: `jachicanoy/jachicanoy.github.io` (rama `main`) → sitio en `https://jachicanoy.github.io/`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Haz push a `main`. El workflow detecta si el repo es `usuario.github.io` (raíz) o un repo de proyecto (`/nombre-repo`) y ajusta `base` automáticamente.

Dominio propio: añade `public/CNAME` con el dominio y configúralo en Settings → Pages.

---
Fuente Lato © Łukasz Dziedzic, SIL Open Font License (`src/assets/fonts/OFL.txt`). Geometría de países: Natural Earth (dominio público) vía `world-atlas`.
