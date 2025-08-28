import { 
  pgTable, 
  serial, 
  text, 
  varchar,
  timestamp, 
  boolean,
  integer,
  pgEnum,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Énumérations simples
export const userRoleEnum = pgEnum('user_role', [
  'chercheur', 
  'point_focal',
  'moderateur'
]);

export const documentCategoryEnum = pgEnum('document_category', [
  'rapports',
  'etudes',
  'lois',
  'articles',
  'outils_pedagogiques'
]);

export const documentThemeEnum = pgEnum('document_theme', [
  'protection_contre_violence',
  'education',
  'sante',
  'justice_juvenile'
]);

export const documentLanguageEnum = pgEnum('document_language', [
  'francais',
  'anglais'
]);

// Table des utilisateurs (seulement les utilisateurs authentifiés)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  nom: varchar('nom', { length: 100 }).notNull(),
  prenom: varchar('prenom', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('chercheur').notNull(),
  organisation: varchar('organisation', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des documents
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(), // Créateur du document
  
  // Informations de base
  titre: varchar('titre', { length: 500 }).notNull(),
  auteur: varchar('auteur', { length: 255 }).notNull(),
  description: text('description').notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  
  // Classification
  categorie: documentCategoryEnum('categorie').notNull(),
  thematique: documentThemeEnum('thematique').notNull(),
  langue: documentLanguageEnum('langue').notNull(),
  
  // Mots-clés (liste simple en JSON)
  motsCles: jsonb('mots_cles').$type<string[]>().default([]),
  
  // Fichier
  fichierUrl: varchar('fichier_url', { length: 500 }),
  imageCouvertureUrl: varchar('image_couverture_url', { length: 500 }), 

  
  // Simple : publié ou non
  isPublished: boolean('is_published').default(false).notNull(),
  
  // Compteur de vues
  vues: integer('vues').default(0).notNull(),
  
  // Dates
  datePublication: timestamp('date_publication'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  createur: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

// Types TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;