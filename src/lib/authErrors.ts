/** Supabase auth hatalarını okunabilir Türkçe mesajlara çevirir. */
const MAP: { match: RegExp; message: string }[] = [
  {
    match: /invalid login credentials/i,
    message: 'E-posta veya şifre hatalı.',
  },
  {
    match: /email not confirmed/i,
    message:
      'E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki doğrulama bağlantısına tıklayın veya “Şifremi unuttum” ile yeni bir bağlantı isteyin.',
  },
  {
    match: /user already registered|already been registered/i,
    message: 'Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.',
  },
  {
    match: /password should be at least/i,
    message: 'Şifreniz en az 8 karakter olmalıdır.',
  },
  {
    match: /email rate limit|over_email_send_rate_limit/i,
    message: 'Çok fazla e-posta gönderildi. Birkaç dakika bekleyip tekrar deneyin.',
  },
  {
    match: /otp_expired|invalid or has expired/i,
    message: 'Doğrulama bağlantısının süresi dolmuş. Yeni bir bağlantı isteyin.',
  },
  {
    match: /schema cache|does not exist|relation .* does not exist/i,
    message:
      'Veritabanı tabloları bulunamadı. Supabase SQL Editor üzerinden supabase/schema.sql dosyasını çalıştırın.',
  },
  {
    match: /database error saving new user|unexpected_failure/i,
    message:
      'Hesap oluşturulurken veritabanı hatası oluştu. Bu genellikle profil oluşturma tetikleyicisinden kaynaklanır — supabase/migrations/004_oauth_signup_fix.sql dosyasını çalıştırın.',
  },
  {
    match: /provider is not enabled|unsupported provider/i,
    message:
      'Bu giriş yöntemi Supabase tarafında etkin değil. Authentication → Providers altından açın.',
  },
  {
    match: /captcha protection|no captcha_token/i,
    message:
      'Supabase paneline Bot/Captcha koruması açık ama captcha token gönderilmedi. Supabase Dashboard → Authentication → Security altından Captcha Protection seçeneğini kapatın veya .env dosyanıza VITE_TURNSTILE_SITE_KEY ekleyin.',
  },
];

export function authErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!raw) return fallback;
  const hit = MAP.find((m) => m.match.test(raw));
  return hit ? hit.message : raw;
}
