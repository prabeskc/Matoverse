import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, the class `is-visible` is added —
 * which triggers the CSS transitions defined in index.css (.reveal, .reveal-scale).
 *
 * @param {object} options
 * @param {number} options.threshold - 0–1, how much of the element must be visible. Default 0.12
 * @param {string} options.rootMargin - CSS margin for the observer root. Default '0px'
 * @param {boolean} options.once - if true, stops observing after first trigger. Default true
 */
export function useScrollReveal({ threshold = 0.12, rootMargin = '0px', once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('is-visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * useScrollRevealGroup
 * Returns a ref for a container element.
 * Applies staggered 'is-visible' to each direct child with class 'reveal' or 'reveal-scale'.
 */
export function useScrollRevealGroup({ threshold = 0.1, staggerMs = 120 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.querySelectorAll('.reveal, .reveal-scale'));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('is-visible'), i * staggerMs);
          });
          observer.unobserve(container);
        }
      },
      { threshold }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, staggerMs]);

  return ref;
}
