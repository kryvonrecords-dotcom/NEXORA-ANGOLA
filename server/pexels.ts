export async function fetchPexelsImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey || !query?.trim()) {
    return null;
  }

  const url = new URL('https://api.pexels.com/v1/search');

  const words = query
    .replace(/[^a-zA-Z0-9À-ÿ ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');

  url.searchParams.set('query', words || query.trim());
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '5');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels HTTP ${response.status}`);
  }

  const data = await response.json();

  const photo = Array.isArray(data?.photos)
    ? data.photos.find(
        (item: any) =>
          item?.src?.large2x ||
          item?.src?.large ||
          item?.src?.original
      )
    : null;

  return (
    photo?.src?.large2x ||
    photo?.src?.large ||
    photo?.src?.original ||
    null
  );
}
