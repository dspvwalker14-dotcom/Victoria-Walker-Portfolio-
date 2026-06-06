import { listSharePointDocuments, getSharePointAccessToken } from '../sharepoint/sharepointClient';
import { listConfluencePages } from '../confluence/confluenceClient';
import { chunkDocument, Document } from '../knowledge/documentStore';
import { generateEmbedding } from '../embeddings/embeddingService';
import { indexChunk } from '../vectorstore/vectorStoreClient';
import { config } from '../config';
import { info, warn, error as logError } from '../utils/logger';

export async function syncSharePointDocuments() {
  try {
    info('Starting SharePoint sync...');
    const accessToken = await getSharePointAccessToken();
    const documents = await listSharePointDocuments(accessToken);

    for (const doc of documents) {
      await indexDocument({
        id: doc.id,
        source: 'SharePoint',
        title: doc.name,
        url: doc.webUrl,
        content: doc.content,
        chunks: []
      });
    }

    info(`Synced ${documents.length} SharePoint documents`);
  } catch (err) {
    logError('SharePoint sync failed', { error: err });
  }
}

export async function syncConfluencePages() {
  try {
    info('Starting Confluence sync...');
    const pages = await listConfluencePages();

    for (const page of pages) {
      await indexDocument({
        id: page.id,
        source: 'Confluence',
        title: page.title,
        url: page.url,
        content: page.content,
        chunks: []
      });
    }

    info(`Synced ${pages.length} Confluence pages`);
  } catch (err) {
    logError('Confluence sync failed', { error: err });
  }
}

async function indexDocument(doc: Document) {
  const chunks = chunkDocument(doc, config.ragChunkSize, config.ragChunkOverlap);

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.text);
      await indexChunk(chunk, embedding);
    } catch (err) {
      warn(`Failed to index chunk ${chunk.id}`, { error: err });
    }
  }
}

export async function syncAllSources() {
  info('Syncing all knowledge sources...');
  await syncSharePointDocuments();
  await syncConfluencePages();
  info('Knowledge base sync complete');
}

if (require.main === module) {
  syncAllSources().catch((err) => {
    logError('Sync failed', { err });
    process.exit(1);
  });
}
