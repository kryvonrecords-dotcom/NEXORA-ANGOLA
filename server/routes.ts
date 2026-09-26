import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { supabase } from './supabase';
import { generateToken, requireAdmin, AuthenticatedRequest } from './auth';
import { getVapidPublicKey, sendWebPushToAll } from './webPush';
import { sendFcmToAll } from './fcm';
import { importRSSArticles } from './rss';

const router = express.Router();

// -------------------------------------------------------------
// PIXABAY - IMAGENS AUTOMÁTICAS PARA NOTÍCIAS
// -------------------------------------------------------------
async function fetchPixabayImage(query: string): Promise<string | null> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey || !query?.trim()) {
    return null;
  }

  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('image_type', 'photo');
  url.searchParams.set('orientation', 'horizontal');
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '5');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Pixabay HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data?.hits?.length) {
    return data.hits[0].largeImageURL || data.hits[0].webformatURL || null;
  }

  return null;
}



// -------------------------------------------------------------
// IMPORTADOR AUTOMÁTICO DE NOTÍCIAS
// -------------------------------------------------------------
function slugifyNewsTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 180);
}

function detectNewsCategory(article: any): string {
  const text = [
    article?.title,
    article?.description,
    ...(Array.isArray(article?.keywords) ? article.keywords : []),
    ...(Array.isArray(article?.category) ? article.category : [article?.category])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(futebol|futebol|football|soccer|basquete|basketball|nba|girabola|champions|olimpí|olimpi|atleta|desporto|sport)/i.test(text)) return 'desporto';
  if (/(tecnologia|technology|tech|ai |artificial intelligence|inteligência artificial|software|smartphone|internet|cyber|startup|digital)/i.test(text)) return 'tecnologia';
  if (/(economia|economy|business|mercado|market|finan|banco|bank|petróleo|petroleo|oil|investimento|investment|inflação|inflacao)/i.test(text)) return 'economia';
  if (/(política|politica|politics|election|eleição|eleicao|governo|government|presidente|president|parlamento|parliament|ministro|diplomacia)/i.test(text)) return 'politica';
  if (/(saúde|saude|health|hospital|medicina|medical|vacina|vaccine|doença|doenca)/i.test(text)) return 'saude';
  if (/(educação|educacao|education|universidade|university|escola|school|estudante|student|bolsa de estudo)/i.test(text)) return 'educacao';
  if (/(música|musica|music|cinema|movie|filme|film|celebridade|celebrity|artista|artist|entretenimento|entertainment|festival)/i.test(text)) return 'entretenimento';
  if (/(cultura|culture|arte|art|literatura|literature|património|patrimonio|heritage)/i.test(text)) return 'cultura';
  if (/(sociedade|society|comunidade|community|crime|segurança|seguranca|acidente|protesto)/i.test(text)) return 'sociedade';
  if (/(angola|luanda|benguela|huambo|cabinda|lubango|namibe|malanje|uan|unitel|sonangol)/i.test(text)) return 'angola';
  if (/(áfrica|africa|african|nigeria|south africa|kenya|ghana|mozambique|namibia|congo|zambia)/i.test(text)) return 'africa';

  return 'mundo';
}

function getNewsCategoryId(categorySlug: string): string {
  const category = db.getCategoryBySlug(categorySlug);
  return category?.id || 'cat-mundo';
}

export async function importNewsDataArticles(limit = 10): Promise<{
  fetched: number;
  imported: number;
  skipped: number;
  errors: number;
}> {
  const newsData = await fetchNewsDataNews({
    language: 'pt',
    size: Math.max(limit, 1)
  });

  const articles = Array.isArray(newsData?.results)
    ? newsData.results.slice(0, Math.max(limit, 1))
    : [];

  const existingNews = db.getAllNews();

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      const title = String(article?.title || '').trim();

      if (!title) {
        skipped++;
        continue;
      }

      const rawSourceUrl = String(article?.link || '').trim();
      const sourceUrl = /^https?:\/\//i.test(rawSourceUrl)
        ? rawSourceUrl
        : rawSourceUrl
          ? `https://${rawSourceUrl}`
          : '';
      const slugBase = slugifyNewsTitle(title);

      if (!slugBase) {
        skipped++;
        continue;
      }

      const duplicate = existingNews.some(n =>
        n.slug.toLowerCase() === slugBase.toLowerCase() ||
        (sourceUrl && n.content.includes(sourceUrl))
      );

      if (duplicate) {
        skipped++;
        continue;
      }

      const categorySlug = detectNewsCategory(article);
      const categoryId = getNewsCategoryId(categorySlug);

      const description = String(
        article?.description ||
        article?.content ||
        title
      ).trim();

      const articleContent = String(
        article?.content ||
        article?.description ||
        ''
      ).trim();

      const sourceName = String(
        article?.source_name ||
        article?.source_id ||
        article?.source ||
        ''
      ).trim();

      const articleCategory = String(
        article?.category ||
        categorySlug ||
        ''
      ).trim();

      const keywords = Array.isArray(article?.keywords)
        ? article.keywords
            .filter(Boolean)
            .map((k: any) => String(k).trim())
            .slice(0, 15)
        : [];

      const articleKeywords = keywords.length
        ? keywords.join(', ')
        : '';

      const contentSections = [
        `<h2>${title}</h2>`,
        `<p>${description}</p>`,
        articleContent && articleContent !== description
          ? `<p>${articleContent}</p>`
          : '',
        sourceName
          ? `<p><strong>Fonte:</strong> ${sourceName}</p>`
          : '',
        articleCategory
          ? `<p><strong>Categoria:</strong> ${articleCategory}</p>`
          : '',
        articleKeywords
          ? `<p><strong>Palavras-chave:</strong> ${articleKeywords}</p>`
          : '',
        sourceUrl
          ? `<p><strong>Leia a notícia completa na fonte original:</strong> <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Acessar fonte original</a></p>`
          : ''
      ].filter(Boolean);

      const content = contentSections.join('\n');

      let imageUrl = String(
        article?.image_url ||
        article?.image ||
        ''
      ).trim();

      if (!imageUrl) {
        try {
          imageUrl = await fetchPixabayImage(title) || '';
        } catch {
          imageUrl = '';
        }
      }

      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
      }

      const tags = keywords.length
        ? keywords
        : title
            .split(/\s+/)
            .map(word => word.replace(/[^\p{L}\p{N}-]/gu, '').trim())
            .filter(word => word.length >= 4)
            .slice(0, 8);

      const publishedAt = article?.pubDate
        ? new Date(article.pubDate).toISOString()
        : new Date().toISOString();

      const created = db.createNewsLocalOnly({
        title,
        slug: slugBase,
        excerpt: description.substring(0, 500),
        content,
        featuredImage: imageUrl,
        featuredImageCaption: 'Imagem ilustrativa',
        galleryImages: [],
        categoryId,
        authorId: 'nexora-automation',
        authorName: 'Redação Nexora',
        authorRole: 'Automação',
        tags,
        status: 'published',
        isBreaking: false,
        isHero: false,
        isSecondaryHero: false,
        publishedAt,
        readTimeMinutes: 1
      });

      existingNews.push(created);

      const notification = db.createNotificationLocalOnly({
        title: created.isBreaking ? `🔴 URGENTE: ${created.title}` : `📰 ${created.title}`,
        body: created.excerpt || 'Toque para ler a notícia completa no Nexora News.',
        newsId: created.id,
        newsSlug: created.slug,
        categoryName: created.categoryName || 'Geral',
        imageUrl: created.featuredImage,
        isBreaking: created.isBreaking,
        type: created.isBreaking ? 'breaking_news' : 'new_article',
        clickUrl: `/noticia/${created.slug}`
      });

      sendFcmToAll(notification).catch(e =>
        console.error('[NEXORA AUTOMATION] FCM dispatch error:', e)
      );

      imported++;
    } catch (error) {
      console.error('[NEXORA AUTOMATION] Erro ao importar notícia:', error);
      errors++;
    }
  }

  return {
    fetched: articles.length,
    imported,
    skipped,
    errors
  };
}

