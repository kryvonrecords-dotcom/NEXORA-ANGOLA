import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { sendFcmToAll } from './server/fcm';
import { createServer as createViteServer } from 'vite';
import routes from './server/routes';
import { db } from './server/db';
import { deleteSupabaseStorageFiles } from './server/supabase';
import { importRSSArticles } from './server/rss';
import { importRNAArticles } from './server/rna';


async function runAutomaticNewsImport() {
  try {
    const rssResult = await importRSSArticles(5);
    const rnaResult = await importRNAArticles(5);

    console.log('[NEXORA AUTOMATION] Importação automática:', {
      rss: rssResult,
      rna: rnaResult
    });
  } catch (error) {
    console.error('[NEXORA AUTOMATION] Erro na importação automática:', error);
  }
}

async function processScheduledNews() {
  const now = new Date();
  const scheduledNews = db.getAllNews().filter(news =>
    news.status === 'scheduled' &&
    news.scheduledFor &&
    new Date(news.scheduledFor).getTime() <= now.getTime()
  );

  if (scheduledNews.length === 0) return;

  for (const news of scheduledNews) {
    try {
      const publishedAt = now.toISOString();

      const updated = db.updateNews(news.id, {
        status: 'published',
        publishedAt
      });

      if (!updated) continue;

      const category = db.getCategoryById(updated.categoryId);

      const notif = db.createNotification({
        title: updated.isBreaking
          ? `🔴 URGENTE: ${updated.title}`
          : `📰 ${updated.title}`,
        body: updated.excerpt ||
          'Toque para ler a notícia completa no Nexora Angola.',
        newsId: updated.id,
        newsSlug: updated.slug,
        categoryName: category?.name || updated.categoryName || 'Geral',
        imageUrl: updated.featuredImage,
        isBreaking: updated.isBreaking,
        type: updated.isBreaking ? 'breaking_news' : 'new_article',
        clickUrl: `/noticia/${updated.slug}`
      });

      console.log(
        `⏰ Notícia agendada publicada: "${updated.title}" (${updated.id})`
      );

      sendFcmToAll(notif)
        .then(result => {
          console.log(
            `⏰ FCM da notícia agendada: ${result.sent} enviados, ${result.failed} falharam.`
          );
        })
        .catch(error => {
          console.error(
            'Erro no FCM da notícia agendada:',
            error
          );
        });

    } catch (error) {
      console.error(
        `Erro ao processar notícia agendada ${news.id}:`,
        error
      );
    }
  }
}


async function cleanupExpiredNewsStorage(expiredNews: any[]) {
  const filesToDelete: string[] = [];

  for (const news of expiredNews) {
    const mediaUrls = [
      news.featuredImage,
      ...(Array.isArray(news.galleryImages) ? news.galleryImages : [])
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);

    for (const url of mediaUrls) {
      try {
        const parsed = new URL(url);
        const pathPrefix = '/storage/v1/object/public/uploads/';

        if (!parsed.pathname.startsWith(pathPrefix)) {
          continue;
        }

        const filename = decodeURIComponent(
          parsed.pathname.slice(pathPrefix.length)
        );

        if (filename && !filename.includes('/')) {
          filesToDelete.push(filename);
        }
      } catch {
        // Ignorar URLs inválidas ou externas.
      }
    }
  }

  const uniqueFiles = [...new Set(filesToDelete)];

  if (uniqueFiles.length === 0) return;

  try {
    await deleteSupabaseStorageFiles(uniqueFiles);
    console.log(
      `🧹 Mídia removida do Supabase Storage após expiração: ${uniqueFiles.length}`
    );
  } catch (error) {
    console.error(
      'Erro ao remover mídia de notícias expiradas do Supabase Storage:',
      error
    );
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Fallback for /uploads/* if image file was deleted, lost after restart, or not found on disk
  app.get('/uploads/*', (req, res) => {
    const filename = path.basename(req.path || '');
    const svgFallback = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#1C2541"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CE1126"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1000" cy="150" r="220" fill="#CE1126" opacity="0.08"/>
  <g transform="translate(600, 280) scale(1.6)" opacity="0.95">
    <circle cx="0" cy="0" r="48" fill="rgba(255,255,255,0.06)" stroke="#CE1126" stroke-width="2"/>
    <path d="M-18 -18 L18 -18 C20 -18 22 -16 22 -14 L22 18 C22 20 20 22 18 22 L-18 22 C-20 22 -22 20 -22 18 L-22 -14 C-22 -16 -20 -18 -18 -18 Z" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="-14" y1="-10" x2="4" y2="-10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-14" y1="-3" x2="4" y2="-3" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-14" y1="4" x2="14" y2="4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-14" y1="11" x2="14" y2="11" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="8" y="-12" width="6" height="10" fill="#CE1126" rx="1"/>
  </g>
  <g transform="translate(600, 520)" text-anchor="middle">
    <text x="0" y="0" fill="#ffffff" font-family="'Georgia', serif" font-size="34" font-weight="bold">NEXORA ANGOLA</text>
    <text x="0" y="40" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" letter-spacing="2">JORNALISMO DE EXCELÊNCIA EM TEMPO REAL</text>
  </g>
</svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgFallback);
  });

  // Dynamic SEO Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const news = db.getPublishedNews();
    const categories = db.getCategories();
    const baseUrl = (process.env.APP_URL || `https://${req.get('host')}`).replace(/^http:\/\//, 'https://');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    // Home
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Categories
    categories.forEach(c => {
      xml += `  <url>\n    <loc>${baseUrl}/categoria/${c.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // News articles
    news.forEach(n => {
      xml += `  <url>\n    <loc>${baseUrl}/noticia/${n.slug}</loc>\n    <lastmod>${new Date(n.updatedAt || n.publishedAt).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    // Institutional
    ['sobre', 'contactos', 'privacidade', 'termos'].forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}/${page}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = (process.env.APP_URL || `https://${req.get('host')}`).replace(/^http:\/\//, 'https://');
    const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    res.send(txt);
  });

  // Mount API routes
  app.use('/api', routes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Catch-all 404 for unhandled API routes to ensure JSON response
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Rota da API não encontrada: ${req.method} ${req.path}` });
  });

  // Vite middleware for dev / static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**']
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Recuperar banco do Supabase antes de iniciar o servidor
  await db.restoreFromSupabase();

  // Processar notícias agendadas imediatamente após restaurar o banco
  await processScheduledNews();

  // Remover notícias publicadas há mais de 24 horas e sua mídia do Storage
  const expiredNews = db.expireOldNews();
  await cleanupExpiredNewsStorage(expiredNews);

  // Importar notícias automaticamente a cada 5 minutos
  await runAutomaticNewsImport();

  setInterval(() => {
    runAutomaticNewsImport().catch(error => {
      console.error('[NEXORA AUTOMATION] Erro no agendamento:', error);
    });
  }, 5 * 60 * 1000);

  // Verificar agendamentos e expiração de notícias a cada 30 segundos
  setInterval(() => {
    processScheduledNews().catch(error => {
      console.error('Erro no processador de notícias agendadas:', error);
    });

    const expiredNews = db.expireOldNews();
    cleanupExpiredNewsStorage(expiredNews).catch(error => {
      console.error('Erro na limpeza de mídia de notícias expiradas:', error);
    });
  }, 30 * 1000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexora Angola Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
