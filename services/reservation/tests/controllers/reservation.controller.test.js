
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct absolute paths for modules to mock
const inventoryServicePath = resolve(__dirname, '../../src/services/inventory.service.js');
const storeServicePath = resolve(__dirname, '../../src/services/store.service.js');
const shippingServicePath = resolve(__dirname, '../../src/services/shipping.service.js');

// Define mocks
const mockInventoryService = {
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
    findAvailableStock: jest.fn(),
    checkStockAvailability: jest.fn()
};

const mockStoreService = {
    validateStore: jest.fn()
};

const mockShippingService = {
    validateCarrier: jest.fn()
};

// Use unstable_mockModule with absolute paths
jest.unstable_mockModule(inventoryServicePath, () => ({
    default: mockInventoryService
}));

jest.unstable_mockModule(storeServicePath, () => ({
    default: mockStoreService
}));

jest.unstable_mockModule(shippingServicePath, () => ({
    default: mockShippingService
}));

// Dynamic imports using the same paths (or relative, as long as they resolve to same module)
// It is safer to use the path we used for mocking to import them for assertions,
// but the controller imports them relatively. Jest should link them.

const { default: ReservationController } = await import('../../src/controllers/reservation.controller.js');
// We import these just to have access to the mock objects for assertions.
// Since we passed the mock objects to the factory, we can just assertion on `mockInventoryService` directly!
// But importing them confirms the mock is applied.
const { default: inventoryService } = await import(inventoryServicePath);
const { default: storeService } = await import(storeServicePath);

describe('ReservationController', () => {
    let reservationController;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        reservationController = new ReservationController(prismaMock);
        mockReset(prismaMock);

        jest.clearAllMocks();

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

    describe('getAllReservation', () => {
        it('should return reservations with pagination and 200 status', async () => {
            req.query = { page: '1', per_page: '10' };
            const mockReservations = [{ id: 1 }];
            const total = 1;

            prismaMock.reserva.findMany.mockResolvedValue(mockReservations);
            prismaMock.reserva.count.mockResolvedValue(total);

            await reservationController.getAllReservation(req, res);

            expect(prismaMock.reserva.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockReservations,
                pagination: expect.anything()
            }));
        });
    });

    describe('createReservation', () => {
        const validBody = {
            id_stock_producto: 1,
            id_orden: 100,
            stock_reservado: 5,
            id_estado: 1,
            fecha_reserva: '2023-01-01T10:00:00Z'
        };

        it('should create reservation successfully', async () => {
            req.body = validBody;
            const createdReservation = { id: 1, ...validBody };

            // Setup mock behavior directly on the mock object
            mockInventoryService.reserveStock.mockResolvedValue(true);
            prismaMock.reserva.create.mockResolvedValue(createdReservation);

            await reservationController.createReservation(req, res);

            expect(mockInventoryService.reserveStock).toHaveBeenCalledWith(1, 5);
            expect(prismaMock.reserva.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdReservation);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { id_stock_producto: 1 };
            await reservationController.createReservation(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should handle inventory reservation failure (rollback)', async () => {
            req.body = validBody;
            const error = new Error('Stock insuficiente');
            error.code = 'INSUFFICIENT_STOCK';
            mockInventoryService.reserveStock.mockRejectedValue(error);

            await reservationController.createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(409); // 409 for insufficient stock
        });
    });

    describe('createReservationFromOrder', () => {
        const validOrderBody = {
            id_orden: 1001,
            productos: [{ id_producto: 1, cantidad: 2 }],
            tipo_envio: 'RECOJO_TIENDA',
            id_tienda: 50
        };

        it('should create reservations from order (Recojo Tienda)', async () => {
            req.body = validOrderBody;

            mockStoreService.validateStore.mockResolvedValue({ exists: true, isStore: true, active: true, data: {} });

            mockInventoryService.findAvailableStock.mockResolvedValue({
                id_stock_producto: 10,
                id_almacen: 5,
                stock_disponible: 100
            });

            mockInventoryService.checkStockAvailability.mockResolvedValue({
                available: true,
                stock_disponible: 100
            });

            mockInventoryService.reserveStock.mockResolvedValue(true);
            prismaMock.reserva.create.mockResolvedValue({ id: 99, id_orden: 1001 });

            await reservationController.createReservationFromOrder(req, res);

            expect(mockStoreService.validateStore).toHaveBeenCalledWith(50);
            expect(prismaMock.reserva.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should fail if store validation fails', async () => {
            req.body = validOrderBody;
            mockStoreService.validateStore.mockResolvedValue({ exists: false });

            await reservationController.createReservationFromOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('no existe') }));
        });
    });
});
