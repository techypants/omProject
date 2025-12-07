// hooks/useElementSize.js
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the dimensions of a DOM element
 * @param {React.RefObject} ref - Reference to the DOM element
 * @returns {Object} Object containing width and height of the element
 */
export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    // Function to update size
    const updateSize = () => {
      if (ref.current) {
        const { offsetWidth, offsetHeight } = ref.current;
        setSize({ 
          width: offsetWidth, 
          height: offsetHeight 
        });
      }
    };

    // Initial size measurement
    updateSize();

    // Set up resize observer for responsive updates
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || !entries[0]) return;
      updateSize();
    });

    resizeObserver.observe(ref.current);

    // Clean up
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}