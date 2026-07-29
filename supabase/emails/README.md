# GurX™ e-posta şablonları

Tüm şablonlar tek dosyalık, inline CSS'li HTML'dir (Gmail, Outlook ve Apple Mail
harici stil dosyası yüklemez). Görseller `https://gurx.gurlabs.com` üzerinden
çekilir — site yayına alınmadan önce logolar görünmez.

| Dosya | Nerede kullanılır |
| --- | --- |
| `confirm-signup.html` | Supabase → Authentication → Email Templates → **Confirm signup** |
| `invite-user.html` | Supabase → Authentication → Email Templates → **Invite user** |
| `magic-link.html` | Supabase → Authentication → Email Templates → **Magic link** |
| `change-email.html` | Supabase → Authentication → Email Templates → **Change email address** |
| `reset-password.html` | Supabase → Authentication → Email Templates → **Reset password** |
| `password-changed.html` | Supabase → Authentication → Email Templates → **Password changed** |
| `reauthentication.html` | Supabase → Authentication → Email Templates → **Reauthentication** |
| `announcement.html` | Duyuru gönderimi (kendi gönderim akışınız / Edge Function) |

## 1. SMTP kurulumu

Supabase Dashboard → **Project Settings → Authentication → SMTP Settings**:

```
Sender email : gurx@gurlabs.com
Sender name  : GurX Design Awards
Host         : (sağlayıcınızın SMTP sunucusu)
Port         : 587   (STARTTLS)  veya 465 (SSL)
Username     : gurx@gurlabs.com
Password     : (SMTP şifresi / uygulama şifresi)
```

> Bu bilgileri bana iletmeniz **gerekmiyor** ve iletmeyin — doğrudan Supabase
> panelinden girin. Depoya SMTP şifresi yazılmamalıdır.

SMTP tanımlanmadan Supabase kendi paylaşımlı gönderim havuzunu kullanır; saatlik
gönderim limiti çok düşüktür ve yarışma günü yetmez.

## 2. Şablonları yerleştirme

Authentication → **Email Templates** altında ilgili sekmeyi açın, dosyanın
tamamını yapıştırın ve kaydedin. Supabase değişkenleri şablonlarda hazırdır:

- `{{ .ConfirmationURL }}` — doğrulama / sıfırlama bağlantısı
- `{{ .Token }}` — 6 haneli kod (kod tabanlı akışa geçerseniz)
- `{{ .Email }}` — alıcının adresi

## 3. Duyuru şablonu

`announcement.html` içindeki yer tutucular gönderim sırasında değiştirilir:

| Yer tutucu | Açıklama |
| --- | --- |
| `{{TITLE}}` | Duyuru başlığı |
| `{{PREVIEW}}` | Gelen kutusunda görünen ön izleme satırı |
| `{{BODY}}` | Gövde (HTML `<p>` blokları) |
| `{{EVENT_NAME}}` | Sağ üstteki etkinlik adı, örn. `GurX Youth Design '26` |
| `{{CTA_URL}}` / `{{CTA_LABEL}}` | Buton bağlantısı ve metni |

Toplu gönderim için bir Supabase Edge Function yazılması gerekir; SMTP bilgileri
girildikten sonra bu adımı ekleyebiliriz.
