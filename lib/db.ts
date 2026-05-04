import { query, execute } from './turso';

function uuid() {
  return crypto.randomUUID();
}

export const prisma = {
  role: {
    findUnique: async ({ where }: { where: { nombre: string } }) => {
      const rows = await query<{
        id: string; nombre: string; descripcion: string | null; createdAt: string;
      }>(`SELECT * FROM Role WHERE nombre = ?`, [where.nombre]);
      return rows[0] || null;
    },
    findMany: async () => {
      return query<{ id: string; nombre: string; descripcion: string | null; createdAt: string }>(
        `SELECT * FROM Role`
      );
    },
  },
  usuario: {
    findUnique: async ({ where }: { where: { email: string } }) => {
      const rows = await query<{
        id: string; email: string; nombre: string; rolId: string | null;
        entrenadorId: string | null; createdAt: string;
      }>(`SELECT * FROM Usuario WHERE email = ?`, [where.email]);
      return rows[0] || null;
    },
    findUniqueOrThrow: async ({ where }: { where: { email: string } }) => {
      const rows = await query<{
        id: string; email: string; nombre: string; rolId: string | null;
        entrenadorId: string | null; createdAt: string;
      }>(`SELECT * FROM Usuario WHERE email = ?`, [where.email]);
      if (!rows[0]) throw new Error('User not found');
      return rows[0];
    },
    findMany: async ({ where }: { where?: { rolId: string; entrenadorId?: string | null } }) => {
      if (where?.rolId && where?.entrenadorId !== undefined) {
        if (where.entrenadorId === null) {
          return query<{
            id: string; email: string; nombre: string; rolId: string | null;
            entrenadorId: string | null; createdAt: string;
          }>(`SELECT * FROM Usuario WHERE rolId = ? AND entrenadorId IS NULL ORDER BY nombre`, [where.rolId]);
        }
        return query<{
          id: string; email: string; nombre: string; rolId: string | null;
          entrenadorId: string | null; createdAt: string;
        }>(`SELECT * FROM Usuario WHERE rolId = ? AND entrenadorId = ? ORDER BY nombre`, [where.rolId, where.entrenadorId]);
      }
      return query<{
        id: string; email: string; nombre: string; rolId: string | null;
        entrenadorId: string | null; createdAt: string;
      }>(`SELECT * FROM Usuario`);
    },
    update: async ({ where, data }: { where: { id: string }; data: { entrenadorId?: string | null } }) => {
      if (data.entrenadorId !== undefined) {
        await execute(`UPDATE Usuario SET entrenadorId = ? WHERE id = ?`, [data.entrenadorId, where.id]);
      }
    },
  },
  rutina: {
    create: async ({ data }: { data: {
      nombre: string; descripcion?: string; diaSemana: string;
      alumnoId: string; entrenadorId: string;
    }}) => {
      const id = uuid();
      await execute(
        `INSERT INTO Rutina (id, nombre, descripcion, diaSemana, alumnoId, entrenadorId) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, data.nombre, data.descripcion || null, data.diaSemana, data.alumnoId, data.entrenadorId]
      );
      return { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },
    findMany: async ({ where }: { where?: { alumnoId: string } }) => {
      if (where?.alumnoId) {
        return query<{
          id: string; nombre: string; descripcion: string | null; diaSemana: string;
          alumnoId: string; entrenadorId: string; createdAt: string; updatedAt: string;
        }>(`SELECT * FROM Rutina WHERE alumnoId = ? ORDER BY createdAt DESC`, [where.alumnoId]);
      }
      return query<{
        id: string; nombre: string; descripcion: string | null; diaSemana: string;
        alumnoId: string; entrenadorId: string; createdAt: string; updatedAt: string;
      }>(`SELECT * FROM Rutina`);
    },
  },
  rutinaEjercicio: {
    createMany: async ({ data }: { data: Array<{
      id?: string; rutinaId: string; ejercicioId: string;
      series: number; repeticiones: number; peso: number; orden: number;
    }>}) => {
      for (const item of data) {
        const id = item.id || uuid();
        await execute(
          `INSERT INTO RutinaEjercicio (id, rutinaId, ejercicioId, series, repeticiones, peso, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, item.rutinaId, item.ejercicioId, item.series, item.repeticiones, item.peso, item.orden]
        );
      }
    },
  },
};