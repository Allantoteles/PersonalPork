import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, diaSemana, alumnoId, entrenadorId, ejercicios } = body;

    if (!nombre || !diaSemana || !alumnoId || !entrenadorId || !ejercicios?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rutinaOriginalId = crypto.randomUUID();
    await execute(
      `INSERT INTO Rutina (id, createdAt, alumnoId, entrenadorId) VALUES (?, datetime('now'), ?, ?)`,
      [rutinaOriginalId, alumnoId, entrenadorId]
    );

    const versionId = crypto.randomUUID();
    await execute(
      `INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
      [versionId, rutinaOriginalId, nombre, descripcion || null, diaSemana]
    );

    for (let i = 0; i < ejercicios.length; i++) {
      const ex = ejercicios[i];
      const ejercicioVersionId = crypto.randomUUID();
      await execute(
        `INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ejercicioVersionId, versionId, ex.ejercicioId, ex.series, ex.repeticiones, ex.peso, i]
      );
    }

    return NextResponse.json({ id: versionId, rutinaOriginalId, success: true });
  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alumnoId = searchParams.get('alumnoId');

    if (!alumnoId) {
      return NextResponse.json({ error: 'alumnoId required' }, { status: 400 });
    }

    const rutinas = await query<{
      id: string;
      nombre: string;
      descripcion: string | null;
      diaSemana: string;
    }>(
      `SELECT rv.* FROM RutinaVersion rv
       INNER JOIN Rutina r ON rv.rutinaOriginalId = r.id
       WHERE r.alumnoId = ? AND rv.isActive = 1
       ORDER BY rv.createdAt DESC`,
      [alumnoId]
    );

    return NextResponse.json(rutinas);
  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 });
  }
}