const TURSO_API = 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5NDgyNDcsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.Fc9OgdlndrUsLMcpk7SToMyttEWU7g19zhZO3KiJ2dSoc9_lZIwSVHn_Onz74gf5rgyOf5xI27oJgY9H0QnTAQ';

async function executeSql(sql) {
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
  return response.json();
}

async function migrate() {
  console.log('🔄 Iniciando migración de versionado de rutinas...\n');

  try {
    console.log('📦 Creando tabla Rutina (nueva estructura)...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS Rutina (
        id TEXT PRIMARY KEY,
        createdAt TEXT DEFAULT (datetime('now')),
        alumnoId TEXT NOT NULL,
        entrenadorId TEXT NOT NULL
      )
    `);
    console.log('✅ Tabla Rutina creada\n');

    console.log('📦 Creando tabla RutinaVersion...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS RutinaVersion (
        id TEXT PRIMARY KEY,
        rutinaOriginalId TEXT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        diaSemana TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (rutinaOriginalId) REFERENCES Rutina(id)
      )
    `);
    console.log('✅ Tabla RutinaVersion creada\n');

    console.log('📦 Creando tabla RutinaEjercicioVersion...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS RutinaEjercicioVersion (
        id TEXT PRIMARY KEY,
        rutinaVersionId TEXT NOT NULL,
        ejercicioId TEXT NOT NULL,
        series INTEGER DEFAULT 3,
        repeticiones INTEGER DEFAULT 10,
        peso REAL DEFAULT 0,
        orden INTEGER DEFAULT 0,
        FOREIGN KEY (rutinaVersionId) REFERENCES RutinaVersion(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla RutinaEjercicioVersion creada\n');

    console.log('📦 Verificando si existen datos en Rutina (vieja)...');
    const oldRutina = await executeSql(`SELECT id, nombre, descripcion, diaSemana, alumnoId, entrenadorId FROM Rutina LIMIT 1`);
    const hasOldData = oldRutina.results?.[0]?.type === 'ok' && oldRutina.results[0].response.result.rows.length > 0;

    if (hasOldData) {
      console.log('📦 Migrando datos de Rutina vieja a nueva estructura...\n');

      await executeSql(`
        INSERT INTO Rutina (id, createdAt, alumnoId, entrenadorId)
        SELECT id, createdAt, alumnoId, entrenadorId FROM Rutina
      `);
      console.log('✅ Datos de Rutina migrados\n');

      await executeSql(`
        INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt)
        SELECT id, id, nombre, descripcion, diaSemana, 1, createdAt FROM Rutina
      `);
      console.log('✅ Versiones iniciales creadas\n');

      await executeSql(`
        INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden)
        SELECT re.id, re.rutinaId, re.ejercicioId, re.series, re.repeticiones, re.peso, re.orden
        FROM RutinaEjercicio re
        INNER JOIN RutinaVersion rv ON re.rutinaId = rv.id
      `);
      console.log('✅ Ejercicios de rutinas migrados\n');
    } else {
      console.log('ℹ️ No se encontraron datos legacy para migrar\n');
    }

    console.log('📦 Agregando columnas a DetalleEntrenamiento...');
    try {
      await executeSql(`
        ALTER TABLE DetalleEntrenamiento ADD COLUMN rutinaEjercicioVersionId TEXT
      `);
      console.log('✅ Columna rutinaEjercicioVersionId agregada\n');
    } catch (e) {
      console.log('ℹ️ Columna rutinaEjercicioVersionId ya existe o no se pudo agregar:', e.message);
    }

    console.log('📦 Agregando columnas a RegistroEntrenamiento...');
    try {
      await executeSql(`
        ALTER TABLE RegistroEntrenamiento ADD COLUMN rutinaVersionId TEXT
      `);
      console.log('✅ Columna rutinaVersionId agregada\n');
    } catch (e) {
      console.log('ℹ️ Columna rutinaVersionId ya existe o no se pudo agregar:', e.message);
    }

    console.log('🎉 Migración completada con éxito!\n');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();
