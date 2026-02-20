/**
 * useModalState - Custom hook for managing modal visibility state
 * Generic hook for any modal or dialog component
 */

import { useState, useCallback } from 'react';

/**
 * Result type for modal state hook
 */
export interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook to manage modal visibility state
 * Provides functions to open, close, and toggle modal
 *
 * @param initialState - Initial open state (default: false)
 * @returns Modal state and control functions
 */
export const useModalState = (initialState: boolean = false): ModalState => {
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * Open the modal
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the modal
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle modal state
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
