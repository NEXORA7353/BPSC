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
  const formattedHtml = useMemo(() => {
    try {
      return renderMathToHtml(text || '');
    } catch {
      return text || '';
    }
  }, [text]);

  if (!text) return null;

  return (
    <Component
      className={`math-rendered-container ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};
