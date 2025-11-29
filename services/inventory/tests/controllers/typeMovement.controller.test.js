
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import TypeMovementController from '../../src/controllers/typeMovement.controller.js';

describe('TypeMovementController', () => {
    let typeMovementController;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        typeMovementController = new TypeMovementController(prismaMock);
        mockReset(prismaMock);

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        req = {
            params: {},
            body: {}
        };
    });

    describe('getAllTypeMovement', () => {
        it('should return all types', async () => {
            const mockData = [{ id: 1, nombre: 'IN' }];
            prismaMock.tipoMovimiento.findMany.mockResolvedValue(mockData);

            await typeMovementController.getAllTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });
    });

    describe('getTypeMovementById', () => {
        it('should return type if found', async () => {
            req.params.id = '1';
            const mockData = { id: 1, nombre: 'IN' };
            prismaMock.tipoMovimiento.findUnique.mockResolvedValue(mockData);

            await typeMovementController.getTypeMovementById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            prismaMock.tipoMovimiento.findUnique.mockResolvedValue(null);
            await typeMovementController.getTypeMovementById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createTypeMovement', () => {
        it('should create type', async () => {
            req.body = { nombre: 'NEW', descripcion: 'New type' };
            const created = { id: 1, ...req.body };
            prismaMock.tipoMovimiento.create.mockResolvedValue(created);

            await typeMovementController.createTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it('should return 409 if name exists', async () => {
            req.body = { nombre: 'EXISTING' };
            const error = new Error('Unique constraint');
            error.code = 'P2002';
            prismaMock.tipoMovimiento.create.mockRejectedValue(error);

            await typeMovementController.createTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('updateTypeMovement', () => {
        it('should update type', async () => {
            req.params.id = '1';
            req.body = { nombre: 'UPDATED' };
            const updated = { id: 1, nombre: 'UPDATED' };
            prismaMock.tipoMovimiento.update.mockResolvedValue(updated);

            await typeMovementController.updateTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            const error = new Error('Not found');
            error.code = 'P2025';
            prismaMock.tipoMovimiento.update.mockRejectedValue(error);

            await typeMovementController.updateTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteTypeMovement', () => {
        it('should delete type', async () => {
            req.params.id = '1';
            prismaMock.tipoMovimiento.delete.mockResolvedValue({ id: 1 });

            await typeMovementController.deleteTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            const error = new Error('Not found');
            error.code = 'P2025';
            prismaMock.tipoMovimiento.delete.mockRejectedValue(error);

            await typeMovementController.deleteTypeMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