// -------------------------------------------------------------
// NEWS DATA.IO - FONTE AUTOMÁTICA DE NOTÍCIAS
// -------------------------------------------------------------
async function fetchNewsDataNews(params: {
  language?: string;
  country?: string;
  category?: string;
  size?: number;
}) {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    return { status: "success", results: [] };
  }

  const url = new URL('https://newsdata.io/api/1/latest');
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('language', params.language || 'pt');
  url.searchParams.set('size', String(params.size || 10));

  if (params.country) url.searchParams.set('country', params.country);
  if (params.category) url.searchParams.set('category', params.category);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`NewsData.io HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data?.status === 'error') {
    throw new Error(data?.results?.message || 'Erro na NewsData.io');
  }

  return data;
}


// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Setup Multer Storage for real image uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for images & video clips
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const allowedExact = [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/gif', 
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime'
    ];
    if (isImage || isVideo || allowedExact.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de ficheiro não suportado. Utilize JPG, PNG, WEBP, GIF, SVG ou vídeos MP4, WebM, QuickTime.'));
    }
  }
});

// Supabase Storage
const SUPABASE_UPLOAD_BUCKET = 'uploads';

function createStorageFilename(file: Express.Multer.File): string {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname).toLowerCase();
  const cleanName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  return `${cleanName}-${uniqueSuffix}${ext}`;
}

async function uploadToSupabase(file: Express.Multer.File) {
  if (!supabase) {
    throw new Error('Supabase Storage não está configurado.');
  }

  const filename = createStorageFilename(file);

  const { error } = await supabase.storage
    .from(SUPABASE_UPLOAD_BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(SUPABASE_UPLOAD_BUCKET)
    .getPublicUrl(filename);

  return {
    filename,
    url: data.publicUrl
  };
}

// Helper for single file upload handler
const handleSingleUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let file: Express.Multer.File | undefined = req.file;

  if (!file && req.files && Array.isArray(req.files) && req.files.length > 0) {
    file = req.files[0];
  }

  if (!file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }

  try {
    const uploaded = await uploadToSupabase(file);

    res.json({
      message: 'Upload concluído com sucesso!',
      url: uploaded.url,
      filename: uploaded.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      mimeType: file.mimetype
    });
  } catch (error: any) {
    console.error('Erro no upload para Supabase Storage:', error);
    res.status(500).json({
      error: 'Erro ao enviar arquivo para o armazenamento permanente.',
      details: error?.message
    });
  }
};

// Helper for slug generation
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ----------------------------------------------------
// FIREBASE CLOUD MESSAGING
// ----------------------------------------------------
router.post('/fcm/token', (req: Request, res: Response): void => {
  const { token, userAgent } = req.body || {};

  if (!token || typeof token !== 'string' || !token.trim()) {
    res.status(400).json({
      error: 'Token FCM é obrigatório.'
    });
    return;
  }

  const savedToken = db.addFcmToken(
    token.trim(),
    typeof userAgent === 'string'
      ? userAgent
      : req.get('user-agent')
  );

  console.log(
    `FCM token registrado: ${savedToken.id}`
  );

  res.status(201).json({
    success: true,
    message: 'Token FCM registrado com sucesso.'
  });
});

// ----------------------------------------------------
// PUBLIC AUTH & SETUP
// ----------------------------------------------------
router.post('/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique o email e senha.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique o email e senha.' });
    return;
  }

  const token = generateToken(user);
  res.json({
    message: 'Login efetuado com sucesso!',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.get('/auth/me', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.post('/auth/logout', (req: Request, res: Response): void => {
  res.json({ message: 'Logout efetuado com sucesso.' });
});

router.post('/auth/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user || !currentPassword || !newPassword) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    return;
  }

  const isMatch = bcrypt.compareSync(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  db.updateUserPassword(req.user.id, newHash);

  res.json({ message: 'Senha alterada com sucesso!' });
});

// ----------------------------------------------------
// PUBLIC REAL-TIME WEATHER API (Open-Meteo Proxy & Cache)
// ----------------------------------------------------
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

router.get('/weather', async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? String(req.query.lat) : '-8.838333';
    const lon = req.query.lon ? String(req.query.lon) : '13.234444';
    const city = req.query.city ? String(req.query.city) : 'Luanda';
    const cacheKey = `${lat},${lon}`;

    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < WEATHER_CACHE_TTL)) {
      res.json(cached.data);
      return;
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Africa%2FLuanda`;
    const fetchRes = await fetch(openMeteoUrl);
    if (!fetchRes.ok) {
      throw new Error(`OpenMeteo HTTP ${fetchRes.status}`);
    }

    const raw = await fetchRes.json();
    const current = raw.current;
    if (!current) throw new Error('Dados meteorológicos vazios');

    const isDay = current.is_day === 1;
    const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;

    let conditionText = 'Céu Limpo';
    if (weatherCode === 0) conditionText = isDay ? 'Céu Limpo' : 'Céu Estrelado';
    else if (weatherCode === 1) conditionText = isDay ? 'Predomínio de Sol' : 'Pouco Nublado';
    else if (weatherCode === 2) conditionText = 'Parcialmente Nublado';
    else if (weatherCode === 3) conditionText = 'Encoberto / Nublado';
    else if (weatherCode === 45 || weatherCode === 48) conditionText = 'Nevoeiro';
    else if (weatherCode >= 51 && weatherCode <= 55) conditionText = 'Chuviscos';
    else if (weatherCode >= 61 && weatherCode <= 65) conditionText = 'Chuva';
    else if (weatherCode >= 80 && weatherCode <= 82) conditionText = 'Aguaceiros';
    else if (weatherCode >= 95) conditionText = 'Trovoada';

    const formatted = {
      city,
      province: city === 'Luanda' ? 'Luanda' : 'Angola',
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      weatherCode,
      isDay,
      conditionText,
      lastUpdated: new Date().toISOString()
    };

    weatherCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
    res.json(formatted);
  } catch (err: any) {
    console.error('Erro na rota /api/weather:', err?.message || err);
    res.status(200).json({
      city: 'Luanda',
      province: 'Luanda',
      temperature: 25,
      apparentTemperature: 27,
      humidity: 70,
      windSpeed: 8,
      weatherCode: 1,
      isDay: true,
      conditionText: 'Céu Limpo',
      lastUpdated: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// PUBLIC NEWS & CONTENT
// ----------------------------------------------------
router.get('/news', (req: Request, res: Response): void => {
  const { category, tag, limit, offset, isHero, isBreaking, search } = req.query;
  let list = db.getPublishedNews();

  if (category) {
    list = list.filter(item => 
      item.categoryId === category || 
      item.categorySlug?.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (tag) {
    list = list.filter(item => 
      item.tags && item.tags.some(t => t.toLowerCase() === String(tag).toLowerCase())
    );
  }

  if (isHero === 'true') {
    list = list.filter(item => item.isHero);
  }

  if (isBreaking === 'true') {
    list = list.filter(item => item.isBreaking);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    list = list.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  const total = list.length;
  const numLimit = limit ? parseInt(String(limit), 10) : 20;
  const numOffset = offset ? parseInt(String(offset), 10) : 0;
  const paginated = list.slice(numOffset, numOffset + numLimit);

  res.json({
    news: paginated,
    total,
    limit: numLimit,
    offset: numOffset
  });
});

router.get('/news/breaking', (req: Request, res: Response): void => {
  const settings = db.getSettings();
  const breakingNews = db.getPublishedNews().filter(n => n.isBreaking);
  res.json({
    enabled: settings.breakingNewsEnabled,
    customText: settings.breakingNewsText,
    customUrl: settings.breakingNewsUrl,
    breakingItems: breakingNews.slice(0, 5)
  });
});

router.get('/news/slug/:slug', (req: Request, res: Response): void => {
  const { slug } = req.params;
  const item = db.getNewsBySlug(slug);
  if (!item) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }

  // Increment views
  item.views = db.incrementViews(item.id);

  // Get related news from same category
  const allPublished = db.getPublishedNews();
  const related = allPublished
    .filter(n => n.id !== item.id && (n.categoryId === item.categoryId || (n.tags && item.tags && n.tags.some(t => item.tags.includes(t)))))
    .slice(0, 4);

  // Get previous and next news
  const itemIndex = allPublished.findIndex(n => n.id === item.id);
  const prevNews = itemIndex > 0 ? {
    title: allPublished[itemIndex - 1].title,
    slug: allPublished[itemIndex - 1].slug,
    featuredImage: allPublished[itemIndex - 1].featuredImage
  } : null;
  
  const nextNews = itemIndex >= 0 && itemIndex < allPublished.length - 1 ? {
    title: allPublished[itemIndex + 1].title,
    slug: allPublished[itemIndex + 1].slug,
    featuredImage: allPublished[itemIndex + 1].featuredImage
  } : null;

  res.json({
    news: item,
    related,
    prevNews,
    nextNews
  });
});

// Categories
router.get('/categories', (req: Request, res: Response): void => {
  const categories = db.getCategories();
  const allPublished = db.getPublishedNews();
  
  const withCounts = categories.map(cat => ({
    ...cat,
    count: allPublished.filter(n => n.categoryId === cat.id).length
  }));

  res.json(withCounts);
});

router.get('/categories/:slug', (req: Request, res: Response): void => {
  const { slug } = req.params;
  const category = db.getCategoryBySlug(slug);
  if (!category) {
    res.status(404).json({ error: 'Categoria não encontrada.' });
    return;
  }

  const news = db.getPublishedNews().filter(n => n.categoryId === category.id);
  res.json({
    category,
    news,
    total: news.length
  });
});

// Search
router.get('/search', (req: Request, res: Response): void => {
  const { q } = req.query;
  if (!q) {
    res.json({ results: [], query: '', total: 0 });
    return;
  }

  const query = String(q).toLowerCase().trim();
  const all = db.getPublishedNews();
  const results = all.filter(item => {
    return (
      item.title.toLowerCase().includes(query) ||
      item.excerpt.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.categoryName?.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  res.json({
    results,
    query: String(q),
    total: results.length
  });
});

// Newsletter
router.post('/newsletter/subscribe', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'O email é obrigatório.' });
    return;
  }
  const result = db.addSubscriber(email);
  res.json(result);
});

// Settings & Site Info
router.get('/settings', (req: Request, res: Response): void => {
  res.json(db.getSettings());
});

// ----------------------------------------------------
// PROTECTED ADMIN ROUTES
// ----------------------------------------------------

// Image & Media Upload Endpoints (Real file upload via multipart/form-data)
router.post('/upload', requireAdmin, upload.any(), handleSingleUpload);

router.post('/admin/automation/test-news-import', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await importNewsDataArticles(1);
    res.json({
      success: true,
      message: 'Teste de importação concluído.',
      result
    });
  } catch (error) {
    console.error('[NEXORA AUTOMATION TEST]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

router.post('/admin/upload', requireAdmin, upload.any(), handleSingleUpload);
router.post('/admin/uploads', requireAdmin, upload.any(), handleSingleUpload);
router.post('/admin/media', requireAdmin, upload.any(), handleSingleUpload);

// Multiple Image Upload Endpoints
const handleMultipleUploads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const rawFiles = (req.files || (req.file ? [req.file] : [])) as Express.Multer.File[];

  if (!rawFiles || rawFiles.length === 0) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }

  try {
    const uploaded = await Promise.all(
      rawFiles.map(async (file) => {
        const stored = await uploadToSupabase(file);

        return {
          url: stored.url,
          filename: stored.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          mimeType: file.mimetype
        };
      })
    );

    res.json({
      message: 'Uploads concluídos com sucesso!',
      files: uploaded
    });
  } catch (error: any) {
    console.error('Erro no upload múltiplo para Supabase Storage:', error);

    res.status(500).json({
      error: 'Erro ao enviar arquivos para o armazenamento permanente.',
      details: error?.message
    });
  }
};

router.post('/upload-multiple', requireAdmin, upload.any(), handleMultipleUploads);
router.post('/admin/upload-multiple', requireAdmin, upload.any(), handleMultipleUploads);
router.post('/admin/uploads-multiple', requireAdmin, upload.any(), handleMultipleUploads);
router.post('/admin/media-multiple', requireAdmin, upload.any(), handleMultipleUploads);

// Media gallery list & aliases
const handleGetMediaList = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!supabase) {
      res.status(500).json({
        error: 'Supabase Storage não está configurado.'
      });
      return;
    }

    const { data, error } = await supabase.storage
      .from(SUPABASE_UPLOAD_BUCKET)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: {
          column: 'created_at',
          order: 'desc'
        }
      });

    if (error) {
      throw error;
    }

    const mediaList = (data || []).map(file => {
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_UPLOAD_BUCKET)
        .getPublicUrl(file.name);

      return {
        id: file.name,
        filename: file.name,
        name: file.name,
        url: publicUrlData.publicUrl,
        size: file.metadata?.size || 0,
        createdAt: file.created_at || new Date().toISOString()
      };
    });

    res.json(mediaList);
  } catch (error: any) {
    console.error('Erro ao listar arquivos do Supabase Storage:', error);

    res.status(500).json({
      error: 'Erro ao listar arquivos de mídia.',
      details: error?.message
    });
  }
};

