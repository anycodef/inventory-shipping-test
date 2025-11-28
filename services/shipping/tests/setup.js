
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock connection
jest.mock('../src/database/conexion.js', () => ({
  __esModule: true,
  default: mockDeep(),
}));

beforeEach(() => {
  // Clear any global mocks if used
});
