
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import MovementController from '../../src/controllers/movement.controller.js';

describe('MovementController', () => {
    let movementController;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        // Create a deep mock of the Prisma client
        prismaMock = mockDeep();

        // Instantiate the controller with the mocked prisma client
        movementController = new MovementController(prismaMock);

        // Reset mock state
        mockReset(prismaMock);

        // Mock Response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock Request object (basic)
        req = {
            params: {},
            body: {}
        };
    });

    describe('getAllMovements', () => {
        it('should return all movements with status 200', async () => {
            const mockMovements = [
                { id: 1, cantidad: 10, tipo_movimiento: { name: 'IN' } },
                { id: 2, cantidad: 5, tipo_movimiento: { name: 'OUT' } }
            ];

            // Setup the mock return value
            prismaMock.movimiento.findMany.mockResolvedValue(mockMovements);

            await movementController.getAllMovements(req, res);

            expect(prismaMock.movimiento.findMany).toHaveBeenCalledWith({
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                },
                orderBy: {
                    fecha: 'desc'
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMovements);
        });

        it('should handle errors and return status 500', async () => {
            const errorMessage = "Database error";
            prismaMock.movimiento.findMany.mockRejectedValue(new Error(errorMessage));

            await movementController.getAllMovements(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    describe('getMovementById', () => {
        it('should return a movement if found with status 200', async () => {
            const mockMovement = { id: 1, cantidad: 10 };
            req.params.id = '1';

            prismaMock.movimiento.findUnique.mockResolvedValue(mockMovement);

            await movementController.getMovementById(req, res);

            expect(prismaMock.movimiento.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMovement);
        });

        it('should return 400 if ID is invalid', async () => {
            req.params.id = 'abc';

            await movementController.getMovementById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "ID inválido" });
        });

        it('should return 404 if movement not found', async () => {
            req.params.id = '999';
            prismaMock.movimiento.findUnique.mockResolvedValue(null);

            await movementController.getMovementById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Movimiento no encontrado" });
        });

        it('should handle errors and return status 500', async () => {
            req.params.id = '1';
            const errorMessage = "Database error";
            prismaMock.movimiento.findUnique.mockRejectedValue(new Error(errorMessage));

            await movementController.getMovementById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    describe('createMovement', () => {
        const validBody = {
            id_producto_almacen: 1,
            id_tipo: 2,
            cantidad: 100,
            fecha: '2023-10-27T00:00:00.000Z'
        };

        it('should create a new movement and return 201', async () => {
            req.body = validBody;
            const createdMovement = { id: 1, ...validBody };

            prismaMock.movimiento.create.mockResolvedValue(createdMovement);

            await movementController.createMovement(req, res);

            expect(prismaMock.movimiento.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdMovement);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { id_tipo: 2 }; // Missing others

            await movementController.createMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "id_producto_almacen, id_tipo y cantidad son requeridos"
            });
        });

        it('should return 400 if cantidad is <= 0', async () => {
            // Note: If cantidad is 0, the presence check (!cantidad) catches it first because 0 is falsy.
            // To test the explicit negative check, we send a negative number.
            req.body = { ...validBody, cantidad: -1 };

            await movementController.createMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "La cantidad debe ser mayor a 0" });
        });

        it('should return 400 if date format is invalid', async () => {
            req.body = { ...validBody, fecha: 'invalid-date' };

            await movementController.createMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Formato de fecha inválido" });
        });

        it('should return 404 if foreign key constraint fails (P2003)', async () => {
            req.body = validBody;
            const error = new Error('Foreign key constraint failed');
            error.code = 'P2003';

            prismaMock.movimiento.create.mockRejectedValue(error);

            await movementController.createMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "El producto almacén o tipo de movimiento especificado no existe"
            });
        });
    });

    describe('updateMovement', () => {
        it('should update a movement and return 200', async () => {
            req.params.id = '1';
            req.body = { cantidad: 50 };
            const updatedMovement = { id: 1, cantidad: 50 };

            prismaMock.movimiento.update.mockResolvedValue(updatedMovement);

            await movementController.updateMovement(req, res);

            expect(prismaMock.movimiento.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { cantidad: 50 },
                include: {
                    producto_almacen: true,
                    tipo_movimiento: true
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedMovement);
        });

        it('should return 404 if movement to update is not found (P2025)', async () => {
            req.params.id = '999';
            req.body = { cantidad: 50 };
            const error = new Error('Record to update not found');
            error.code = 'P2025';

            prismaMock.movimiento.update.mockRejectedValue(error);

            await movementController.updateMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Movimiento no encontrado" });
        });
    });

    describe('deleteMovement', () => {
        it('should delete a movement and return 200', async () => {
            req.params.id = '1';

            prismaMock.movimiento.delete.mockResolvedValue({ id: 1 });

            await movementController.deleteMovement(req, res);

            expect(prismaMock.movimiento.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Movimiento eliminado exitosamente" });
        });

        it('should return 404 if movement to delete is not found (P2025)', async () => {
            req.params.id = '999';
            const error = new Error('Record to delete not found');
            error.code = 'P2025';

            prismaMock.movimiento.delete.mockRejectedValue(error);

            await movementController.deleteMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Movimiento no encontrado" });
        });
    });
});
