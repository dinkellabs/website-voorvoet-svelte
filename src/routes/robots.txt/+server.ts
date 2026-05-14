import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  const disallow = env.PUBLIC_DISALLOW_INDEXING === 'true';
  const siteUrl = privateEnv.SITE_URL ?? 'https://voorvoet.nl';

  const body = disallow
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nDisallow: /dev/\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
