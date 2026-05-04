import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const roleAdministrador = await prisma.role.upsert({
    where: { nombre: 'administrador' },
    update: {},
    create: {
      nombre: 'administrador',
      descripcion: 'Usuario administrador del sistema',
    },
  });

  const roleEntrenador = await prisma.role.upsert({
    where: { nombre: 'entrenador' },
    update: {},
    create: {
      nombre: 'entrenador',
      descripcion: 'Usuario que crea y supervisa entrenamientos',
    },
  });

  const roleAtleta = await prisma.role.upsert({
    where: { nombre: 'atleta' },
    update: {},
    create: {
      nombre: 'atleta',
      descripcion: 'Usuario que realiza entrenamientos',
    },
  });

  console.log('✅ Roles created');

  const entrenador = await prisma.usuario.upsert({
    where: { email: 'entrenador@test.com' },
    update: {},
    create: {
      email: 'entrenador@test.com',
      nombre: 'Carlos Entrenador',
      rolId: roleEntrenador.id,
    },
  });

  const atleta = await prisma.usuario.upsert({
    where: { email: 'atleta@test.com' },
    update: {},
    create: {
      email: 'atleta@test.com',
      nombre: 'Juan Atleta',
      rolId: roleAtleta.id,
      entrenadorId: entrenador.id,
    },
  });

  console.log('✅ Users created');
  console.log(`   Entrenador: ${entrenador.id}`);
  console.log(`   Atleta: ${atleta.id}`);

  console.log('\n✨ Seed completed!');
  console.log('\n📋 Test credentials:');
  console.log('   Entrenador: entrenador@test.com / test123456');
  console.log('   Atleta: atleta@test.com / test123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });