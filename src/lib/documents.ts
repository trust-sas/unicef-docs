import { db, documents, users, type Document, type NewDocument } from '@/db';
import { eq, desc, and, ilike, or } from 'drizzle-orm';

// Types pour les filtres de recherche
type DocumentCategory = 'rapports' | 'etudes' | 'lois' | 'articles' | 'outils_pedagogiques';
type DocumentTheme = 'protection_contre_violence' | 'education' | 'sante' | 'justice_juvenile';
type DocumentLanguage = 'francais' | 'anglais';

interface SearchFilters {
  categorie?: DocumentCategory;
  thematique?: DocumentTheme;
  langue?: DocumentLanguage;
}

export class DocumentService {
  // Créer un document
  static async create(data: NewDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(data).returning();
    return document;
  }

  // Obtenir tous les documents publiés avec leur créateur
  static async getAllPublished() {
    return await db
      .select({
        id: documents.id,
        titre: documents.titre,
        auteur: documents.auteur,
        description: documents.description,
        source: documents.source,
        categorie: documents.categorie,
        thematique: documents.thematique,
        langue: documents.langue,
        motsCles: documents.motsCles,
        fichierUrl: documents.fichierUrl,
        imageCouvertureUrl: documents.imageCouvertureUrl,
        vues: documents.vues,
        datePublication: documents.datePublication,
        createdAt: documents.createdAt,
        createur: {
          id: users.id,
          nom: users.nom,
          prenom: users.prenom,
          organisation: users.organisation,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(eq(documents.isPublished, true))
      .orderBy(desc(documents.createdAt));
  }

  // Obtenir tous les documents (pour modérateurs)
  static async getAll() {
    return await db
      .select({
        id: documents.id,
        titre: documents.titre,
        auteur: documents.auteur,
        description: documents.description,
        source: documents.source,
        categorie: documents.categorie,
        thematique: documents.thematique,
        langue: documents.langue,
        motsCles: documents.motsCles,
        fichierUrl: documents.fichierUrl,
        imageCouvertureUrl: documents.imageCouvertureUrl,
        isPublished: documents.isPublished,
        vues: documents.vues,
        datePublication: documents.datePublication,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        createur: {
          id: users.id,
          nom: users.nom,
          prenom: users.prenom,
          organisation: users.organisation,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .orderBy(desc(documents.createdAt));
  }

  // Obtenir un document par ID
  static async getById(id: number): Promise<Document | null> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || null;
  }

  // Obtenir les documents d'un utilisateur
  static async getByUserId(userId: number) {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  // Rechercher des documents
  static async search(query: string, filters?: SearchFilters) {
    let whereCondition = and(
      eq(documents.isPublished, true),
      or(
        ilike(documents.titre, `%${query}%`),
        ilike(documents.description, `%${query}%`),
        ilike(documents.auteur, `%${query}%`)
      )
    );

    // Ajouter les filtres si fournis
    if (filters?.categorie) {
      whereCondition = and(whereCondition, eq(documents.categorie, filters.categorie));
    }
    if (filters?.thematique) {
      whereCondition = and(whereCondition, eq(documents.thematique, filters.thematique));
    }
    if (filters?.langue) {
      whereCondition = and(whereCondition, eq(documents.langue, filters.langue));
    }

    return await db
      .select({
        id: documents.id,
        titre: documents.titre,
        auteur: documents.auteur,
        description: documents.description,
        source: documents.source,
        categorie: documents.categorie,
        thematique: documents.thematique,
        langue: documents.langue,
        motsCles: documents.motsCles,
        fichierUrl: documents.fichierUrl,
        imageCouvertureUrl: documents.imageCouvertureUrl,
        vues: documents.vues,
        datePublication: documents.datePublication,
        createdAt: documents.createdAt,
        createur: {
          nom: users.nom,
          prenom: users.prenom,
          organisation: users.organisation,
        },
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(whereCondition)
      .orderBy(desc(documents.createdAt));
  }

  // Filtrer par catégorie
  static async getByCategory(categorie: DocumentCategory) {
    return await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.isPublished, true),
        eq(documents.categorie, categorie)
      ))
      .orderBy(desc(documents.createdAt));
  }

  // Filtrer par thématique
  static async getByTheme(thematique: DocumentTheme) {
    return await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.isPublished, true),
        eq(documents.thematique, thematique)
      ))
      .orderBy(desc(documents.createdAt));
  }

  // Publier un document (pour modérateurs)
  static async publish(id: number): Promise<Document | null> {
    const [document] = await db
      .update(documents)
      .set({ 
        isPublished: true, 
        updatedAt: new Date() 
      })
      .where(eq(documents.id, id))
      .returning();
    
    return document || null;
  }

  // Dépublier un document
  static async unpublish(id: number): Promise<Document | null> {
    const [document] = await db
      .update(documents)
      .set({ 
        isPublished: false, 
        updatedAt: new Date() 
      })
      .where(eq(documents.id, id))
      .returning();
    
    return document || null;
  }

  // Mettre à jour un document
  static async update(id: number, data: Partial<NewDocument>): Promise<Document | null> {
    const [document] = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    
    return document || null;
  }

  // Supprimer un document
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(documents).where(eq(documents.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }
}