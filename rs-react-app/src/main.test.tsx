import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('main entry point', () => {
  let rootElement: HTMLElement;
  let mockRender: any;
  let createRootMock: any;

  beforeEach(async () => {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    vi.resetModules();

    mockRender = vi.fn();
    createRootMock = vi.fn().mockReturnValue({ render: mockRender });

    vi.doMock('react-dom/client', () => ({
      createRoot: createRootMock,
      default: {
        createRoot: createRootMock,
      },
    }));

    await import('./main');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should call createRoot with the element having id "root"', () => {
    expect(createRootMock).toHaveBeenCalledWith(rootElement);
  });

  it('should call render method on the root', () => {
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
