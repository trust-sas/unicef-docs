import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/documents';

// GET /api/documents - Récupérer tous les documents publiés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true'; // Pour les modérateurs
    
    let documents;
    if (showAll) {
      // Tous les documents (pour modérateurs)
      documents = await DocumentService.getAll();
    } else {
      // Seulement les documents publiés (public)
      documents = await DocumentService.getAllPublished();
    }
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Créer un nouveau document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.titre || !body.auteur || !body.description || !body.source) {
      return NextResponse.json(
        { error: 'Titre, auteur, description et source sont requis' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Créer le document
    const document = await DocumentService.create({
      userId: body.userId,
      titre: body.titre,
      auteur: body.auteur,
      description: body.description,
      source: body.source,
      categorie: body.categorie,
      thematique: body.thematique,
      langue: body.langue,
      motsCles: body.motsCles || [],
      fichierUrl: body.fichierUrl,
      imageCouvertureUrl: body.imageCouvertureUrl,
      datePublication: body.datePublication ? new Date(body.datePublication) : null,
      isPublished: body.isPublished || false
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du document' },
      { status: 500 }
    );
  }
}