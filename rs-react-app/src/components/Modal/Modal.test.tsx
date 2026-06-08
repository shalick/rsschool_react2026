import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot?.remove();
  });

  it('renders content in a portal and closes on Escape', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <button type="button">Close</button>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside the modal content', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('renders into the portal root, exposes accessible attributes, and closes via close button', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <div>Modal content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { name: /Test modal/i })).toBeInTheDocument();
    expect(document.getElementById('modal-root')).toContainElement(dialog);

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal content', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <div data-testid="inside-content">Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('inside-content'));
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('prevents backspace navigation when focus is outside editable fields', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <button type="button">Action</button>
      </Modal>
    );

    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');
    fireEvent.keyDown(document, { key: 'Backspace' });
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('does not prevent backspace when focus is inside an editable input', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <input aria-label="Editable field" />
      </Modal>
    );

    const input = screen.getByLabelText('Editable field');
    input.focus();

    const preventDefaultSpy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault');
    fireEvent.keyDown(document, { key: 'Backspace' });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });

  it('wraps focus when tabbing between modal controls', () => {
    const closeSpy = vi.fn();
    render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    const lastButton = screen.getByText('Last');

    lastButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(lastButton).toHaveFocus();
  });

  it('restores body scroll style after modal unmounts', () => {
    const closeSpy = vi.fn();
    const { unmount } = render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('returns null when modal root is missing', () => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot?.remove();

    const closeSpy = vi.fn();
    const { container } = render(
      <Modal open title="Test modal" onClose={closeSpy}>
        <div>Modal content</div>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
