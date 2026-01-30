import { Test, TestingModule } from '@nestjs/testing';
import { DbModule, DRIZZLE } from './db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('DbModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');

    module = await Test.createTestingModule({
      imports: [DbModule],
    }).compile();
  });

  it('should provide a defined drizzle instance', () => {
    const db = module.get<NodePgDatabase<typeof schema>>(DRIZZLE);
    expect(db).toBeDefined();
  });

  it('should have the schema properly attached to the drizzle instance', () => {
    const db = module.get<NodePgDatabase<typeof schema>>(DRIZZLE);
    expect(db.query).toBeDefined();
    expect(db.select).toBeDefined();
  });
});
