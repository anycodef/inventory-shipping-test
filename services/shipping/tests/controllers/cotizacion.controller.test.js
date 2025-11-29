
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servicePath = resolve(__dirname, '../../src/services/cotizacion.service.js');
const controllerPath = resolve(__dirname, '../../src/controllers/cotizacion.controller.js');

// Mock service
const mockCotizacionService = {
    obtenerCotizaciones: jest.fn(),
    obtenerHistorial: jest.fn(),
    obtenerCotizacionPorId: jest.fn(),
    listarCarriers: jest.fn()
};

jest.unstable_mockModule(servicePath, () => ({
    default: mockCotizacionService
}));

// Import the module under test
const controller = await import(controllerPath);

describe('CotizacionController', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        req = {
            body: {},
            query: {},
            params: {}
        };
    });

    describe('obtenerCotizaciones', () => {
        it('should return quotations successfully', async () => {
            req.body = {
                destino_lat: 10,
                destino_lng: 20,
                destino_direccion: 'Calle 123'
            };
            const mockResult = [{ carrier: 'DHL', costo: 100 }];
            mockCotizacionService.obtenerCotizaciones.mockResolvedValue(mockResult);

            await controller.obtenerCotizaciones(req, res);

            expect(mockCotizacionService.obtenerCotizaciones).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 if coordinates are missing', async () => {
            req.body = { destino_direccion: 'Calle 123' };
            await controller.obtenerCotizaciones(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should handle errors', async () => {
            req.body = { destino_lat: 10, destino_lng: 20, destino_direccion: 'A' };
            mockCotizacionService.obtenerCotizaciones.mockRejectedValue(new Error('Service Error'));

            await controller.obtenerCotizaciones(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('obtenerHistorial', () => {
        it('should return history', async () => {
            mockCotizacionService.obtenerHistorial.mockResolvedValue([]);
            await controller.obtenerHistorial(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('obtenerCotizacionPorId', () => {
        it('should return quotation by id', async () => {
            req.params.id = '1';
            mockCotizacionService.obtenerCotizacionPorId.mockResolvedValue({ id: 1 });
            await controller.obtenerCotizacionPorId(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            mockCotizacionService.obtenerCotizacionPorId.mockResolvedValue(null);
            await controller.obtenerCotizacionPorId(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('listarCarriers', () => {
        it('should list carriers', async () => {
            mockCotizacionService.listarCarriers.mockResolvedValue([]);
            await controller.listarCarriers(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
