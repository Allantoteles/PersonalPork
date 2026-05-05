import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/turso';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  try {
    const users = await query<{
      id: string; email: string; nombre: string; rolId: string | null;
      entrenadorId: string | null; createdAt: string;
    }>(`SELECT * FROM Usuario WHERE email = ?`, [email]);

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let rol = null;
    if (user.rolId) {
      const roles = await query<{ id: string; nombre: string; descripcion: string | null }>(
        `SELECT * FROM Role WHERE id = ?`, [user.rolId]
      );
      rol = roles[0] || null;
    }

    return NextResponse.json({ ...user, rol });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}