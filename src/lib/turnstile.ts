/**
 * Canonical Cloudflare Turnstile server-side siteverify helper.
 *
 * Sends a POST request to https://challenges.cloudflare.com/turnstile/v0/siteverify
 * to validate a Turnstile response token against the TURNSTILE_SECRET.
 */

export interface SiteverifyResult {
  success: boolean;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<SiteverifyResult> {
  const secret =
    (typeof process !== 'undefined' ? process.env?.TURNSTILE_SECRET : undefined) ??
    (import.meta.env ? (import.meta.env.TURNSTILE_SECRET as string) : undefined);

  if (!secret) {
    console.error('Turnstile siteverify: TURNSTILE_SECRET ortam değişkeni bulunamadı.');
    return { success: false, errorCodes: ['missing_secret_key'] };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing_token'] };
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!res.ok) {
      return { success: false, errorCodes: [`http_error_${res.status}`] };
    }

    const data = await res.json();
    return {
      success: Boolean(data.success),
      errorCodes: data['error-codes'],
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
      action: data.action,
      cdata: data.cdata,
    };
  } catch (err) {
    console.error('Turnstile siteverify hatası:', err);
    return { success: false, errorCodes: ['network_error'] };
  }
}
