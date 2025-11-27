class UbicacionController {
  constructor(prismaInstance) {
    this.prisma = prismaInstance;
    this.Departamento = this.prisma.departamento;
    this.Provincia = this.prisma.provincia;
    this.Distrito = this.prisma.distrito;
  }

  async getDepartamentos(req, res) {
    try {
      const departamentos = await this.Departamento.findMany();
      res.json({
        success: true,
        data: departamentos
      });
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener departamentos', 
        error: error.message 
      });
    }
  }

  async getProvincias(req, res) {
    try {
      const { id_departamento } = req.query;
      
      // Validar id_departamento si se proporciona
      if (id_departamento !== undefined) {
        const departamentoId = parseInt(id_departamento);
        if (isNaN(departamentoId)) {
          return res.status(400).json({
            success: false,
            message: 'id_departamento debe ser un número válido'
          });
        }
      }

      const where = id_departamento ? { id_departamento: parseInt(id_departamento) } : {};
      const provincias = await this.Provincia.findMany({ where });
      
      res.json({
        success: true,
        data: provincias
      });
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener provincias', 
        error: error.message 
      });
    }
  }

  async getDistritos(req, res) {
    try {
      const { id_provincia } = req.query;
      
      // Validar id_provincia si se proporciona
      if (id_provincia !== undefined) {
        const provinciaId = parseInt(id_provincia);
        if (isNaN(provinciaId)) {
          return res.status(400).json({
            success: false,
            message: 'id_provincia debe ser un número válido'
          });
        }
      }

      const where = id_provincia ? { id_provincia: parseInt(id_provincia) } : {};
      const distritos = await this.Distrito.findMany({ where });
      
      res.json({
        success: true,
        data: distritos
      });
    } catch (error) {
      console.error('Error al obtener distritos:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener distritos', 
        error: error.message 
      });
    }
  }
}

export default UbicacionController;