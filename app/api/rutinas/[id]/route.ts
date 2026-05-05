import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/turso';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, descripcion, diaSemana, ejercicios } = body;

    if (!nombre || !diaSemana || !ejercicios?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [rutinaVersion] = await query<{ rutinaOriginalId: string | null }>(
      `SELECT rutinaOriginalId FROM RutinaVersion WHERE id = ?`,
      [id]
    );

    if (!rutinaVersion) {
      return NextResponse.json({ error: 'Rutina version not found' }, { status: 404 });
    }

    const rutinaOriginalId = rutinaVersion.rutinaOriginalId || id;

    await execute(
      `UPDATE RutinaVersion SET isActive = 0 WHERE id = ?`,
      [id]
    );

    const rutinaId = crypto.randomUUID();
    await execute(
      `INSERT INTO Rutina (id, createdAt, alumnoId, entrenadorId) VALUES (?, datetime('now'), ?, ?)`,
      [rutinaId, '', '']
    );

    const [alumnoAndEntrenador] = await query<{ alumnoId: string; entrenadorId: string }>(
      `SELECT rv.alumnoId, rv.entrenadorId FROM RutinaVersion rv WHERE rv.id = ?`,
      [id]
    );

    await execute(
      `UPDATE Rutina SET alumnoId = ?, entrenadorId = ? WHERE id = ?`,
      [alumnoAndEntrenador.alumnoId, alumnoAndEntrenador.entrenadorId, rutinaId]
    );

    const newVersionId = crypto.randomUUID();
    await execute(
      `INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
      [newVersionId, rutinaOriginalId, nombre, descripcion || null, diaSemana]
    );

    for (let i = 0; i < ejercicios.length; i++) {
      const ex = ejercicios[i];
      const ejercicioVersionId = crypto.randomUUID();
      await execute(
        `INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ejercicioVersionId, newVersionId, ex.ejercicioId, ex.series, ex.repeticiones, ex.peso, i]
      );
    }

    return NextResponse.json({ id: newVersionId, rutinaId, success: true });
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [rutinaVersion] = await query<{
      id: string;
      nombre: string;
      descripcion: string | null;
      diaSemana: string;
      rutinaOriginalId: string | null;
      isActive: number;
    }>(
      `SELECT * FROM RutinaVersion WHERE id = ?`,
      [id]
    );

    if (!rutinaVersion) {
      return NextResponse.json({ error: 'Rutina not found' }, { status: 404 });
    }

    const ejercicios = await query<{
      id: string;
      ejercicioId: string;
      series: number;
      repeticiones: number;
      peso: number;
      orden: number;
    }>(
      `SELECT * FROM RutinaEjercicioVersion WHERE rutinaVersionId = ? ORDER BY orden ASC`,
      [id]
    );

    return NextResponse.json({ ...rutinaVersion, ejercicios });
  } catch (error) {
    console.error('Error fetching routine:', error);
    return NextResponse.json({ error: 'Failed to fetch routine' }, { status: 500 });
  }
}