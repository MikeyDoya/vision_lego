ALTER TYPE "public"."product_category" ADD VALUE 'accessories';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_on_sale" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "discount_percent" integer;