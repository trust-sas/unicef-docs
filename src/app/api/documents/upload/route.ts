import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer le fichier depuis la requête
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // 2. Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les PDF sont acceptés' }, { status: 400 });
    }

    // 3. Créer un nom unique pour le fichier
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanName}`;
    
    // 4. Créer le dossier de destination
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', year.toString(), month);
    await mkdir(uploadDir, { recursive: true });
    
    // 5. Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // 6. Retourner l'URL du fichier
    const fileUrl = `/uploads/documents/${year}/${month}/${fileName}`;
    
    return NextResponse.json({ 
      success: true,
      message: 'Fichier uploadé avec succès',
      fileUrl: fileUrl,
      fileName: fileName,
      originalName: file.name,
      fileSize: file.size
    });
    
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload du fichier' 
    }, { status: 500 });
  }
}