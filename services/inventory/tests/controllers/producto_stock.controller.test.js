
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct absolute paths
const modelPath = resolve(__dirname, '../../src/models/producto_stock.model.js');
const controllerPath = resolve(__dirname, '../../src/controllers/producto_stock.controller.js');

// Mock dependencies
jest.unstable_mockModule(modelPath, () => ({
    getProductosConStock: jest.fn(),
    getCategoriasProducto: jest.fn(),
    getStockPorProducto: jest.fn(),
    getStockPorAlmacen: jest.fn()
}));

const {
    obtenerStockGlobal,
    obtenerCategoriasProducto,
    obtenerStockPorProducto,
    obtenerStockPorAlmacen
} = await import(controllerPath);

const model = await import(modelPath);

describe('ProductoStockController', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            query: {},
            params: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('obtenerStockGlobal', () => {
        it('should return global stock data', async () => {
            req.query = { PageNumber: '2', PageSize: '10', Categoria: 'Test' };
            const mockData = { items: [], total: 0 };
            model.getProductosConStock.mockResolvedValue(mockData);

            await obtenerStockGlobal(req, res);

            expect(model.getProductosConStock).toHaveBeenCalledWith(2, 10, 'Test');
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should handle errors', async () => {
            model.getProductosConStock.mockRejectedValue(new Error('DB Error'));
            await obtenerStockGlobal(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('obtenerCategoriasProducto', () => {
        it('should return categories', async () => {
            const mockData = ['Cat1', 'Cat2'];
            model.getCategoriasProducto.mockResolvedValue(mockData);

            await obtenerCategoriasProducto(req, res);

            expect(model.getCategoriasProducto).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
        });
    });

    describe('obtenerStockPorProducto', () => {
        it('should return stock for product', async () => {
            req.params.id_producto = '100';
            const mockData = { stock: 50 };
            model.getStockPorProducto.mockResolvedValue(mockData);

            await obtenerStockPorProducto(req, res);

            expect(model.getStockPorProducto).toHaveBeenCalledWith(100, 1, 5); // Defaults
            expect(res.json).toHaveBeenCalledWith(mockData);
        });
    });

    describe('obtenerStockPorAlmacen', () => {
        it('should return stock for almacen', async () => {
            req.params.id_almacen = '5';
            const mockData = { stock: 20 };
            model.getStockPorAlmacen.mockResolvedValue(mockData);

            await obtenerStockPorAlmacen(req, res);

            expect(model.getStockPorAlmacen).toHaveBeenCalledWith(5, 1, 5);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });
    });
});
