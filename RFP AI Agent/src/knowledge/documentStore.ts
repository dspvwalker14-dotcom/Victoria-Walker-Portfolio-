export interface Document {
  id: string;
  source: string;
  title: string;
  url: string;
  content: string;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  text: string;
  documentId: string;
  chunkIndex: number;
  metadata: Record<string, any>;
}

export function chunkDocument(doc: Document, chunkSize: number, chunkOverlap: number): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const text = doc.content;
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);

    chunks.push({
      id: `${doc.id}-chunk-${index}`,
      text: chunkText,
      documentId: doc.id,
      chunkIndex: index,
      metadata: {
        source: doc.source,
        title: doc.title,
        url: doc.url
      }
    });

    start += chunkSize - chunkOverlap;
    index += 1;
  }

  return chunks;
}