router.get('/admin/uploads', requireAdmin, handleGetMediaList);
router.get('/admin/media', requireAdmin, handleGetMediaList);

// Delete uploaded image / media
const handleDeleteMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!supabase) {
      res.status(500).json({
        error: 'Supabase Storage não está configurado.'
      });
      return;
    }

    const rawParam = req.params.filename || req.params.idOrUrl || '';
    const decoded = decodeURIComponent(rawParam);

    // Aceita tanto o nome do arquivo quanto uma URL completa
    const filename = decoded.includes('/')
      ? decoded.split('/').pop() || ''
      : decoded;

    const safeFilename = path.basename(filename);

    if (!safeFilename) {
      res.status(400).json({
        error: 'Nome do arquivo inválido.'
      });
      return;
    }

    const { error } = await supabase.storage
      .from(SUPABASE_UPLOAD_BUCKET)
      .remove([safeFilename]);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Arquivo excluído permanentemente do Supabase Storage.'
    });

  } catch (error: any) {
    console.error('Erro ao excluir arquivo do Supabase Storage:', error);

    res.status(500).json({
      success: false,
      error: 'Erro ao excluir arquivo permanentemente.',
      details: error?.message
    });
  }
};

router.delete('/admin/uploads/:filename', requireAdmin, handleDeleteMedia);
router.delete('/admin/media/:idOrUrl(*)', requireAdmin, handleDeleteMedia);

// Dashboard & Stats statistics (Both /api/admin/stats and /api/admin/dashboard)
const handleAdminStats = (req: AuthenticatedRequest, res: Response): void => {
  const allNews = db.getAllNews();
  const categories = db.getCategories();
  const subscribers = db.getSubscribers();

  const totalNews = allNews.length;
  const publishedNews = allNews.filter(n => n.status === 'published').length;
  const draftNews = allNews.filter(n => n.status === 'draft').length;
  const scheduledNews = allNews.filter(n => n.status === 'scheduled').length;
  const totalViews = allNews.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const topNews = [...allNews].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  const recentNews = [...allNews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const categoryDistribution = categories.map(cat => ({
    categoryName: cat.name,
    color: cat.color,
    count: allNews.filter(n => n.categoryId === cat.id).length
  }));

  const allProposals = db.getAdProposals();
  const pendingProposalsCount = allProposals.filter(p => p.status === 'pending').length;

  res.json({
    totalNews,
    publishedNews,
    draftNews,
    scheduledNews,
    totalViews,
    totalCategories: categories.length,
    totalSubscribers: subscribers.length,
    pendingProposalsCount,
    totalProposalsCount: allProposals.length,
    topNews,
    recentNews,
    categoryDistribution
  });
};

router.get('/admin/stats', requireAdmin, handleAdminStats);
router.get('/admin/dashboard', requireAdmin, handleAdminStats);

// -------------------------------------------------------------
// ESTATÍSTICAS DE INSTALAÇÕES DO APLICATIVO
// Apenas administradores autenticados
// -------------------------------------------------------------
router.get('/admin/app-downloads/stats', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!supabase) {
      res.status(503).json({ error: 'Supabase não configurado.' });
      return;
    }

    const { data, error } = await supabase
      .from('app_downloads')
      .select('downloaded_at, app_version, version, platform, country, source, device_id');

    if (error) {
      console.error('Erro ao buscar estatísticas do aplicativo:', error.message);
      res.status(500).json({
        error: 'Não foi possível carregar as estatísticas do aplicativo.'
      });
      return;
    }

    const rows = data || [];

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const last7Start = new Date(now);
    last7Start.setDate(last7Start.getDate() - 6);
    last7Start.setHours(0, 0, 0, 0);

    const last30Start = new Date(now);
    last30Start.setDate(last30Start.getDate() - 29);
    last30Start.setHours(0, 0, 0, 0);

    const getDate = (value: string | null) => {
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime()) ? date : null;
    };

    const today = rows.filter(row => {
      const date = getDate(row.downloaded_at);
      return date ? date >= todayStart : false;
    }).length;

    const last7Days = rows.filter(row => {
      const date = getDate(row.downloaded_at);
      return date ? date >= last7Start : false;
    }).length;

    const last30Days = rows.filter(row => {
      const date = getDate(row.downloaded_at);
      return date ? date >= last30Start : false;
    }).length;

    const countBy = (field: string) => {
      const counts: Record<string, number> = {};

      rows.forEach(row => {
        const value = String(row[field] || 'Desconhecido').trim() || 'Desconhecido';
        counts[value] = (counts[value] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    const daily = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(last30Start);
      date.setDate(last30Start.getDate() + index);

      const key = date.toISOString().slice(0, 10);

      const count = rows.filter(row => {
        const rowDate = getDate(row.downloaded_at);
        return rowDate ? rowDate.toISOString().slice(0, 10) === key : false;
      }).length;

      return {
        date: key,
        count
      };
    });

    const uniqueDevices = new Set(
      rows
        .map(row => String(row.device_id || '').trim())
        .filter(Boolean)
    ).size;

    res.json({
      total: rows.length,
      today,
      last7Days,
      last30Days,
      uniqueDevices,
      countries: countBy('country'),
      versions: countBy('app_version'),
      platforms: countBy('platform'),
      sources: countBy('source'),
      daily
    });
  } catch (error: any) {
    console.error('Erro na estatística de instalações:', error);

    res.status(500).json({
      error: 'Erro interno ao carregar estatísticas do aplicativo.'
    });
  }
});


