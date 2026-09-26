import { importRSSArticles } from './server/rss';
import { importRNAArticles } from './server/rna';

async function main() {
  try {
    console.log('[NEXORA CRON] Iniciando importação automática...');

    console.log('[NEXORA CRON] 1/2 - RSS angolano...');
    const rssResult = await importRSSArticles(10);
    console.log('[NEXORA CRON] RSS:', rssResult);

    console.log('[NEXORA CRON] 2/2 - Rádio Nacional de Angola...');
    const rnaResult = await importRNAArticles(10);
    console.log('[NEXORA CRON] RNA:', rnaResult);

    console.log('[NEXORA CRON] Importação concluída.');

    console.log('[NEXORA CRON] RESUMO FINAL:', {
      rss: rssResult,
      rna: rnaResult
    });

    process.exit(0);
  } catch (error) {
    console.error('[NEXORA CRON] Erro:', error);
    process.exit(1);
  }
}

main();
