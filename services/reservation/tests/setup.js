
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Fix for Jest Resolver issue with manual mocks of external modules in setup file or just general confusion
// We are not mocking inventory.service.js here, we do it in the test file.

// Mock connection
jest.mock('../src/database/conexion.js', () => ({
  __esModule: true,
  default: mockDeep(),
}));

beforeEach(() => {
  // Clear any global mocks if used
});
