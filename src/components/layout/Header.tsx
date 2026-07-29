import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Shield, UserRound, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { initialsOf } from '../../lib/format';

const NAV = [
  { label: 'Awards', to: '/', end: true },
  { label: 'Youth Design', to: '/youth-design' },
  { label: 'Sertifika Doğrulama', to: '/dogrula' },
  { label: 'Yarışma Paneli', to: '/dashboard' },
];

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, isAdmin, isStaff, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  /* Transparent over the hero; condenses into a floating pill once scrolled. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap transition-colors ${
      isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div
        className={`mx-auto transition-all duration-300 ease-out pointer-events-auto ${
          scrolled
            ? 'max-w-5xl mt-3 px-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5'
            : 'max-w-7xl mt-0 px-4 sm:px-6 lg:px-8 border border-transparent'
        }`}
      >
        <nav
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-14 px-3' : 'h-16 sm:h-20'
          }`}
          aria-label="Ana menü"
        >
          <Logo withFoundation={false} size={scrolled ? 'sm' : 'md'} />

          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2.5">
            {user ? (
              <>
                {isStaff && (
                  <Link
                    to={isAdmin ? '/admin/genel' : '/staff/genel'}
                    className="w-9 h-9 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-600 hover:text-slate-900 transition-colors"
                    title={isAdmin ? 'Admin paneli' : 'Staff paneli'}
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to="/dashboard/profil"
                  className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-bold hover:bg-slate-800 transition-colors overflow-hidden"
                  title={profile?.full_name ?? user.email ?? 'Profil'}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initialsOf(profile?.full_name ?? user.email)
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-600 hover:text-slate-900 transition-colors"
                  title="Çıkış yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/giris" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Giriş Yap
                </Link>
                <Link to="/kayit" className="gx-btn-primary !py-2">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-700"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {open && (
          <div
            id="mobile-nav"
            className={`lg:hidden bg-white border-t border-slate-200/70 ${scrolled ? 'rounded-b-3xl' : ''}`}
          >
            <div className="px-4 sm:px-6 py-4 space-y-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-semibold ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="pt-3 grid grid-cols-2 gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard/profil" className="gx-btn-ghost w-full">
                      <UserRound className="w-4 h-4" />
                      Profil
                    </Link>
                    {isStaff ? (
                      <Link to={isAdmin ? '/admin/genel' : '/staff/genel'} className="gx-btn-ghost w-full">
                        <Shield className="w-4 h-4" />
                        {isAdmin ? 'Admin' : 'Staff'}
                      </Link>
                    ) : (
                      <span />
                    )}
                    <button onClick={handleSignOut} className="gx-btn-ghost w-full col-span-2">
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/kayit" className="gx-btn-primary w-full">
                      Kayıt Ol
                    </Link>
                    <Link to="/giris" className="gx-btn-ghost w-full">
                      Giriş Yap
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
