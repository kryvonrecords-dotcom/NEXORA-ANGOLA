// Media URL and Paste Sanitization Utilities

export function cleanPastedUrl(input: string): string {
  if (!input) return '';
  let str = input.trim();

  // If user pasted full iframe snippet <iframe ... src="https://..." ...></iframe>
  const iframeSrcMatch = str.match(/<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1].trim();
  }

  // If user pasted img tag <img ... src="https://..." ...>
  const imgSrcMatch = str.match(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  if (imgSrcMatch && imgSrcMatch[1]) {
    return imgSrcMatch[1].trim();
  }

  // If user pasted markdown link/image [text](url) or ![alt](url)
  const mdMatch = str.match(/!?\[.*?\]\((https?:\/\/[^)\s]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1].trim();
  }

  // Strip wrapping quotes or brackets
  str = str.replace(/^["'«»“`<\(]+|["'»”`>\)]+$/g, '').trim();

  return str;
}

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))/i.test(url);
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/i;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0&modestbranding=1`;
  }
  return null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/i;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
}

export function detectMediaType(url: string): 'image' | 'video' {
  if (!url) return 'image';
  const clean = url.toLowerCase().trim();
  if (
    isYouTubeUrl(clean) ||
    clean.includes('vimeo.com') ||
    clean.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)
  ) {
    return 'video';
  }
  return 'image';
}
