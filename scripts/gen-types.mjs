import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'pglite-server';
import { PostgresMeta } from '@supabase/postgres-meta';
import { getGeneratorMetadata } from '@supabase/postgres-meta/dist/lib/generators.js';
import { apply as generateTypescript } from '@supabase/postgres-meta/dist/server/templates/typescript.js';

async function main() {
  console.log('Starting PGlite in-memory database...');
  const db = new PGlite();
  
  console.log('Preparing auth schema in PGlite...');
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id uuid PRIMARY KEY,
      email text,
      created_at timestamptz
    );
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT '00000000-0000-0000-0000-000000000000'::uuid;
    $$;
  `);

  console.log('Reading schema.sql...');
  let schemaSql = fs.readFileSync('schema.sql', 'utf-8');
  
  // PGlite doesn't bundle uuid-ossp extension by default, so we mock uuid_generate_v4() in memory for type generation.
  // We do NOT touch schema.sql on disk. Using a replacer function avoids JS $$ replacement behavior.
  schemaSql = schemaSql.replace(
    /create extension if not exists ["']uuid-ossp["'];/i,
    () => 'CREATE OR REPLACE FUNCTION uuid_generate_v4() RETURNS uuid AS $$ SELECT md5(random()::text || clock_timestamp()::text)::uuid $$ LANGUAGE SQL;'
  );
  
  console.log('Applying schema to PGlite...');
  await db.exec(schemaSql);

  // Start wire server so @supabase/postgres-meta can connect via standard postgres wire protocol
  const port = 54322;
  console.log(`Starting pglite-server wire protocol on port ${port}...`);
  const server = createServer(db);
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

  console.log('Introspecting database metadata using @supabase/postgres-meta...');
  const pgMeta = new PostgresMeta({ connectionString: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres` });
  
  try {
    const { data, error } = await getGeneratorMetadata(pgMeta, { includedSchemas: ['public'] });
    if (error) {
      throw new Error(`Metadata introspection failed: ${error.message || JSON.stringify(error)}`);
    }

    console.log('Generating exact TypeScript definitions...');
    const typescriptOutput = await generateTypescript({
      ...data,
      detectOneToOneRelationships: true,
    });

    const outputDir = path.resolve('lib/types');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'database.types.ts');
    fs.writeFileSync(outputPath, typescriptOutput, 'utf-8');
    console.log(`Successfully generated ${outputPath}!`);
  } catch (err) {
    console.error('Error generating types details:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await pgMeta.end();
    server.close();
  }
}

main();
