
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import LocalController from '../../src/controllers/local.controller.js';

describe('LocalController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new LocalController(prismaMock);
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

    describe('getLocales', () => {
        it('should return locales', async () => {
            req.query = { page: '1', per_page: '10' };
            const mockData = [{ id: 1 }];
            prismaMock.local.findMany.mockResolvedValue(mockData);
            prismaMock.local.count.mockResolvedValue(1);

            await controller.getLocales(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockData }));
        });
    });
});
