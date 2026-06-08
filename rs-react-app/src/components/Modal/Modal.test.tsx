import React from 'react';
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
});
