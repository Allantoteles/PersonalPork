import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const trainerId = req.nextUrl.searchParams.get('trainerId');

  if (!trainerId) {
    return NextResponse.json({ error: 'trainerId required' }, { status: 400 });
  }

  try {
    const alumnos = await prisma.usuario.findMany({
      where: {
        rol: { nombre: 'atleta' },
        entrenadorId: trainerId,
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(alumnos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alumnos' }, { status: 500 });
  }
}