const TURSO_API = process.env.TURSO_API || 'https://personalpork-allantoteles.aws-us-east-1.turso.io';
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5NDgyNDcsImlkIjoiMDE5ZGY0YmUtYTQwMS03ZjIxLTk3NzYtNWYwZTNmMjI3NTgzIiwicmlkIjoiOGM0NWFjYmItN2UwOS00YjRiLTkzNjktZDYzNjk1MDJmMzY0In0.Fc9OgdlndrUsLMcpk7SToMyttEWU7g19zhZO3KiJ2dSoc9_lZIwSVHn_Onz74gf5rgyOf5xI27oJgY9H0QnTAQ';

async function query(sql, params = []) {
  const inlineSql = params.reduce((acc, val, i) => {
    if (val === null || val === undefined) return acc.replace('?', 'NULL');
    if (typeof val === 'number') return acc.replace('?', String(val));
    if (typeof val === 'boolean') return acc.replace('?', val ? '1' : '0');
    return acc.replace('?', `'${String(val).replace(/'/g, "''")}'`);
  }, sql);

  const response = await fetch(`${TURSO_API}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql: inlineSql } }]
    })
  });

  const data = await response.json();
  if (data.results?.[0]?.type === 'ok') {
    return data.results[0].response.result.rows.map(row => {
      const cols = data.results[0].response.result.cols;
      const obj = {};
      cols.forEach((col, i) => {
        let cell = row[i];
        if (cell !== null && typeof cell === 'object' && 'value' in cell) cell = cell.value;
        if (cell !== null && typeof cell === 'object' && 'type' in cell) cell = null;
        obj[col.name] = cell;
      });
      return obj;
    });
  }
  throw new Error(JSON.stringify(data));
}

async function execute(sql, params = []) {
  await query(sql, params);
}

function uuid() {
  return crypto.randomUUID();
}

async function getUsers() {
  return await query('SELECT id, email, nombre FROM Usuario');
}

async function getExercises() {
  const response = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const data = await response.json();
  return data.slice(0, 50);
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  console.log('📥 Fetching users...');
  const users = await getUsers();
  console.log(`Found ${users.length} users:`);
  users.forEach(u => console.log(`  - ${u.nombre} (${u.email})`));

  console.log('\n📥 Fetching exercises from API...');
  const exercises = await getExercises();
  console.log(`Fetched ${exercises.length} exercises`);

  const trainer = users.find(u => u.email.includes('entrenador') || u.nombre.toLowerCase().includes('coach'));
  const athletes = users.filter(u => u !== trainer);

  if (!trainer) {
    console.log('\n❌ No trainer found!');
    return;
  }

  console.log(`\n👨‍🏫 Trainer: ${trainer.nombre}`);
  console.log(`👥 Athletes: ${athletes.length}`);

  console.log('\n🏋️ Creating routines and workouts...\n');

  const routineNames = [
    { nombre: 'Pierna Pesada A', dia: 'Lunes', exercises: ['Barbell Squat', 'Romanian Deadlift', 'Leg Extension', 'Leg Curl'] },
    { nombre: 'Empuje Pecho', dia: 'Martes', exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Tricep Pushdown'] },
    { nombre: 'Espalda y Bíceps', dia: 'Miércoles', exercises: ['Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl'] },
    { nombre: 'Pierna Ligera', dia: 'Jueves', exercises: ['Leg Press', 'Walking Lunge', 'Calf Raise', 'Abdominal Crunch'] },
    { nombre: 'Hombros y Tríceps', dia: 'Viernes', exercises: ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Dips'] },
  ];

  for (const athlete of athletes.slice(0, 3)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`👤 Athlete: ${athlete.nombre}`);
    console.log('='.repeat(50));

    for (const routine of routineNames) {
      const routineId = uuid();
      await execute(
        `INSERT INTO Rutina (id, createdAt, alumnoId, entrenadorId) VALUES (?, datetime('now'), ?, ?)`,
        [routineId, athlete.id, trainer.id]
      );

      const versionId = uuid();
      await execute(
        `INSERT INTO RutinaVersion (id, rutinaOriginalId, nombre, descripcion, diaSemana, isActive, createdAt) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
        [versionId, routineId, routine.nombre, `Rutina de ${routine.dia.toLowerCase()}`, routine.dia]
      );

      console.log(`  📋 ${routine.dia}: ${routine.nombre}`);

      const availableExercises = exercises.filter(ex =>
        routine.exercises.some(name => ex.name.toLowerCase().includes(name.toLowerCase().split(' ')[0]))
      );

      if (availableExercises.length === 0) {
        const filtered = exercises.filter(ex =>
          ex.primaryMuscles.some(m =>
            routine.exercises.some(name => {
              const key = name.toLowerCase();
              if (key.includes('pierna') || key.includes('leg')) return m.includes('quad') || m.includes('hamstring') || m.includes('glute');
              if (key.includes('pecho') || key.includes('chest')) return m.includes('chest');
              if (key.includes('espalda') || key.includes('back')) return m.includes('back') || m.includes('lat');
              if (key.includes('bicep')) return m.includes('bicep');
              if (key.includes('tricep')) return m.includes('tricep');
              if (key.includes('hombro') || key.includes('shoulder')) return m.includes('shoulder');
              if (key.includes('abdominal')) return m.includes('abdominal');
              return false;
            })
          )
        );
        availableExercises.push(...filtered.slice(0, 4));
      }

      for (let i = 0; i < Math.min(availableExercises.length, 4); i++) {
        const ex = availableExercises[i];
        const ejercicioVersionId = uuid();
        const series = Math.floor(Math.random() * 3) + 3;
        const repeticiones = Math.floor(Math.random() * 5) + 8;
        const peso = Math.floor(Math.random() * 40) + 20;

        await execute(
          `INSERT INTO RutinaEjercicioVersion (id, rutinaVersionId, ejercicioId, series, repeticiones, peso, orden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [ejercicioVersionId, versionId, ex.id, series, repeticiones, peso, i]
        );

        console.log(`    └─ ${ex.name} (${series}x${repeticiones} @ ${peso}kg)`);
      }

      const today = new Date();
      const dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].indexOf(routine.dia);
      const daysAgo = (today.getDay() - dayOfWeek + 7) % 7 || 7;

      const workoutDate = new Date(today);
      workoutDate.setDate(today.getDate() - daysAgo);
      workoutDate.setHours(18, 0, 0, 0);

      const registroId = uuid();
      await execute(
        `INSERT INTO RegistroEntrenamiento (id, rutinaVersionId, alumnoId, fecha, estado, horaInicio, horaFin, duracionMinutos, observaciones, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [registroId, versionId, athlete.id, workoutDate.toISOString(), 'completado', '18:00', '19:30', 90, 'Entrenamiento completado sin problemas', workoutDate.toISOString()]
      );

      for (let i = 0; i < Math.min(availableExercises.length, 4); i++) {
        const ex = availableExercises[i];
        const series = Math.floor(Math.random() * 3) + 3;
        const repeticiones = Math.floor(Math.random() * 5) + 8;
        const peso = Math.floor(Math.random() * 40) + 20;

        for (let s = 1; s <= series; s++) {
          const detalleId = uuid();
          await execute(
            `INSERT INTO DetalleEntrenamiento (id, registroEntrenamientoId, rutinaEjercicioVersionId, numeroSerie, repeticiones, peso, completado) VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [detalleId, registroId, ex.id, s, repeticiones + Math.floor(Math.random() * 3) - 1, peso + Math.floor(Math.random() * 10) - 5]
          );
        }
      }

      console.log(`    └─ 📅 Workout logged: ${workoutDate.toLocaleDateString('es-ES')}`);
    }
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Athletes seeded: ${Math.min(athletes.length, 3)}`);
  console.log(`   - Routines per athlete: ${routineNames.length}`);
  console.log(`   - Total workouts: ${athletes.slice(0, 3).length * routineNames.length}`);
}

seed().catch(console.error);