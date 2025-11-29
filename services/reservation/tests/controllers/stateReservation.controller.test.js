
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import StateReservationController from '../../src/controllers/stateReservation.controller.js';

describe('StateReservationController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new StateReservationController(prismaMock);
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

    describe('getAllStateReservation', () => {
        it('should return all states with status 200', async () => {
            const mockStates = [{ id: 1, nombre: 'PENDIENTE' }];
            prismaMock.estadoReserva.findMany.mockResolvedValue(mockStates);

            await controller.getAllStateReservation(req, res);

            expect(prismaMock.estadoReserva.findMany).toHaveBeenCalledWith({ orderBy: { nombre: 'asc' } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockStates);
        });

        it('should handle errors and return 500', async () => {
            prismaMock.estadoReserva.findMany.mockRejectedValue(new Error('DB Error'));
            await controller.getAllStateReservation(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getStateReservationById', () => {
        it('should return state if found', async () => {
            req.params.id = '1';
            const mockState = { id: 1, nombre: 'PENDIENTE' };
            prismaMock.estadoReserva.findUnique.mockResolvedValue(mockState);

            await controller.getStateReservationById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockState);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            prismaMock.estadoReserva.findUnique.mockResolvedValue(null);
            await controller.getStateReservationById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 400 for invalid ID', async () => {
            req.params.id = 'abc';
            await controller.getStateReservationById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('createStateReservation', () => {
        it('should create state successfully', async () => {
            req.body = { nombre: 'NUEVO', descripcion: 'desc' };
            const created = { id: 1, ...req.body };
            prismaMock.estadoReserva.create.mockResolvedValue(created);

            await controller.createStateReservation(req, res);

            expect(prismaMock.estadoReserva.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it('should return 400 if nombre is missing', async () => {
            req.body = {};
            await controller.createStateReservation(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if name exists', async () => {
            req.body = { nombre: 'EXISTE' };
            const error = new Error('Unique constraint');
            error.code = 'P2002';
            prismaMock.estadoReserva.create.mockRejectedValue(error);

            await controller.createStateReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('updateStateReservation', () => {
        it('should update state successfully', async () => {
            req.params.id = '1';
            req.body = { nombre: 'UPDATED' };
            const updated = { id: 1, nombre: 'UPDATED' };
            prismaMock.estadoReserva.update.mockResolvedValue(updated);

            await controller.updateStateReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            req.body = { nombre: 'UPDATED' };
            const error = new Error('Not found');
            error.code = 'P2025';
            prismaMock.estadoReserva.update.mockRejectedValue(error);

            await controller.updateStateReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteStateReservation', () => {
        it('should delete state successfully', async () => {
            req.params.id = '1';
            prismaMock.estadoReserva.delete.mockResolvedValue({ id: 1 });

            await controller.deleteStateReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if state has associated reservations', async () => {
            req.params.id = '1';
            const error = new Error('Foreign key');
            error.code = 'P2003';
            prismaMock.estadoReserva.delete.mockRejectedValue(error);

            await controller.deleteStateReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
