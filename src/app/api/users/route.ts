    import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/users';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await UserService.getAll();
    
    // Ne pas retourner les mots de passe
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.nom || !body.prenom || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nom, prénom, email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await UserService.getByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur
    const user = await UserService.create({
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      password: body.password,
      organisation: body.organisation,
      role: body.role || 'chercheur'
    });
    
    // Retourner sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}