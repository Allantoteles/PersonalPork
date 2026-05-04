import { NextResponse } from 'next/server';
import { query } from '@/lib/turso';

export async function GET() {
  try {
    const roles = await query<{ id: string; nombre: string }>(`SELECT * FROM Role`);
    const entrenador = roles.find(r => r.nombre === 'entrenador');
    const atleta = roles.find(r => r.nombre === 'atleta');

    if (!entrenador || !atleta) {
      return NextResponse.json({ error: 'Roles not found' }, { status: 500 });
    }

    const usuarios = await query<{
      id: string;
      email: string;
      nombre: string;
      rolId: string;
      entrenadorId: string | null;
    }>(`SELECT * FROM Usuario`);

    const entrenadorUser = usuarios.find(u => u.rolId === entrenador.id);
    const atletaUser = usuarios.find(u => u.rolId === atleta.id);

    if (!entrenadorUser) {
      const id = crypto.randomUUID();
      await query(
        `INSERT INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`,
        [id, 'entrenador@test.com', 'Carlos Entrenador', entrenador.id]
      );
    }

    if (!atletaUser) {
      const id = crypto.randomUUID();
      await query(
        `INSERT INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`,
        [id, 'atleta@test.com', 'Juan Atleta', atleta.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}