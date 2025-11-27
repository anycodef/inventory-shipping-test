import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Inventory Service - Iniciando...\n');

  // ========================================
  // 1. TIPOS DE MOVIMIENTO (5 tipos)
  // ========================================
  const tipos = [
    { nombre: 'ENTRADA', descripcion: 'Entrada de productos al almacén' },
    { nombre: 'SALIDA', descripcion: 'Salida de productos del almacén' },
    { nombre: 'AJUSTE_POSITIVO', descripcion: 'Ajuste de inventario positivo' },
    { nombre: 'AJUSTE_NEGATIVO', descripcion: 'Ajuste de inventario negativo' },
    { nombre: 'TRANSFERENCIA', descripcion: 'Transferencia entre almacenes' },
  ];

  for (const tipo of tipos) {
    await prisma.tipoMovimiento.upsert({
      where: { nombre: tipo.nombre },
      update: { descripcion: tipo.descripcion },
      create: tipo,
    });
  }
  console.log('✅ Tipos de movimiento creados (5)');

  // ========================================
  // 2. PRODUCTOS EN ALMACÉN
  // ========================================
  // id_producto e id_almacen son FKs lógicas a otros servicios
  // id_producto: 101-105 (productos ficticios)
  // id_almacen: 1, 2, 3 (coincide con almacenes en store/warehouse)
  
  const productosAlmacen = [
    // Almacén Lima (id: 1) - Producto 101 y 102
    { id: 1, id_producto: 101, id_almacen: 1, stock_reservado: 10, stock_disponible: 140 },
    { id: 2, id_producto: 102, id_almacen: 1, stock_reservado: 5, stock_disponible: 45 },
    
    // Almacén Cusco (id: 2) - Producto 103 y 104
    { id: 3, id_producto: 103, id_almacen: 2, stock_reservado: 8, stock_disponible: 72 },
    { id: 4, id_producto: 104, id_almacen: 2, stock_reservado: 15, stock_disponible: 25 },

    // Almacén Arequipa (id: 3) - Producto 101 (compartido) y 105
    { id: 5, id_producto: 101, id_almacen: 3, stock_reservado: 5, stock_disponible: 195 },
    { id: 6, id_producto: 105, id_almacen: 3, stock_reservado: 0, stock_disponible: 60 },
    
    // Stock adicional en Lima - Producto 103 (compartido entre almacenes)
    { id: 7, id_producto: 103, id_almacen: 1, stock_reservado: 0, stock_disponible: 30 },
    
    // Stock adicional en Arequipa - Producto 102
    { id: 8, id_producto: 102, id_almacen: 3, stock_reservado: 0, stock_disponible: 50 },

    { id: 9, id_producto: 101, id_almacen: 4, stock_reservado: 10, stock_disponible: 140 },
    { id: 10, id_producto: 102, id_almacen: 4, stock_reservado: 5, stock_disponible: 45 },
    
    // Almacén Cusco (id: 2) - Producto 103 y 104
    { id: 11, id_producto: 103, id_almacen: 5, stock_reservado: 8, stock_disponible: 72 },
    { id: 12, id_producto: 104, id_almacen: 5, stock_reservado: 15, stock_disponible: 25 },
    
  ];

  for (const prod of productosAlmacen) {
    await prisma.productoAlmacen.upsert({
      where: { id: prod.id },
      update: {
        stock_disponible: prod.stock_disponible,
        stock_reservado: prod.stock_reservado,
      },
      create: prod,
    });
  }
  console.log('✅ Productos en almacén creados (12 registros de stock)');

  // ========================================
  // 3. MOVIMIENTOS HISTÓRICOS
  // ========================================
  const tipoIds = await prisma.tipoMovimiento.findMany();
  const idEntrada = tipoIds.find(t => t.nombre === 'ENTRADA').id;
  const idSalida = tipoIds.find(t => t.nombre === 'SALIDA').id;
  const idTransferencia = tipoIds.find(t => t.nombre === 'TRANSFERENCIA').id;

  const movimientos = [
    // Movimientos Almacén Lima
    { id: 1, id_producto_almacen: 1, id_tipo: idEntrada, cantidad: 100, fecha: new Date('2024-01-10') },
    { id: 2, id_producto_almacen: 1, id_tipo: idEntrada, cantidad: 50, fecha: new Date('2024-02-15') },
    { id: 3, id_producto_almacen: 2, id_tipo: idEntrada, cantidad: 50, fecha: new Date('2024-01-12') },
    { id: 4, id_producto_almacen: 2, id_tipo: idSalida, cantidad: 5, fecha: new Date('2024-03-20') },
    { id: 5, id_producto_almacen: 7, id_tipo: idEntrada, cantidad: 30, fecha: new Date('2024-02-01') },
    
    // Movimientos Almacén Cusco
    { id: 6, id_producto_almacen: 3, id_tipo: idEntrada, cantidad: 80, fecha: new Date('2024-01-15') },
    { id: 7, id_producto_almacen: 4, id_tipo: idEntrada, cantidad: 40, fecha: new Date('2024-01-20') },
    { id: 8, id_producto_almacen: 4, id_tipo: idSalida, cantidad: 10, fecha: new Date('2024-03-10') },
    
    // Movimientos Almacén Arequipa
    { id: 9, id_producto_almacen: 5, id_tipo: idEntrada, cantidad: 200, fecha: new Date('2024-01-18') },
    { id: 10, id_producto_almacen: 6, id_tipo: idEntrada, cantidad: 60, fecha: new Date('2024-02-05') },
    { id: 11, id_producto_almacen: 8, id_tipo: idEntrada, cantidad: 50, fecha: new Date('2024-02-10') },
    
    // Transferencias entre almacenes
    { id: 12, id_producto_almacen: 1, id_tipo: idTransferencia, cantidad: 10, fecha: new Date('2024-03-15') },
  ];

  for (const mov of movimientos) {
    const exists = await prisma.movimiento.findUnique({ where: { id: mov.id } });
    if (!exists) {
      await prisma.movimiento.create({ data: mov });
    }
  }
  console.log('✅ Movimientos históricos creados (12)');

  console.log('\n✨ Seed de Inventory completado exitosamente!');
  console.log('📊 Total: 5 Tipos Movimiento | 12 Stocks en Almacenes | 12 Movimientos\n');
  console.log('📦 Productos: 101-105 (FKs lógicas a servicio Products)');
  console.log('🏢 Almacenes: 1, 2, 3, 4, 5 (coinciden con Store/Warehouse)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
