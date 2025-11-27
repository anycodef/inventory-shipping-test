class TypeMovementController {
    constructor(prismaInstance) {
        this.prisma = prismaInstance;
        this.TypeMovement = this.prisma.tipoMovimiento;
    };

    async getAllTypeMovement(req, res) {
        try {
            const typeMovements = await this.TypeMovement.findMany();
            res.status(200).json(typeMovements);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getTypeMovementById(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const typeMovement = await this.TypeMovement.findUnique({
                where: { id: idNumerico }
            });

            if (!typeMovement) {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }

            res.status(200).json(typeMovement);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createTypeMovement(req, res) {
        try {
            const { nombre, descripcion } = req.body;

            if (!nombre) {
                return res.status(400).json({ message: "El nombre es requerido" });
            }

            const typeMovement = await this.TypeMovement.create({
                data: { nombre, descripcion }
            });

            res.status(201).json(typeMovement);
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(409).json({ message: "El nombre ya existe" });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async updateTypeMovement(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const typeMovement = await this.TypeMovement.update({
                where: { id: idNumerico },
                data: { nombre, descripcion }
            });

            res.status(200).json(typeMovement);
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async deleteTypeMovement(req, res) {
        try {
            const { id } = req.params;
            const idNumerico = parseInt(id);

            if (isNaN(idNumerico)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            await this.TypeMovement.delete({ where: { id: idNumerico } });
            res.status(200).json({ message: "Tipo de movimiento eliminado exitosamente" });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }
            res.status(500).json({ message: error.message });
        }
    }
}

export default TypeMovementController;
