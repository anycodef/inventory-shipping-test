
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import DistritoController from '../../src/controllers/distrito.controller.js';

describe('DistritoController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new DistritoController(prismaMock);
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

    describe('getDistritos', () => {
        it('should return all districts', async () => {
            prismaMock.distrito.findMany.mockResolvedValue([]);
            await controller.getDistritos(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
