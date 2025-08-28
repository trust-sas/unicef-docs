import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/lib/documents';
import { type NewDocument } from '@/db';

// GET /api/documents/[id] - Récupérer un document par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID document invalide' },
        { status: 400 }
      );
    }

    const document = await DocumentService.getById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Mettre à jour un document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID document invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const updateData: Partial<NewDocument> = {};
    if (body.titre) updateData.titre = body.titre;
    if (body.auteur) updateData.auteur = body.auteur;
    if (body.description) updateData.description = body.description;
    if (body.source) updateData.source = body.source;
    if (body.categorie) updateData.categorie = body.categorie;
    if (body.thematique) updateData.thematique = body.thematique;
    if (body.langue) updateData.langue = body.langue;
    if (body.motsCles) updateData.motsCles = body.motsCles;
    if (body.fichierUrl) updateData.fichierUrl = body.fichierUrl;
    if (body.datePublication) updateData.datePublication = new Date(body.datePublication);
    if (typeof body.isPublished === 'boolean') updateData.isPublished = body.isPublished;

    const document = await DocumentService.update(id, updateData);

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID document invalide' },
        { status: 400 }
      );
    }

    const deleted = await DocumentService.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du document' },
      { status: 500 }
    );
  }
}