-- CreateTable
CREATE TABLE "departamento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincia" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "id_departamento" INTEGER NOT NULL,

    CONSTRAINT "provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distrito" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "id_provincia" INTEGER NOT NULL,

    CONSTRAINT "distrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geopoint" (
    "id" SERIAL NOT NULL,
    "latitud" DECIMAL(65,30) NOT NULL,
    "longitud" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "geopoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direccion" (
    "id" SERIAL NOT NULL,
    "referencia" TEXT NOT NULL,
    "id_distrito" INTEGER NOT NULL,
    "id_geopoint" INTEGER NOT NULL,

    CONSTRAINT "direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_local" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(15) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "imagen" TEXT,
    "estado" VARCHAR(10) NOT NULL DEFAULT 'INACTIVO',
    "id_direccion" INTEGER NOT NULL,
    "id_tipo_local" INTEGER NOT NULL,

    CONSTRAINT "local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacen_tienda" (
    "id" SERIAL NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "id_tienda" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "almacen_tienda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departamento_nombre_key" ON "departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "provincia_nombre_id_departamento_key" ON "provincia"("nombre", "id_departamento");

-- CreateIndex
CREATE UNIQUE INDEX "distrito_nombre_id_provincia_key" ON "distrito"("nombre", "id_provincia");

-- CreateIndex
CREATE UNIQUE INDEX "direccion_id_geopoint_key" ON "direccion"("id_geopoint");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_local_nombre_key" ON "tipo_local"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "local_nombre_key" ON "local"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "local_id_direccion_key" ON "local"("id_direccion");

-- CreateIndex
CREATE UNIQUE INDEX "almacen_tienda_id_almacen_id_tienda_key" ON "almacen_tienda"("id_almacen", "id_tienda");

-- AddForeignKey
ALTER TABLE "provincia" ADD CONSTRAINT "provincia_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distrito" ADD CONSTRAINT "distrito_id_provincia_fkey" FOREIGN KEY ("id_provincia") REFERENCES "provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_id_distrito_fkey" FOREIGN KEY ("id_distrito") REFERENCES "distrito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_id_geopoint_fkey" FOREIGN KEY ("id_geopoint") REFERENCES "geopoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local" ADD CONSTRAINT "local_id_direccion_fkey" FOREIGN KEY ("id_direccion") REFERENCES "direccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local" ADD CONSTRAINT "local_id_tipo_local_fkey" FOREIGN KEY ("id_tipo_local") REFERENCES "tipo_local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "almacen_tienda" ADD CONSTRAINT "almacen_tienda_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "almacen_tienda" ADD CONSTRAINT "almacen_tienda_id_tienda_fkey" FOREIGN KEY ("id_tienda") REFERENCES "local"("id") ON DELETE CASCADE ON UPDATE CASCADE;
