import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';

describe('main entry point', () => {
  let rootElement: HTMLElement;
  let mockRender: ReturnType<typeof vi.fn>;
  let createRootMock: any;

  beforeEach(async () => {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    vi.resetModules();

    vi.doMock('react-dom/client', () => ({
      createRoot: vi.fn(),
    }));

    const { createRoot } = await import('react-dom/client');
    createRootMock = createRoot;
    mockRender = vi.fn();
    createRootMock.mockReturnValue({ render: mockRender });

    await import('./main');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should call createRoot with the element having id "root"', () => {
    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(createRootMock).toHaveBeenCalledWith(rootElement);
  });

  it('should call render with <StrictMode><App /></StrictMode>', () => {
    expect(mockRender).toHaveBeenCalledTimes(1);
    const renderArg = mockRender.mock.calls[0][0];

    expect(renderArg.type).toBe(StrictMode);
    expect(renderArg.props.children.type.name).toBe('App');
  });
});
