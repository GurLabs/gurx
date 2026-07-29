import React from 'react';
import { motion } from 'motion/react';

interface PageHeroProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  description,
  actions,
  aside,
}) => (
  <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-4">
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={aside ? 'lg:col-span-7 space-y-4' : 'lg:col-span-9 space-y-4'}
      >
        {eyebrow ? <div className="gx-pill">{eyebrow}</div> : null}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-normal text-slate-900 leading-[1.05]">
          {title}
        </h1>
        {description ? (
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
      </motion.div>

      {aside ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-5"
        >
          {aside}
        </motion.div>
      ) : null}
    </div>
  </section>
);