// Admin News CRUD
router.get('/admin/news', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { status, category, search, limit, offset } = req.query;
  let list = db.getAllNews();

  if (status) {
    list = list.filter(n => n.status === status);
  }

  if (category) {
    list = list.filter(n => n.categoryId === category);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    list = list.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.excerpt.toLowerCase().includes(q) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = list.length;
  const numLimit = limit ? parseInt(String(limit), 10) : 50;
  const numOffset = offset ? parseInt(String(offset), 10) : 0;

  res.json({
    news: list.slice(numOffset, numOffset + numLimit),
    total,
    limit: numLimit,
    offset: numOffset
  });
});

router.get('/admin/news/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const item = db.getNewsById(id);
  if (!item) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }
  res.json(item);
});

router.post('/admin/news', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const {
    title,
    excerpt,
    content,
    featuredImage,
    featuredImageCaption,
    galleryImages,
    categoryId,
    authorName,
    authorRole,
    tags,
    status,
    isBreaking,
    isHero,
    scheduledFor
  } = req.body;

  if (!title || !content || !categoryId) {
    res.status(400).json({ error: 'Título, conteúdo e categoria são campos obrigatórios.' });
    return;
  }

  let slug = slugify(title);
  // Ensure unique slug
  let counter = 1;
  while (db.getNewsBySlug(slug)) {
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }

  // Parse tags if array or string
  let parsedTags: string[] = [];
  if (Array.isArray(tags)) {
    parsedTags = tags.map(t => String(t).trim()).filter(Boolean);
  } else if (typeof tags === 'string') {
    parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  const created = db.createNews({
    title,
    slug,
    excerpt: excerpt || title,
    content,
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    featuredImageCaption,
    galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
    categoryId,
    authorId: req.user?.id || 'admin-1',
    authorName: authorName || req.user?.name || 'Redação Nexora',
    authorRole: authorRole || 'Jornalista',
    tags: parsedTags,
    status: status || 'published',
    isBreaking: Boolean(isBreaking),
    isHero: Boolean(isHero),
    scheduledFor: status === 'scheduled' ? scheduledFor : undefined,
    publishedAt: status === 'published' ? new Date().toISOString() : (scheduledFor || new Date().toISOString()),
    readTimeMinutes: Math.max(1, Math.ceil((content.replace(/<[^>]*>?/gm, '').split(/\s+/).length || 200) / 200))
  });

  // Auto-send Push Notification to app users (Estilo Phoenix) when published
  if (created.status === 'published' && req.body.sendPushNotification !== false) {
    const category = db.getCategoryById(created.categoryId);
    const notif = db.createNotification({
      title: created.isBreaking ? `🔴 URGENTE: ${created.title}` : `📰 ${created.title}`,
      body: created.excerpt || 'Toque para ler a notícia completa no Nexora News.',
      newsId: created.id,
      newsSlug: created.slug,
      categoryName: category?.name || created.categoryName || 'Geral',
      imageUrl: created.featuredImage,
      isBreaking: created.isBreaking,
      type: created.isBreaking ? 'breaking_news' : 'new_article',
      clickUrl: `/noticia/${created.slug}`
    });
    // Send real background Web Push to all devices
    sendFcmToAll(notif).catch(e => console.error('FCM dispatch error:', e));
  }

  res.status(201).json({
    message: 'Notícia criada com sucesso!',
    news: created
  });
});

router.put('/admin/news/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const existing = db.getNewsById(id);
  if (!existing) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }

  const {
    title,
    excerpt,
    content,
    featuredImage,
    featuredImageCaption,
    galleryImages,
    categoryId,
    authorName,
    authorRole,
    tags,
    status,
    isBreaking,
    isHero,
    scheduledFor
  } = req.body;

  let parsedTags = existing.tags;
  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      parsedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title);
    let counter = 1;
    while (true) {
      const match = db.getNewsBySlug(slug);
      if (!match || match.id === id) break;
      slug = `${slugify(title)}-${counter}`;
      counter++;
    }
  }

  const updated = db.updateNews(id, {
    ...(title ? { title, slug } : {}),
    ...(excerpt !== undefined ? { excerpt } : {}),
    ...(content !== undefined ? { content } : {}),
    ...(featuredImage !== undefined ? { featuredImage } : {}),
    ...(featuredImageCaption !== undefined ? { featuredImageCaption } : {}),
    ...(galleryImages !== undefined ? { galleryImages } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(authorName !== undefined ? { authorName } : {}),
    ...(authorRole !== undefined ? { authorRole } : {}),
    ...(tags !== undefined ? { tags: parsedTags } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(isBreaking !== undefined ? { isBreaking: Boolean(isBreaking) } : {}),
    ...(isHero !== undefined ? { isHero: Boolean(isHero) } : {}),
    ...(scheduledFor !== undefined ? { scheduledFor } : {})
  });

  // If newly published or user explicitly chose to send push notification
  if (updated && req.body.sendPushNotification === true && updated.status === 'published') {
    const category = db.getCategoryById(updated.categoryId);
    const notif = db.createNotification({
      title: updated.isBreaking ? `🔴 URGENTE: ${updated.title}` : `📰 ${updated.title}`,
      body: updated.excerpt || 'Toque para ler a notícia completa no Nexora News.',
      newsId: updated.id,
      newsSlug: updated.slug,
      categoryName: category?.name || updated.categoryName || 'Geral',
      imageUrl: updated.featuredImage,
      isBreaking: updated.isBreaking,
      type: updated.isBreaking ? 'breaking_news' : 'new_article',
      clickUrl: `/noticia/${updated.slug}`
    });
    sendFcmToAll(notif).catch(e => console.error('FCM dispatch error:', e));
  }

  res.json({
    message: 'Notícia atualizada com sucesso!',
    news: updated
  });
});

router.delete('/admin/news/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteNews(id);
  if (!deleted) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }
  res.json({ message: 'Notícia excluída permanentemente com sucesso.' });
});

const handleToggleBreaking = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const item = db.getNewsById(id);
  if (!item) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }
  const updated = db.updateNews(id, { isBreaking: !item.isBreaking });
  res.json({ success: true, message: 'Status urgente atualizado!', news: updated });
};

router.post('/admin/news/:id/toggle-breaking', requireAdmin, handleToggleBreaking);
router.patch('/admin/news/:id/toggle-breaking', requireAdmin, handleToggleBreaking);

const handleToggleHero = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const item = db.getNewsById(id);
  if (!item) {
    res.status(404).json({ error: 'Notícia não encontrada.' });
    return;
  }
  const updated = db.updateNews(id, { isHero: !item.isHero });
  res.json({ success: true, message: 'Destaque principal atualizado!', news: updated });
};

router.post('/admin/news/:id/toggle-hero', requireAdmin, handleToggleHero);
router.patch('/admin/news/:id/toggle-hero', requireAdmin, handleToggleHero);

// Admin Categories CRUD
router.get('/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const categories = db.getCategories();
  const allNews = db.getAllNews();
  const withCounts = categories.map(cat => ({
    ...cat,
    count: allNews.filter(n => n.categoryId === cat.id).length
  }));
  res.json(withCounts);
});

router.get('/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const cat = db.getCategoryById(id);
  if (!cat) {
    res.status(404).json({ error: 'Categoria não encontrada.' });
    return;
  }
  res.json(cat);
});

router.post('/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { name, description, color, order } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    return;
  }

  const slug = slugify(name);
  if (db.getCategoryBySlug(slug)) {
    res.status(400).json({ error: 'Já existe uma categoria com este nome/slug.' });
    return;
  }

  const created = db.createCategory({
    name,
    slug,
    description: description || '',
    color: color || '#146EF5',
    order: order ? parseInt(String(order), 10) : undefined
  });

  res.status(201).json({ message: 'Categoria criada com sucesso!', category: created });
});

router.put('/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { name, description, color, order } = req.body;
  const updates: any = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (description !== undefined) updates.description = description;
  if (color !== undefined) updates.color = color;
  if (order !== undefined) updates.order = parseInt(String(order), 10);

  const updated = db.updateCategory(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Categoria não encontrada.' });
    return;
  }
  res.json({ message: 'Categoria atualizada com sucesso!', category: updated });
});

