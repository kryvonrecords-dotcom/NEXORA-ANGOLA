export interface RSSSource {
  name: string;
  url: string;
  category: string;
  country: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'Correio da Kianda',
    url: 'https://correiokianda.info/feed',
    category: 'angola',
    country: 'Angola'
  },
  {
    name: 'Notícias de Angola',
    url: 'https://noticiasdeangola.co.ao/feed',
    category: 'angola',
    country: 'Angola'
  },
  {
    name: 'Folha 8',
    url: 'https://jornalf8.net/feed',
    category: 'angola',
    country: 'Angola'
  },
  {
    name: 'Portal de Angola',
    url: 'https://portaldeangola.com/feed',
    category: 'angola',
    country: 'Angola'
  }
];
