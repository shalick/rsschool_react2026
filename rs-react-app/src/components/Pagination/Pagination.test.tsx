import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./Pagination.module.css', () => ({
  default: {
    paginationContainer: 'paginationContainer',
    pageButton: 'pageButton',
    active: 'active',
  },
}));

describe('Pagination Component', () => {
  it('returns null and renders nothing if totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all page numbers and navigation buttons correctly', () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: /« Prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next »/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('disables "Prev" button on the first page and "Next" button on the last page', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /« Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next »/i })).not.toBeDisabled();

    rerender(
      <Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /« Prev/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Next »/i })).toBeDisabled();
  });

  it('highlights the current active page button', () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />
    );

    const activeButton = screen.getByRole('button', { name: '2' });
    const inactiveButton = screen.getByRole('button', { name: '1' });

    expect(activeButton.className).toContain('active');
    expect(inactiveButton.className).not.toContain('active');
  });

  it('calls onPageChange with correct values when clicking buttons', () => {
    const onPageChangeMock = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={4}
        onPageChange={onPageChangeMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /« Prev/i }));
    expect(onPageChangeMock).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onPageChangeMock).toHaveBeenLastCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: /Next »/i }));
    expect(onPageChangeMock).toHaveBeenLastCalledWith(3);

    expect(onPageChangeMock).toHaveBeenCalledTimes(3);
  });
});
