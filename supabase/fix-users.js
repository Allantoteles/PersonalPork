const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixUsers() {
  console.log('🔧 Fixing users...\n');

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, nombre');

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
    process.exit(1);
  }

  const rolEntrenador = roles.find(r => r.nombre === 'entrenador');
  const rolAtleta = roles.find(r => r.nombre === 'atleta');

  console.log('Roles:', { entrenador: rolEntrenador?.id, atleta: rolAtleta?.id });

  // Get all users
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('*');

  if (usuariosError) {
    console.error('❌ Error fetching usuarios:', usuariosError);
  } else {
    console.log('\n📋 Current users in database:');
    usuarios?.forEach(u => console.log(`  - ${u.nombre} (${u.email}) - rol_id: ${u.rol_id}`));
  }

  // Check if users need updating
  const { data: entrenadorUser } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', 'entrenador@test.com')
    .single();

  const { data: atletaUser } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', 'atleta@test.com')
    .single();

  if (entrenadorUser && !entrenadorUser.rol_id) {
    console.log('\n📝 Updating entrenador with rol_id...');
    await supabase
      .from('usuarios')
      .update({ rol_id: rolEntrenador.id })
      .eq('id', entrenadorUser.id);
  }

  if (atletaUser && !atletaUser.rol_id) {
    console.log('📝 Updating atleta with rol_id...');
    await supabase
      .from('usuarios')
      .update({ rol_id: rolAtleta.id })
      .eq('id', atletaUser.id);
  }

  // Verify
  const { data: updatedUsers } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol_id');

  console.log('\n✅ Updated users:');
  updatedUsers?.forEach(u => console.log(`  - ${u.nombre} (${u.email}) - rol_id: ${u.rol_id}`));

  console.log('\n✨ Done!');
}

fixUsers().catch(console.error);