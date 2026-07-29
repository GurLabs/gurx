# GurX™ Design Awards

**GurLabs Foundation™** tarafından düzenlenen uluslararası UI/UX ve Vibe Coding tasarım
yarışmaları platformu. Aktif yarışma: **GurX Youth Design 2026**.

React 19 + Vite + Tailwind v4 + Supabase. Tüm akışlar gerçek sayfa (route) olarak çalışır —
uygulamada **hiçbir popup / modal yoktur**; giriş, kayıt, başvuru, teslim ve doğrulama dâhil.

---

## Kurulum

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayın ve Supabase anahtarlarınızı girin:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Anahtarlar tanımlı değilken herkese açık sayfalar örnek içerikle çalışmaya devam eder;
> giriş, kayıt, oylama ve panel işlemleri devre dışı kalır ve sitede bir uyarı görünür.

### Cloudflare Turnstile (bot koruması)

1. Cloudflare Dashboard → **Turnstile** → Site ekleyin, alan adınızı girin.
2. **Site key**'i `.env` içindeki `VITE_TURNSTILE_SITE_KEY` alanına yazın.
3. **Secret key**'i Supabase Dashboard → **Authentication → Settings → Bot and Abuse
   Protection** altında "Enable CAPTCHA protection" seçeneğini açıp Turnstile sağlayıcısıyla
   girin.

> 3. adım olmadan koruma yalnızca tarayıcı tarafında kalır. Kayıt akışında token Supabase'e
> gönderilir ve orada doğrulanır; doğrulama sayfasındaki widget ise sunucu tarafı bir çağrıya
> bağlanmadığı için yalnızca otomatik taramayı zorlaştırır.

### E-posta (SMTP)

Şablonlar ve kurulum adımları: [`supabase/emails/README.md`](supabase/emails/README.md).
SMTP şifresi **depoya yazılmaz**, doğrudan Supabase panelinden girilir.

### Veritabanı

