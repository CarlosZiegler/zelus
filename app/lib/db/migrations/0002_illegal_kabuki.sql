CREATE TABLE "supplier_categories" (
	"key" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "supplier_categories" ("key") VALUES
  ('plumbing'),
  ('sewage'),
  ('gas'),
  ('electricity'),
  ('common_lighting'),
  ('elevators'),
  ('hvac'),
  ('intercom'),
  ('security'),
  ('fire_safety'),
  ('gardening'),
  ('cleaning'),
  ('pest_control'),
  ('structural'),
  ('roofing'),
  ('parking'),
  ('telecommunications'),
  ('waste'),
  ('painting'),
  ('other');
