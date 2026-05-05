'use client';

import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '../../../lib/turso';

function uuid() {
  return crypto.randomUUID();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const grupoMuscular = searchParams.get('grupoMuscular');

  let sql = 'SELECT * FROM Ejercicio WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${search}%`);
  }

  if (grupoMuscular) {
    sql += ' AND grupoMuscular = ?';
    params.push(grupoMuscular);
  }

  sql += ' ORDER BY nombre ASC';

  try {
    const ejercicios = await query<any>(sql, params);
    return NextResponse.json(ejercicios);
  } catch (error) {
    console.error('Error fetching ejercicios:', error);
    return NextResponse.json({ error: 'Error fetching ejercicios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      grupoMuscular,
      gruposMusculares,
      equipo,
      nivel,
      instrucciones,
      categoria,
      imagen,
      creadoPor,
    } = body;

    if (!nombre || !grupoMuscular) {
      return NextResponse.json(
        { error: 'Nombre y grupo muscular son obligatorios' },
        { status: 400 }
      );
    }

    const id = uuid();
    const gruposMuscularesJson = Array.isArray(gruposMusculares)
      ? JSON.stringify(gruposMusculares)
      : gruposMusculares || '[]';

    await execute(
      `INSERT INTO Ejercicio (id, nombre, grupoMuscular, gruposMusculares, equipo, nivel, instrucciones, categoria, imagen, creadoPor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, grupoMuscular, gruposMuscularesJson, equipo || null, nivel || 'intermediate', instrucciones || '', categoria || null, imagen || null, creadoPor || null]
    );

    const ejercicio = await query<any>('SELECT * FROM Ejercicio WHERE id = ?', [id]);

    return NextResponse.json(ejercicio[0], { status: 201 });
  } catch (error) {
    console.error('Error creating ejercicio:', error);
    return NextResponse.json({ error: 'Error creating ejercicio' }, { status: 500 });
  }
}