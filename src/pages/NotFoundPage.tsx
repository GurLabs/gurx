import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { useSeo } from '../hooks/useSeo';

export const NotFoundPage: React.FC = () => {
  useSeo({ title: 'Sayfa bulunamadı', noindex: true });

  return (
    <Section className="!py-24">
      <div className="max-w-lg mx-auto text-center space-y-5">
        <p className="gx-num text-7xl text-slate-300">404</p>
        <h1 className="text-3xl font-serif text-slate-900">Aradığınız sayfa bulunamadı</h1>
        <p className="text-sm text-slate-600">
          Bağlantı taşınmış veya hiç var olmamış olabilir. Aşağıdaki sayfalardan devam edebilirsiniz.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/" className="gx-btn-primary">
            <Home className="w-4 h-4" />
            Ana sayfa
          </Link>
          <Link to="/youth-design" className="gx-btn-ghost">
            <Compass className="w-4 h-4" />
            GurX Youth Design
          </Link>
          <Link to="/certificate/verify" className="gx-btn-ghost">
            Sertifika doğrula
          </Link>
        </div>
      </div>
    </Section>
  );
};
