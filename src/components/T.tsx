'use client';

import { useTranslatedText } from '@/lib/translation/useTranslation';
import { ElementType } from 'react';

interface TProps {
  children: string;
  as?: ElementType;
  className?: string;
}

/**
 * Composant simple pour traduire du texte
 * Usage: <T>Texte en français</T>
 */
export function T({ children, as: Component = 'span', className }: TProps) {
  const translated = useTranslatedText(children);

  if (Component === 'span' && !className) {
    return <>{translated}</>;
  }

  const Tag = Component as ElementType;
  return <Tag className={className}>{translated}</Tag>;
}

/**
 * Hook pour traduire des attributs HTML (placeholder, alt, title, etc.)
 * Usage: const placeholder = useTranslatedAttr('Votre nom');
 */
export { useTranslatedAttr } from '@/lib/translation/useTranslation';

