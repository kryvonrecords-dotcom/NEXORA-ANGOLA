import Parser from 'rss-parser';

const parser = new Parser();

export interface RSSArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl: string;
  category: string;
}

export async function fetchRSSFeed(
  url: string,
  source: string,
  category: string
): Promise<RSSArticle[]> {
  const feed = await parser.parseURL(url);

  return (feed.items || [])
    .map(item => ({
      title: String(item.title || '').trim(),
      description: String(
        item.contentSnippet ||
        item.content ||
        item.summary ||
        ''
      ).trim(),
      link: String(item.link || '').trim(),
      pubDate: String(
        item.isoDate ||
        item.pubDate ||
        ''
      ).trim(),
      source,
      imageUrl: String(
        (item as any).enclosure?.url ||
        (item as any).media?.content?.url ||
        ''
      ).trim(),
      category
    }))
    .filter(article => article.title && article.link);
}

import { db } from './db';
import { RSS_SOURCES } from './rss-sources';
import { sendFcmToAll } from './fcm';
import { fetchPixabayImage } from './pixabay';
import { fetchPexelsImage } from './pexels';

function detectRSSCategory(text: string): string {
  const value = text.toLowerCase();

  if (/(futebol|football|soccer|basquete|basketball|tênis|tenis|sport|desporto|olimpíadas|olimpiadas|champions|nba|nfl)/i.test(value)) return 'desporto';
  if (/(tecnologia|technology|tech|inteligência artificial|artificial intelligence|software|internet|smartphone|cyber|digital)/i.test(value)) return 'tecnologia';
  if (/(economia|economy|mercado|market|finanças|financas|banco|bank|inflação|inflacao|petróleo|petroleo|empresa|business)/i.test(value)) return 'economia';
  if (/(política|politica|politics|governo|government|eleição|eleicoes|eleição|presidente|parlamento|senado|congresso)/i.test(value)) return 'politica';
  if (/(saúde|saude|health|hospital|médico|medico|doença|doenca|vacina|vaccine)/i.test(value)) return 'saude';
  if (/(educação|educacao|education|escola|school|universidade|university|estudante)/i.test(value)) return 'educacao';
  if (/(música|musica|music|cinema|movie|filme|film|celebridade|celebrity|artista|artist|entretenimento|entertainment|festival)/i.test(value)) return 'entretenimento';
  if (/(cultura|culture|arte|art|literatura|literature|património|patrimonio|heritage)/i.test(value)) return 'cultura';
  if (/(sociedade|society|comunidade|community|crime|segurança|seguranca|acidente|protesto)/i.test(value)) return 'sociedade';
  if (/(angola|luanda|benguela|huambo|cabinda|lubango|namibe|malanje|uan|unitel|sonangol)/i.test(value)) return 'angola';
  if (/(áfrica|africa|african|nigeria|south africa|kenya|ghana|mozambique|namibia|congo|zambia)/i.test(value)) return 'africa';

  return 'mundo';
}

function isLikelyPortuguese(text: string): boolean {
  const value = text.toLowerCase();

  const portuguese = (value.match(/\b(de|da|do|das|dos|em|no|na|nos|nas|para|por|com|que|uma|um|os|as|ao|aos|esta|este|sobre|tambem|mais|como|foi|sao|ser|tem|seu|sua)\b/g) || []).length;
  const english = (value.match(/\b(the|and|of|to|in|for|with|from|on|at|is|are|was|were|this|that|new|will|has|have)\b/g) || []).length;
  const french = (value.match(/\b(le|la|les|des|du|et|pour|avec|dans|sur|une|un|est|sont|qui|que|ce|cette|ces)\b/g) || []).length;
  const portugueseSignals = /[ãõáàâéêíóôúç]/i.test(text) ||
    /\b(angola|luanda|brasil|portugal|governo|presidente|ministro|noticia|noticias|economia|saude|desporto|educacao|empresa|mercado)\b/i.test(value);

  if (english >= portuguese + 2 || french >= portuguese + 2) return false;
  return portugueseSignals || portuguese >= 2;
}

function slugifyRSSTitle(title: string): string {
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

export async function importRSSArticles(limit = 20): Promise<{
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

  for (const source of RSS_SOURCES) {
    if (imported >= limit) break;

    try {
      const articles = await fetchRSSFeed(
        source.url,
        source.name,
        source.category
      );

      fetched += articles.length;

      const portugueseArticles = articles.filter(article =>
        isLikelyPortuguese(`${article.title} ${article.description}`)
      );

      for (const article of portugueseArticles) {
        if (imported >= limit) break;

        try {
          const title = article.title.trim();
          const sourceUrl = article.link.trim();

          if (!title || !sourceUrl) {
            skipped++;
            continue;
          }

          const slug = slugifyRSSTitle(title);

          const duplicate = existingNews.some(news =>
            news.slug.toLowerCase() === slug.toLowerCase() ||
            (sourceUrl && news.content.includes(sourceUrl))
          );

          if (duplicate) {
            skipped++;
            continue;
          }

          const description =
            article.description ||
            title;

          const content = [
            `<h2>${title}</h2>`,
            `<p>${description}</p>`,
            `<p><strong>Fonte:</strong> ${article.source}</p>`,
            `<p><strong>Leia a notícia completa na fonte original:</strong> <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Acessar fonte original</a></p>`
          ].join('\n');

          let featuredImage = article.imageUrl || '';

          if (!featuredImage) {
            try {
              featuredImage = await fetchPexelsImage(title) || '';
            } catch {
              featuredImage = '';
            }

            if (!featuredImage) {
              try {
                featuredImage = await fetchPixabayImage(title) || '';
              } catch {
                featuredImage = '';
              }
            }
          }

          const created = db.createNewsLocalOnly({
            title,
            slug,
            excerpt: description.substring(0, 500),
            content,
            featuredImage,
            featuredImageCaption: 'Imagem da fonte original',
            galleryImages: [],
            categoryId: db.getCategoryBySlug(
              detectRSSCategory(`${title} ${description} ${article.category}`)
            )?.id || 'cat-mundo',
            authorId: 'nexora-rss',
            authorName: 'Redação Nexora',
            authorRole: 'Agregação RSS',
            tags: [source.category, source.country, source.name],
            status: 'published',
            isBreaking: false,
            isHero: false,
            isSecondaryHero: false,
            publishedAt: article.pubDate
              ? new Date(article.pubDate).toISOString()
              : new Date().toISOString(),
            readTimeMinutes: 1
          });

          existingNews.push(created);

          const notification = db.createNotificationLocalOnly({
            title: `📰 ${created.title}`,
            body: created.excerpt || 'Toque para ler a notícia completa no Nexora News.',
            newsId: created.id,
            newsSlug: created.slug,
            categoryName: created.categoryName || 'Geral',
            imageUrl: created.featuredImage,
            isBreaking: false,
            type: 'new_article',
            clickUrl: `/noticia/${created.slug}`
          });

          sendFcmToAll(notification).catch(error =>
            console.error('[NEXORA RSS] FCM dispatch error:', error)
          );

          imported++;
        } catch (error) {
          console.error(
            `[NEXORA RSS] Erro ao importar artigo de ${source.name}:`,
            error
          );
          errors++;
        }
      }
    } catch (error) {
      console.error(
        `[NEXORA RSS] Erro ao consultar ${source.name}:`,
        error
      );
      errors++;
    }
  }

  return {
    fetched,
    imported,
    skipped,
    errors
  };
}