router.delete('/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteCategory(id);
  if (!deleted) {
    res.status(404).json({ error: 'Categoria não encontrada.' });
    return;
  }
  res.json({ message: 'Categoria excluída com sucesso.' });
});

// Admin Subscribers & Newsletter
router.get('/admin/subscribers', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const subscribers = db.getSubscribers() || [];
  res.json({ subscribers });
});

router.post('/admin/subscribers', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Insira um endereço de email válido.' });
    return;
  }
  const result = db.addSubscriber(email);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

router.delete('/admin/subscribers/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteSubscriber(id);
  if (!deleted) {
    res.status(404).json({ error: 'Subscritor não encontrado.' });
    return;
  }
  res.json({ message: 'Subscritor removido com sucesso.' });
});

router.get('/admin/newsletter/campaigns', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const campaigns = db.getNewsletterCampaigns();
  res.json({ campaigns });
});

router.get('/admin/newsletter/stats', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const stats = db.getNewsletterStats();
  res.json(stats);
});

router.post('/admin/newsletter/broadcast', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { subject, previewText, introText, selectedNewsIds, customContent } = req.body;
  if (!subject || !subject.trim()) {
    res.status(400).json({ error: 'O assunto da newsletter é obrigatório.' });
    return;
  }

  const campaign = db.createNewsletterCampaign({
    subject: subject.trim(),
    previewText: previewText || '',
    introText: introText || '',
    selectedNewsIds: Array.isArray(selectedNewsIds) ? selectedNewsIds : [],
    customContent: customContent || ''
  });

  res.json({
    success: true,
    message: `Newsletter enviada com sucesso para ${campaign.sentCount} leitores inscritos!`,
    campaign
  });
});

// Admin Profile & Security
router.put('/admin/profile', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = db.getUserById(req.user?.id || '');
  if (!user) {
    res.status(404).json({ error: 'Utilizador não encontrado.' });
    return;
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: 'Insira a senha atual para autorizar a alteração.' });
      return;
    }
    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Senha atual incorreta.' });
      return;
    }
  }

  const updated = db.updateUser(user.id, {
    name,
    email,
    password: newPassword || undefined
  });

  res.json({ message: 'Perfil atualizado com sucesso!', user: updated });
});

// Admin Settings
router.get('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  res.json(db.getSettings());
});

router.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateSettings(req.body);
  res.json({ message: 'Configurações atualizadas com sucesso!', settings: updated });
});

// Admin & Public Social Media Endpoints
router.get('/social-media', (req: Request, res: Response): void => {
  const settings = db.getSettings();
  res.json({
    socialLinks: settings.socialLinks || {},
    customSocialLinks: settings.customSocialLinks || [],
    whatsappFloatingEnabled: settings.whatsappFloatingEnabled ?? true,
    whatsappFloatingNumber: settings.whatsappFloatingNumber || '',
    whatsappFloatingMessage: settings.whatsappFloatingMessage || '',
    showSocialInHeader: settings.showSocialInHeader ?? true,
    showSocialInFooter: settings.showSocialInFooter ?? true
  });
});

router.get('/admin/social-media', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const settings = db.getSettings();
  res.json({
    socialLinks: settings.socialLinks || {},
    customSocialLinks: settings.customSocialLinks || [],
    whatsappFloatingEnabled: settings.whatsappFloatingEnabled ?? true,
    whatsappFloatingNumber: settings.whatsappFloatingNumber || '',
    whatsappFloatingMessage: settings.whatsappFloatingMessage || '',
    showSocialInHeader: settings.showSocialInHeader ?? true,
    showSocialInFooter: settings.showSocialInFooter ?? true
  });
});

router.put('/admin/social-media', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { 
    socialLinks, 
    customSocialLinks, 
    whatsappFloatingEnabled, 
    whatsappFloatingNumber, 
    whatsappFloatingMessage,
    showSocialInHeader,
    showSocialInFooter
  } = req.body;

  const updated = db.updateSettings({
    ...(socialLinks !== undefined ? { socialLinks } : {}),
    ...(customSocialLinks !== undefined ? { customSocialLinks } : {}),
    ...(whatsappFloatingEnabled !== undefined ? { whatsappFloatingEnabled: Boolean(whatsappFloatingEnabled) } : {}),
    ...(whatsappFloatingNumber !== undefined ? { whatsappFloatingNumber: String(whatsappFloatingNumber) } : {}),
    ...(whatsappFloatingMessage !== undefined ? { whatsappFloatingMessage: String(whatsappFloatingMessage) } : {}),
    ...(showSocialInHeader !== undefined ? { showSocialInHeader: Boolean(showSocialInHeader) } : {}),
    ...(showSocialInFooter !== undefined ? { showSocialInFooter: Boolean(showSocialInFooter) } : {})
  });

  res.json({ message: 'Redes sociais atualizadas com sucesso!', settings: updated });
});

// --- PUBLIC ADVERTISEMENTS ---
router.get('/ads', (req: Request, res: Response): void => {
  const position = req.query.position as string | undefined;
  const ads = db.getActiveAdvertisements(position);
  res.json(ads);
});

router.post('/ads/:id/click', (req: Request, res: Response): void => {
  const success = db.recordAdClick(req.params.id);
  res.json({ success });
});

const handleAdView = (req: Request, res: Response): void => {
  const success = db.recordAdImpression(req.params.id);
  res.json({ success });
};

router.post('/ads/:id/view', handleAdView);
router.post('/ads/:id/impression', handleAdView);

// -------------------------------------------------------------
// COMMERCIAL PROPOSALS & MEDIA KIT (ANUNCIE NO NEXORA NEWS)
// -------------------------------------------------------------

// Public: Submit commercial proposal / media kit request
router.post('/ads/proposals', (req: Request, res: Response): void => {
  const { company, contactName, email, phone, adFormat, budget, message } = req.body;

  if (!company || !String(company).trim()) {
    res.status(400).json({ error: 'O nome da empresa é obrigatório.' });
    return;
  }
  if (!contactName || !String(contactName).trim()) {
    res.status(400).json({ error: 'O nome do responsável é obrigatório.' });
    return;
  }
  if (!email || !String(email).trim() || !String(email).includes('@')) {
    res.status(400).json({ error: 'Um endereço de email válido é obrigatório.' });
    return;
  }
  if (!phone || !String(phone).trim()) {
    res.status(400).json({ error: 'O telefone / WhatsApp de contacto é obrigatório.' });
    return;
  }

  const proposal = db.addAdProposal({
    company: String(company).trim(),
    contactName: String(contactName).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    adFormat: adFormat ? String(adFormat).trim() : 'hero_banner',
    budget: budget ? String(budget).trim() : '1_mes',
    message: message ? String(message).trim() : '',
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Solicitação de proposta comercial e Mídia Kit enviada com sucesso! A nossa equipa entrará em contacto brevemente.',
    proposal
  });
});

// Admin: List all commercial proposals (Support both /admin/ads/proposals and /admin/proposals)
const handleGetProposals = (req: AuthenticatedRequest, res: Response): void => {
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const list = db.getAdProposals({ status, search });
  res.json(list);
};
router.get('/admin/ads/proposals', requireAdmin, handleGetProposals);
router.get('/admin/proposals', requireAdmin, handleGetProposals);

// Admin: Get specific commercial proposal
const handleGetProposalById = (req: AuthenticatedRequest, res: Response): void => {
  const item = db.getAdProposalById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Proposta comercial não encontrada.' });
    return;
  }
  res.json(item);
};
router.get('/admin/ads/proposals/:id', requireAdmin, handleGetProposalById);
router.get('/admin/proposals/:id', requireAdmin, handleGetProposalById);

// Admin: Update proposal status or internal notes
const handleUpdateProposal = (req: AuthenticatedRequest, res: Response): void => {
  const { status, notes, budget, adFormat } = req.body;
  const updated = db.updateAdProposal(req.params.id, {
    ...(status ? { status } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(budget ? { budget } : {}),
    ...(adFormat ? { adFormat } : {})
  });

  if (!updated) {
    res.status(404).json({ error: 'Proposta comercial não encontrada.' });
    return;
  }

  res.json({
    success: true,
    message: 'Proposta comercial atualizada com sucesso!',
    proposal: updated
  });
};
router.put('/admin/ads/proposals/:id', requireAdmin, handleUpdateProposal);
router.put('/admin/proposals/:id', requireAdmin, handleUpdateProposal);

// Admin: Delete proposal
const handleDeleteProposal = (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteAdProposal(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Proposta não encontrada ou já excluída.' });
    return;
  }
  res.json({ success: true, message: 'Proposta comercial removida com sucesso.' });
};
router.delete('/admin/ads/proposals/:id', requireAdmin, handleDeleteProposal);
router.delete('/admin/proposals/:id', requireAdmin, handleDeleteProposal);

// --- ADMIN ADVERTISEMENTS CRUD ---
router.get('/admin/ads', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const position = req.query.position as string | undefined;
  const status = req.query.status as string | undefined;
  const ads = db.getAdvertisements({ position, status });
  res.json(ads);
});

