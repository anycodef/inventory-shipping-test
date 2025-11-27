import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Store Service - Iniciando...\n');

  // ========================================
  // 1. DEPARTAMENTOS (idénticos a warehouse)
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
  // 2. PROVINCIAS (idénticas a warehouse)
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
      where: { nombre_id_departamento: { nombre: prov.nombre, id_departamento: prov.id_departamento } },
      update: {},
      create: prov,
    });
    provIds[prov.nombre] = created.id;
  }
  console.log('✅ Provincias creadas (4)');

  // ========================================
  // 3. DISTRITOS (idénticos a warehouse)
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
      where: { nombre_id_provincia: { nombre: dist.nombre, id_provincia: dist.id_provincia } },
      update: {},
      create: dist,
    });
    distIds[dist.nombre] = created.id;
  }
  console.log('✅ Distritos creados (8)');

  // ========================================
  // 4. GEOPOINTS (coordenadas GPS - idénticas)
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

  const geoIds = {};
  for (const geo of geopoints) {
    const created = await prisma.geopoint.upsert({
      where: { id: geo.id },
      update: { latitud: geo.latitud, longitud: geo.longitud },
      create: geo,
    });
    geoIds[geo.id] = created.id;
  }
  console.log('✅ Geopoints creados (8)');

  // ========================================
  // 5. DIRECCIONES (idénticas a warehouse)
  // ========================================
  const direcciones = [
    { id: 1, referencia: 'Av. Larco 1234 - Almacén Central', id_distrito: distIds['Miraflores'], id_geopoint: geoIds[1] },
    { id: 2, referencia: 'Av. Javier Prado 567 - Tienda Premium', id_distrito: distIds['San Isidro'], id_geopoint: geoIds[2] },
    { id: 3, referencia: 'Av. Primavera 890 - Tienda Sur', id_distrito: distIds['Surco'], id_geopoint: geoIds[3] },
    { id: 4, referencia: 'Av. El Sol 456 - Almacén Cusco', id_distrito: distIds['Wanchaq'], id_geopoint: geoIds[4] },
    { id: 5, referencia: 'Calle Cultura 234 - Tienda Cusco', id_distrito: distIds['Santiago'], id_geopoint: geoIds[5] },
    { id: 6, referencia: 'Calle Mercaderes 789 - Almacén Arequipa', id_distrito: distIds['Cercado'], id_geopoint: geoIds[6] },
    { id: 7, referencia: 'Av. Cayma 321 - Tienda Norte', id_distrito: distIds['Cayma'], id_geopoint: geoIds[7] },
    { id: 8, referencia: 'Av. Colonial 555 - Tienda Callao', id_distrito: distIds['Callao'], id_geopoint: geoIds[8] },
  ];

  const dirIds = {};
  for (const dir of direcciones) {
    const created = await prisma.direccion.upsert({
      where: { id: dir.id },
      update: { referencia: dir.referencia },
      create: dir,
    });
    dirIds[dir.id] = created.id;
  }
  console.log('✅ Direcciones creadas (8)');

  // ========================================
  // 6. TIPOS DE LOCAL (idénticos a warehouse)
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
  // 7. LOCALES - ALMACENES (3 almacenes)
  // ========================================
  const almacenes = [
    { id: 1, nombre: 'Almacén Lima Central', imagen: 'https://example.com/alm-lima.jpg', estado: 'ACTIVO', id_direccion: dirIds[1], id_tipo_local: tipoIds['Almacen'], id_almacen: null },
    { id: 2, nombre: 'Almacén Cusco', imagen: 'https://example.com/alm-cusco.jpg', estado: 'ACTIVO', id_direccion: dirIds[4], id_tipo_local: tipoIds['Almacen'], id_almacen: null },
    { id: 3, nombre: 'Almacén Arequipa', imagen: 'https://example.com/alm-arequipa.jpg', estado: 'ACTIVO', id_direccion: dirIds[6], id_tipo_local: tipoIds['Almacen'], id_almacen: null },
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
  // 8. LOCALES - TIENDAS (5 tiendas)
  // ========================================
  const tiendas = [
    { id: 4, nombre: 'Tienda San Isidro Premium', imagen: 'https://example.com/tienda-si.jpg', estado: 'ACTIVO', id_direccion: dirIds[2], id_tipo_local: tipoIds['Tienda'], id_almacen: 1 },
    { id: 5, nombre: 'Tienda Surco Mall', imagen: 'https://example.com/tienda-surco.jpg', estado: 'ACTIVO', id_direccion: dirIds[3], id_tipo_local: tipoIds['Tienda'], id_almacen: 1 },
    { id: 6, nombre: 'Tienda Callao Plaza', imagen: 'https://example.com/tienda-callao.jpg', estado: 'ACTIVO', id_direccion: dirIds[8], id_tipo_local: tipoIds['Tienda'], id_almacen: 1 },
    { id: 7, nombre: 'Tienda Cusco Centro', imagen: 'https://example.com/tienda-cusco.jpg', estado: 'ACTIVO', id_direccion: dirIds[5], id_tipo_local: tipoIds['Tienda'], id_almacen: 2 },
    { id: 8, nombre: 'Tienda Arequipa Norte', imagen: 'https://example.com/tienda-aqp.jpg', estado: 'ACTIVO', id_direccion: dirIds[7], id_tipo_local: tipoIds['Tienda'], id_almacen: 3 },
  ];

  for (const tienda of tiendas) {
    await prisma.local.upsert({
      where: { id: tienda.id },
      update: { estado: tienda.estado },
      create: tienda,
    });
  }
  console.log('✅ Tiendas creadas (5)');

  console.log('\n✨ Seed de Store completado exitosamente!');
  console.log('📊 Total: 3 Departamentos | 4 Provincias | 8 Distritos | 8 Geopoints | 8 Direcciones | 3 Almacenes | 5 Tiendas\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
