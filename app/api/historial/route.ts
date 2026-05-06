import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/turso';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const registros = await query<{
      id: string;
      rutinaVersionId: string | null;
      alumnoId: string;
      fecha: string;
      estado: string;
      horaInicio: string | null;
      horaFin: string | null;
      duracionMinutos: number | null;
      observaciones: string | null;
    }>(
      `SELECT r.* FROM RegistroEntrenamiento r WHERE r.alumnoId = ? ORDER BY r.fecha DESC LIMIT 50`,
      [userId]
    );

    const registrosConRutina = await Promise.all(
      registros.map(async (registro) => {
        let rutinaNombre = 'Rutina';
        if (registro.rutinaVersionId) {
          const [rutina] = await query<{ nombre: string }>(
            `SELECT rv.nombre FROM RutinaVersion rv WHERE rv.id = ?`,
            [registro.rutinaVersionId]
          );
          if (rutina) rutinaNombre = rutina.nombre;
        }

        const detalles = await query<{
          id: string;
          numeroSerie: number;
          repeticiones: number;
          peso: number;
          completado: boolean;
          rutinaEjercicioVersionId: string;
        }>(
          `SELECT * FROM DetalleEntrenamiento WHERE registroEntrenamientoId = ?`,
          [registro.id]
        );

        const seriesCompletadas = detalles.filter(d => d.completado).length;
        const totalSeries = detalles.length;
        const volumenTotal = detalles.reduce((acc, d) => acc + (d.peso * d.repeticiones), 0);

        return {
          ...registro,
          rutinaNombre,
          seriesCompletadas,
          totalSeries,
          volumenTotal,
        };
      })
    );

    return NextResponse.json(registrosConRutina);
  } catch (error) {
    console.error('Error fetching historial:', error);
    return NextResponse.json({ error: 'Failed to fetch historial' }, { status: 500 });
  }
}