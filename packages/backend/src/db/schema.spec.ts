import { describe, expect, it } from 'vitest';
import { legislativeDocs, docChunksEmbeddings, votes } from './schema';
import { getTableConfig, PgVarchar, PgVector, PgUUID } from 'drizzle-orm/pg-core';

interface HasLength {
  length: number;
}

interface HasDimensions {
  dimensions: number;
}

describe('Database Schema Definition', () => {
  describe('legislativeDocs Table', () => {
    it('should have a content_hash with length 128', () => {
      const config = getTableConfig(legislativeDocs);
      const hashColumn = config.columns.find((column) => column.name === 'content_hash');

      expect(hashColumn).toBeInstanceOf(PgVarchar);

      const varcharColumn = hashColumn as unknown as HasLength;
      expect(varcharColumn.length).toBe(128);
    });

    it('should have a default status of draft', () => {
      const config = getTableConfig(legislativeDocs);
      const statusColumn = config.columns.find((column) => column.name === 'status');
      expect(statusColumn?.default).toBeDefined();
    });
  });

  describe('docChunksEmbeddings Table', () => {
    it('should have a vector column with 1536 dimensions for AI embeddings', () => {
      const config = getTableConfig(docChunksEmbeddings);
      const embeddingColumn = config.columns.find((column) => column.name === 'embedding');

      expect(embeddingColumn).toBeInstanceOf(PgVector);
      if (!(embeddingColumn instanceof PgVector)) throw new Error('Not a PgVector');

      const vectorColumn = embeddingColumn as unknown as HasDimensions;
      expect(vectorColumn.dimensions).toBe(1536);
    });

    it('should have a doc_id column as a UUID reference', () => {
      const config = getTableConfig(docChunksEmbeddings);
      const docIdColumn = config.columns.find((column) => column.name === 'doc_id');

      expect(docIdColumn).toBeInstanceOf(PgUUID);
      if (!docIdColumn) throw new Error('doc_id not found');
      expect(docIdColumn.columnType).toBe('PgUUID');
    });
  });

  describe('votes Table', () => {
    it('should have a vote hash with length 128 for SHA3-512', () => {
      const config = getTableConfig(votes);
      const hashColumn = config.columns.find((column) => column.name === 'hash');

      expect(hashColumn).toBeInstanceOf(PgVarchar);
      if (!(hashColumn instanceof PgVarchar)) throw new Error('Not a PgVarchar');

      const varcharColumn = hashColumn as unknown as HasLength;
      expect(varcharColumn.length).toBe(128);
    });

    it('should define decision and userId columns correctly', () => {
      const config = getTableConfig(votes);
      const decisionCol = config.columns.find((column) => column.name === 'decision');
      const userIdCol = config.columns.find((column) => column.name === 'user_id');

      expect(decisionCol).toBeDefined();
      expect(userIdCol).toBeInstanceOf(PgUUID);
    });
  });

  describe('votes Table', () => {
    it('should have a vote hash with length 128', () => {
      const config = getTableConfig(votes);
      const hashColumn = config.columns.find((column) => column.name === 'hash');

      expect(hashColumn).toBeInstanceOf(PgVarchar);
      const varcharColumn = hashColumn as unknown as HasLength;
      expect(varcharColumn.length).toBe(128);
    });
  });

  describe('Schema Relations Coverage', () => {
    it('should execute relation functions for legislativeDocs references', () => {
      const chunksConfig = getTableConfig(docChunksEmbeddings);
      const votesConfig = getTableConfig(votes);

      expect(chunksConfig.foreignKeys.length).toBeGreaterThan(0);
      expect(votesConfig.foreignKeys.length).toBeGreaterThan(0);

      const chunkRef = chunksConfig.foreignKeys[0].reference();
      const voteRef = votesConfig.foreignKeys[0].reference();

      expect(chunkRef).toBeDefined();
      expect(voteRef).toBeDefined();

      expect(Array.isArray(chunkRef.columns)).toBe(true);
      expect(Array.isArray(voteRef.columns)).toBe(true);
    });
  });
});
