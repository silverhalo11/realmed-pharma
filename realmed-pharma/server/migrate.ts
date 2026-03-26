import { pool } from "./db";

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "phone" text DEFAULT ''
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "doctors" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "name" text NOT NULL,
        "degree" text DEFAULT '',
        "dob" text DEFAULT '',
        "clinic" text DEFAULT '',
        "phone" text DEFAULT '',
        "address" text DEFAULT '',
        "specialty" text DEFAULT '',
        "notes" text DEFAULT '',
        "medical_store" text DEFAULT '',
        "prescribed_products" text[] DEFAULT '{}'::text[]
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "name" text NOT NULL,
        "category" text DEFAULT '',
        "composition" text DEFAULT '',
        "description" text DEFAULT '',
        "catalog_slide" integer DEFAULT 0,
        "is_seeded" boolean DEFAULT false
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "doctor_id" varchar NOT NULL,
        "items" json DEFAULT '[]',
        "date" text DEFAULT ''
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "visits" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "doctor_id" varchar NOT NULL,
        "date" text DEFAULT '',
        "completed" boolean DEFAULT false
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "reminders" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "doctor_id" varchar NOT NULL,
        "text" text DEFAULT '',
        "date" text DEFAULT '',
        "done" boolean DEFAULT false
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    await client.query(`
      ALTER TABLE IF EXISTS "products" ADD COLUMN IF NOT EXISTS "image_url" text DEFAULT '';
    `);
    console.log("Database tables verified/created successfully");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  } finally {
    client.release();
  }
}
