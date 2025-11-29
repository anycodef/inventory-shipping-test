
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import CarrierController from '../../src/controllers/carrier.controller.js';

describe('CarrierController', () => {
    let carrierController;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        carrierController = new CarrierController(prismaMock);
        mockReset(prismaMock);

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        req = {
            params: {},
            query: {},
            body: {}
        };
    });

    describe('getAllCarriers', () => {
        it('should return all carriers with 200 status', async () => {
            const mockCarriers = [{ id: 1, nombre: 'Carrier1' }];
            prismaMock.carrier.findMany.mockResolvedValue(mockCarriers);

            await carrierController.getAllCarriers(req, res);

            expect(prismaMock.carrier.findMany).toHaveBeenCalledWith({ orderBy: { nombre: 'asc' } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCarriers
            });
        });

        it('should handle errors and return 500', async () => {
            prismaMock.carrier.findMany.mockRejectedValue(new Error('DB Error'));

            await carrierController.getAllCarriers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'Error al obtener carriers' }));
        });
    });

    describe('getCarrierById', () => {
        it('should return carrier if found', async () => {
            req.params.id = '1';
            const mockCarrier = { id: 1, nombre: 'Carrier1' };
            prismaMock.carrier.findUnique.mockResolvedValue(mockCarrier);

            await carrierController.getCarrierById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCarrier
            });
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            prismaMock.carrier.findUnique.mockResolvedValue(null);

            await carrierController.getCarrierById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Carrier no encontrado' }));
        });

        it('should return 400 for invalid ID', async () => {
            req.params.id = 'abc';
            await carrierController.getCarrierById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('createCarrier', () => {
        const validBody = { nombre: 'DHL', tarifa_por_hora: 50 };

        it('should create carrier successfully', async () => {
            req.body = validBody;
            const createdCarrier = { id: 1, ...validBody };
            prismaMock.carrier.create.mockResolvedValue(createdCarrier);

            await carrierController.createCarrier(req, res);

            expect(prismaMock.carrier.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: createdCarrier }));
        });

        it('should return 400 if nombre is missing', async () => {
            req.body = { tarifa_por_hora: 50 };
            await carrierController.createCarrier(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if name already exists (P2002)', async () => {
            req.body = validBody;
            const error = new Error('Unique constraint failed');
            error.code = 'P2002';
            prismaMock.carrier.create.mockRejectedValue(error);

            await carrierController.createCarrier(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('updateCarrier', () => {
        it('should update carrier successfully', async () => {
            req.params.id = '1';
            req.body = { nombre: 'FedEx' };
            const updatedCarrier = { id: 1, nombre: 'FedEx', tarifa_por_hora: 50 };
            prismaMock.carrier.update.mockResolvedValue(updatedCarrier);

            await carrierController.updateCarrier(req, res);

            expect(prismaMock.carrier.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: updatedCarrier }));
        });

        it('should return 404 if carrier not found', async () => {
            req.params.id = '1';
            req.body = { nombre: 'FedEx' };
            const error = new Error('Record not found');
            error.code = 'P2025';
            prismaMock.carrier.update.mockRejectedValue(error);

            await carrierController.updateCarrier(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteCarrier', () => {
        it('should delete carrier successfully if no shipments', async () => {
            req.params.id = '1';
            prismaMock.carrier.findUnique.mockResolvedValue({ id: 1, envio: [] });
            prismaMock.carrier.delete.mockResolvedValue({ id: 1 });

            await carrierController.deleteCarrier(req, res);

            expect(prismaMock.carrier.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 409 if carrier has shipments', async () => {
            req.params.id = '1';
            prismaMock.carrier.findUnique.mockResolvedValue({ id: 1, envio: [{ id: 100 }] });

            await carrierController.deleteCarrier(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('tiene envíos asociados') }));
        });

         it('should return 404 if carrier not found', async () => {
            req.params.id = '1';
            prismaMock.carrier.findUnique.mockResolvedValue(null);

            await carrierController.deleteCarrier(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
