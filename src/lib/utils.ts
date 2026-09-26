export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  if (diffHours === 1) return 'Há 1 hora';
  if (diffHours < 24) return `Há ${diffHours} horas`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  
  return formatDate(isoString);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>?/gm, '');
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength) + '...';
}

export async function shareArticle(data: { title: string; text?: string; url: string }): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text || data.title,
        url: data.url
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share error:', err);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(data.url);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
