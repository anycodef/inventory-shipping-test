import prisma from "../database/conexion.js";

export async function getLocalesByTipo(idTipoLocal) {
    return prisma.local.findMany({
        where: { id_tipo_local: Number(idTipoLocal) },
        include: {
            direccion: {
                include: {
                    distrito: {
                        include: {
                            provincia: { include: { departamento: true } },
                        },
                    },
                },
            },
        },
    });
}

export const saveDataFromCSV = async (id_tipo_local, rows) => {
    let errors = 0;
    let count = 0;
    for (const row of rows) {
        const { nombre, imagen, estado, direccion, distrito } = row;

        const dist = await prisma.distrito.findFirst({
            where: { nombre: distrito }
        });

        if (!dist) {
            console.warn(`Fila ${count + 1}: Distrito "${distrito}" no encontrado. Saltando fila.`);
            errors++;
            continue;
        }

        const geo = await prisma.geopoint.create({
            data: {
                latitud: 0,
                longitud: 0,
            },
        });

        const dir = await prisma.direccion.create({
            data: {
                referencia: direccion,
                id_distrito: dist.id,
                id_geopoint: geo.id,
            },
        });

        await prisma.local.upsert({
            where: { nombre },
            update: {
                imagen,
                estado,
                direccion: {
                    update: {
                        referencia: direccion,
                    },
                },
            },
            create: {
                nombre,
                imagen,
                estado: "ACTIVO",
                id_direccion: dir.id,
                id_tipo_local,
            },
        });

        count++;
    }

    return { count, errors };
};