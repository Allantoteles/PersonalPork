import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rutinaVersionId, alumnoId, rutinaEjercicioVersionId, numeroSerie, repeticiones, peso, completado } = body;

    if (!rutinaVersionId || !alumnoId || !rutinaEjercicioVersionId || numeroSerie === undefined || repeticiones === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let registroId: string | null = null;

    const existentes = await query<{ id: string }>(
      `SELECT id FROM RegistroEntrenamiento WHERE rutinaVersionId = ? AND alumnoId = ? AND fecha >= datetime('now', 'start of day')`,
      [rutinaVersionId, alumnoId]
    );

    if (existentes.length > 0) {
      registroId = existentes[0].id;
    } else {
      registroId = crypto.randomUUID();
      await execute(
        `INSERT INTO RegistroEntrenamiento (id, rutinaVersionId, alumnoId, fecha, estado) VALUES (?, ?, ?, datetime('now'), 'en_progreso')`,
        [registroId, rutinaVersionId, alumnoId]
      );
    }

    const detalleId = crypto.randomUUID();
    await execute(
      `INSERT INTO DetalleEntrenamiento (id, registroEntrenamientoId, rutinaEjercicioVersionId, numeroSerie, repeticiones, peso, completado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [detalleId, registroId, rutinaEjercicioVersionId, numeroSerie, repeticiones, peso || 0, completado ? 1 : 0]
    );

    return NextResponse.json({ id: detalleId, registroId, success: true });
  } catch (error) {
    console.error('Error saving set:', error);
    return NextResponse.json({ error: 'Failed to save set' }, { status: 500 });
  }
}