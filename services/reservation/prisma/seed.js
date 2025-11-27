import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Reservation Service - Iniciando...\n');

  // ========================================
  // 1. ESTADOS DE RESERVA (5 estados)
  // ========================================
  const estados = [
    { nombre: 'PENDING', descripcion: 'Reserva pendiente de confirmación' },
    { nombre: 'CONFIRMED', descripcion: 'Reserva confirmada y activa' },
    { nombre: 'EXPIRED', descripcion: 'Reserva expirada' },
    { nombre: 'CANCELLED', descripcion: 'Reserva cancelada' },
    { nombre: 'COMPLETED', descripcion: 'Reserva completada exitosamente' },
  ];

  for (const estado of estados) {
    await prisma.estadoReserva.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: estado,
    });
  }
  console.log('✅ Estados de reserva creados (5)');

  // ========================================
  // 2. RESERVAS
  // ========================================
  // id_stock_producto: referencia a ProductoAlmacen.id en inventory service (IDs: 1-8)
  // id_orden: FK lógica a servicio Orders (órdenes ficticias: 1001-1010)
  
  const estadoIds = await prisma.estadoReserva.findMany();
  const idPending = estadoIds.find(e => e.nombre === 'PENDING').id;
  const idConfirmed = estadoIds.find(e => e.nombre === 'CONFIRMED').id;
  const idCompleted = estadoIds.find(e => e.nombre === 'COMPLETED').id;
  const idExpired = estadoIds.find(e => e.nombre === 'EXPIRED').id;

  const reservas = [
    // Reservas activas (CONFIRMED)
    {
      id: 1,
      id_stock_producto: 1, // Producto 101 en Almacén Lima (stock_disponible: 140, stock_reservado: 10)
      id_orden: 1001,
      stock_reservado: 10,
      fecha_reserva: new Date('2024-03-21T10:00:00'),
      fecha_expiracion: new Date('2024-03-28T10:00:00'),
      id_estado: idConfirmed,
    },
    {
      id: 2,
      id_stock_producto: 2, // Producto 102 en Almacén Lima (stock_reservado: 5)
      id_orden: 1002,
      stock_reservado: 5,
      fecha_reserva: new Date('2024-03-22T14:30:00'),
      fecha_expiracion: new Date('2024-03-29T14:30:00'),
      id_estado: idConfirmed,
    },
    {
      id: 3,
      id_stock_producto: 3, // Producto 103 en Almacén Cusco (stock_reservado: 8)
      id_orden: 1003,
      stock_reservado: 8,
      fecha_reserva: new Date('2024-03-23T09:00:00'),
      fecha_expiracion: new Date('2024-03-30T09:00:00'),
      id_estado: idConfirmed,
    },
    {
      id: 4,
      id_stock_producto: 4, // Producto 104 en Almacén Cusco (stock_reservado: 15)
      id_orden: 1004,
      stock_reservado: 15,
      fecha_reserva: new Date('2024-03-20T11:00:00'),
      fecha_expiracion: new Date('2024-03-27T11:00:00'),
      id_estado: idConfirmed,
    },
    {
      id: 5,
      id_stock_producto: 5, // Producto 101 en Almacén Arequipa (stock_reservado: 5)
      id_orden: 1005,
      stock_reservado: 5,
      fecha_reserva: new Date('2024-03-24T16:00:00'),
      fecha_expiracion: new Date('2024-03-31T16:00:00'),
      id_estado: idConfirmed,
    },
    
    // Reservas pendientes (PENDING)
    {
      id: 6,
      id_stock_producto: 6, // Producto 105 en Almacén Arequipa
      id_orden: 1006,
      stock_reservado: 0,
      fecha_reserva: new Date('2024-03-25T13:00:00'),
      fecha_expiracion: new Date('2024-04-01T13:00:00'),
      id_estado: idPending,
    },
    
    // Reservas completadas (COMPLETED)
    {
      id: 7,
      id_stock_producto: 1,
      id_orden: 1007,
      stock_reservado: 0,
      fecha_reserva: new Date('2024-03-10T10:00:00'),
      fecha_expiracion: new Date('2024-03-17T10:00:00'),
      id_estado: idCompleted,
    },
    {
      id: 8,
      id_stock_producto: 2,
      id_orden: 1008,
      stock_reservado: 0,
      fecha_reserva: new Date('2024-03-12T15:00:00'),
      fecha_expiracion: new Date('2024-03-19T15:00:00'),
      id_estado: idCompleted,
    },
    
    // Reserva expirada (EXPIRED)
    {
      id: 9,
      id_stock_producto: 7,
      id_orden: 1009,
      stock_reservado: 0,
      fecha_reserva: new Date('2024-03-05T09:00:00'),
      fecha_expiracion: new Date('2024-03-12T09:00:00'),
      id_estado: idExpired,
    },
  ];

  for (const reserva of reservas) {
    const exists = await prisma.reserva.findUnique({ where: { id: reserva.id } });
    if (!exists) {
      await prisma.reserva.create({ data: reserva });
    }
  }
  console.log('✅ Reservas creadas (9)');

  console.log('\n✨ Seed de Reservation completado exitosamente!');
  console.log('📊 Total: 5 Estados | 9 Reservas (5 confirmadas, 1 pendiente, 2 completadas, 1 expirada)\n');
  console.log('📦 Stock IDs: 1-7 (coinciden con ProductoAlmacen en Inventory)');
  console.log('🛒 Órdenes: 1001-1009 (FKs lógicas a servicio Orders)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
