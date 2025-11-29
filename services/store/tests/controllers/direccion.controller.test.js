
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import DireccionController from '../../src/controllers/direccion.controller.js';

describe('DireccionController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new DireccionController(prismaMock);
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

    describe('createDireccion', () => {
        it('should create address successfully', async () => {
            req.body = {
                referencia: 'Ref',
                id_distrito: 1,
                id_geopoint: 10
            };

            // Mock dependencies exist checks
            prismaMock.distrito.findUnique.mockResolvedValue({ id: 1 });
            prismaMock.geopoint.findUnique.mockResolvedValue({ id: 10 });

            // Mock unique check (ensure no existing address for this geopoint)
            prismaMock.direccion.findUnique.mockResolvedValue(null);

            const created = { id: 1, ...req.body };
            prismaMock.direccion.create.mockResolvedValue(created);

            await controller.createDireccion(req, res);

            expect(prismaMock.direccion.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if geopoint already has address', async () => {
            req.body = { referencia: 'Ref', id_distrito: 1, id_geopoint: 10 };

            prismaMock.distrito.findUnique.mockResolvedValue({ id: 1 });
            prismaMock.geopoint.findUnique.mockResolvedValue({ id: 10 });
            prismaMock.direccion.findUnique.mockResolvedValue({ id: 99 }); // Exists!

            await controller.createDireccion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
