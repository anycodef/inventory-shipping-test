
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import StockProductController from '../../src/controllers/stockProduct.controller.js';

describe('StockProductController', () => {
    let stockProductController;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        stockProductController = new StockProductController(prismaMock);
        mockReset(prismaMock);

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        req = {
            params: {},
            body: {}
        };
    });

    describe('getAllStockProducts', () => {
        it('should return all stock products with 200 status', async () => {
            const mockData = [{ id: 1, stock_disponible: 10 }];
            // The controller filters out whereClause if empty, so it might call with specific include
            prismaMock.productoAlmacen.findMany.mockResolvedValue(mockData);

            // Mock query parameters to be empty to trigger "getAll" behavior
            req.query = {};

            await stockProductController.getAllStockProducts(req, res);

            expect(prismaMock.productoAlmacen.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should filter by id_almacen', async () => {
            req.query = { id_almacen: '5' };
            const mockData = [];
            prismaMock.productoAlmacen.findMany.mockResolvedValue(mockData);

            await stockProductController.getAllStockProducts(req, res);

            expect(prismaMock.productoAlmacen.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ id_almacen: 5 })
            }));
        });

        it('should handle errors and return 500', async () => {
            req.query = {};
            prismaMock.productoAlmacen.findMany.mockRejectedValue(new Error('DB Error'));
            await stockProductController.getAllStockProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getStockProductById', () => {
        it('should return stock product if found', async () => {
            req.params.id = '1';
            const mockData = { id: 1 };
            prismaMock.productoAlmacen.findUnique.mockResolvedValue(mockData);

            await stockProductController.getStockProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            prismaMock.productoAlmacen.findUnique.mockResolvedValue(null);

            await stockProductController.getStockProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 400 for invalid ID', async () => {
            req.params.id = 'abc';
            await stockProductController.getStockProductById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('createStockProduct', () => {
        const validBody = {
            id_producto: 1,
            id_almacen: 1,
            stock_disponible: 100,
            stock_reservado: 0
        };

        it('should create stock product successfully', async () => {
            req.body = validBody;
            const created = { id: 1, ...validBody };
            prismaMock.productoAlmacen.create.mockResolvedValue(created);

            await stockProductController.createStockProduct(req, res);

            expect(prismaMock.productoAlmacen.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { id_producto: 1 };
            await stockProductController.createStockProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if unique constraint violated (already exists)', async () => {
            req.body = validBody;
            const error = new Error('Unique constraint failed');
            error.code = 'P2002';
            prismaMock.productoAlmacen.create.mockRejectedValue(error);

            await stockProductController.createStockProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('updateStockProduct', () => {
        it('should update stock product successfully', async () => {
            req.params.id = '1';
            req.body = { stock_disponible: 50 };
            const updated = { id: 1, stock_disponible: 50 };
            prismaMock.productoAlmacen.update.mockResolvedValue(updated);

            await stockProductController.updateStockProduct(req, res);

            expect(prismaMock.productoAlmacen.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 for negative stock', async () => {
            req.params.id = '1';
            req.body = { stock_disponible: -10 };
            await stockProductController.updateStockProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if not found', async () => {
            req.params.id = '1';
            req.body = { stock_disponible: 50 };
            const error = new Error('Record not found');
            error.code = 'P2025';
            prismaMock.productoAlmacen.update.mockRejectedValue(error);

            await stockProductController.updateStockProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteStockProduct', () => {
        it('should delete stock product successfully', async () => {
            req.params.id = '1';
            prismaMock.productoAlmacen.delete.mockResolvedValue({ id: 1 });

            await stockProductController.deleteStockProduct(req, res);

            expect(prismaMock.productoAlmacen.delete).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 409 if related records exist (movements)', async () => {
            req.params.id = '1';
            const error = new Error('Foreign key constraint');
            error.code = 'P2003';
            prismaMock.productoAlmacen.delete.mockRejectedValue(error);

            await stockProductController.deleteStockProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('getStockByProducts', () => {
        it('should return consolidated stock for products', async () => {
            req.body = { productIds: [1] };
            const mockStock = [{ id_producto: 1, id_almacen: 10, stock_disponible: 50, stock_reservado: 0 }];
            prismaMock.productoAlmacen.findMany.mockResolvedValue(mockStock);

            await stockProductController.getStockByProducts(req, res);

            expect(prismaMock.productoAlmacen.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id_producto: 1, stock_total: 50 })
            ]));
        });

        it('should return 400 for invalid input', async () => {
            req.body = { productIds: [] };
            await stockProductController.getStockByProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
