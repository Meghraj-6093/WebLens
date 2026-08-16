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

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 420,
  particleCount = 10,
  initialActiveIndex = 0,
  activeIndex: controlledIndex,
  onNavigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const particleLayerRef = useRef<HTMLDivElement | null>(null);

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

  const spawnGooeyParticles = useCallback(
    (oldRect: DOMRect, newRect: DOMRect, containerRect: DOMRect) => {
      if (!particleLayerRef.current) return;
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const layer = particleLayerRef.current;
      // Clear any prior lingering particles
      while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
      }

      const deltaX = (newRect.left + newRect.width / 2) - (oldRect.left + oldRect.width / 2);
      const isMovingRight = deltaX >= 0;
      const count = Math.min(particleCount, 10);

      // Particle colors: primarily Signal Orange (#FF6B35), with warm light accents
      const particleColors = ['#FF6B35', '#FF6B35', '#FF804F', '#FF6B35', '#F3F0E8'];

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.classList.add('gooey-blob-particle');

        // Distribute origins between old pill and new pill along edges
        const progress = (i + 0.5) / count;
        const originX =
          oldRect.left + oldRect.width / 2 + deltaX * progress * 0.7 - containerRect.left;
        const originY =
          newRect.top + newRect.height / 2 + (Math.random() - 0.5) * 8 - containerRect.top;

        // Size between 5px and 9px (compact, not oversized)
        const size = Math.round(5 + Math.random() * 4);
        const color = particleColors[i % particleColors.length];

        // Random subtle displacement vector
        const angle = isMovingRight
          ? (Math.random() * Math.PI - Math.PI / 2) // splash sideways/up/down
          : (Math.random() * Math.PI + Math.PI / 2);
        const distance = 12 + Math.random() * 22;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * (10 + Math.random() * 12);

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--scale', `${(0.8 + Math.random() * 0.5).toFixed(2)}`);
        particle.style.setProperty('--time', `${animationTime}ms`);

        if (color === '#FF6B35') {
          particle.style.boxShadow = '0 0 6px rgba(255, 107, 53, 0.4)';
        }

        layer.appendChild(particle);

        setTimeout(() => {
          try {
            if (particle.parentNode === layer) {
              layer.removeChild(particle);
            }
          } catch {}
        }, animationTime + 50);
      }
    },
    [animationTime, particleCount]
  );

  const handleSelect = (index: number, liEl: HTMLElement) => {
    if (activeIndex === index) return;

    if (!containerRef.current || !navRef.current) return;
    const itemsList = navRef.current.querySelectorAll('li');
    const oldLi = itemsList[prevIndexRef.current] as HTMLElement | undefined;
    const containerRect = containerRef.current.getBoundingClientRect();

    if (oldLi && oldLi !== liEl) {
      const oldRect = oldLi.getBoundingClientRect();
      const newRect = liEl.getBoundingClientRect();
      spawnGooeyParticles(oldRect, newRect, containerRect);
    }

    prevIndexRef.current = index;
    if (controlledIndex === undefined) {
      setInternalActiveIndex(index);
    }

    updateEffectPosition(liEl);

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
      {/* Particle layer positioned under text and around the moving pill */}
      <div className="gooey-particle-layer" ref={particleLayerRef} />
      {/* Active Morph Pill Filter */}
      <span className="effect filter" ref={filterRef} />
      {/* Active Morph Pill Text */}
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
