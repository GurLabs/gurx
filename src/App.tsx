import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { RequireAuth, RequireRole } from './components/RouteGuards';
import { AdminConsole, ParticipantConsole } from './components/console/ConsoleLayouts';
import { CompetitionLayout } from './components/console/CompetitionLayout';
import { StandalonePageSkeleton } from './components/ui/Skeleton';
import { YOUTH_SLUG } from './lib/brand';

/*
 * Pages are code-split; the shells (site layout, console frame, guards) are not.
 * That way the header, sidebar and page scaffolding paint immediately and only
 * the content area shows a skeleton while its chunk and data arrive.
 */

/* Public marketing site */
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const YouthDesignPage = lazy(() =>
  import('./pages/YouthDesignPage').then((m) => ({ default: m.YouthDesignPage })),
);
const RulesPage = lazy(() => import('./pages/RulesPage').then((m) => ({ default: m.RulesPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const LeaderboardPage = lazy(() =>
  import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })),
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const OfficialApplicationPage = lazy(() =>
  import('./pages/OfficialApplicationPage').then((m) => ({ default: m.OfficialApplicationPage })),
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const AuthCallbackPage = lazy(() =>
  import('./pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

/* Standalone surfaces */
const VerifyPage = lazy(() => import('./pages/VerifyPage').then((m) => ({ default: m.VerifyPage })));
const CertificateDocumentPage = lazy(() =>
  import('./pages/CertificateDocumentPage').then((m) => ({ default: m.CertificateDocumentPage })),
);
const PublicProfilePage = lazy(() =>
  import('./pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })),
);

/* Participant console */
const CompetitionsListPage = lazy(() =>
  import('./pages/console/CompetitionsListPage').then((m) => ({ default: m.CompetitionsListPage })),
);
const OverviewPage = lazy(() =>
  import('./pages/console/OverviewPage').then((m) => ({ default: m.OverviewPage })),
);
const AnnouncementsPage = lazy(() =>
  import('./pages/console/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })),
);
const ApplicationPage = lazy(() =>
  import('./pages/console/ApplicationPage').then((m) => ({ default: m.ApplicationPage })),
);
const SubmissionPage = lazy(() =>
  import('./pages/console/SubmissionPage').then((m) => ({ default: m.SubmissionPage })),
);
const VotingPage = lazy(() =>
  import('./pages/console/VotingPage').then((m) => ({ default: m.VotingPage })),
);
const StandingsPage = lazy(() =>
  import('./pages/console/StandingsPage').then((m) => ({ default: m.StandingsPage })),
);
const CompetitionAwardsRoute = lazy(() =>
  import('./pages/console/CompetitionAwardsRoute').then((m) => ({
    default: m.CompetitionAwardsRoute,
  })),
);
const CompetitionRulesPage = lazy(() =>
  import('./pages/console/InfoPages').then((m) => ({ default: m.CompetitionRulesPage })),
);
const ConsoleRulesPage = lazy(() =>
  import('./pages/console/InfoPages').then((m) => ({ default: m.ConsoleRulesPage })),
);
const ConsoleHelpPage = lazy(() =>
  import('./pages/console/InfoPages').then((m) => ({ default: m.ConsoleHelpPage })),
);
const ConsoleLegalPage = lazy(() =>
  import('./pages/console/InfoPages').then((m) => ({ default: m.ConsoleLegalPage })),
);
const ConsoleAwardsPage = lazy(() =>
  import('./pages/console/AccountPages').then((m) => ({ default: m.ConsoleAwardsPage })),
);
const ConsoleCertificateLookupPage = lazy(() =>
  import('./pages/console/AccountPages').then((m) => ({ default: m.ConsoleCertificateLookupPage })),
);
const ProfileSettingsPage = lazy(() =>
  import('./pages/console/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })),
);
const MyTicketsPage = lazy(() =>
  import('./pages/console/SupportPages').then((m) => ({ default: m.MyTicketsPage })),
);
const TicketThreadPage = lazy(() =>
  import('./pages/console/SupportPages').then((m) => ({ default: m.TicketThreadPage })),
);
const StaffTicketsPage = lazy(() =>
  import('./pages/console/SupportPages').then((m) => ({ default: m.StaffTicketsPage })),
);

/* Admin console */
const AdminPages = {
  Overview: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminOverviewPage })),
  ),
  CompetitionsList: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({
      default: m.AdminCompetitionsListPage,
    })),
  ),
  CompetitionOverview: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({
      default: m.AdminCompetitionOverviewPage,
    })),
  ),
  Applications: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminApplicationsPage })),
  ),
  Submissions: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminSubmissionsPage })),
  ),
  Announcements: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminAnnouncementsPage })),
  ),
  Certificates: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminCertificatesPage })),
  ),
  CompetitionSettings: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({
      default: m.AdminCompetitionSettingsPage,
    })),
  ),
  Users: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminUsersPage })),
  ),
  NewCompetition: lazy(() =>
    import('./pages/console/admin/NewCompetitionPage').then((m) => ({
      default: m.NewCompetitionPage,
    })),
  ),
  Team: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminTeamPage })),
  ),
  Settings: lazy(() =>
    import('./pages/console/admin/AdminPages').then((m) => ({ default: m.AdminSettingsPage })),
  ),
};

