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
  const data = await response.json();
  if (data.results?.[0]?.type === 'error') {
    console.log('SQL Error:', JSON.stringify(data));
  }
  return data;
}

async function querySql(sql) {
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

async function fixSchema() {
  console.log('🔧 Corrigiendo schema de Rutina...\n');

  try {
    console.log('📦 Verificando tabla Rutina actual...');
    const result = await querySql(`SELECT * FROM Rutina LIMIT 1`);
    const cols = result.results?.[0]?.response?.result?.cols || [];
    console.log('Columnas:', cols.map(c => c.name).join(', '));

    if (cols.some(c => c.name === 'nombre')) {
      console.log('\n⚠️ Rutina tiene schema VIEJO. Procediendo a corregir...\n');

      console.log('📦 1. Renombrando tabla Rutina vieja...');
      await executeSql(`ALTER TABLE Rutina RENAME TO Rutina_old_v3`);

      console.log('📦 2. Creando nueva tabla Rutina...');
      await executeSql(`
        CREATE TABLE Rutina (
          id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT (datetime('now')),
          alumnoId TEXT NOT NULL,
          entrenadorId TEXT NOT NULL
        )
      `);

      console.log('📦 3. Insertando datos en nueva Rutina (sin createdAt, usa default)...');
      await executeSql(`
        INSERT INTO Rutina (id, alumnoId, entrenadorId)
        SELECT id, alumnoId, entrenadorId FROM Rutina_old_v3
      `);

      console.log('📦 4. Verificando si RutinaVersion existe...');
      const checkVersion = await querySql(`SELECT count(*) as cnt FROM RutinaVersion`);
      const versionCount = checkVersion.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value || 0;

      if (versionCount === 0) {
        console.log('📦 5. Creando RutinaVersion desde datos viejos...');
        await executeSql(`
          INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt)
          SELECT id, id, nombre, descripcion, diaSemana, 1, datetime('now') FROM Rutina_old_v3
        `);

        console.log('📦 6. Verificando si RutinaEjercicioVersion existe...');
        const checkEjercicioVersion = await querySql(`SELECT count(*) as cnt FROM RutinaEjercicioVersion`);
        const ejercicioVersionCount = checkEjercicioVersion.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value || 0;

        if (ejercicioVersionCount === 0) {
          console.log('📦 7. Creando RutinaEjercicioVersion...');
          await executeSql(`
            CREATE TABLE RutinaEjercicioVersion (
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

          console.log('📦 8. Migrando ejercicios...');
          await executeSql(`
            INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden)
            SELECT id, rutinaId, ejercicioId, series, repeticiones, peso, orden FROM RutinaEjercicio
          `);
        }
      }

      console.log('\n✅ Migración completada!\n');

    } else {
      console.log('✅ Schema de Rutina ya es correcto\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSchema();
