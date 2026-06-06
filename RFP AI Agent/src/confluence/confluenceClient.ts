import axios from 'axios';
import { config } from '../config';

export interface ConfluencePage {
  id: string;
  title: string;
  url: string;
  content: string;
  lastModified: string;
  space: string;
}

export async function listConfluencePages(): Promise<ConfluencePage[]> {
  const auth = Buffer.from(`${config.confluenceEmail}:${config.confluenceApiToken}`).toString('base64');
  const spaceFilter = config.confluenceSpaceKeys.map((key) => `space = ${key}`).join(' OR ');
  const cql = `type = page AND (${spaceFilter})`;
  const url = `${config.confluenceBaseUrl}/rest/api/content?cql=${encodeURIComponent(cql)}&expand=body.storage,space&limit=50`;

  const pages: ConfluencePage[] = [];
  const response = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  });

  for (const item of response.data.results || []) {
    pages.push({
      id: item.id,
      title: item.title,
      url: item._links?.base + item._links?.webui,
      content: item.body?.storage?.value || '',
      lastModified: item.lastModified?.when || '',
      space: item.space?.name || ''
    });
  }

  return pages;
}

export async function searchConfluence(query: string): Promise<ConfluencePage[]> {
  const auth = Buffer.from(`${config.confluenceEmail}:${config.confluenceApiToken}`).toString('base64');
  const cql = `text ~ "${query}" AND type = page`;
  const url = `${config.confluenceBaseUrl}/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=body.storage,space&limit=20`;

  const pages: ConfluencePage[] = [];
  const response = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  });

  for (const item of response.data.results || []) {
    pages.push({
      id: item.id,
      title: item.title,
      url: item._links?.base + item._links?.webui,
      content: item.body?.storage?.value || '',
      lastModified: item.lastModified?.when || '',
      space: item.space?.name || ''
    });
  }

  return pages;
}
