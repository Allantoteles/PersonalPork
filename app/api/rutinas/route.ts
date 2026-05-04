import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, diaSemana, alumnoId, entrenadorId, ejercicios } = body;

    if (!nombre || !diaSemana || !alumnoId || !entrenadorId || !ejercicios?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rutinaId = crypto.randomUUID();
    await execute(
      `INSERT INTO Rutina (id, nombre, descripcion, diaSemana, alumnoId, entrenadorId) VALUES (?, ?, ?, ?, ?, ?)`,
      [rutinaId, nombre, descripcion || null, diaSemana, alumnoId, entrenadorId]
    );

    for (let i = 0; i < ejercicios.length; i++) {
      const ex = ejercicios[i];
      const id = crypto.randomUUID();
      await execute(
        `INSERT INTO RutinaEjercicio (id, rutinaId, ejercicioId, series, repeticiones, peso, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, rutinaId, ex.ejercicioId, ex.series, ex.repeticiones, ex.peso, i]
      );
    }

    return NextResponse.json({ id: rutinaId, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
  }
}