import { db } from './db';
import { sendFcmToAll } from './fcm';
import { fetchPixabayImage } from './pixabay';
import { fetchPexelsImage } from './pexels';

const RNA_HOME = 'https://rna.ao/';
const RNA_SOURCE = 'Rádio Nacional de Angola';

interface RNAArticle {
  uid: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  pubDate: string;
  author: string;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCharCode(Number(n))
    )
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/\[caption[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html: string, regex: RegExp): string {
  const match = html.match(regex);
  return match?.[1] ? cleanText(match[1]) : '';
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (/(futebol|desporto|basquete|basquetebol|atleta|campeonato|jogos|seleção|selecao|angola sport)/i.test(text)) {
    return 'desporto';
  }

  if (/(tecnologia|inteligência artificial|inteligencia artificial|digital|internet|software|computador|telemóvel|telemovel)/i.test(text)) {
    return 'tecnologia';
  }

  if (/(economia|finanças|financas|mercado|banco|petróleo|petroleo|empresa|emprego|negócio|negocio|investimento)/i.test(text)) {
    return 'economia';
  }

  if (/(política|politica|governo|presidente|ministro|parlamento|eleição|eleicoes|assembleia nacional)/i.test(text)) {
    return 'politica';
  }

  if (/(saúde|saude|hospital|médico|medico|doença|doenca|vacina|paciente)/i.test(text)) {
    return 'saude';
  }

  if (/(educação|educacao|escola|universidade|estudante|ensino|professor)/i.test(text)) {
    return 'educacao';
  }

  if (/(música|musica|artista|cinema|filme|cultura|literatura|teatro|festival)/i.test(text)) {
    return 'cultura';
  }

  if (/(crime|segurança|seguranca|polícia|policia|acidente|sociedade|comunidade)/i.test(text)) {
    return 'sociedade';
  }

  return 'angola';
}

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 Nexora Angola News Bot'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
}

function extractArticleLinks(html: string): string[] {
  const links = new Set<string>();

  const regex = /href=["']([^"']*pages\/new\.php\?uid=\d+)["']/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1];

    const url = raw.startsWith('http')
      ? raw
      : new URL(raw, RNA_HOME).href;

    links.add(url);
  }

  return [...links];
}

function parseArticle(html: string, link: string): RNAArticle | null {
  const uidMatch = link.match(/[?&]uid=(\d+)/i);

  if (!uidMatch) {
    return null;
  }

  const uid = uidMatch[1];

  const title =
    extract(html, /<div[^>]*class=["'][^"']*cat-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    '';

  const body =
    extract(html, /<div[^>]*class=["'][^"']*cult-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    '';

  const dateMatch = html.match(
    /Data:\s*([^<]+)/i
  );

  const authorMatch = html.match(
    /Editor\(a\):\s*([^<]+)/i
  );

  const imageMatch = html.match(
    /background-image:\s*url\(['"]([^'"]+)['"]\)/i
  );

  const imageUrl = imageMatch?.[1]
    ? new URL(imageMatch[1], RNA_HOME).href
    : '';

  const pubDate = dateMatch?.[1]?.trim() || '';

  const author = authorMatch?.[1]?.trim() || '';

  if (!title || !body) {
    return null;
  }

  return {
    uid,
    title,
    description: body,
    link,
    imageUrl,
    pubDate,
    author
  };
}

export async function importRNAArticles(limit = 10): Promise<{
  fetched: number;
  imported: number;
  skipped: number;
  errors: number;
}> {
  const existingNews = db.getAllNews();

  let fetched = 0;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  try {
    console.log('[NEXORA RNA] Consultando RNA...');

    const home = await fetchHTML(RNA_HOME);

    const links = extractArticleLinks(home);

    console.log(`[NEXORA RNA] ${links.length} links encontrados.`);

    for (const link of links) {
      if (imported >= limit) break;

      fetched++;

      try {
        const html = await fetchHTML(link);
        const article = parseArticle(html, link);

        if (!article) {
          skipped++;
          continue;
        }

        const slug = slugify(article.title);

        const duplicate = existingNews.some(news =>
          news.slug.toLowerCase() === slug.toLowerCase() ||
          news.content.includes(link) ||
          news.content.includes(`RNA-${article.uid}`)
        );

        if (duplicate) {
          skipped++;
          continue;
        }

        const categorySlug = detectCategory(
          article.title,
          article.description
        );

        let featuredImage = article.imageUrl;

        if (!featuredImage) {
          try {
            featuredImage = await fetchPexelsImage(article.title) || '';
          } catch {
            featuredImage = '';
          }
        }

        if (!featuredImage) {
          try {
            featuredImage = await fetchPixabayImage(article.title) || '';
          } catch {
            featuredImage = '';
          }
        }

        const content = [
          `<h2>${article.title}</h2>`,
          `<p>${article.description}</p>`,
          `<p><strong>Fonte:</strong> ${RNA_SOURCE}</p>`,
          article.author
            ? `<p><strong>Editor:</strong> ${article.author}</p>`
            : '',
          `<p><strong>Leia a notícia completa na fonte original:</strong> <a href="${link}" target="_blank" rel="noopener noreferrer">Acessar RNA</a></p>`,
          `<p style="display:none">RNA-${article.uid}</p>`
        ].filter(Boolean).join('\n');

        let publishedAt = new Date().toISOString();

        if (article.pubDate) {
          const parsedDate = new Date(
            article.pubDate.replace(
              /(\d{2})\/(\d{2})\/(\d{4})/,
              '$3-$2-$1'
            )
          );

          if (!Number.isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate.toISOString();
          }
        }

        const created = db.createNewsLocalOnly({
          title: article.title,
          slug,
          excerpt: article.description.substring(0, 500),
          content,
          featuredImage,
          featuredImageCaption: 'Imagem da Rádio Nacional de Angola',
          galleryImages: [],
          categoryId:
            db.getCategoryBySlug(categorySlug)?.id ||
            db.getCategoryBySlug('angola')?.id ||
            'cat-angola',
          authorId: 'nexora-rna',
          authorName: 'Redação Nexora',
          authorRole: 'Fonte: Rádio Nacional de Angola',
          tags: [
            'angola',
            'rna',
            'rádio nacional de angola',
            categorySlug
          ],
          status: 'published',
          isBreaking: false,
          isHero: false,
          isSecondaryHero: false,
          publishedAt,
          readTimeMinutes: 1
        });

        existingNews.push(created);

        const notification = db.createNotificationLocalOnly({
          title: `📰 ${created.title}`,
          body: created.excerpt || 'Nova notícia da RNA no Nexora Angola.',
          newsId: created.id,
          newsSlug: created.slug,
          categoryName: created.categoryName || 'Angola',
          imageUrl: created.featuredImage,
          isBreaking: false,
          type: 'new_article',
          clickUrl: `/noticia/${created.slug}`
        });

        sendFcmToAll(notification).catch(error =>
          console.error('[NEXORA RNA] FCM dispatch error:', error)
        );

        imported++;

        console.log(
          `[NEXORA RNA] Importada: ${article.title}`
        );
      } catch (error) {
        console.error(
          `[NEXORA RNA] Erro ao processar ${link}:`,
          error
        );
        errors++;
      }
    }
  } catch (error) {
    console.error('[NEXORA RNA] Erro geral:', error);
    errors++;
  }

  return {
    fetched,
    imported,
    skipped,
    errors
  };
}