router.get('/admin/ads/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  if (req.params.id === 'proposals') {
    return handleGetProposals(req, res);
  }
  const ad = db.getAdvertisementById(req.params.id);
  if (!ad) {
    res.status(404).json({ error: 'Publicidade não encontrada.' });
    return;
  }
  res.json(ad);
});

router.post('/admin/ads', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { title, subtitle, tagline, badgeText, mediaType, mediaUrl, videoThumbnail, linkUrl, targetNewTab, callToAction, position, status, order, startDate, endDate } = req.body;
  if (!title || !String(title).trim()) {
    res.status(400).json({ error: 'O título da publicidade é obrigatório.' });
    return;
  }

  let finalMediaUrl = (mediaUrl ? String(mediaUrl).trim() : '');
  // If pasted HTML iframe or tag, extract src
  const srcMatch = finalMediaUrl.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    finalMediaUrl = srcMatch[1];
  }

  // Fallback default image if left empty
  if (!finalMediaUrl) {
    finalMediaUrl = '/src/assets/images/nexora_promo_banner_1786868992912.jpg';
  }

  // Auto-detect media type if video or youtube
  let finalMediaType = mediaType || 'image';
  if (
    finalMediaUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ||
    finalMediaUrl.includes('youtube.com') ||
    finalMediaUrl.includes('youtu.be') ||
    finalMediaUrl.includes('vimeo.com')
  ) {
    finalMediaType = 'video';
  }

  const created = db.createAdvertisement({
    title: String(title).trim(),
    subtitle: subtitle ? String(subtitle).trim() : '',
    tagline: tagline ? String(tagline).trim() : '',
    badgeText: badgeText ? String(badgeText).trim() : 'PUBLICIDADE',
    mediaType: finalMediaType,
    mediaUrl: finalMediaUrl,
    videoThumbnail: videoThumbnail ? String(videoThumbnail).trim() : '',
    linkUrl: linkUrl ? String(linkUrl).trim() : '',
    targetNewTab: targetNewTab ?? true,
    callToAction: callToAction ? String(callToAction).trim() : 'Acesse Agora',
    position: position || 'top_hero',
    status: status || 'active',
    order: order ? Number(order) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  res.status(201).json({
    success: true,
    message: 'Publicidade criada com sucesso!',
    advertisement: created,
    id: created.id,
    ...created
  });
});

router.put('/admin/ads/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const updates = { ...req.body };
  if (updates.mediaUrl) {
    let url = String(updates.mediaUrl).trim();
    const srcMatch = url.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1];
    }
    updates.mediaUrl = url;
  }

  const updated = db.updateAdvertisement(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Publicidade não encontrada.' });
    return;
  }
  res.json({
    success: true,
    message: 'Publicidade atualizada com sucesso!',
    advertisement: updated,
    ...updated
  });
});

router.delete('/admin/ads/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteAdvertisement(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Publicidade não encontrada ou já excluída.' });
    return;
  }
  res.json({ success: true, message: 'Publicidade removida com sucesso.' });
});

// -------------------------------------------------------------
// EDITORIAL CONTACT MESSAGES (FALE COM A REDAÇÃO)
// -------------------------------------------------------------

// Public: Submit contact message
router.post('/contact/messages', (req: Request, res: Response): void => {
  const { name, email, phone, category, subject, message } = req.body;

  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'O seu nome é obrigatório.' });
    return;
  }
  if (!email || !String(email).trim() || !String(email).includes('@')) {
    res.status(400).json({ error: 'O seu email é obrigatório.' });
    return;
  }
  if (!message || !String(message).trim()) {
    res.status(400).json({ error: 'A mensagem é obrigatória.' });
    return;
  }

  const msg = db.addContactMessage({
    name: String(name).trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : '',
    category: category ? String(category).trim() : 'geral',
    subject: subject ? String(subject).trim() : 'Mensagem Editorial',
    message: String(message).trim(),
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada à redação com sucesso!',
    item: msg
  });
});

// Admin: List contact messages
router.get('/admin/contact/messages', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const status = req.query.status as string | undefined;
  const list = db.getContactMessages({ status });
  res.json(list);
});

// Admin: Update contact message status / notes
router.put('/admin/contact/messages/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { status, notes } = req.body;
  const updated = db.updateContactMessage(req.params.id, {
    ...(status ? { status } : {}),
    ...(notes !== undefined ? { notes } : {})
  });
  if (!updated) {
    res.status(404).json({ error: 'Mensagem não encontrada.' });
    return;
  }
  res.json({ success: true, message: 'Mensagem atualizada com sucesso.', item: updated });
});

// Admin: Delete contact message
router.delete('/admin/contact/messages/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteContactMessage(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Mensagem não encontrada.' });
    return;
  }
  res.json({ success: true, message: 'Mensagem removida com sucesso.' });
});

// -------------------------------------------------------------
// PUSH NOTIFICATIONS & REAL-TIME ALERTS (ESTILO PHOENIX APP)
// -------------------------------------------------------------

// Public: Get VAPID Public Key for Web Push browser subscription
const handleGetVapidKey = (req: Request, res: Response): void => {
  res.json({
    publicKey: getVapidPublicKey()
  });
};

router.get('/notifications/vapid-public-key', handleGetVapidKey);
router.get('/notifications/vapid-key', handleGetVapidKey);

// Public: Get recent notification alerts for notification center
router.get('/notifications', (req: Request, res: Response): void => {
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  const list = db.getNotifications(limit);
  res.json(list);
});

// Public: Polling for new notifications (for active app users - only returns new notifications created after the specified timestamp)
router.get('/notifications/latest', (req: Request, res: Response): void => {
  const after = req.query.after as string;
  if (!after) {
    res.json([]);
    return;
  }
  const afterTime = new Date(after).getTime();
  if (isNaN(afterTime)) {
    res.json([]);
    return;
  }
  const list = db.getNotifications(20);
  const newItems = list.filter(n => new Date(n.sentAt).getTime() > afterTime);
  res.json(newItems);
});

// Public: Subscribe device / browser to Web Push (Even when app is closed)
router.post('/notifications/subscribe', (req: Request, res: Response): void => {
  const { endpoint, keys, subscription } = req.body;
  const finalEndpoint = endpoint || subscription?.endpoint;
  const finalKeys = keys || subscription?.keys;

  if (!finalEndpoint) {
    res.status(400).json({ error: 'Endpoint da subscrição de notificação é obrigatório.' });
    return;
  }

  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const sub = db.addPushSubscription({ endpoint: finalEndpoint, keys: finalKeys, userAgent });

  res.status(201).json({
    success: true,
    message: 'Dispositivo subscrito com sucesso para receber notificações mesmo com o aplicativo fechado!',
    subscription: sub
  });
});

// Public: Test Push Notification to user's device in background
const handleTestDeviceNotification = (req: Request, res: Response): void => {
  const notif = db.createNotification({
    title: req.body.title || '🔔 Notificação em Segundo Plano Nexora News',
    body: req.body.body || 'Notificação nativa recebida com sucesso! Você continuará a receber notícias urgentes mesmo sem abrir o app.',
    isBreaking: req.body.isBreaking ?? true,
    type: 'system',
    categoryName: req.body.categoryName || 'Sistema',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    clickUrl: req.body.clickUrl || '/'
  });

  sendWebPushToAll(notif).catch(e => console.error('WebPush test error:', e));

  res.json({
    success: true,
    message: 'Notificação enviada para o seu dispositivo!',
    notification: notif
  });
};

router.post('/notifications/test-my-device', handleTestDeviceNotification);
router.post('/notifications/test-device', handleTestDeviceNotification);

// Admin: Get notifications list + stats
router.get('/admin/notifications', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const notifications = db.getNotifications(50);
  const subscribers = db.getPushSubscriptions();
  
  res.json({
    notifications,
    stats: {
      totalSent: notifications.length,
      activeSubscribers: Math.max(subscribers.length, 1),
      registeredDevices: subscribers.length
    }
  });
});

