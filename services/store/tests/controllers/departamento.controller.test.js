
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import DepartamentoController from '../../src/controllers/departamento.controller.js';

describe('DepartamentoController', () => {
    let controller;
    let prismaMock;
    let req;
    let res;

    beforeEach(() => {
        prismaMock = mockDeep();
        controller = new DepartamentoController(prismaMock);
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

    describe('getDepartamentos', () => {
        it('should return all departments', async () => {
            prismaMock.departamento.findMany.mockResolvedValue([]);
            await controller.getDepartamentos(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('createDepartamento', () => {
        it('should create department', async () => {
            req.body = { nombre: 'Dept' };
            prismaMock.departamento.create.mockResolvedValue({ id: 1 });
            await controller.createDepartamento(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
