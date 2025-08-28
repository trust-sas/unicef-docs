import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Configuration de la connexion
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined');
}

// Créer le client PostgreSQL
const client = postgres(connectionString, {
  max: 1, // Maximum de connexions pour le développement
});

// Créer l'instance Drizzle avec le schéma
export const db = drizzle(client, { schema });

// Exporter les types et schémas pour utilisation dans l'app
export * from './schema';