// Admin: Send manual broadcast / urgent breaking news push
const handleSendNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, body, isBreaking, imageUrl, newsSlug, newsId, categoryName, clickUrl } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Título do alerta é obrigatório.' });
    return;
  }

  const notif = db.createNotification({
    title: isBreaking ? `🔴 URGENTE: ${title.trim()}` : title.trim(),
    body: body ? body.trim() : 'Nova atualização importante no Nexora News.',
    isBreaking: Boolean(isBreaking),
    imageUrl,
    newsSlug,
    newsId,
    categoryName: categoryName || 'Destaque',
    type: isBreaking ? 'urgent_broadcast' : 'new_article',
    clickUrl: clickUrl || (newsSlug ? `/noticia/${newsSlug}` : '/')
  });

  const [result, fcmResult] = await Promise.all([
    sendWebPushToAll(notif).catch(e => {
      console.error('WebPush broadcast error:', e);
      return { total: 0, sent: 0, failed: 0 };
    }),
    sendFcmToAll(notif).catch(e => {
      console.error('FCM broadcast error:', e);
      return { total: 0, sent: 0, failed: 0 };
    })
  ]);

  res.status(201).json({
    success: true,
    message: `Notificação push enviada com sucesso para ${result.sent || db.getPushSubscriptions().length || 1} dispositivo(s) cadastrado(s)!`,
    notification: notif,
    delivery: {
      webPush: result,
      fcm: fcmResult
    },
    deliveredCount: (result.sent || 0) + (fcmResult.sent || 0)
  });
};

router.post('/admin/notifications/send', requireAdmin, handleSendNotification);
router.post('/admin/notifications', requireAdmin, handleSendNotification);

// Admin: Test notification on current device
const handleAdminTestNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const notif = db.createNotification({
    title: req.body.title || '🔔 Teste de Notificação Nexora News',
    body: req.body.body || 'O seu sistema de notificações push em segundo plano está 100% ativo e configurado.',
    isBreaking: req.body.isBreaking ?? true,
    type: 'system',
    categoryName: req.body.categoryName || 'Sistema',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    clickUrl: req.body.clickUrl || '/'
  });

  const [result, fcmResult] = await Promise.all([
    sendWebPushToAll(notif).catch(e => {
      console.error('WebPush test error:', e);
      return { total: 0, sent: 0, failed: 0 };
    }),
    sendFcmToAll(notif).catch(e => {
      console.error('FCM test error:', e);
      return { total: 0, sent: 0, failed: 0 };
    })
  ]);

  res.json({
    success: true,
    message: 'Notificação de teste disparada com sucesso!',
    notification: notif,
    delivery: {
      webPush: result,
      fcm: fcmResult
    },
    deliveredCount: (result.sent || 0) + (fcmResult.sent || 0)
  });
};

router.post('/admin/notifications/test', requireAdmin, handleAdminTestNotification);
router.post('/admin/notifications/test-push', requireAdmin, handleAdminTestNotification);

// Admin: Delete all notifications from history
router.delete('/admin/notifications', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const count = db.deleteAllNotifications();
  res.json({ success: true, message: `${count} notificações removidas do histórico com sucesso.`, count });
});

// Admin: Delete notification from history
router.delete('/admin/notifications/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const deleted = db.deleteNotification(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Notificação não encontrada.' });
    return;
  }
  res.json({ success: true, message: 'Notificação removida do histórico.' });
});

// -------------------------------------------------------------
// FREE NEWS IMAGE SEARCH (WIKIMEDIA COMMONS)
// -------------------------------------------------------------
let newsAutomationRunning = false;

router.get('/automation/news', async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.AUTOMATION_SECRET;

  if (!secret || req.query.key !== secret) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }

  const settings = db.getSettings();
  const now = Date.now();
  const lastRun = settings.newsAutomationLastRun
    ? new Date(settings.newsAutomationLastRun).getTime()
    : 0;
  const cooldownMs = 60 * 1000;

  if (newsAutomationRunning) {
    res.json({
      success: true,
      skipped: true,
      message: 'Automação já está em execução.'
    });
    return;
  }

  if (lastRun && now - lastRun < cooldownMs) {
    const nextRun = new Date(lastRun + cooldownMs).toISOString();

    res.json({
      success: true,
      skipped: true,
      message: 'Automação já executada recentemente.',
      lastRun: settings.newsAutomationLastRun,
      nextRun
    });
    return;
  }

  newsAutomationRunning = true;

  try {
    let newsDataResult = {
      fetched: 0,
      imported: 0,
      skipped: 0,
      errors: 0
    };

    try {
      newsDataResult = await importNewsDataArticles(1);
    } catch (error) {
      console.error('[NEXORA AUTOMATION] NewsData indisponível, continuando com RSS:', error);
      newsDataResult.errors = 1;
    }

    const remainingSlots = Math.max(0, 1 - newsDataResult.imported);
    const rssResult = await importRSSArticles(remainingSlots);

    const runTime = new Date().toISOString();

    db.updateSettingsLocalOnly({
      newsAutomationLastRun: runTime,
      newsAutomationLastResult: JSON.stringify({
        newsData: newsDataResult,
        rss: rssResult
      })
    });

    res.json({
      success: true,
      skipped: false,
      lastRun: runTime,
      newsData: newsDataResult,
      rss: rssResult
    });
  } catch (error) {
    console.error('[NEXORA AUTOMATION] Erro na rota automática:', error);
    res.status(500).json({ error: 'Erro na importação automática' });
  } finally {
    newsAutomationRunning = false;
  }
});

