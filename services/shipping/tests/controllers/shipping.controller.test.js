
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import ShippingController from '../../src/controllers/shipping.controller.js';

describe('ShippingController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new ShippingController(prismaMock);
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

    describe('getAllShipping', () => {
        it('should return shippings paginated with status 200', async () => {
            req.query = { page: '1', limit: '10' };
            const mockData = [{ id: 1 }];
            prismaMock.envio.findMany.mockResolvedValue(mockData);
            prismaMock.envio.count.mockResolvedValue(1);

            await controller.getAllShipping(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockData }));
        });
    });

    describe('createShipping', () => {
        // Use a function to get valid body to ensure future date
        const getValidBody = () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);
            return {
                id_stock_producto: 1,
                id_orden: 100,
                stock_reservado: 5,
                id_estado: 1,
                id_carrier: 1,
                fecha_expiracion: futureDate.toISOString()
            };
        };

        it('should create shipping successfully', async () => {
            const body = getValidBody();
            req.body = body;

            const created = { id: 1, ...body };

            prismaMock.carrier.findUnique.mockResolvedValue({ id: 1 });
            prismaMock.envio.create.mockResolvedValue(created);

            await controller.createShipping(req, res);

            expect(prismaMock.envio.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 404 if carrier not found', async () => {
            const body = getValidBody();
            req.body = body;

            prismaMock.carrier.findUnique.mockResolvedValue(null);

            await controller.createShipping(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Carrier no encontrado' }));
        });
    });

    describe('updateShipping', () => {
        it('should update shipping successfully', async () => {
            req.params.id = '1';
            req.body = { stock_reservado: 10 };
            const existing = { id: 1 };
            const updated = { id: 1, stock_reservado: 10 };

            prismaMock.envio.findUnique.mockResolvedValue(existing);
            prismaMock.envio.update.mockResolvedValue(updated);

            await controller.updateShipping(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if shipping not found', async () => {
            req.params.id = '1';
            prismaMock.envio.findUnique.mockResolvedValue(null);

            await controller.updateShipping(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteShipping', () => {
        it('should delete shipping successfully', async () => {
            req.params.id = '1';
            prismaMock.envio.delete.mockResolvedValue({ id: 1 });

            await controller.deleteShipping(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getExpiredShippings', () => {
        it('should return expired shippings', async () => {
            const mockData = [{ id: 1, fecha_expiracion: new Date() }];
            prismaMock.envio.findMany.mockResolvedValue(mockData);

            await controller.getExpiredShippings(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 1 }));
        });
    });
});
