# Core Data Schema

## Context

We need a robust database structure to store legislative documents, their vector embeddings for AI analysis, and the voting records. The schema must be optimized for PostgreSQL with `pgvector`.

## Proposed Schema

### 1. Table: `legislative_docs`

Stores the raw and processed text of laws/proposals.

- `id`: UUID (Primary Key)
- `title`: String
- `content`: Text (The full law text)
- `url`: String (Source link)
- `status`: Enum (Draft, Active, Revoked)
- `created_at`: Timestamp

### 2. Table: `doc_chunks_embeddings`

This is where the **AI/LangChain** will live. We split large laws into "chunks" for better RAG performance.

- `id`: UUID
- `doc_id`: ForeignKey(legislative_docs)
- `chunk_content`: Text (A portion of the law)
- `embedding`: Vector(1536) <-- _Optimized for OpenAI/Open-source models_
- `metadata`: JSONB (Page number, section title)

### 3. Table: `votes`

The integrity core.

- `id`: UUID
- `doc_id`: ForeignKey(legislative_docs)
- `user_id`: UUID
- `decision`: Enum (Yes, No, Abstain)
- `hash`: String (SHA-256 of the vote data for integrity)
- `timestamp`: Timestamp (Immutable)

## Rationale

- **Chunking Strategy:** Large laws cannot be sent to an LLM at once. Storing chunks with embeddings allows for precise "Semantic Search".
- **JSONB Metadata:** Allows flexibility for different types of legislation without changing the schema.
- **Vector(1536):** Standard size for many high-performance embedding models.
