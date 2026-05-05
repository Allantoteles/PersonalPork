-- Migration: Rutina Versioning (Copy-on-Write)
-- This migration creates the versioning system for routines

-- 1. Create new Rutina table (without the old columns)
CREATE TABLE IF NOT EXISTS Rutina_new (
  id TEXT PRIMARY KEY,
  createdAt TEXT DEFAULT (datetime('now')),
  alumnoId TEXT NOT NULL,
  entrenadorId TEXT NOT NULL
);

-- 2. Create RutinaVersion table
CREATE TABLE IF NOT EXISTS RutinaVersion (
  id TEXT PRIMARY KEY,
  rutinaOriginalId TEXT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  diaSemana TEXT NOT NULL,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (rutinaOriginalId) REFERENCES Rutina_new(id)
);

-- 3. Create RutinaEjercicioVersion table
CREATE TABLE IF NOT EXISTS RutinaEjercicioVersion (
  id TEXT PRIMARY KEY,
  rutinaVersionId TEXT NOT NULL,
  ejercicioId TEXT NOT NULL,
  series INTEGER DEFAULT 3,
  repeticiones INTEGER DEFAULT 10,
  peso REAL DEFAULT 0,
  orden INTEGER DEFAULT 0,
  FOREIGN KEY (rutinaVersionId) REFERENCES RutinaVersion(id) ON DELETE CASCADE
);

-- 4. Create DetalleEntrenamientoVersion table
CREATE TABLE IF NOT EXISTS DetalleEntrenamientoVersion (
  id TEXT PRIMARY KEY,
  registroEntrenamientoId TEXT NOT NULL,
  rutinaEjercicioVersionId TEXT NOT NULL,
  numeroSerie INTEGER NOT NULL,
  repeticiones INTEGER NOT NULL,
  peso REAL DEFAULT 0,
  completado INTEGER DEFAULT 0,
  FOREIGN KEY (registroEntrenamientoId) REFERENCES RegistroEntrenamiento(id) ON DELETE CASCADE,
  FOREIGN KEY (rutinaEjercicioVersionId) REFERENCES RutinaEjercicioVersion(id) ON DELETE CASCADE
);

-- 5. Migrate existing Rutina data
-- For each existing Rutina, create a Rutina record and a RutinaVersion with isActive=true
INSERT INTO Rutina_new (id, createdAt, alumnoId, entrenadorId)
SELECT id, createdAt, alumnoId, entrenadorId FROM Rutina;

INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt)
SELECT id, id, nombre, descripcion, diaSemana, 1, createdAt FROM Rutina;

-- 6. Migrate RutinaEjercicio to RutinaEjercicioVersion
INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden)
SELECT re.id, re.rutinaId, re.ejercicioId, re.series, re.repeticiones, re.peso, re.orden
FROM RutinaEjercicio re
INNER JOIN RutinaVersion rv ON re.rutinaId = rv.id;

-- 7. Drop old tables
DROP TABLE IF EXISTS RutinaEjercicio;
DROP TABLE IF EXISTS Rutina;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Role;

-- 8. Rename new tables
ALTER TABLE Rutina_new RENAME TO Rutina;
ALTER TABLE RutinaVersion RENAME TO RutinaVersion;
ALTER TABLE RutinaEjercicioVersion RENAME TO RutinaEjercicioVersion;
ALTER TABLE DetalleEntrenamientoVersion RENAME TO DetalleEntrenamientoVersion;

-- 9. Update RegistroEntrenamiento to reference RutinaVersion
-- Note: rutinaId column is now rutinaVersionId
-- Existing RegistroEntrenamiento entries need manual update or we leave them as is (nullable)
