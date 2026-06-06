# RFP AI Agent — RAG-Powered Response Generation

## Project Overview

The RFP AI Agent is an intelligent system that uses Retrieval-Augmented Generation (RAG) to accelerate RFP response creation. It pulls relevant content from past proposals stored in SharePoint and internal documentation from Confluence, then uses a Large Language Model to generate accurate, contextual RFP responses.

## Problem Statement

Sales and proposal teams face significant challenges:

1. **Slow response times** — Manual searches through past proposals and docs consume 40-60% of proposal creation time
2. **Inconsistency** — Responses vary in tone, completeness, and compliance with company standards
3. **Knowledge silos** — Critical content (capabilities, case studies, pricing, policies) lives across multiple systems (SharePoint, Confluence, emails)
4. **Compliance gaps** — Team members may miss required disclosures or compliance statements because relevant docs aren't discovered
5. **Missed best practices** — Similar RFPs answered previously don't inform current responses; lessons learned aren't applied systematically

## Solution

This project implements a **Retrieval-Augmented Generation (RAG) pipeline** that:

1. **Ingests knowledge sources** from SharePoint (past proposals, templates) and Confluence (internal policies, capabilities, case studies)
2. **Embeds documents** into a vector database using state-of-the-art embeddings (OpenAI, Hugging Face, or local models)
3. **Accepts RFP input** (questions, requirements, context) from the user
4. **Retrieves relevant documents** using semantic similarity search
5. **Augments a prompt** with the retrieved context
6. **Generates responses** using a large language model (GPT-4, Claude, or local LLM)
7. **Cites sources** so the team can verify facts and drill into original docs
8. **Iterates** based on feedback to improve future responses

## Key Features

- **Multi-source knowledge base**: Integrate SharePoint and Confluence; easily extend to other sources
- **Vector embeddings**: Semantic search for relevant docs (not keyword-based)
- **RAG architecture**: Combine retrieval and generation for grounded, accurate responses
- **LLM integration**: Support multiple LLM providers (OpenAI, Anthropic, local models via Ollama)
- **Batch indexing**: Periodically sync and re-index SharePoint and Confluence docs
- **Source attribution**: Responses include references to source documents
- **Feedback loop**: Track response quality and allow users to rate helpfulness
- **Configurable RAG parameters**: Control retrieval depth, LLM temperature, prompt templates

## Technologies Used

- **SharePoint Online API** — Retrieve proposal documents and templates
- **Confluence REST API** — Retrieve internal docs, policies, and case studies
- **Vector Embeddings** — OpenAI Embeddings, Hugging Face, or Ollama
- **Vector Store** — ChromaDB, Pinecone, or Qdrant for similarity search
- **LLM APIs** — OpenAI, Anthropic Claude, or local models (Ollama)
- **Node.js / TypeScript** — Modular, testable implementation
- **Express** — REST API for RFP input and response generation

## Architecture

```
User Query (RFP Question)
       ↓
   [RAG Pipeline]
       ├→ Retrieve relevant docs from vector store (semantic search)
       ├→ Rank and filter results
       ├→ Build augmented prompt with retrieved context
       ├→ Call LLM with augmented prompt
       └→ Generate response with source citations
       ↓
 [Response with Sources]
```

## Project Structure

```
RFP AI Agent/
  README.md
  .env.example
  package.json
  tsconfig.json
  example-rfp-request.json
  src/
    index.ts
    server.ts
    config.ts
    errors.ts
    validation.ts
    utils/
      logger.ts
    sharepoint/
      sharepointClient.ts
    confluence/
      confluenceClient.ts
    knowledge/
      documentStore.ts
      indexer.ts
    embeddings/
      embeddingService.ts
    vectorstore/
      vectorStoreClient.ts
    llm/
      llmClient.ts
      prompts.ts
    rag/
      ragPipeline.ts
    workflow/
      rfpResponseWorkflow.ts
  scripts/
    index-sharepoint.sh
    index-confluence.sh
    sync-knowledge-base.sh
```

## Business Impact

- **Reduces proposal time** from 3-5 days to <2 hours
- **Improves consistency** through LLM-guided responses aligned with company voice
- **Ensures compliance** by referencing approved docs and policies
- **Increases win rate** through data-backed, comprehensive responses
- **Knowledge retention** — Institutional knowledge captured and reused

## Getting Started

### Prerequisites

- Node.js 18+
- Azure account (SharePoint) or Microsoft 365 tenant access
- Atlassian Cloud account (Confluence)
- OpenAI API key or local LLM (Ollama)
- Vector database access (Chroma local, Pinecone, or Qdrant)

### Setup

1. Copy `.env.example` to `.env` and fill in credentials.
2. Install dependencies: `npm install`
3. Index knowledge base: `npm run index:all`
4. Start server: `npm run start:webhook`
5. Post RFP questions to the API.

## RAG Workflow Mapping

- **Document ingestion** → `sharepoint/sharepointClient.ts`, `confluence/confluenceClient.ts`
- **Embedding generation** → `embeddings/embeddingService.ts`
- **Vector storage** → `vectorstore/vectorStoreClient.ts`
- **Semantic retrieval** → `rag/ragPipeline.ts` (retrieve step)
- **Prompt augmentation** → `llm/prompts.ts`
- **LLM generation** → `llm/llmClient.ts`
- **Orchestration** → `workflow/rfpResponseWorkflow.ts`

## Notes

- The RAG pipeline is modular; swap vector stores, embeddings, or LLMs without rewriting core logic.
- All sensitive credentials are environment-driven.
- Supports batch indexing to keep the knowledge base fresh.
