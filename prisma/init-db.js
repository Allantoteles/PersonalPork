import initSqlJs from 'sql.js';
import { writeFileSync } from 'fs';

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS Role (
    id TEXT PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Usuario (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rolId TEXT,
    entrenadorId TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (rolId) REFERENCES Role(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Ejercicio (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    nombreOriginal TEXT,
    descripcion TEXT,
    grupoMuscular TEXT NOT NULL,
    gruposMusculares TEXT,
    equipo TEXT,
    nivel TEXT DEFAULT 'intermediate',
    instrucciones TEXT,
    categoria TEXT,
    creadoPor TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Rutina (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    diaSemana TEXT NOT NULL,
    alumnoId TEXT NOT NULL,
    entrenadorId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (alumnoId) REFERENCES Usuario(id),
    FOREIGN KEY (entrenadorId) REFERENCES Usuario(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS RutinaEjercicio (
    id TEXT PRIMARY KEY,
    rutinaId TEXT NOT NULL,
    ejercicioId TEXT NOT NULL,
    series INTEGER DEFAULT 3,
    repeticiones INTEGER DEFAULT 10,
    peso REAL DEFAULT 0,
    orden INTEGER DEFAULT 0,
    FOREIGN KEY (rutinaId) REFERENCES Rutina(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicioId) REFERENCES Ejercicio(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS RegistroEntrenamiento (
    id TEXT PRIMARY KEY,
    rutinaId TEXT,
    alumnoId TEXT NOT NULL,
    fecha TEXT DEFAULT (datetime('now')),
    estado TEXT DEFAULT 'completado',
    horaInicio TEXT,
    horaFin TEXT,
    duracionMinutos INTEGER,
    observaciones TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (alumnoId) REFERENCES Usuario(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS DetalleEntrenamiento (
    id TEXT PRIMARY KEY,
    registroEntrenamientoId TEXT NOT NULL,
    rutinaEjercicioId TEXT NOT NULL,
    numeroSerie INTEGER NOT NULL,
    repeticiones INTEGER NOT NULL,
    peso REAL DEFAULT 0,
    completado INTEGER DEFAULT 0,
    FOREIGN KEY (registroEntrenamientoId) REFERENCES RegistroEntrenamiento(id) ON DELETE CASCADE
  )
`);

console.log('✅ Database schema created');

const roleAdministrador = crypto.randomUUID();
const roleEntrenador = crypto.randomUUID();
const roleAtleta = crypto.randomUUID();

db.run(`INSERT OR IGNORE INTO Role (id, nombre, descripcion) VALUES (?, ?, ?)`,
  [roleAdministrador, 'administrador', 'Usuario administrador del sistema']);
db.run(`INSERT OR IGNORE INTO Role (id, nombre, descripcion) VALUES (?, ?, ?)`,
  [roleEntrenador, 'entrenador', 'Usuario que crea y supervisa entrenamientos']);
db.run(`INSERT OR IGNORE INTO Role (id, nombre, descripcion) VALUES (?, ?, ?)`,
  [roleAtleta, 'atleta', 'Usuario que realiza entrenamientos']);

const entrenadorId = crypto.randomUUID();
const atletaId = crypto.randomUUID();

db.run(`INSERT OR IGNORE INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`,
  [entrenadorId, 'entrenador@test.com', 'Carlos Entrenador', roleEntrenador]);
db.run(`INSERT OR IGNORE INTO Usuario (id, email, nombre, rolId) VALUES (?, ?, ?, ?)`,
  [atletaId, 'atleta@test.com', 'Juan Atleta', roleAtleta]);

db.run(`UPDATE Usuario SET entrenadorId = ? WHERE email = ?`, [entrenadorId, 'atleta@test.com']);

const data = db.export();
writeFileSync('./prisma/dev.db', Buffer.from(data));

console.log('✅ Seed data inserted');
console.log(`   Entrenador ID: ${entrenadorId}`);
console.log(`   Atleta ID: ${atletaId}`);
console.log('   Database saved to prisma/dev.db');

db.close();