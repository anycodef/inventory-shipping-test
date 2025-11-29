
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct absolute paths
const csvParserPath = resolve(__dirname, '../../src/utils/csvParser.js');
const modelPath = resolve(__dirname, '../../src/models/producto_local.model.js');
const controllerPath = resolve(__dirname, '../../src/controllers/producto_local.controller.js');

// Mock dependencies using unstable_mockModule BEFORE dynamic imports
jest.unstable_mockModule('fs', () => ({
    default: {
        unlinkSync: jest.fn()
    }
}));

jest.unstable_mockModule(csvParserPath, () => ({
    parseCSV: jest.fn()
}));

jest.unstable_mockModule(modelPath, () => ({
    upsertProductoAlmacen: jest.fn()
}));

// Import module under test and mocked dependencies
const { uploadCSV } = await import(controllerPath);
const fs = (await import('fs')).default;
const { parseCSV } = await import(csvParserPath);
const { upsertProductoAlmacen } = await import(modelPath);

describe('ProductoLocalController', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            file: { path: 'dummy/path.csv' },
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('uploadCSV', () => {
        it('should process CSV successfully', async () => {
            const mockRows = [
                { id_local: '1', id_producto: '100', stock_disponible: '50' },
                { id_local: '1', id_producto: '101', stock_disponible: '20' }
            ];

            parseCSV.mockResolvedValue(mockRows);
            upsertProductoAlmacen.mockResolvedValue({ id: 1 });

            await uploadCSV(req, res);

            expect(parseCSV).toHaveBeenCalledWith('dummy/path.csv', ["id_local", "id_producto", "stock_disponible"]);
            expect(upsertProductoAlmacen).toHaveBeenCalledTimes(2);
            expect(fs.unlinkSync).toHaveBeenCalledWith('dummy/path.csv');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Archivo procesado correctamente." }));
        });

        it('should return 400 if no file', async () => {
            req.file = null;
            await uploadCSV(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should handle errors', async () => {
            parseCSV.mockRejectedValue(new Error('Parse error'));
            await uploadCSV(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
