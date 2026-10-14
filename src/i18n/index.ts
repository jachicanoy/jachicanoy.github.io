/** i18n: idiomas, textos de interfaz y helpers. EN es el idioma por defecto (raíz /), ES vive en /es/. */
export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export type Localized<T = string> = T | { en: T; es: T };

/** Resuelve un campo localizado ({en, es}) o devuelve el valor compartido. */
export function L<T>(v: Localized<T> | undefined, lang: Lang): T {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'en' in (v as object)) {
    const o = v as { en: T; es: T };
    return o[lang] ?? o.en;
  }
  return v as T;
}

const base = () => import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** URL de la home en un idioma, respetando el base path de GitHub Pages. */
export const homeUrl = (lang: Lang) => (lang === defaultLang ? base() : `${base()}${lang}/`);

export const ui = {
  en: {
    skip: 'Skip to content',
    nav: { about: 'Profile', stack: 'Stack', projects: 'Projects', products: 'Products', footprint: 'Operations', research: 'Research', experience: 'Experience', contact: 'Contact' },
    themeToggle: 'Toggle light/dark theme',
    menu: 'Open menu',
    langSwitch: 'Español',
    langSwitchLabel: 'Ver en español',
    hero: { cv: 'Download CV', projects: 'View projects' },
    about: { eyebrow: '01 · Profile', title: 'From the <strong>territory</strong> to the model, from the model to the <strong>decision</strong>.' },
    stack: {
      eyebrow: '02 · Core stack', title: 'Technology <strong>matrix</strong>',
      lead: 'Hover or select a technology to filter the projects and products that use it. Related technologies light up.',
      legend: 'projects & products using it', empty: 'No published work yet', filterBy: 'Filter by',
    },
    projects: {
      eyebrow: '03 · Portfolio', title: 'Projects & <strong>case studies</strong>',
      lead: 'Production systems, data platforms and decision frameworks for humanitarian operations and risk management.',
      clear: 'Clear filter', none: 'Nothing published with this technology yet.',
      one: 'item', many: 'items', with: 'with', techs: 'Technologies',
    },
    products: {
      eyebrow: '04 · Products', title: 'Apps, dashboards & <strong>maps</strong>',
      lead: 'A selection of live Earth Engine apps, Power BI reports, ArcGIS dashboards and information products.',
      all: 'All', open: 'Open', code: 'Code',
      types: { gee: 'Earth Engine', powerbi: 'Power BI', arcgis: 'ArcGIS', infographic: 'Infographics', code: 'Code' },
    },
    footprint: {
      eyebrow: '05 · Geospatial footprint', title: 'Operations <strong>map</strong>',
      lead: 'Countries and regions where I have led technical operations, provided regional or remote coverage, or carried out research.',
      all: 'All', loading: 'Loading map…', aria: 'Interactive operations map', filter: 'Filter by region',
      types: { lead: 'On-site operations', regional: 'Regional / remote coverage', academic: 'Research & events' },
    },
    research: { eyebrow: '06 · Research & academic hub', title: 'Doctoral <strong>research</strong> and technical output', education: 'Education' },
    experience: { eyebrow: '07 · Career', title: 'Professional <strong>timeline</strong>', lead: 'Roles across UN agencies, missions and international organisations. Expand each role for detail.' },
    contact: {
      eyebrow: '08 · Contact', title: 'An early-warning system, a geospatial pipeline or a <strong>decision that needs evidence</strong>?',
      cta: 'Get in touch', email: 'Email', built: 'Built with Astro · Deployed on GitHub Pages',
    },
  },
  es: {
    skip: 'Saltar al contenido',
    nav: { about: 'Perfil', stack: 'Stack', projects: 'Proyectos', products: 'Productos', footprint: 'Operaciones', research: 'Investigación', experience: 'Trayectoria', contact: 'Contacto' },
    themeToggle: 'Cambiar tema claro/oscuro',
    menu: 'Abrir menú',
    langSwitch: 'English',
    langSwitchLabel: 'View in English',
    hero: { cv: 'Descargar CV', projects: 'Ver proyectos' },
    about: { eyebrow: '01 · Perfil', title: 'Del <strong>territorio</strong> al modelo, del modelo a la <strong>decisión</strong>.' },
    stack: {
      eyebrow: '02 · Core stack', title: 'Matriz <strong>tecnológica</strong>',
      lead: 'Pasa el cursor o selecciona una tecnología para filtrar los proyectos y productos que la usan. Las tecnologías relacionadas se iluminan.',
      legend: 'proyectos y productos que la usan', empty: 'Aún sin trabajos publicados', filterBy: 'Filtrar por',
    },
    projects: {
      eyebrow: '03 · Portafolio', title: 'Proyectos y <strong>casos de estudio</strong>',
      lead: 'Sistemas en producción, plataformas de datos y marcos de decisión para operaciones humanitarias y gestión del riesgo.',
      clear: 'Limpiar filtro', none: 'Aún no hay trabajos publicados con esta tecnología.',
      one: 'elemento', many: 'elementos', with: 'con', techs: 'Tecnologías',
    },
    products: {
      eyebrow: '04 · Productos', title: 'Apps, tableros y <strong>mapas</strong>',
      lead: 'Una selección de apps de Earth Engine, reportes de Power BI, tableros de ArcGIS y productos de información en vivo.',
      all: 'Todos', open: 'Abrir', code: 'Código',
      types: { gee: 'Earth Engine', powerbi: 'Power BI', arcgis: 'ArcGIS', infographic: 'Infografías', code: 'Código' },
    },
    footprint: {
      eyebrow: '05 · Huella geoespacial', title: 'Mapa de <strong>operaciones</strong>',
      lead: 'Países y regiones donde he liderado operaciones técnicas, dado cobertura regional o remota, o realizado investigación.',
      all: 'Todas', loading: 'Cargando mapa…', aria: 'Mapa interactivo de operaciones', filter: 'Filtrar por región',
      types: { lead: 'Operaciones en terreno', regional: 'Cobertura regional / remota', academic: 'Investigación y eventos' },
    },
    research: { eyebrow: '06 · Investigación y academia', title: 'Investigación <strong>doctoral</strong> y producción técnica', education: 'Formación' },
    experience: { eyebrow: '07 · Trayectoria', title: 'Línea de tiempo <strong>profesional</strong>', lead: 'Roles en agencias, misiones de la ONU y organizaciones internacionales. Despliega cada rol para ver el detalle.' },
    contact: {
      eyebrow: '08 · Contacto', title: '¿Un sistema de alerta temprana, un pipeline geoespacial o una <strong>decisión que necesita evidencia</strong>?',
      cta: 'Escríbeme', email: 'Correo', built: 'Construido con Astro · Desplegado en GitHub Pages',
    },
  },
} as const;

export const t = (lang: Lang) => ui[lang];
