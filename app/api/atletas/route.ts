import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const disponibles = searchParams.get('disponibles');
  const query = searchParams.get('query');

  try {
    if (disponibles === 'true') {
      const atletas = await prisma.usuario.findMany({
        where: {
          rol: { nombre: 'atleta' },
          entrenadorId: null,
        },
        orderBy: { nombre: 'asc' },
      });
      return NextResponse.json(atletas);
    }

    if (query) {
      const atletas = await prisma.usuario.findMany({
        where: {
          rol: { nombre: 'atleta' },
          entrenadorId: null,
          nombre: { contains: query },
        },
        orderBy: { nombre: 'asc' },
        take: 10,
      });
      return NextResponse.json(atletas);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch atletas' }, { status: 500 });
  }
}