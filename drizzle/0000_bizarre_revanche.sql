CREATE TYPE "public"."document_category" AS ENUM('rapports', 'etudes', 'lois', 'articles', 'outils_pedagogiques');--> statement-breakpoint
CREATE TYPE "public"."document_language" AS ENUM('francais', 'anglais');--> statement-breakpoint
CREATE TYPE "public"."document_theme" AS ENUM('protection_contre_violence', 'education', 'sante', 'justice_juvenile');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('chercheur', 'point_focal', 'moderateur');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"titre" varchar(500) NOT NULL,
	"auteur" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"source" varchar(255) NOT NULL,
	"categorie" "document_category" NOT NULL,
	"thematique" "document_theme" NOT NULL,
	"langue" "document_language" NOT NULL,
	"mots_cles" jsonb DEFAULT '[]'::jsonb,
	"fichier_url" varchar(500),
	"image_couverture_url" varchar(500),
	"is_published" boolean DEFAULT false NOT NULL,
	"vues" integer DEFAULT 0 NOT NULL,
	"date_publication" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nom" varchar(100) NOT NULL,
	"prenom" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'chercheur' NOT NULL,
	"organisation" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
