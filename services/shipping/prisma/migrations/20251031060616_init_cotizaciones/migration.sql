-- CreateTable
CREATE TABLE "envio" (
    "id" SERIAL NOT NULL,
    "id_stock_producto" INTEGER NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "stock_reservado" INTEGER NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_carrier" INTEGER,
    "tracking_number" TEXT,
    "costo_envio" DOUBLE PRECISION,
    "tiempo_estimado_dias" INTEGER,
    "tipo_envio" TEXT NOT NULL DEFAULT 'DOMICILIO',
    "direccion_destino" JSONB,
    "peso_kg" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tipo" TEXT NOT NULL DEFAULT 'NACIONAL',
    "logo_url" TEXT,
    "tarifa_base" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tarifa_por_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tarifa_por_km" DOUBLE PRECISION,
    "tiempo_base_dias" INTEGER NOT NULL DEFAULT 3,
    "api_endpoint" TEXT,
    "api_key_encrypted" TEXT,
    "requiere_api" BOOLEAN NOT NULL DEFAULT false,
    "cobertura_nacional" BOOLEAN NOT NULL DEFAULT true,
    "cobertura_internacional" BOOLEAN NOT NULL DEFAULT false,
    "peso_maximo_kg" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion" (
    "id" TEXT NOT NULL,
    "origen_lat" DOUBLE PRECISION,
    "origen_lng" DOUBLE PRECISION,
    "origen_direccion" TEXT,
    "destino_lat" DOUBLE PRECISION,
    "destino_lng" DOUBLE PRECISION,
    "destino_direccion" TEXT,
    "distancia_km" DOUBLE PRECISION,
    "peso_kg" DOUBLE PRECISION,
    "dimensiones" JSONB,
    "valor_declarado" DOUBLE PRECISION,
    "tipo_envio" TEXT NOT NULL,
    "carrier_id" INTEGER,
    "carrier_nombre" TEXT,
    "costo_envio" DOUBLE PRECISION NOT NULL,
    "tiempo_estimado_dias" INTEGER NOT NULL,
    "fecha_entrega_estimada" TIMESTAMP(3),
    "cotizacion_valida_hasta" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carrier_nombre_key" ON "carrier"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "carrier_codigo_key" ON "carrier"("codigo");

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_id_carrier_fkey" FOREIGN KEY ("id_carrier") REFERENCES "carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
