import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BadgeCheck,
  CalendarCog,
  ClipboardList,
  FileCheck2,
  FileText,
  Gavel,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  PlusCircle,
  ScanLine,
  ScrollText,
  Settings2,
  Shield,
  Trophy,
  Upload,
  UserRound,
  Users,
  Vote,
} from 'lucide-react';
import type { Competition } from '../../types';

export interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  /** Matches only on the exact path — used for section landing pages. */
  end?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar model for the participant console. When a competition is selected the
 * section for that competition is expanded inline, the way docs sites nest a
 * chapter's pages under the chapter.
 */
export function participantNav(
  competitions: Competition[],
  activeSlug: string | null,
): NavSection[] {
  const sections: NavSection[] = [
    {
      title: 'Yarışmalar',
      items: [
        { label: 'Tüm yarışmalar', to: '/dashboard/yarismalar', icon: Trophy, end: true },
        ...competitions.map((c) => ({
          label: c.title,
          to: `/dashboard/yarismalar/${c.slug}`,
          icon: LayoutDashboard,
          end: true,
          badge: c.status === 'registration_open' ? 'Aktif' : undefined,
        })),
      ],
    },
  ];

  const active = competitions.find((c) => c.slug === activeSlug);
  if (active) {
    const base = `/dashboard/yarismalar/${active.slug}`;
    sections.push({
      title: active.title,
      items: [
        { label: 'Genel Bakış', to: base, icon: LayoutDashboard, end: true },
        { label: 'Duyurular', to: `${base}/duyurular`, icon: Megaphone },
        { label: 'Kurallar', to: `${base}/kurallar`, icon: ScrollText },
        { label: 'Başvurum', to: `${base}/basvurum`, icon: FileText },
        { label: 'Sonuç Yükleme', to: `${base}/teslim`, icon: Upload },
        { label: 'Oylama', to: `${base}/oylama`, icon: Vote },
        { label: 'Ödüllerim', to: `${base}/oduller`, icon: Award },
        { label: 'Sıralama', to: `${base}/siralama`, icon: Trophy },
      ],
    });
  }

  sections.push(
    {
      title: 'Hesabım',
      items: [
        { label: 'Ödüllerim', to: '/dashboard/oduller', icon: Award },
        { label: 'Sertifika Sorgula', to: '/dashboard/sertifika', icon: ScanLine },
        { label: 'Profilim', to: '/dashboard/profil', icon: UserRound },
      ],
    },
    {
      title: 'Destek',
      items: [
        { label: 'Destek Taleplerim', to: '/dashboard/destek', icon: LifeBuoy },
        { label: 'Yardım', to: '/dashboard/yardim', icon: MessageSquare },
        { label: 'Yetkili Başvurusu', to: '/yetkili-basvuru', icon: ClipboardList },
      ],
    },
    {
      title: 'Bilgi',
      items: [
        { label: 'Kurallar', to: '/dashboard/kurallar', icon: ScrollText },
        { label: 'Yasal', to: '/dashboard/yasal', icon: Gavel },
      ],
    },
  );

  return sections;
}

/** Admin and staff share a shell; staff simply gets fewer entries. */
export function adminNav(
  competitions: Competition[],
  activeSlug: string | null,
  isAdmin: boolean,
): NavSection[] {
  const root = isAdmin ? '/admin' : '/staff';

  const sections: NavSection[] = [
    {
      title: 'Genel',
      items: [{ label: 'Genel Bakış', to: `${root}/genel`, icon: LayoutDashboard, end: true }],
    },
    {
      title: 'Yarışmalar',
      items: [
        { label: 'Tüm yarışmalar', to: `${root}/yarismalar`, icon: Trophy, end: true },
        ...(isAdmin
          ? [{ label: 'Yeni Yarışma', to: `${root}/yarismalar/yeni`, icon: PlusCircle, end: true }]
          : []),
        ...competitions.map((c) => ({
          label: c.title,
          to: `${root}/yarismalar/${c.slug}`,
          icon: LayoutDashboard,
          end: true,
          badge: c.status === 'registration_open' ? 'Aktif' : undefined,
        })),
      ],
    },
  ];

  const active = competitions.find((c) => c.slug === activeSlug);
  if (active) {
    const base = `${root}/yarismalar/${active.slug}`;
    const items: NavItem[] = [
      { label: 'Genel Bakış', to: base, icon: LayoutDashboard, end: true },
      { label: 'Başvurular', to: `${base}/basvurular`, icon: FileCheck2 },
      { label: 'Teslimler', to: `${base}/teslimler`, icon: Upload },
      { label: 'Duyurular', to: `${base}/duyurular`, icon: Megaphone },
      { label: 'Sıralama', to: `${base}/siralama`, icon: Trophy },
    ];
    if (isAdmin) {
      items.push(
        { label: 'Sertifikalar', to: `${base}/sertifikalar`, icon: BadgeCheck },
        { label: 'Yarışma Ayarları', to: `${base}/ayarlar`, icon: CalendarCog },
      );
    }
    sections.push({ title: active.title, items });
  }

  if (isAdmin) {
    sections.push({
      title: 'Yönetim',
      items: [
        { label: 'Destek Talepleri', to: `${root}/destek`, icon: LifeBuoy },
        { label: 'Kullanıcılar', to: `${root}/kullanicilar`, icon: Users },
        { label: 'Ekip & Roller', to: `${root}/ekip`, icon: Shield },
        { label: 'Sertifika Sorgula', to: `${root}/sertifika`, icon: ScanLine },
        { label: 'Ayarlar', to: `${root}/ayarlar`, icon: Settings2 },
      ],
    });
  } else {
    sections.push({
      title: 'Araçlar',
      items: [
        { label: 'Destek Talepleri', to: `${root}/destek`, icon: LifeBuoy },
        { label: 'Sertifika Sorgula', to: `${root}/sertifika`, icon: ScanLine },
      ],
    });
  }

  return sections;
}
