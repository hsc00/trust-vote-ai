CREATE TYPE "public"."decision" AS ENUM('yes', 'no', 'abstain');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'active', 'revoked');--> statement-breakpoint
CREATE TABLE "doc_chunks_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid,
	"chunk_content" text NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "legislative_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"content_hash" varchar(128) NOT NULL,
	"status" "status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merkle_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid NOT NULL,
	"root_hash" varchar(128) NOT NULL,
	"total_votes" integer NOT NULL,
	"algorithm" varchar(20) DEFAULT 'SHA3-512',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid,
	"user_id" uuid NOT NULL,
	"decision" "decision" NOT NULL,
	"hash" varchar(128) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doc_chunks_embeddings" ADD CONSTRAINT "doc_chunks_embeddings_doc_id_legislative_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."legislative_docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merkle_snapshots" ADD CONSTRAINT "merkle_snapshots_doc_id_legislative_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."legislative_docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_doc_id_legislative_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."legislative_docs"("id") ON DELETE no action ON UPDATE no action;