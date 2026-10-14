import type { ImageMetadata } from 'astro';

/** Miniaturas de trabajos: src/assets/work/<id>.webp, referenciadas por `image` en portfolio.json. */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/work/*.{webp,png,jpg,jpeg}', { eager: true });

export const workImage = (id?: string): ImageMetadata | undefined => {
  if (!id) return undefined;
  const hit = Object.entries(files).find(([p]) => p.split('/').pop()!.replace(/\.\w+$/, '') === id);
  return hit?.[1].default;
};
