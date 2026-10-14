// @ts-check
import { defineConfig } from 'astro/config';

/**
 * SITE y BASE_PATH los inyecta el workflow de GitHub Actions
 * (actions/configure-pages). En local se usan los valores por defecto.
 *  - Repo "usuario.github.io"  -> BASE_PATH = "/"
 *  - Repo de proyecto "portfolio" -> BASE_PATH = "/portfolio"
 */
const site = process.env.SITE || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  compressHTML: true,
  prefetch: false,
});
