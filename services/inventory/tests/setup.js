// services/inventory/tests/setup.js
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';

// If we want to mock the module itself for files that import it directly:
jest.mock('../src/database/conexion.js', () => ({
  __esModule: true,
  default: mockDeep(),
}));

// We'll expose a global prismaMock if needed, but per-test instantiation is better.
// However, to satisfy jest config needing a setup file:
beforeEach(() => {
  // Clear any global mocks if used
});
