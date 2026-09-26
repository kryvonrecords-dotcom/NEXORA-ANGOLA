import { importNewsDataArticles } from './server/routes';

async function main() {
  try {
    console.log('[NEXORA CRON] Iniciando importação automática...');
    
    const result = await importNewsDataArticles(10);
    
    console.log('[NEXORA CRON] Resultado:', result);
    console.log('[NEXORA CRON] Importação concluída.');
    
    process.exit(0);
  } catch (error) {
    console.error('[NEXORA CRON] Erro:', error);
    process.exit(1);
  }
}

main();
