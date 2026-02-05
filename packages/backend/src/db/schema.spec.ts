import { describe, expect, it } from 'vitest';
import * as schema from './schema';
import { getTableConfig, PgVarchar, PgVector, PgInteger } from 'drizzle-orm/pg-core';

interface HasLength {
  length: number;
}
interface HasDimensions {
  dimensions: number;
}

describe('Database Schema Definition', () => {
  describe('Enums Coverage', () => {
    it('should initialize statusEnum and decisionEnum', () => {
      expect(schema.statusEnum.enumValues).toContain('draft');
      expect(schema.decisionEnum.enumValues).toContain('yes');
    });
  });

  describe('legislativeDocs Table', () => {
    it('should have a content_hash with length 128', () => {
      const config = getTableConfig(schema.legislativeDocs);
      const hashColumn = config.columns.find((c) => c.name === 'content_hash');
      expect(hashColumn).toBeInstanceOf(PgVarchar);
      expect((hashColumn as unknown as HasLength).length).toBe(128);
    });

    it('should have a default status', () => {
      const config = getTableConfig(schema.legislativeDocs);
      const statusColumn = config.columns.find((c) => c.name === 'status');
      expect(statusColumn?.default).toBeDefined();
    });
  });

  describe('merkleSnapshots Table', () => {
    it('should have correct configuration and referential integrity', () => {
      const config = getTableConfig(schema.merkleSnapshots);

      const rootHash = config.columns.find((c) => c.name === 'root_hash');
      const totalVotes = config.columns.find((c) => c.name === 'total_votes');

      expect(rootHash).toBeInstanceOf(PgVarchar);
      expect(totalVotes).toBeInstanceOf(PgInteger);

      const fk = config.foreignKeys.find(
        (k) => getTableConfig(k.reference().foreignColumns[0].table).name === 'legislative_docs',
      );

      expect(fk).toBeDefined();
      expect(fk?.onDelete).toBe('cascade');
    });
  });

  describe('docChunksEmbeddings Table', () => {
    it('should have 1536 dimensions for AI embeddings', () => {
      const config = getTableConfig(schema.docChunksEmbeddings);
      const embeddingColumn = config.columns.find((c) => c.name === 'embedding');
      expect(embeddingColumn).toBeInstanceOf(PgVector);
      expect((embeddingColumn as unknown as HasDimensions).dimensions).toBe(1536);
    });
  });

  describe('votes Table', () => {
    it('should define decision and hash correctly', () => {
      const config = getTableConfig(schema.votes);
      const hashColumn = config.columns.find((c) => c.name === 'hash');
      const decisionCol = config.columns.find((c) => c.name === 'decision');

      expect(hashColumn).toBeInstanceOf(PgVarchar);
      expect((hashColumn as unknown as HasLength).length).toBe(128);
      expect(decisionCol).toBeDefined();
    });
  });

  describe('Schema Relations Deep Coverage', () => {
    it('should execute all relation reference functions', () => {
      const tables = [schema.docChunksEmbeddings, schema.merkleSnapshots, schema.votes];

      tables.forEach((table) => {
        const config = getTableConfig(table);
        config.foreignKeys.forEach((fk) => {
          const ref = fk.reference();
          expect(ref.columns.length).toBeGreaterThan(0);
          expect(ref.foreignColumns.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
