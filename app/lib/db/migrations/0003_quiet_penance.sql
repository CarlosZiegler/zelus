ALTER TABLE "ticket_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ticket_categories" CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_categories" RENAME TO "categories";--> statement-breakpoint
ALTER TABLE "tickets" RENAME COLUMN "category_id" TO "category";