/** Shared by /admin and /staff — staff never sees the admin-only routes. */
const consoleCompetitionRoutes = (isAdmin: boolean) => (
  <Route path="yarismalar/:slug" element={<CompetitionLayout />}>
    <Route index element={<AdminPages.CompetitionOverview />} />
    <Route path="basvurular" element={<AdminPages.Applications />} />
    <Route path="teslimler" element={<AdminPages.Submissions />} />
    <Route path="duyurular" element={<AdminPages.Announcements />} />
    <Route path="siralama" element={<StandingsPage />} />
    {isAdmin && <Route path="sertifikalar" element={<AdminPages.Certificates />} />}
    {isAdmin && <Route path="ayarlar" element={<AdminPages.CompetitionSettings />} />}
  </Route>
);

/** Standalone pages bring their own chrome, so their skeleton does too. */
const standalone = (element: React.ReactNode) => (
  <Suspense fallback={<StandalonePageSkeleton />}>{element}</Suspense>
);

export default function App() {
  return (
    <Routes>
      {/* Standalone surfaces — own chrome, outside the marketing shell */}
      <Route path="/certificate/:code/belge" element={standalone(<CertificateDocumentPage />)} />
      <Route path="/dogrula" element={standalone(<VerifyPage />)} />
      <Route path="/dogrula/:code" element={standalone(<VerifyPage />)} />
      <Route path="/certificate/verify" element={standalone(<VerifyPage />)} />
      <Route path="/certificate/verify/:code" element={standalone(<VerifyPage />)} />
      <Route path="/u/:username" element={standalone(<PublicProfilePage />)} />

      {/* ---------------- Public site ---------------- */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/youth-design" element={<YouthDesignPage />} />
        <Route path="/kurallar" element={<RulesPage />} />
        <Route path="/yardim" element={<HelpPage />} />
        <Route path="/siralama" element={<LeaderboardPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
        <Route path="/yetkili-basvuru" element={<OfficialApplicationPage />} />

        <Route path="/giris" element={<LoginPage />} />
        <Route path="/kayit" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ---------------- Participant console ---------------- */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<ParticipantConsole />}>
          <Route index element={<Navigate to={`/dashboard/yarismalar/${YOUTH_SLUG}`} replace />} />
          <Route path="yarismalar" element={<CompetitionsListPage />} />

          <Route path="yarismalar/:slug" element={<CompetitionLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="duyurular" element={<AnnouncementsPage />} />
            <Route path="kurallar" element={<CompetitionRulesPage />} />
            <Route path="basvurum" element={<ApplicationPage />} />
            <Route path="teslim" element={<SubmissionPage />} />
            <Route path="oylama" element={<VotingPage />} />
            <Route path="oduller" element={<CompetitionAwardsRoute />} />
            <Route path="siralama" element={<StandingsPage />} />
          </Route>

          <Route path="oduller" element={<ConsoleAwardsPage />} />
          <Route path="sertifika" element={<ConsoleCertificateLookupPage />} />
          <Route path="profil" element={<ProfileSettingsPage />} />
          <Route path="destek" element={<MyTicketsPage />} />
          <Route path="destek/:id" element={<TicketThreadPage />} />
          <Route path="kurallar" element={<ConsoleRulesPage />} />
          <Route path="yardim" element={<ConsoleHelpPage />} />
          <Route path="yasal" element={<ConsoleLegalPage />} />
        </Route>

        <Route path="/profil" element={<Navigate to="/dashboard/profil" replace />} />
      </Route>

      {/* ---------------- Admin console ---------------- */}
      <Route element={<RequireRole allow={['admin']} />}>
        <Route path="/admin" element={<AdminConsole />}>
          <Route index element={<Navigate to="/admin/genel" replace />} />
          <Route path="genel" element={<AdminPages.Overview />} />
          <Route path="yarismalar" element={<AdminPages.CompetitionsList />} />
          <Route path="yarismalar/yeni" element={<AdminPages.NewCompetition />} />
          {consoleCompetitionRoutes(true)}
          <Route path="kullanicilar" element={<AdminPages.Users />} />
          <Route path="ekip" element={<AdminPages.Team />} />
          <Route path="sertifika" element={<ConsoleCertificateLookupPage />} />
          <Route path="destek" element={<StaffTicketsPage />} />
          <Route path="destek/:id" element={<TicketThreadPage staffView />} />
          <Route path="ayarlar" element={<AdminPages.Settings />} />
        </Route>
      </Route>

      {/* ---------------- Staff console ---------------- */}
      <Route element={<RequireRole allow={['staff', 'admin']} />}>
        <Route path="/staff" element={<AdminConsole />}>
          <Route index element={<Navigate to="/staff/genel" replace />} />
          <Route path="genel" element={<AdminPages.Overview />} />
          <Route path="yarismalar" element={<AdminPages.CompetitionsList />} />
          {consoleCompetitionRoutes(false)}
          <Route path="sertifika" element={<ConsoleCertificateLookupPage />} />
          <Route path="destek" element={<StaffTicketsPage />} />
          <Route path="destek/:id" element={<TicketThreadPage staffView />} />
        </Route>
      </Route>
    </Routes>
  );
}
