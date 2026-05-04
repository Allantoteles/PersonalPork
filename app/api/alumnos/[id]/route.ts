import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/turso';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const usuarios = await query(
      `SELECT * FROM Usuario WHERE id = ?`,
      [id]
    );
    return NextResponse.json(usuarios[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}