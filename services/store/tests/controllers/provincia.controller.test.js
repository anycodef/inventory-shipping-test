
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import ProvinciaController from '../../src/controllers/provincia.controller.js';

describe('ProvinciaController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new ProvinciaController(prismaMock);
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

    describe('getProvincias', () => {
        it('should return all provinces', async () => {
            prismaMock.provincia.findMany.mockResolvedValue([]);
            await controller.getProvincias(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
