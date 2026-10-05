import React, { useMemo } from 'react';
import { renderMathToHtml } from '../utils/mathFormatter';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3';
}

export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as: Component = 'span'
}) => {
  const formattedHtml = useMemo(() => renderMathToHtml(text), [text]);

  return (
    <Component
      className={`math-rendered-container inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};
