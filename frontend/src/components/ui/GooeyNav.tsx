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
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  activeIndex?: number;
  onNavigate?: (item: GooeyNavItem, index: number) => void;
  className?: string;
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  activeIndex: controlledIndex,
  onNavigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  const [internalActiveIndex, setInternalActiveIndex] = useState<number>(
    controlledIndex !== undefined ? controlledIndex : initialActiveIndex
  );

  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalActiveIndex;

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = useCallback(
    (element: HTMLElement) => {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const d = particleDistances;
      const r = particleR;
      const bubbleTime = animationTime * 2 + timeVariance;
      element.style.setProperty('--time', `${bubbleTime}ms`);

      for (let i = 0; i < particleCount; i++) {
        const t = animationTime * 2 + noise(timeVariance * 2);
        const p = createParticle(i, t, d, r);
        element.classList.remove('active');

        setTimeout(() => {
          if (!element) return;
          const particle = document.createElement('span');
          const point = document.createElement('span');
          particle.classList.add('particle');
          particle.style.setProperty('--start-x', `${p.start[0]}px`);
          particle.style.setProperty('--start-y', `${p.start[1]}px`);
          particle.style.setProperty('--end-x', `${p.end[0]}px`);
          particle.style.setProperty('--end-y', `${p.end[1]}px`);
          particle.style.setProperty('--time', `${p.time}ms`);
          particle.style.setProperty('--scale', `${p.scale}`);
          particle.style.setProperty('--color', `var(--color-${p.color}, #FF6B35)`);
          particle.style.setProperty('--rotate', `${p.rotate}deg`);

          point.classList.add('point');
          particle.appendChild(point);
          element.appendChild(particle);

          requestAnimationFrame(() => {
            element.classList.add('active');
          });

          setTimeout(() => {
            try {
              if (particle.parentNode === element) {
                element.removeChild(particle);
              }
            } catch {
              // Ignore cleanup race
            }
          }, t);
        }, 30);
      }
    },
    [animationTime, colors, particleCount, particleDistances, particleR, timeVariance]
  );

  const updateEffectPosition = useCallback((element: HTMLElement | null) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    if (!element) {
      filterRef.current.style.opacity = '0';
      textRef.current.style.opacity = '0';
      textRef.current.classList.remove('active');
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
      opacity: '1'
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText.trim();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    const liEl = e.currentTarget.closest('li') as HTMLElement | null;
    if (!liEl || activeIndex === index) return;

    if (controlledIndex === undefined) {
      setInternalActiveIndex(index);
    }

    updateEffectPosition(liEl);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => {
        try {
          filterRef.current?.removeChild(p);
        } catch {}
      });
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }

    if (onNavigate) {
      onNavigate(items[index], index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.closest('li') as HTMLElement | null;
      if (liEl) {
        handleClick(e as unknown as React.MouseEvent<HTMLElement>, index);
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const itemsList = navRef.current.querySelectorAll('li');
    const activeLi = activeIndex >= 0 && activeIndex < itemsList.length ? (itemsList[activeIndex] as HTMLElement) : null;
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    } else {
      updateEffectPosition(null);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = activeIndex >= 0 && activeIndex < itemsList.length ? (navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement) : null;
      updateEffectPosition(currentActiveLi);
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
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
