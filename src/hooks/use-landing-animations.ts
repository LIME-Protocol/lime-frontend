import { RefObject, useEffect } from 'react';
import { animate, createScope, stagger } from 'animejs';

const revealSelector = '[data-landing-reveal]';
const cardSelector = '[data-landing-card]';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function prepare(elements: Element[]) {
  elements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(24px)';
    element.style.filter = 'blur(8px)';
  });
}

function reveal(elements: Element[], delay: number | ((target: Element, index: number) => number) = 0) {
  if (!elements.length) return;

  animate(elements, {
    opacity: [0, 1],
    y: [24, 0],
    filter: ['blur(8px)', 'blur(0px)'],
    duration: 720,
    delay,
    ease: 'outCubic',
  });
}

export function useLandingAnimations(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scope = createScope({
      root,
      mediaQueries: {
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
    }).add((self) => {
      if (self.matches.reduceMotion || prefersReducedMotion()) return;

      const heroElements = [
        ...root.querySelectorAll('[data-hero-eyebrow], [data-hero-copy], [data-hero-actions]'),
      ];
      const heroLines = [...root.querySelectorAll('[data-hero-line]')];
      const heroCard = [...root.querySelectorAll('[data-hero-card]')];
      const heroBar = [...root.querySelectorAll('[data-hero-bar]')];
      const heroMarker = [...root.querySelectorAll('[data-hero-marker]')];
      const revealSections = [...root.querySelectorAll(revealSelector)];
      const revealCards = [...root.querySelectorAll(cardSelector)];

      prepare([...heroElements, ...heroLines, ...heroCard, ...revealSections, ...revealCards]);

      reveal(heroElements, stagger(80));
      reveal(heroLines, stagger(110, { start: 140 }));
      reveal(heroCard, 420);

      animate(heroBar, {
        scaleX: [0, 1],
        transformOrigin: '0% 50%',
        duration: 900,
        delay: 720,
        ease: 'outCubic',
      });

      animate(heroMarker, {
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 560,
        delay: 940,
        ease: 'outBack',
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target;
            reveal([element]);

            const cards = [...element.querySelectorAll(cardSelector)];
            if (cards.length) {
              reveal(cards, stagger(90, { start: 120 }));
              cards.forEach((card) => observer.unobserve(card));
            }

            observer.unobserve(element);
          });
        },
        {
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.18,
        },
      );

      revealSections.forEach((element) => observer.observe(element));
      revealCards.forEach((element) => {
        if (!element.closest(revealSelector)) observer.observe(element);
      });

      return () => observer.disconnect();
    });

    return () => scope.revert();
  }, [rootRef]);
}
