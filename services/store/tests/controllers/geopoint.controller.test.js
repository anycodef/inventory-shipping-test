
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import GeoPointController from '../../src/controllers/geopoint.controller.js';

describe('GeoPointController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new GeoPointController(prismaMock);
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

    describe('getGeoPoints', () => {
        it('should return geopoints', async () => {
            const mockData = [{ id: 1, latitud: 10, longitud: 20 }];
            prismaMock.geopoint.findMany.mockResolvedValue(mockData);

            await controller.getGeoPoints(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockData }));
        });
    });

    describe('createGeoPoint', () => {
        it('should create geopoint', async () => {
            req.body = { latitud: 10, longitud: 20 };
            const created = { id: 1, latitud: 10, longitud: 20 };
            prismaMock.geopoint.create.mockResolvedValue(created);

            await controller.createGeoPoint(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: created }));
        });

        it('should return 400 if lat/long missing', async () => {
            req.body = { latitud: 10 };
            await controller.createGeoPoint(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
