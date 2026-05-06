import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/turso';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [registro] = await query<{
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
      `SELECT * FROM RegistroEntrenamiento WHERE id = ?`,
      [id]
    );

    if (!registro) {
      return NextResponse.json({ error: 'Registro not found' }, { status: 404 });
    }

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
      rutinaEjercicioVersionId: string;
      numeroSerie: number;
      repeticiones: number;
      peso: number;
      completado: boolean;
    }>(
      `SELECT * FROM DetalleEntrenamiento WHERE registroEntrenamientoId = ?`,
      [id]
    );

    const ejercicioIds = [...new Set(detalles.map(d => d.rutinaEjercicioVersionId))];

    const ejercicioInfoMap = new Map<string, { nombre: string; imagen: string; isLocal: boolean }>();

    for (const ejId of ejercicioIds) {
      const [rev] = await query<{ ejercicioId: string }>(
        `SELECT ejercicioId FROM RutinaEjercicioVersion WHERE id = ?`,
        [ejId]
      );

      if (rev) {
        const [localEj] = await query<{ id: string; nombre: string; imagen: string | null }>(
          `SELECT id, nombre, imagen FROM Ejercicio WHERE id = ?`,
          [rev.ejercicioId]
        );

        if (localEj) {
          ejercicioInfoMap.set(ejId, {
            nombre: localEj.nombre,
            imagen: `/ejercicios/${localEj.id}.jpg`,
            isLocal: true,
          });
        } else {
          ejercicioInfoMap.set(ejId, {
            nombre: rev.ejercicioId,
            imagen: '',
            isLocal: false,
          });
        }
      }
    }

    const detallesAgrupados: Record<string, {
      id: string;
      ejercicioId: string;
      ejercicioNombre: string;
      imagen: string;
      isLocal: boolean;
      series: { numeroSerie: number; peso: number; repeticiones: number; completado: boolean }[];
    }> = {};

    for (const detalle of detalles) {
      if (!detallesAgrupados[detalle.rutinaEjercicioVersionId]) {
        const info = ejercicioInfoMap.get(detalle.rutinaEjercicioVersionId) || {
          nombre: 'Ejercicio',
          imagen: '',
          isLocal: false,
        };
        detallesAgrupados[detalle.rutinaEjercicioVersionId] = {
          id: crypto.randomUUID(),
          ejercicioId: detalle.rutinaEjercicioVersionId,
          ejercicioNombre: info.nombre,
          imagen: info.imagen,
          isLocal: info.isLocal,
          series: [],
        };
      }
      detallesAgrupados[detalle.rutinaEjercicioVersionId].series.push({
        numeroSerie: detalle.numeroSerie,
        peso: detalle.peso,
        repeticiones: detalle.repeticiones,
        completado: detalle.completado,
      });
    }

    const volumenTotal = detalles.reduce((acc, d) => acc + (d.peso * d.repeticiones), 0);
    const seriesCompletadas = detalles.filter(d => d.completado).length;
    const totalSeries = detalles.length;

    return NextResponse.json({
      ...registro,
      rutinaNombre,
      volumenTotal,
      seriesCompletadas,
      totalSeries,
      detalles: Object.values(detallesAgrupados),
    });
  } catch (error) {
    console.error('Error fetching registro detalle:', error);
    return NextResponse.json({ error: 'Failed to fetch registro' }, { status: 500 });
  }
}