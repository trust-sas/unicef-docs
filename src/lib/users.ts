import { db, users, type User } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export class UserService {
  // Créer un utilisateur avec hash du mot de passe
  static async create(data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    organisation?: string; // Optionnel
    role?: 'chercheur' | 'point_focal' | 'moderateur'; // Optionnel, défaut = chercheur
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const [user] = await db.insert(users).values({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: hashedPassword,
      organisation: data.organisation || null,
      role: data.role || 'chercheur',
      // isActive, createdAt, updatedAt sont gérés automatiquement
    }).returning();
    
    return user;
  }

  // Obtenir tous les utilisateurs
  static async getAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Obtenir un utilisateur par ID
  static async getById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  // Obtenir un utilisateur par email
  static async getByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  // Vérifier le mot de passe lors de la connexion
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(id: number, data: {
    nom?: string;
    prenom?: string;
    organisation?: string;
  }): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return user || null;
  }

  // Supprimer un utilisateur
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Changer le rôle d'un utilisateur (pour modérateurs)
  static async changeRole(id: number, newRole: 'chercheur' | 'point_focal' | 'moderateur'): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        role: newRole,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return user || null;
  }

  // Activer/désactiver un utilisateur
  static async toggleActive(id: number, isActive: boolean): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        isActive,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    
    return user || null;
  }
}