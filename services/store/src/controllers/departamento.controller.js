class DepartamentoController {
    constructor (instacePrisma) {
        this.prisma = instacePrisma;
        this.Departamento = this.prisma.departamento;
    }

    // Obtener todos los departamentos
    async getDepartamentos(req, res) {
        try {
            const departamentos = await this.Departamento.findMany({
                include: {
                    provincias: true
                }
            });
            return res.status(200).json({
                success: true,
                data: departamentos
            });
        } catch (error) {
            console.error('Error al obtener departamentos:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al obtener departamentos',
                error: error.message
            });
        }
    }

    // Obtener un departamento por ID
    async getDepartamentoById(req, res) {
        try {
            const { id } = req.params;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            const departamento = await this.Departamento.findUnique({
                where: { id: idNumerico },
                include: {
                    provincias: true
                }
            });

            if (!departamento) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Departamento no encontrado' 
                });
            }

            return res.status(200).json({
                success: true,
                data: departamento
            });
        } catch (error) {
            console.error('Error al obtener departamento por ID:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al obtener departamento',
                error: error.message
            });
        }
    }

    // Crear un nuevo departamento
    async createDepartamento(req, res) {
        try {
            const { nombre } = req.body;

            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ 
                    success: false,
                    message: 'El nombre del departamento es requerido' 
                });
            }

            // Validar longitud
            if (nombre.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 50 caracteres'
                });
            }

            const nuevoDepartamento = await this.Departamento.create({
                data: { nombre: nombre.trim() }
            });

            return res.status(201).json({
                success: true,
                data: nuevoDepartamento,
                message: 'Departamento creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear departamento:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al crear departamento',
                error: error.message
            });
        }
    }

    // Actualizar un departamento existente
    async updateDepartamento(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ 
                    success: false,
                    message: 'El nombre del departamento es requerido' 
                });
            }

            // Validar longitud
            if (nombre.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 50 caracteres'
                });
            }

            // Verificar si el departamento existe
            const departamentoExistente = await this.Departamento.findUnique({
                where: { id: idNumerico }
            });

            if (!departamentoExistente) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Departamento no encontrado' 
                });
            }

            // Actualizar el departamento
            const departamentoActualizado = await this.Departamento.update({
                where: { id: idNumerico },
                data: { nombre: nombre.trim() }
            });

            return res.status(200).json({
                success: true,
                data: departamentoActualizado,
                message: 'Departamento actualizado exitosamente'
            });
        } catch (error) {
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Departamento no encontrado',
                    error: error.message
                });
            }

            console.error('Error al actualizar departamento:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Error al actualizar departamento',
                error: error.message
            });
        }
    }

    // Eliminar un departamento
    async deleteDepartamento(req, res) {
        try {
            const { id } = req.params;

            // Validar ID
            const idNumerico = parseInt(id);
            if (isNaN(idNumerico)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID debe ser un número válido'
                });
            }

            // Verificar si el departamento existe
            const departamentoExistente = await this.Departamento.findUnique({
                where: { id: idNumerico }
            });

            if (!departamentoExistente) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Departamento no encontrado' 
                });
            }

            // Eliminar el departamento
            await this.Departamento.delete({
                where: { id: idNumerico }
            });

            return res.status(200).json({ 
                success: true,
                message: 'Departamento eliminado correctamente',
                data: { id: idNumerico }
            });
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            
            // Manejo de errores específicos de Prisma
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    success: false,
                    message: 'No se puede eliminar el departamento porque tiene provincias asociadas',
                    error: error.message
                });
            }

            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Departamento no encontrado',
                    error: error.message
                });
            }
            
            return res.status(500).json({ 
                success: false,
                message: 'Error al eliminar departamento',
                error: error.message
            });
        }
    }
}

export default DepartamentoController;