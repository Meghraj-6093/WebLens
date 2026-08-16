import React, { useRef, useEffect, useState, useCallback } from 'react';
import './GooeyNav.css';

export interface GooeyNavItem {
  label: string;
  href: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number] | number[];
  particleR?: number;
  timeVariance?: number;
  colors?: number[] | string[];
  initialActiveIndex?: number;
  activeIndex?: number;
  onNavigate?: (item: GooeyNavItem, index: number) => void;
  className?: string;
}

/**
 * Computes an (x, y) coordinate along the outer perimeter of a rounded pill
 * @param w Width of the pill
 * @param h Height of the pill
 * @param t Progress along perimeter [0, 1)
 * @param margin Distance outside the pill boundary (px)
 */
function getCapsulePerimeterPoint(w: number, h: number, t: number, margin = 2): { x: number; y: number } {
  const normalizedT = ((t % 1) + 1) % 1;
  const r = h / 2;
  const straightW = Math.max(0, w - 2 * r);
  const semiCircumference = Math.PI * r;
  const totalPerimeter = 2 * straightW + 2 * semiCircumference;

  const targetDist = normalizedT * totalPerimeter;

  // Segment 1: Top straight edge (left to right)
  if (targetDist <= straightW) {
    const fraction = straightW > 0 ? targetDist / straightW : 0;
    return {
      x: r + fraction * straightW,
      y: -margin
    };
  }

  // Segment 2: Right circular cap (top to bottom)
  const distAfterTop = targetDist - straightW;
  if (distAfterTop <= semiCircumference) {
    const angle = -Math.PI / 2 + (distAfterTop / semiCircumference) * Math.PI;
    const effR = r + margin;
    return {
      x: (w - r) + effR * Math.cos(angle),
      y: r + effR * Math.sin(angle)
    };
  }

  // Segment 3: Bottom straight edge (right to left)
  const distAfterRight = distAfterTop - semiCircumference;
  if (distAfterRight <= straightW) {
    const fraction = straightW > 0 ? distAfterRight / straightW : 0;
    return {
      x: (w - r) - fraction * straightW,
      y: h + margin
    };
  }

  // Segment 4: Left circular cap (bottom to top)
  const distAfterBottom = distAfterRight - straightW;
  const angle = Math.PI / 2 + (distAfterBottom / semiCircumference) * Math.PI;
  const effR = r + margin;
  return {
    x: r + effR * Math.cos(angle),
    y: r + effR * Math.sin(angle)
  };
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 420,
  particleCount = 8,
  initialActiveIndex = 0,
  activeIndex: controlledIndex,
  onNavigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const borderLayerRef = useRef<HTMLDivElement | null>(null);

  const prevIndexRef = useRef<number>(controlledIndex !== undefined ? controlledIndex : initialActiveIndex);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number>(
    controlledIndex !== undefined ? controlledIndex : initialActiveIndex
  );

  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalActiveIndex;

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.left - containerRect.left}px`,
      top: `${pos.top - containerRect.top}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText.trim();
  }, []);

  const spawnBorderParticles = useCallback(
    (targetEl: HTMLElement) => {
      if (!borderLayerRef.current || !containerRef.current) return;
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const layer = borderLayerRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const pos = targetEl.getBoundingClientRect();

      const pillX = pos.left - containerRect.left;
      const pillY = pos.top - containerRect.top;
      const pillW = pos.width;
      const pillH = pos.height;

      // Clear any prior lingering particles
      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }

      const count = Math.min(particleCount, 10);
      const colors = ['#FF6B35', '#FF6B35', '#FF804F', '#FF6B35', '#F3F0E8'];

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.classList.add('gooey-perimeter-particle');

        // Starting position evenly distributed around the perimeter
        const baseT = i / count + (Math.random() - 0.5) * 0.08;
        const margin = 3 + Math.random() * 2.5; // Strictly 3-5.5px outside border

        const p0 = getCapsulePerimeterPoint(pillW, pillH, baseT, margin);
        const p1 = getCapsulePerimeterPoint(pillW, pillH, baseT + 0.12, margin);
        const p2 = getCapsulePerimeterPoint(pillW, pillH, baseT + 0.24, margin * 0.9);

        const x0 = pillX + p0.x;
        const y0 = pillY + p0.y;
        const x1 = pillX + p1.x;
        const y1 = pillY + p1.y;
        const x2 = pillX + p2.x;
        const y2 = pillY + p2.y;

        // Size between 4px and 7px (compact, perimeter hugging)
        const size = Math.round(4 + Math.random() * 3);
        const color = colors[i % colors.length];

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.setProperty('--x0', `${x0.toFixed(1)}px`);
        particle.style.setProperty('--y0', `${y0.toFixed(1)}px`);
        particle.style.setProperty('--x1', `${x1.toFixed(1)}px`);
        particle.style.setProperty('--y1', `${y1.toFixed(1)}px`);
        particle.style.setProperty('--x2', `${x2.toFixed(1)}px`);
        particle.style.setProperty('--y2', `${y2.toFixed(1)}px`);
        particle.style.setProperty('--scale', `${(0.9 + Math.random() * 0.4).toFixed(2)}`);
        particle.style.setProperty('--time', `${animationTime}ms`);

        if (color === '#FF6B35') {
          particle.style.boxShadow = '0 0 4px rgba(255, 107, 53, 0.5)';
        }

        layer.appendChild(particle);

        setTimeout(() => {
          try {
            if (particle.parentNode === layer) {
              layer.removeChild(particle);
            }
          } catch {}
        }, animationTime + 40);
      }
    },
    [animationTime, particleCount]
  );

  const handleSelect = (index: number, liEl: HTMLElement) => {
    if (activeIndex === index) return;

    prevIndexRef.current = index;
    if (controlledIndex === undefined) {
      setInternalActiveIndex(index);
    }

    updateEffectPosition(liEl);
    spawnBorderParticles(liEl);

    if (onNavigate) {
      onNavigate(items[index], index);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault();
    const liEl = e.currentTarget.closest('li') as HTMLElement | null;
    if (liEl) {
      handleSelect(index, liEl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.closest('li') as HTMLElement | null;
      if (liEl) {
        handleSelect(index, liEl);
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const itemsList = navRef.current.querySelectorAll('li');
    const activeLi = itemsList[activeIndex] as HTMLElement | undefined;
    if (activeLi) {
      updateEffectPosition(activeLi);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement | undefined;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, updateEffectPosition]);

  return (
    <div className={`gooey-nav-container ${className}`.trim()} ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <li key={item.href} className={isActive ? 'active' : ''}>
                <a
                  href={item.href}
                  onClick={e => handleClick(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  tabIndex={0}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Active Morph Pill Background (White pill with 1px Signal Orange outline) */}
      <span className="effect filter" ref={filterRef} />
      {/* Dedicated Border-Only Particle Layer (Strictly around the outer perimeter) */}
      <div className="gooey-border-layer" ref={borderLayerRef} />
      {/* Active Morph Pill Text (Crisp Obsidian Typography) */}
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
