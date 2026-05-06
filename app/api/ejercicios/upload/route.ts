import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const ejercicioId = formData.get('ejercicioId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only jpg, png, webp allowed' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB allowed' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileName = ejercicioId ? `${ejercicioId}.jpg` : `${crypto.randomUUID()}.jpg`;

    const uploadDir = path.join(process.cwd(), 'public', 'ejercicios');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, Buffer.from(buffer));

    return NextResponse.json({ path: `/ejercicios/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
  }
}