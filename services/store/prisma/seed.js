import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Warehouse Service - Iniciando...\n');

  // ========================================
  // 1. DEPARTAMENTOS (3 principales)
  // ========================================
  const departamentos = [
    { nombre: 'Lima' },
    { nombre: 'Cusco' },
    { nombre: 'Arequipa' },
  ];

  const depIds = {};
  for (const dep of departamentos) {
    const created = await prisma.departamento.upsert({
      where: { nombre: dep.nombre },
      update: {},
      create: dep,
    });
    depIds[dep.nombre] = created.id;
  }
  console.log('✅ Departamentos creados (3)');

  // ========================================
  // 2. PROVINCIAS (4 principales)
  // ========================================
  const provincias = [
    { nombre: 'Lima', id_departamento: depIds['Lima'] },
    { nombre: 'Callao', id_departamento: depIds['Lima'] },
    { nombre: 'Cusco', id_departamento: depIds['Cusco'] },
    { nombre: 'Arequipa', id_departamento: depIds['Arequipa'] },
  ];

  const provIds = {};
  for (const prov of provincias) {
    const created = await prisma.provincia.upsert({
      where: { 
        nombre_id_departamento: { 
          nombre: prov.nombre, 
          id_departamento: prov.id_departamento 
        } 
      },
      update: {},
      create: prov,
    });
    provIds[prov.nombre] = created.id;
  }
  console.log('✅ Provincias creadas (4)');

  // ========================================
  // 3. DISTRITOS (8 locaciones)
  // ========================================
  const distritos = [
    { nombre: 'Miraflores', id_provincia: provIds['Lima'] },
    { nombre: 'San Isidro', id_provincia: provIds['Lima'] },
    { nombre: 'Surco', id_provincia: provIds['Lima'] },
    { nombre: 'Callao', id_provincia: provIds['Callao'] },
    { nombre: 'Wanchaq', id_provincia: provIds['Cusco'] },
    { nombre: 'Santiago', id_provincia: provIds['Cusco'] },
    { nombre: 'Cercado', id_provincia: provIds['Arequipa'] },
    { nombre: 'Cayma', id_provincia: provIds['Arequipa'] },
  ];

  const distIds = {};
  for (const dist of distritos) {
    const created = await prisma.distrito.upsert({
      where: { 
        nombre_id_provincia: { 
          nombre: dist.nombre, 
          id_provincia: dist.id_provincia 
        } 
      },
      update: {},
      create: dist,
    });
    distIds[dist.nombre] = created.id;
  }
  console.log('✅ Distritos creados (8)');

  // ========================================
  // 4. GEOPOINTS (coordenadas GPS)
  // ========================================
  const geopoints = [
    { id: 1, latitud: -12.119700, longitud: -77.035200 }, // Almacén Lima
    { id: 2, latitud: -12.093100, longitud: -77.042800 }, // Tienda San Isidro
    { id: 3, latitud: -12.145000, longitud: -77.010000 }, // Tienda Surco
    { id: 4, latitud: -13.531900, longitud: -71.967500 }, // Almacén Cusco
    { id: 5, latitud: -13.520000, longitud: -71.980000 }, // Tienda Santiago
    { id: 6, latitud: -16.409000, longitud: -71.537500 }, // Almacén Arequipa
    { id: 7, latitud: -16.390000, longitud: -71.530000 }, // Tienda Cayma
    { id: 8, latitud: -12.056000, longitud: -77.118000 }, // Tienda Callao
  ];

  for (const geo of geopoints) {
    await prisma.geopoint.upsert({
      where: { id: geo.id },
      update: { latitud: geo.latitud, longitud: geo.longitud },
      create: geo,
    });
  }
  console.log('✅ Geopoints creados (8)');

  // ========================================
  // 5. DIRECCIONES (8 locaciones)
  // ========================================
  const direcciones = [
    { id: 1, referencia: 'Av. Larco 1234 - Almacén Central', id_distrito: distIds['Miraflores'], id_geopoint: 1 },
    { id: 2, referencia: 'Av. Javier Prado 567 - Tienda Premium', id_distrito: distIds['San Isidro'], id_geopoint: 2 },
    { id: 3, referencia: 'Av. Primavera 890 - Tienda Sur', id_distrito: distIds['Surco'], id_geopoint: 3 },
    { id: 4, referencia: 'Av. El Sol 456 - Almacén Cusco', id_distrito: distIds['Wanchaq'], id_geopoint: 4 },
    { id: 5, referencia: 'Calle Cultura 234 - Tienda Cusco', id_distrito: distIds['Santiago'], id_geopoint: 5 },
    { id: 6, referencia: 'Calle Mercaderes 789 - Almacén Arequipa', id_distrito: distIds['Cercado'], id_geopoint: 6 },
    { id: 7, referencia: 'Av. Cayma 321 - Tienda Norte', id_distrito: distIds['Cayma'], id_geopoint: 7 },
    { id: 8, referencia: 'Av. Colonial 555 - Tienda Callao', id_distrito: distIds['Callao'], id_geopoint: 8 },
  ];

  for (const dir of direcciones) {
    await prisma.direccion.upsert({
      where: { id: dir.id },
      update: { referencia: dir.referencia },
      create: dir,
    });
  }
  console.log('✅ Direcciones creadas (8)');

  // ========================================
  // 6. TIPOS DE LOCAL (2 tipos)
  // ========================================
  const tiposLocal = [
    { nombre: 'Almacen', descripcion: 'Almacén principal de distribución' },
    { nombre: 'Tienda', descripcion: 'Tienda de venta al público' },
  ];

  const tipoIds = {};
  for (const tipo of tiposLocal) {
    const created = await prisma.tipoLocal.upsert({
      where: { nombre: tipo.nombre },
      update: { descripcion: tipo.descripcion },
      create: tipo,
    });
    tipoIds[tipo.nombre] = created.id;
  }
  console.log('✅ Tipos de local creados (2)');

  // ========================================
  // 7. LOCALES - ALMACENES (3 almacenes principales)
  // ========================================
  const almacenes = [
    { 
      id: 1, 
      nombre: 'Almacén Lima Central', 
      estado: 'ACTIVO', 
      id_direccion: 1, 
      id_tipo_local: tipoIds['Almacen']
    },
    { 
      id: 2, 
      nombre: 'Almacén Cusco', 
      estado: 'ACTIVO', 
      id_direccion: 4, 
      id_tipo_local: tipoIds['Almacen']
    },
    { 
      id: 3, 
      nombre: 'Almacén Arequipa', 
      estado: 'ACTIVO', 
      id_direccion: 6, 
      id_tipo_local: tipoIds['Almacen']
    },
  ];

  for (const almacen of almacenes) {
    await prisma.local.upsert({
      where: { id: almacen.id },
      update: { estado: almacen.estado },
      create: almacen,
    });
  }
  console.log('✅ Almacenes creados (3)');

  // ========================================
  // 8. LOCALES - TIENDAS (5 tiendas sin id_almacen directo)
  // ========================================
  const tiendas = [
    { id: 4, nombre: 'Tienda San Isidro Premium', estado: 'ACTIVO', id_direccion: 2, id_tipo_local: tipoIds['Tienda'] },
    { id: 5, nombre: 'Tienda Surco Mall', estado: 'ACTIVO', id_direccion: 3, id_tipo_local: tipoIds['Tienda'] },
    { id: 6, nombre: 'Tienda Callao Plaza', estado: 'ACTIVO', id_direccion: 8, id_tipo_local: tipoIds['Tienda'] },
    { id: 7, nombre: 'Tienda Cusco Centro', estado: 'ACTIVO', id_direccion: 5, id_tipo_local: tipoIds['Tienda'] },
    { id: 8, nombre: 'Tienda Arequipa Norte', estado: 'ACTIVO', id_direccion: 7, id_tipo_local: tipoIds['Tienda'] },
  ];

  for (const tienda of tiendas) {
    await prisma.local.upsert({
      where: { id: tienda.id },
      update: { estado: tienda.estado },
      create: tienda,
    });
  }
  console.log('✅ Tiendas creadas (5)');

  // ========================================
  // 9. RELACIONES ALMACÉN-TIENDA
  // ========================================
  console.log('\n🔗 Creando relaciones almacén-tienda...');
  
  const relaciones = [
    // Almacén Lima Central (id: 1) abastece a 3 tiendas de Lima
    { id_almacen: 1, id_tienda: 4 }, // → Tienda San Isidro Premium
    { id_almacen: 1, id_tienda: 5 }, // → Tienda Surco Mall
    { id_almacen: 1, id_tienda: 6 }, // → Tienda Callao Plaza
    
    // Almacén Cusco (id: 2) abastece a 1 tienda local
    { id_almacen: 2, id_tienda: 7 }, // → Tienda Cusco Centro
    
    // Almacén Arequipa (id: 3) abastece a 1 tienda local
    { id_almacen: 3, id_tienda: 8 }, // → Tienda Arequipa Norte
    
    // Ejemplo de tienda con múltiples almacenes (emergencia):
    // Tienda Surco Mall también puede recibir del Almacén Cusco
    { id_almacen: 2, id_tienda: 5 }, // Almacén Cusco → Tienda Surco Mall (backup)
  ];

  let relacionesCreadas = 0;
  for (const rel of relaciones) {
    try {
      await prisma.almacenTienda.upsert({
        where: {
          id_almacen_id_tienda: {
            id_almacen: rel.id_almacen,
            id_tienda: rel.id_tienda
          }
        },
        update: {},
        create: rel
      });
      relacionesCreadas++;
    } catch (error) {
      // Si ya existe, continuar
      if (error.code !== 'P2002') {
        console.warn(`⚠️  Error al crear relación ${rel.id_almacen} → ${rel.id_tienda}:`, error.message);
      }
    }
  }
  console.log(`✅ Relaciones almacén-tienda creadas (${relacionesCreadas}/${relaciones.length})`);

  console.log('\n✨ Seed de Store Service completado exitosamente!');
  console.log('📊 Total: 3 Departamentos | 4 Provincias | 8 Distritos | 8 Geopoints | 8 Direcciones | 3 Almacenes | 5 Tiendas | 6 Relaciones\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
