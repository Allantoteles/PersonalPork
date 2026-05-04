const TURSO_API = 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5Mjc2NDMsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.NgPvBSdoGC_4H8pFM7DG67v1WsXd-z2kh3B3XdqBLbcUNLVCu8BtRtwySOgJnDjcReO2fTCM-p70plLwRVe8DQ';

async function execute(sql, params = []) {
  const response = await fetch(`${TURSO_API}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, params } }]
    })
  });
  const data = await response.json();
  if (data.results?.[0]?.type !== 'ok') {
    throw new Error(JSON.stringify(data));
  }
}

async function seed() {
  console.log('🌱 Starting seed...');

  console.log('📝 Creating Role table...');
  await execute(`CREATE TABLE IF NOT EXISTS Role (id TEXT PRIMARY KEY, nombre TEXT UNIQUE NOT NULL, descripcion TEXT, createdAt TEXT DEFAULT (datetime('now')))`);

  console.log('📝 Creating Usuario table...');
  await execute(`CREATE TABLE IF NOT EXISTS Usuario (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, nombre TEXT NOT NULL, rolId TEXT, entrenadorId TEXT, createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (rolId) REFERENCES Role(id))`);

  console.log('📝 Creating Ejercicio table...');
  await execute(`CREATE TABLE IF NOT EXISTS Ejercicio (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, nombreOriginal TEXT, descripcion TEXT, grupoMuscular TEXT NOT NULL, gruposMusculares TEXT, equipo TEXT, nivel TEXT DEFAULT 'intermediate', instrucciones TEXT, categoria TEXT, creadoPor TEXT, createdAt TEXT DEFAULT (datetime('now')))`);

  console.log('📝 Creating Rutina table...');
  await execute(`CREATE TABLE IF NOT EXISTS Rutina (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT, diaSemana TEXT NOT NULL, alumnoId TEXT NOT NULL, entrenadorId TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (alumnoId) REFERENCES Usuario(id), FOREIGN KEY (entrenadorId) REFERENCES Usuario(id))`);

  console.log('📝 Creating RutinaEjercicio table...');
  await execute(`CREATE TABLE IF NOT EXISTS RutinaEjercicio (id TEXT PRIMARY KEY, rutinaId TEXT NOT NULL, ejercicioId TEXT NOT NULL, series INTEGER DEFAULT 3, repeticiones INTEGER DEFAULT 10, peso REAL DEFAULT 0, orden INTEGER DEFAULT 0, FOREIGN KEY (rutinaId) REFERENCES Rutina(id) ON DELETE CASCADE, FOREIGN KEY (ejercicioId) REFERENCES Ejercicio(id))`);

  console.log('📝 Creating RegistroEntrenamiento table...');
  await execute(`CREATE TABLE IF NOT EXISTS RegistroEntrenamiento (id TEXT PRIMARY KEY, rutinaId TEXT, alumnoId TEXT NOT NULL, fecha TEXT DEFAULT (datetime('now')), estado TEXT DEFAULT 'completado', horaInicio TEXT, horaFin TEXT, duracionMinutos INTEGER, observaciones TEXT, createdAt TEXT DEFAULT (datetime('now')), FOREIGN KEY (alumnoId) REFERENCES Usuario(id))`);

  console.log('📝 Creating DetalleEntrenamiento table...');
  await execute(`CREATE TABLE IF NOT EXISTS DetalleEntrenamiento (id TEXT PRIMARY KEY, registroEntrenamientoId TEXT NOT NULL, rutinaEjercicioId TEXT NOT NULL, numeroSerie INTEGER NOT NULL, repeticiones INTEGER NOT NULL, peso REAL DEFAULT 0, completado INTEGER DEFAULT 0, FOREIGN KEY (registroEntrenamientoId) REFERENCES RegistroEntrenamiento(id) ON DELETE CASCADE)`);

  console.log('✅ Tables created');

  const roleEntrenador = crypto.randomUUID();
  const roleAtleta = crypto.randomUUID();

  await execute(`INSERT OR IGNORE INTO Role (id, nombre, descripcion) VALUES (?, ?, ?)`, [roleEntrenador, 'entrenador', 'Usuario que crea y supervisa entrenamientos']);
  await execute(`INSERT OR IGNORE INTO Role (id, nombre, descripcion) VALUES (?, ?, ?)`, [roleAtleta, 'atleta', 'Usuario que realiza entrenamientos']);

  console.log('✅ Roles created');

  const entrenadorId = crypto.randomUUID();
  const atletaId = crypto.randomUUID();

  await execute(`INSERT OR IGNORE INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`, [entrenadorId, 'entrenador@test.com', 'Carlos Entrenador', roleEntrenador]);
  await execute(`INSERT OR IGNORE INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`, [atletaId, 'atleta@test.com', 'Juan Atleta', roleAtleta]);

  await execute(`UPDATE Usuario SET entrenadorId = ? WHERE email = ?`, [entrenadorId, 'atleta@test.com']);

  console.log('✅ Users created');
  console.log(`   Entrenador ID: ${entrenadorId}`);
  console.log(`   Atleta ID: ${atletaId}`);

  console.log('\n✨ Seed completed!');
}

seed().catch(console.error);