
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import AlmacenController from '../../src/controllers/almacen.controller.js';

describe('AlmacenController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new AlmacenController(prismaMock);
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

    describe('getAlmacenTypeId', () => {
        it('should return ID of Almacen type', async () => {
            // The code explicitly searches for 'Almacen'
            prismaMock.tipoLocal.findFirst.mockResolvedValue({ id: 10, nombre: 'Almacen' });
            const id = await controller.getAlmacenTypeId();
            expect(id).toBe(10);
        });
    });

    describe('getAlmacenes', () => {
        it('should return warehouses', async () => {
            req.query = { page: '1', per_page: '10' };
            const mockData = [{ id: 1, nombre: 'A1', direccion: { distrito: { provincia: { departamento: {} } } } }];

            // Mock getAlmacenTypeId call inside
            prismaMock.tipoLocal.findFirst.mockResolvedValue({ id: 10, nombre: 'Almacen' });

            prismaMock.local.findMany.mockResolvedValue(mockData);
            prismaMock.local.count.mockResolvedValue(1);

            await controller.getAlmacenes(req, res);

            // The controller calls res.json directly (implying 200) without calling res.status(200) explicitly
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('createAlmacen', () => {
        it('should create warehouse successfully', async () => {
            // Structure matches what controller expects: nested objects
            req.body = {
                nombre: 'A1',
                direccion: {
                    referencia: 'Ref',
                    id_distrito: 1
                },
                geopoint: {
                    latitud: 10,
                    longitud: 20
                },
                estado: 'ACTIVO'
            };

            prismaMock.tipoLocal.findFirst.mockResolvedValue({ id: 10, nombre: 'Almacen' });

            // Mock transaction
            prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));

            prismaMock.geopoint.create.mockResolvedValue({ id: 100 });
            prismaMock.direccion.create.mockResolvedValue({ id: 200 });
            prismaMock.local.create.mockResolvedValue({
                id: 1,
                nombre: 'A1',
                direccion: { distrito: { provincia: { departamento: {} } } }
            });

            await controller.createAlmacen(req, res);

            // Controller calls res.status(201).json(...)
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
