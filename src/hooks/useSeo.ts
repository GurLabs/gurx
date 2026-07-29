import { useEffect } from 'react';
import { SITE_URL } from '../lib/brand';

interface SeoOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Per-route document title, description, canonical and OG tags. */
export function useSeo({ title, description, path, image, noindex }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title.includes('GurX') ? title : `${title} — GurX™ Design Awards`;
    document.title = fullTitle;

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);

    setMeta(
      'meta[property="og:image"]',
      'property',
      'og:image',
      image ?? `${SITE_URL}/og-image.png`,
    );
    setMeta(
      'meta[name="twitter:image"]',
      'name',
      'twitter:image',
      image ?? `${SITE_URL}/og-image.png`,
    );

    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';
    } else if (robots) {
      robots.content = 'index, follow';
    }
  }, [title, description, path, image, noindex]);
}
