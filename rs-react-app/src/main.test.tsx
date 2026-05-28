import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: mockCreateRoot,
  },
  createRoot: mockCreateRoot,
  __esModule: true,
}));

describe('main entry point', () => {
  let rootElement: HTMLElement;

  beforeEach(async () => {
    mockRender.mockClear();
    mockCreateRoot.mockClear();

    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    vi.resetModules();
    await import('./main');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should call createRoot with the element having id "root"', () => {
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
  });

  it('should call render method on the root', () => {
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
