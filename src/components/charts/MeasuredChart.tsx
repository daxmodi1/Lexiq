'use client';

import { useEffect, useRef, useState } from 'react';

interface MeasuredChartProps {
  className?: string;
  children: (size: { width: number; height: number }) => React.ReactNode;
}

export default function MeasuredChart({ className, children }: MeasuredChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;

      if (nextWidth > 0 && nextHeight > 0) {
        setSize((current) => {
          if (current?.width === nextWidth && current?.height === nextHeight) {
            return current;
          }

          return { width: nextWidth, height: nextHeight };
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {size ? children(size) : null}
    </div>
  );
}
