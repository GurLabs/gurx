import React from 'react';
import { motion } from 'motion/react';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, className = '', children }) => (
  <section
    id={id}
    className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24 ${className}`}
  >
    {children}
  </section>
);

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface HeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<HeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}) => (
  <div
    className={`space-y-3 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'} ${className}`}
  >
    {eyebrow ? <div className="gx-pill">{eyebrow}</div> : null}
    <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-normal text-slate-900 leading-[1.1]">
      {title}
    </h2>
    {description ? (
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{description}</p>
    ) : null}
  </div>
);
