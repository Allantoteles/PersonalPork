import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/turso';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { entrenadorId } = body;

    if (entrenadorId === null) {
      await execute(`UPDATE Usuario SET entrenadorId = NULL WHERE id = ?`, [id]);
    } else {
      await execute(`UPDATE Usuario SET entrenadorId = ? WHERE id = ?`, [entrenadorId, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Atletas PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update atleta' }, { status: 500 });
  }
}