1. Supabase Dashboard → **SQL Editor**
2. [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını çalıştırın.
2b. Ardından [`supabase/migrations/002_profiles_tickets_jury.sql`](supabase/migrations/002_profiles_tickets_jury.sql)
   dosyasını çalıştırın (profil alanları, avatar kovası, destek talepleri, jüri puanlaması).
   schema.sql'i daha önce çalıştırdıysanız **yalnızca** 002'yi çalıştırmanız yeterlidir.
3. **Authentication → Providers → Google** sağlayıcısını etkinleştirin.
4. **Authentication → URL Configuration** altında Redirect URL olarak
   `https://<alan-adiniz>/auth/callback` ve `http://localhost:3000/auth/callback` ekleyin.

Şema; `zulfumirzagur23@gmail.com` adresiyle kayıt olan kullanıcıya otomatik olarak **admin**
rolü verir. Diğer roller admin panelindeki *Kullanıcılar* sekmesinden atanır.

### Geliştirme

```bash
npm run dev
```

```bash
npm run lint
```

---

## Yapı

Site iki ayrı yüzeyden oluşur:

1. **Tanıtım sitesi** (`/`) — üst menülü, geniş, pazarlama odaklı sayfalar.
2. **Konsol** (`/dashboard`, `/admin`, `/staff`) — dokümantasyon tarzı kalıcı sol menü,
   ince üst bar ve sağda "Bu sayfada" bağlantı rayı. Bir yarışma seçildiğinde o yarışmanın
   bölümleri sol menüde iç içe açılır.

### Tanıtım sitesi

| Rota | İçerik |
| --- | --- |
| `/` | GurX™ Awards nedir, işleyiş, kimler katılabilir, aktif yarışma, ödüller, SSS |
| `/youth-design` | GurX Youth Design 2026 proje detayları, takvim, koşullar, duyurular |
| `/kurallar` | Kurallar ve Şartlar (16 madde, gizlilik ve KVKK dâhil) |
| `/yardim` | Yardım merkezi: AI Studio → SEO → güvenlik → Vercel/Netlify → teslim |
| `/siralama` | Sıralama, podyum ve ödül kazananlar |
| `/yetkili-basvuru` | Jüri / moderatör / destekleyici başvurusu (Google Forms'a yönlendirir) |
| `/kayit`, `/giris` | Kayıt ve giriş (Google, GitHub, e-posta) |

Doğrulama servisi sitenin kabuğundan bağımsızdır — kendi sade header/footer'ı vardır:

| Rota | İçerik |
| --- | --- |
| `/dogrula`, `/dogrula/:code` | Sertifika doğrulama servisi |
| `/certificate/verify/:code` | Aynı sayfa — QR kodlarında kullanılan kanonik adres |
| `/certificate/:code/belge` | Yazdırılabilir / PDF sertifika |

### Katılımcı konsolu — `/dashboard`

Sol menü: **Yarışmalar** · seçili yarışma · **Hesabım** (Ödüllerim, Sertifika Sorgula, Profilim)
· **Bilgi** (Kurallar, Yardım, Yasal).

| Rota | İçerik |
| --- | --- |
| `/dashboard/yarismalar` | Tüm yarışmalar |
| `/dashboard/yarismalar/:slug` | Genel Bakış — geri sayım, konu, durum, duyurular, referans linki |
| `…/duyurular` | Duyurular |
| `…/kurallar` | Yarışma kuralları |
| `…/basvurum` | Başvuru formu (yaş kontrolü + veli izni) |
| `…/teslim` | Sonuç Yükleme (canlı bağlantı + hero görseli) |
| `…/oylama` | Oylama — kendi projesine oy verilemez |
| `…/oduller` | Bu yarışmadaki sertifika ve rozetleriniz |
| `…/siralama` | Sıralama |
| `/dashboard/oduller` | Tüm sertifikalarınız (PDF + rozet indirme) |
| `/dashboard/sertifika` | Sertifika sorgulama |
| `/dashboard/profil` | Profil |

### Yönetim konsolu — `/admin` (admin) ve `/staff` (staff)

Aynı kabuk, farklı menü. Staff; yarışma ayarlarını, sertifika üretimini ve rol yönetimini görmez.

| Rota | İçerik | Erişim |
| --- | --- | --- |
| `/admin/genel` | Özet sayılar, takvim, kısayollar | Staff + Admin |
| `/admin/yarismalar/:slug/basvurular` | Başvuru onay / ret | Staff + Admin |
| `…/teslimler` | Teslim yayınlama kontrolü | Staff + Admin |
| `…/duyurular` | Duyuru yayınlama | Staff + Admin |
| `…/siralama` | Sıralama | Staff + Admin |
| `…/sertifikalar` | Sertifika üretimi (tekil + toplu katılım) | Admin |
| `…/ayarlar` | Konu, takvim, durum | Admin |
| `/admin/kullanicilar` | Rol yönetimi | Admin |
| `/admin/ayarlar` | Platform sabitleri | Admin |

---

## Sertifika kodu

```
GYD-26-0001-01
 │   │   │    └─ Belge / ödül türü
 │   │   └────── Katılımcı ID (sıralı, benzersiz)
 │   └────────── Yıl (2026)
 └────────────── Etkinlik kodu (GurX Youth Design)
```

| Kod | Ödül | Rozet |
| --- | --- | --- |
| `01` | Katılımcı Belgesi | `gy-attendee.png` |
| `02` | Best Design | `gy-best-design.png` |
| `03` | Best SEO | `gy-best-seo.png` |
| `04` | Best Security | `gy-best-secure.png` |
| `05` | Grand Winner | `gy-grand-winner.png` |
| `06` | Yetkili Görev Belgesi (jüri / moderatör) | `gf-badge.png` |

Doğrulama adresi: `https://gurx.gurlabs.com/certificate/verify/GYD-26-0001-01`

Sertifika PDF'i tarayıcının yazdırma diyaloğu üzerinden ("PDF olarak kaydet") üretilir;
`/certificate/:code/belge` sayfası A4 yatay olarak yazdırılmak üzere hazırlanmıştır.

---

## Yarışma kuralları (özet)

- Yaş: **15 – 21** (22 yaşından küçük). 15 yaş ve altı için **veli izni onayı** zorunlu.
- Başvuru referansları: **1 Vibe Coding web sitesi** + **1 portfolyo** (kendi siteniz, LinkedIn
  veya GitHub).
- Zorunlu tasarım ortamı: **aistudio.google.com** (Google AI Studio).
- Konu açıklandıktan sonra **24 saat** üretim süresi; SEO ve güvenlik iyileştirmeleri dâhil.
- Teslim: **Vercel** veya **Netlify** üzerinde yayınlanmış canlı bağlantı + hero ekran görüntüsü.
- Değerlendirme: **açık puanlama** — katılımcılar birbirini puanlar, kimse kendi projesine oy
  veremez. Bu kural veritabanı tetikleyicisiyle de zorunlu kılınır.

Kuralların tamamı `/kurallar` sayfasında ve [`src/pages/RulesPage.tsx`](src/pages/RulesPage.tsx)
içinde yer alır.

---

## Yayına alma kontrol listesi (Vercel)

1. **Migration'ları çalıştırın** — `schema.sql` → `002_profiles_tickets_jury.sql` →
   `003_roles_and_profile_fix.sql`. (Daha önce kurduysanız yalnızca eksik olanlar.)
2. **Vercel → New Project** → repoyu içe aktarın. Framework otomatik *Vite* algılanır;
   `vercel.json` build komutunu, SPA yönlendirmesini ve güvenlik başlıklarını zaten içerir.
3. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL=https://gurx.gurlabs.com`
   - `VITE_TURNSTILE_SITE_KEY`
4. **Supabase → Authentication → URL Configuration**: Site URL'i ve
   `https://gurx.gurlabs.com/auth/callback` adresini Redirect URLs'e ekleyin.
5. **Supabase → Authentication → Providers**: Google ve GitHub sağlayıcılarını açın;
   her ikisinin callback adresi Supabase'in verdiği adrestir.
6. **SMTP** ve **Turnstile secret key**: `supabase/emails/README.md` adımları.
7. Alan adını Vercel'de bağlayın; `gurx.gurlabs.com` için CNAME kaydı.

> `vercel.json` içindeki Content-Security-Policy yalnızca Supabase, Google Fonts ve
> Cloudflare Turnstile'a izin verir. Yeni bir dış servis eklerseniz `connect-src` /
> `script-src` listesini güncellemeniz gerekir.

## Dağıtım

`vercel.json` ve `public/_redirects` SPA yönlendirmelerini ve temel güvenlik başlıklarını
içerir; proje Vercel veya Netlify'a doğrudan yüklenebilir.

Ortam değişkenlerini (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) dağıtım panelinde
tanımlamayı unutmayın.

---

Bir **GurLabs Foundation™** projesidir.
