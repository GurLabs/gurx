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
      'Hesap oluşturulurken veritabanı hatası oluştu. Lütfen Supabase SQL Editor üzerinden migration 004 sorgusunu çalıştırın.',
  },
  {
    match: /captcha protection: request disallowed \(timeout-or-duplicate\)/i,
    message:
      'Güvenlik doğrulamasının (Captcha) süresi doldu. Lütfen aşağıdaki güvenlik kutucuğunu tekrar işaretleyin.',
  },
  {
    match: /captcha protection: request disallowed|no captcha_token/i,
    message:
      'Güvenlik doğrulaması (Captcha) gerekli. Lütfen formun altındaki güvenlik kutucuğunu işaretleyin.',
  },
  {
    match: /provider is not enabled|unsupported provider/i,
    message:
      'Bu giriş yöntemi Supabase tarafında etkin değil. Authentication → Providers altından açın.',
  },
];

export function authErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;

  let raw = '';
  if (typeof err === 'string') {
    raw = err;
  } else if (err instanceof Error) {
    raw = err.message;
  } else if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message && obj.message !== '{}') {
      raw = obj.message;
    } else if (typeof obj.error_description === 'string' && obj.error_description) {
      raw = obj.error_description;
    } else if (typeof obj.msg === 'string' && obj.msg) {
      raw = obj.msg;
    } else {
      try {
        const str = JSON.stringify(err);
        if (str && str !== '{}') raw = str;
      } catch {
        /* ignore */
      }
    }
  }

  if (!raw || raw.trim() === '{}' || raw.trim() === '') return fallback;

  const hit = MAP.find((m) => m.match.test(raw));
  return hit ? hit.message : raw;
}
