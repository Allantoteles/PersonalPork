const TURSO_API = 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5NDgyNDcsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.Fc9OgdlndrUsLMcpk7SToMyttEWU7g19zhZO3KiJ2dSoc9_lZIwSVHn_Onz74gf5rgyOf5xI27oJgY9H0QnTAQ';

async function query(sql) {
  const response = await fetch(`${TURSO_API}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql } }]
    })
  });
  const data = await response.json();
  if (data.results?.[0]?.type === 'ok') {
    return data.results[0].response.result.rows.map(row => {
      const cols = data.results[0].response.result.cols;
      const obj = {};
      cols.forEach((col, i) => {
        let cell = row[i];
        if (cell !== null && typeof cell === 'object') {
          if ('value' in cell) cell = cell.value;
          else if ('type' in cell) cell = null;
        }
        obj[col.name] = cell;
      });
      return obj;
    });
  }
  throw new Error(JSON.stringify(data));
}

async function migrate() {
  console.log('🔧 Iniciando migración...\n');

  try {
    console.log('📦 Verificando Rutina_old_v2...');
    const oldRutina = await query('SELECT * FROM Rutina_old_v2 LIMIT 1');
    console.log('Datos:', oldRutina);

    console.log('\n📦 Verificando RutinaEjercicio...');
    const oldEjercicios = await query('SELECT * FROM RutinaEjercicio');
    console.log('Ejercicios:', oldEjercicios);

    if (oldRutina.length > 0) {
      const r = oldRutina[0];
      console.log('\n📦 Insertando en nueva Rutina...');
      await query(`INSERT INTO Rutina (id, createdAt, alumnoId, entrenadorId) VALUES ('${r.id}', datetime('now'), '${r.alumnoId}', '${r.entrenadorId}')`);
      console.log('✅');

      console.log('📦 Insertando en RutinaVersion...');
      await query(`INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt) VALUES ('${r.id}_v1', '${r.id}', '${r.nombre}', ${r.descripcion ? "'" + r.descripcion + "'" : 'NULL'}, '${r.diaSemana}', 1, datetime('now'))`);
      console.log('✅');

      for (const ex of oldEjercicios) {
        console.log(`📦 Insertando ejercicio ${ex.ejercicioId}...`);
        await query(`INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden) VALUES ('${ex.id}_v1', '${r.id}_v1', '${ex.ejercicioId}', ${ex.series}, ${ex.repeticiones}, ${ex.peso}, ${ex.orden})`);
      }
      console.log('✅');
    }

    console.log('\n🎉 Migración completada!\n');

  } catch (error) {
    console.error('❌ Error:', error.message || error);
    process.exit(1);
  }
}

migrate();