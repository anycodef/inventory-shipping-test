
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import UbicacionController from '../../src/controllers/ubicacion.controller.js';

describe('UbicacionController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new UbicacionController(prismaMock);
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

    describe('getDepartamentos', () => {
        it('should return departments', async () => {
            prismaMock.departamento.findMany.mockResolvedValue([]);
            await controller.getDepartamentos(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
