'use client';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduced } from './motion';

// Cualquier modal abierto (dialog nativo o un panel con data-modal-open) congela el scroll de la página.
const MODAL = 'dialog[open], [data-modal-open]';

export function startSmoothScroll(duration = 1.05) {
  let lenis: Lenis | null = null;
  let tick: ((t: number) => void) | null = null;

  if (!reduced()) {
    lenis = new Lenis({
      duration,
      // Dentro de un modal o una lista desplegable el scroll es nativo, no el de la página.
      prevent: (node: HTMLElement) => !!node.closest?.('dialog, [data-modal-open], [data-lenis-prevent]'),
    });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t: number) => lenis!.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  const sync = () => {
    const locked = !!document.querySelector(MODAL);
    document.documentElement.toggleAttribute('data-locked', locked);
    if (lenis) (locked ? lenis.stop() : lenis.start());
  };
  const mo = new MutationObserver(sync);
  mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'data-modal-open'] });

  return () => {
    mo.disconnect();
    document.documentElement.removeAttribute('data-locked');
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
  };
}
