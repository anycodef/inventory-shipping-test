
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import TipoLocalController from '../../src/controllers/tipolocal.controller.js';

describe('TipoLocalController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new TipoLocalController(prismaMock);
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

    describe('getTiposLocal', () => {
        it('should return all local types', async () => {
            prismaMock.tipoLocal.findMany.mockResolvedValue([]);
            await controller.getTiposLocal(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
