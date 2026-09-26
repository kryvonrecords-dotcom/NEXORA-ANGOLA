export async function fetchPixabayImage(query: string): Promise<string | null> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey || !query?.trim()) {
    return null;
  }

  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', apiKey);
  const words = query
    .replace(/[^a-zA-Z0-9À-ÿ ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');

  url.searchParams.set('q', words || query.trim());
  url.searchParams.set('image_type', 'photo');
  url.searchParams.set('orientation', 'horizontal');
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '5');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Pixabay HTTP ${response.status}`);
  }

  const data = await response.json();

  const hit = Array.isArray(data?.hits)
    ? data.hits.find((item: any) => item?.largeImageURL || item?.webformatURL)
    : null;

  return hit?.largeImageURL || hit?.webformatURL || null;
}