router.post('/admin/ai/search-news-image', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    res.status(400).json({ error: 'A descrição da imagem é obrigatória.' });
    return;
  }

  try {
    const query = encodeURIComponent(description.trim());
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NexoraNews/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikimedia HTTP ${response.status}`);
    }

    const data = await response.json();
    const pages = Object.values(data?.query?.pages || {}) as any[];

    const image = pages.find(page =>
      page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url
    );

    if (!image) {
      res.json({ imageUrl: '' });
      return;
    }

    const imageInfo = image.imageinfo[0];

    res.json({
      imageUrl: imageInfo.thumburl || imageInfo.url,
      title: image.title || '',
      source: 'Wikimedia Commons'
    });
  } catch (err) {
    console.error('Wikimedia image search error:', err);
    res.json({ imageUrl: '' });
  }
});

// -------------------------------------------------------------
// AI NEWS CONTENT GENERATOR (GEMINI API)
// -------------------------------------------------------------
router.post('/admin/ai/generate-news', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { theme, categorySlug, tone, targetLength } = req.body;
  if (!theme || !theme.trim()) {
    res.status(400).json({ error: 'O tema da notícia é obrigatório.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent fallback when Gemini API key is not yet configured
    const cleanTheme = theme.trim();
    res.json({
      title: `Novos Desenvolvimentos: ${cleanTheme}`,
      excerpt: `Acompanhe as principais informações e atualizações recentes sobre ${cleanTheme} no portal Nexora News.`,
      content: `<p>Em recentes acontecimentos acompanhados de perto pela equipa editorial do Nexora News, o tema <strong>${cleanTheme}</strong> ganhou forte repercussão pública e institucional.</p><p>Especialistas e fontes do setor destacam que os desdobramentos atuais trazem impactos significativos e abrem novas perspetivas para os cidadãos e entidades envolvidas.</p><p>A redação continuará a acompanhar o desenrolar dos fatos e atualizará esta reportagem à medida que novas confirmações oficiais forem disponibilizadas.</p>`,
      suggestedTags: [categorySlug || 'geral', 'noticias', 'atualidade', 'angola'],
      suggestedImageDescription: `Fotografia jornalística de alta definição retratando ${cleanTheme}`,
      categorySlug: categorySlug || 'geral'
    });
    return;
  }

  try {
    const prompt = `Você é um jornalista sénior, editor e redator profissional da Nexora News, um portal de notícias de Angola com cobertura nacional e internacional.

TEMA: "${theme.trim()}"
CATEGORIA: ${categorySlug || 'geral'}
TOM: ${tone || 'jornalístico e imparcial'}
EXTENSÃO: ${targetLength || 'médio'}

REGRA PRINCIPAL:
NUNCA invente acontecimentos, resultados, classificações, datas, números, estatísticas, valores, nomes, declarações, transferências, lesões ou outras informações apresentadas como atuais.

Se o utilizador fornecer apenas um tema amplo, produza uma matéria EXPLICATIVA, CONTEXTUAL ou DE ANÁLISE.

Por exemplo, se o tema for apenas "Girabola", não invente resultados, jornadas, posições na tabela, líder, campeão, jogos futuros ou acontecimentos recentes.

Nesse caso, explique o Girabola como o Campeonato Nacional de Futebol de Angola, abordando a importância da competição, o desenvolvimento do futebol angolano, clubes, formação de jogadores, organização e desafios estruturais, sem inventar acontecimentos atuais.

Se o utilizador fornecer uma notícia com factos concretos, utilize somente os factos fornecidos. Não acrescente informações factuais não fornecidas.

Nunca escreva "a redação apurou", "segundo fontes", "especialistas afirmam" ou atribua declarações a alguém quando nenhuma fonte ou declaração foi fornecida.

ESTRUTURA:
- Título curto, forte, claro e informativo.
- Resumo em 1 ou 2 frases.
- Conteúdo com 5 a 8 parágrafos.
- Primeiro parágrafo: apresentação do assunto.
- Parágrafos seguintes: contexto, desenvolvimento, importância, impacto ou desafios.
- Último parágrafo: conclusão ou próximos passos.

Use HTML válido dentro de "content", principalmente <p>...</p>. Pode utilizar <strong>, <em> e <h2> quando necessário.

Não use Markdown.
Não use blocos de código.
Não repita informações.
Evite frases genéricas e texto de enchimento.
Use português natural utilizado em Angola.
O texto deve parecer produzido por uma redação jornalística profissional.

PARA TEMAS AMPLOS:
Não transforme um assunto geral numa falsa notícia de última hora.
Não use expressões temporais como "recentemente", "hoje", "nesta temporada", "entrou numa fase decisiva" ou semelhantes sem que os factos correspondentes tenham sido fornecidos.

TAGS:
Crie entre 3 e 5 tags diretamente relacionadas ao tema.

IMAGEM:
Crie uma descrição de fotografia ou ilustração jornalística coerente com o tema. Não diga que a imagem representa um acontecimento específico que não foi fornecido.

RESPONDA EXCLUSIVAMENTE COM JSON VÁLIDO, sem texto antes ou depois.

Formato obrigatório:
{
  "title": "Título jornalístico",
  "excerpt": "Resumo da matéria em 1 ou 2 frases",
  "content": "<p>Primeiro parágrafo...</p><p>Segundo parágrafo...</p><p>Terceiro parágrafo...</p><p>Quarto parágrafo...</p><p>Quinto parágrafo...</p>",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedImageDescription": "Descrição jornalística da imagem ideal",
  "categorySlug": "${categorySlug || 'geral'}"
}

VERIFICAÇÃO FINAL:
- JSON válido;
- 5 a 8 parágrafos;
- português natural;
- nenhuma informação factual inventada;
- nenhuma notícia atual inventada;
- nenhuma classificação ou resultado inventado;
- nenhuma fonte ou declaração inventada;
- tema amplo tratado de forma contextual.`;
    let response;
    const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    let lastError;

    for (const model of models) {
      try {
        console.log(`Tentando Gemini: ${model}`);
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        console.log(`Gemini respondeu com sucesso: ${model}`);
        break;
      } catch (err) {
        lastError = err;
        console.error(`Gemini ${model} falhou:`, err);
      }
    }

    if (!response) {
      throw lastError || new Error('Nenhum modelo Gemini conseguiu gerar a notícia.'); 
    }

    const text = response.text || '';
    const parsed = JSON.parse(text);

    // Buscar automaticamente uma imagem gratuita no Wikimedia Commons
    try {
      const imageQuery = (
        parsed.suggestedImageDescription ||
        parsed.title ||
        theme.trim()
      ).trim();

      // Termos comuns traduzidos para melhorar a pesquisa no Wikimedia Commons.
      const imageSearchTerms = imageQuery
        .replace(/seleção brasileira/gi, 'Brazil national football team')
        .replace(/seleção do brasil/gi, 'Brazil national football team')
        .replace(/brasil/gi, 'Brazil')
        .replace(/futebol/gi, 'football')
        .replace(/jogador/gi, 'football player')
        .replace(/jogadores/gi, 'football players')
        .replace(/copa do mundo/gi, 'World Cup')
        .replace(/treino/gi, 'football training')
        .replace(/treinamento/gi, 'football training')
        .replace(/estádio/gi, 'football stadium')
        .replace(/equipa/gi, 'football team')
        .replace(/time/gi, 'football team')
        .replace(/campeonato/gi, 'championship')
        .replace(/mundial/gi, 'World Cup')
        .replace(/política/gi, 'politics')
        .replace(/eleições/gi, 'election')
        .replace(/eleição/gi, 'election')
        .replace(/presidente/gi, 'president')
        .replace(/governo/gi, 'government')
        .replace(/economia/gi, 'economy')
        .replace(/negócios/gi, 'business')
        .replace(/tecnologia/gi, 'technology')
        .replace(/saúde/gi, 'health')
        .replace(/educação/gi, 'education')
        .replace(/guerra/gi, 'war')
        .replace(/Ucrânia/gi, 'Ukraine')
        .replace(/Rússia/gi, 'Russia')
        .replace(/Estados Unidos/gi, 'United States')
        .replace(/Portugal/gi, 'Portugal')
        .replace(/Angola/gi, 'Angola');

      if (imageQuery) {
        const queries = [
          imageSearchTerms,
          parsed.title || theme.trim(),
          theme.trim()
        ].filter(Boolean);

        let imageFound: any = null;

        for (const searchText of queries) {
          const query = encodeURIComponent(searchText);
          const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;

          const imageResponse = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'NexoraNews/1.0'
            }
          });

          if (!imageResponse.ok) continue;

          const imageData = await imageResponse.json();
          const pages = Object.values(imageData?.query?.pages || {}) as any[];

          imageFound = pages.find(page =>
            page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url
          );

          if (imageFound) break;
        }

        if (imageFound) {
          const info = imageFound.imageinfo[0];

          parsed.featuredImage = info.thumburl || info.url;
          parsed.featuredImageCaption =
            `${(imageFound.title || '').replace(/^File:/, '')} — Wikimedia Commons`;

          console.log('NEXORA IMAGE AUTO:', parsed.featuredImage);
        } else {
          console.log('Nenhuma imagem encontrada no Wikimedia Commons.');
        }
      }
    } catch (imageError) {
      console.error('Erro ao buscar imagem gratuita:', imageError);
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini generate-news error:', err);
    const cleanTheme = theme.trim();
    res.json({
      title: `Análise: ${cleanTheme}`,
      excerpt: `Uma análise contextual sobre ${cleanTheme}, com foco nas informações gerais e na importância do tema.`,
      content: `<p>O tema <strong>${cleanTheme}</strong> merece atenção e análise devido à sua relevância no contexto atual.</p><p>Esta matéria apresenta uma abordagem contextual ao assunto, procurando explicar os seus principais aspetos de forma clara e objetiva.</p><p>A compreensão do tema depende do contexto, das informações disponíveis e dos desenvolvimentos devidamente confirmados.</p><p>Quando existirem acontecimentos específicos relacionados com este assunto, eles deverão ser apresentados com base em informações verificadas e fontes identificadas.</p><p>O Nexora News continuará a acompanhar o tema e poderá atualizar a cobertura quando surgirem informações confirmadas e relevantes.</p>`,
      suggestedTags: [categorySlug || 'geral', 'atualidade', 'análise'],
      suggestedImageDescription: `Imagem editorial representativa de ${cleanTheme}`,
      categorySlug: categorySlug || 'geral'
    });
  }
});


// -------------------------------------------------------------
// CONTADOR DE DOWNLOADS / INSTALAÇÕES DO APLICATIVO
// -------------------------------------------------------------
router.post('/app/download', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabase) {
      res.status(503).json({ error: 'Supabase não configurado.' });
      return;
    }

    const {
      app_version,
      version,
      platform = 'android',
      country,
      source,
      device_id
    } = req.body || {};

    const resolvedVersion =
      String(app_version || version || '').trim() || null;

    const resolvedPlatform =
      String(platform || 'android').trim().toLowerCase();

    const resolvedCountry =
      String(country || '').trim() || null;

    const resolvedSource =
      String(source || '').trim() || null;

    const resolvedDeviceId =
      String(device_id || '').trim() || null;

    const userAgent = req.get('user-agent') || null;

    const { data, error } = await supabase
      .from('app_downloads')
      .insert({
        app_version: resolvedVersion,
        version: resolvedVersion,
        platform: resolvedPlatform,
        country: resolvedCountry,
        source: resolvedSource,
        device_id: resolvedDeviceId,
        user_agent: userAgent
      })
      .select('id, downloaded_at')
      .single();

    if (error) {
      console.error('App download registration failed:', error.message);
      res.status(500).json({ error: 'Não foi possível registrar o download.' });
      return;
    }

    res.status(201).json({
      success: true,
      download: data
    });
  } catch (error: any) {
    console.error('App download route error:', error);
    res.status(500).json({
      error: 'Erro interno ao registrar o download.'
    });
  }
});

// Error handling middleware for API routes and Multer
router.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'O ficheiro excede o tamanho máximo permitido (100MB).' });
      return;
    }
    res.status(400).json({ error: `Erro no upload: ${err.message}` });
    return;
  }
  if (err) {
    res.status(400).json({ error: err.message || 'Erro no processamento da requisição.' });
    return;
  }
  next();
});

export default router;
