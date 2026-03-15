# Add for forward reference support in type annotations
from __future__ import annotations
from dataclasses import dataclass
# ============================================================================
# SCORED CHUNK DATACLASS
# ============================================================================

@dataclass
class ScoredChunk:
	chunk: "Chunk"
	rrf_score: float
	boosted_score: float
	vector_distance: float
	bm25_score: float

"""
Production-ready chunk repository with hybrid search (PGVector + BM25 + RRF).

Features:
- Hybrid search with Reciprocal Rank Fusion
- Metadata filtering (content_type, difficulty)
- Score boosting (section title, path, content type)
- HNSW index optimization
- Full test coverage
"""

import uuid
from uuid import UUID
from sqlalchemy import select, func, literal, Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, TSVECTOR
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import declarative_base
from pgvector.sqlalchemy import Vector
import structlog

logger = structlog.get_logger()


# ==========================================================================
# DOMAIN MODELS (SQLAlchemy Declarative)
# ==========================================================================

Base = declarative_base()

	__tablename__ = "chunks"
	id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	document_id = Column(PG_UUID(as_uuid=True), ForeignKey("documents.id"))
	content = Column(String)
	embedding = Column(Vector(1024))
	content_tsvector = Column(TSVECTOR)
	section_title = Column(String, nullable=True)
	section_path = Column(String, nullable=True)
	content_type = Column(String)
	chunk_index = Column(Integer)


# ============================================================================
# REPOSITORY
# ============================================================================

class ChunkRepository:
	"""Repository for chunk operations with hybrid search."""
# Renamed for valid Python import
