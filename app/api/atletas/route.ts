import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/turso';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const disponibles = searchParams.get('disponibles');
  const queryParam = searchParams.get('query');

  try {
    const roles = await query<{ id: string }>(`SELECT id FROM Role WHERE nombre = 'atleta'`);
    if (!roles[0]) return NextResponse.json([]);

    const rolAtletaId = roles[0].id;

    if (disponibles === 'true') {
      const atletas = await query(
        `SELECT * FROM Usuario WHERE rolId = ? AND entrenadorId IS NULL ORDER BY nombre`,
        [rolAtletaId]
      );
      return NextResponse.json(atletas);
    }

    if (queryParam) {
      const atletas = await query(
        `SELECT * FROM Usuario WHERE rolId = ? AND entrenadorId IS NULL AND nombre LIKE ? ORDER BY nombre LIMIT 10`,
        [rolAtletaId, `%${queryParam}%`]
      );
      return NextResponse.json(atletas);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Atletas error:', error);
    return NextResponse.json({ error: 'Failed to fetch atletas' }, { status: 500 });
  }
}