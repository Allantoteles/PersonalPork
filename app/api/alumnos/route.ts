import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/turso';

export async function GET(req: NextRequest) {
  const trainerId = req.nextUrl.searchParams.get('trainerId');

  if (!trainerId) {
    return NextResponse.json({ error: 'trainerId required' }, { status: 400 });
  }

  try {
    const roles = await query<{ id: string }>(`SELECT id FROM Role WHERE nombre = 'atleta'`);
    if (!roles[0]) return NextResponse.json([]);

    const rolAtletaId = roles[0].id;

    const alumnos = await query(
      `SELECT * FROM Usuario WHERE rolId = ? AND entrenadorId = ? ORDER BY nombre`,
      [rolAtletaId, trainerId]
    );

    return NextResponse.json(alumnos);
  } catch (error) {
    console.error('Alumnos error:', error);
    return NextResponse.json({ error: 'Failed to fetch alumnos' }, { status: 500 });
  }
}