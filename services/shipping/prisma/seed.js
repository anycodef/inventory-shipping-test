import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Shipping Service - Iniciando...\n');

  // ========================================
  // 1. CARRIERS (Transportistas - Fake para desarrollo)
  // ========================================
  const carriers = [
    {
      id: 1,
      nombre: 'FedEx Express',
      codigo: 'FEDEX',
      tipo: 'INTERNACIONAL',
      activo: true,
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg',
      tarifa_base: 25.00,
      tarifa_por_kg: 8.50,
      tarifa_por_km: 0.15,
      tiempo_base_dias: 2,
      cobertura_nacional: true,
      cobertura_internacional: true,
      peso_maximo_kg: 68,
      requiere_api: false, // En el futuro será true
      api_endpoint: null,
      api_key_encrypted: null,
    },
    {
      id: 2,
      nombre: 'DHL Express',
      codigo: 'DHL',
      tipo: 'INTERNACIONAL',
      activo: true,
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg',
      tarifa_base: 30.00,
      tarifa_por_kg: 9.00,
      tarifa_por_km: 0.18,
      tiempo_base_dias: 1,
      cobertura_nacional: true,
      cobertura_internacional: true,
      peso_maximo_kg: 70,
      requiere_api: false,
      api_endpoint: null,
      api_key_encrypted: null,
    },
    {
      id: 3,
      nombre: 'Servientrega',
      codigo: 'SERV',
      tipo: 'NACIONAL',
      activo: true,
      logo_url: null,
      tarifa_base: 15.00,
      tarifa_por_kg: 5.00,
      tarifa_por_km: 0.10,
      tiempo_base_dias: 3,
      cobertura_nacional: true,
      cobertura_internacional: false,
      peso_maximo_kg: 50,
      requiere_api: false,
      api_endpoint: null,
      api_key_encrypted: null,
    },
  ];

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { id: carrier.id },
      update: carrier,
      create: carrier,
    });
  }
  console.log('✅ Carriers creados (3 fake: FedEx, DHL, Servientrega)');

  // ========================================
  // 2. ENVÍOS (Ejemplos básicos)
  // ========================================
  const envios = [
    // Envío con FedEx
    {
      id: 1,
      id_stock_producto: 1,
      id_orden: 1001,
      stock_reservado: 10,
      fecha_reserva: new Date('2024-03-21T10:00:00'),
      fecha_expiracion: new Date('2024-03-28T10:00:00'),
      id_estado: 2, // EN_TRANSITO
      id_carrier: 1, // FedEx
      tracking_number: 'FEDEX123456',
      costo_envio: 45.50,
      tiempo_estimado_dias: 2,
      tipo_envio: 'DOMICILIO',
      peso_kg: 2.5,
    },
    // Envío con DHL
    {
      id: 2,
      id_stock_producto: 2,
      id_orden: 1002,
      stock_reservado: 5,
      fecha_reserva: new Date('2024-03-22T14:30:00'),
      fecha_expiracion: new Date('2024-03-29T14:30:00'),
      id_estado: 2, // EN_TRANSITO
      id_carrier: 2, // DHL
      tracking_number: 'DHL789012',
      costo_envio: 55.00,
      tiempo_estimado_dias: 1,
      tipo_envio: 'DOMICILIO',
      peso_kg: 3.0,
    },
    // Envío recojo en tienda
    {
      id: 3,
      id_stock_producto: 3,
      id_orden: 1003,
      stock_reservado: 8,
      fecha_reserva: new Date('2024-03-23T09:00:00'),
      fecha_expiracion: new Date('2024-03-30T09:00:00'),
      id_estado: 1, // PENDIENTE
      id_carrier: null, // Sin carrier
      tracking_number: null,
      costo_envio: 0,
      tiempo_estimado_dias: 0,
      tipo_envio: 'RECOJO_TIENDA',
      peso_kg: 1.5,
    },
    // Envío entregado con Servientrega
    {
      id: 4,
      id_stock_producto: 4,
      id_orden: 1004,
      stock_reservado: 0,
      fecha_reserva: new Date('2024-03-10T10:00:00'),
      fecha_expiracion: new Date('2024-03-17T10:00:00'),
      id_estado: 3, // ENTREGADO
      id_carrier: 3, // Servientrega
      tracking_number: 'SERV345678',
      costo_envio: 28.00,
      tiempo_estimado_dias: 3,
      tipo_envio: 'DOMICILIO',
      peso_kg: 1.8,
    },
  ];

  for (const envio of envios) {
    const exists = await prisma.envio.findUnique({ where: { id: envio.id } });
    if (!exists) {
      await prisma.envio.create({ data: envio });
    }
  }
  console.log('✅ Envíos creados (4 ejemplos)');

  console.log('\n✨ Seed de Shipping completado exitosamente!');
  console.log('📊 Total: 3 Carriers (FedEx, DHL, Servientrega) | 4 Envíos de ejemplo');
  console.log('🚚 Estados: 1=PENDIENTE, 2=EN_TRANSITO, 3=ENTREGADO');
  console.log('📦 Tipos: DOMICILIO, RECOJO_TIENDA');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
