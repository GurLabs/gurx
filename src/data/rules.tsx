import React from 'react';
import { AI_STUDIO } from '../lib/brand';

export interface RuleArticle {
  id: string;
  title: string;
  paragraphs?: React.ReactNode[];
  items?: React.ReactNode[];
}

/** Yarışma kurallarının tek kaynağı: hem herkese açık sayfa hem panel bunu kullanır. */
export const RULE_ARTICLES: RuleArticle[] = [
  {
    id: 'kapsam',
    title: '1. Kapsam ve Taraflar',
    paragraphs: [
      <>
        Bu Kurallar ve Şartlar metni, GurLabs Foundation<sup>™</sup> tarafından GurX
        <sup>™</sup> Design Awards programı altında düzenlenen <strong>GurX Youth Design 2026</strong>{' '}
        yarışmasının katılım, değerlendirme, ödüllendirme ve belgelendirme koşullarını düzenler.
      </>,
      <>
        Yarışmaya başvuran her kişi, başvuru formunu gönderdiği anda bu metnin tamamını okuduğunu,
        anladığını ve kabul ettiğini beyan etmiş sayılır.
      </>,
      <>
        Bu metinde geçen “Organizatör” ifadesi GurLabs Foundation<sup>™</sup> ve GurX
        <sup>™</sup> ekibini; “Katılımcı” ifadesi başvurusu onaylanan gerçek kişiyi; “Proje”
        ifadesi katılımcının yarışma süresi içinde ürettiği ve teslim ettiği çalışmayı ifade eder.
      </>,
    ],
  },
  {
    id: 'katilim',
    title: '2. Katılım Koşulları',
    items: [
      'Katılım tamamen ücretsizdir. Organizatör hiçbir aşamada katılımcıdan ücret talep etmez.',
      'Katılımcılar 15 ile 21 yaş aralığında olmalıdır; 22 yaşından büyük başvurular kabul edilmez.',
      '15 yaşında veya daha küçük katılımcılar, başvuru formundaki veli izni onayını işaretlemek zorundadır. Bu onay verilmeden başvuru tamamlanamaz.',
      'Başvuru sırasında verilen ad, soyad, e-posta ve doğum yılı bilgileri doğru olmalıdır. Sertifikalar bu bilgilerle düzenlenir ve sonradan değiştirilmez.',
      'Kayıt sırasında girilen ad soyad ve e-posta bilgileri başvuru formuna otomatik taşınır; bu alanlar zorunludur.',
      'Her katılımcı yalnızca bir hesap ve bir başvuru oluşturabilir. Çoklu hesap tespiti, tüm hesapların diskalifiyesiyle sonuçlanır.',
      'Yarışma bireyseldir. Ekip halinde teslim edilen projeler değerlendirmeye alınmaz.',
    ],
  },
  {
    id: 'referans',
    title: '3. Başvuru Koşulları',
    paragraphs: [
      <>
        GurX™ yarışmalarına katılım tamamen ücretsizdir. Başvuru formunu dolduran tüm katılımcılar yarışmaya doğrudan katılabilir.
      </>,
    ],
    items: [
      'Ad soyad, e-posta ve doğum yılı bilgilerinizin doğru ve eksiksiz olması zorunludur.',
      '15 - 21 yaş arasındaki tüm tasarımcılar ve geliştiriciler başvuru yapabilir.',
      '15 yaş ve altındaki katılımcılar için veli izni onayı gereklidir.',
      'Tüm katılımcıların GurX™ etik ve kural ilkelerine uyması beklenir.',
    ],
  },
  {
    id: 'sure',
    title: '4. Yarışma Süresi ve Konu',
    items: [
      'Yarışma konusu, takvimde ilan edilen tarih ve saatte katılımcı panelinde ve e-posta ile aynı anda duyurulur.',
      'Konunun açıklandığı andan itibaren tüm katılımcılar için 24 saatlik ortak bir süre başlar.',
      'Süre sonunda teslim bölümü otomatik olarak kapanır. Süre dolduktan sonra yapılan teslimler değerlendirmeye alınmaz.',
      'Konuyla ilgili sorular yalnızca resmî destek kanalı üzerinden yanıtlanır; katılımcılar arasında konu hakkında bilgi paylaşımı serbesttir ancak proje paylaşımı yasaktır.',
      'Teknik bir aksaklık nedeniyle sürenin uzatılması yalnızca Organizatörün takdirindedir ve tüm katılımcılar için eşit şekilde uygulanır.',
    ],
  },
  {
    id: 'arac',
    title: '5. Zorunlu Tasarım Ortamı',
    paragraphs: [
      <>
        GurX Youth Design projeleri <strong>Google AI Studio</strong> (
        <a
          href={AI_STUDIO.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          aistudio.google.com
        </a>
        ) üzerinde Vibe Coding ile tasarlanmak zorundadır. Bu kural, tüm katılımcıların aynı araç
        setiyle ve eşit koşullarda yarışmasını sağlamak için konulmuştur.
      </>,
    ],
    items: [
      'Farklı bir ortamda üretildiği tespit edilen projeler değerlendirmeye alınmaz.',
      'Organizatör, gerektiğinde katılımcıdan üretim sürecine dair kanıt (proje geçmişi, ekran kaydı vb.) talep edebilir.',
      'AI Studio içinde üretilen proje, teslim aşamasında Vercel veya Netlify üzerinden yayına alınır.',
    ],
  },
  {
    id: 'teslim',
    title: '6. Teslim Kuralları',
    items: [
      'Proje, Vercel veya Netlify üzerinden yayına alınmalı ve canlı bağlantı katılımcı panelindeki sonuç yükleme bölümüne girilmelidir.',
      'Teslimle birlikte hero bölümünün ekran görüntüsü zorunludur; bu görsel oylama sayfasında kullanılır.',
      'Canlı bağlantı, oylama ve sonuç açıklama süreci tamamlanana kadar erişilebilir kalmalıdır. Erişilemeyen projeler puanlamadan çıkarılır.',
      'Projede yapılan SEO ve güvenlik iyileştirmeleri, teslim formundaki ilgili alanlarda kısaca özetlenmelidir.',
      'Süre dolduktan sonra proje üzerinde yapılan değişiklikler tespit edilirse ilgili teslim iptal edilir.',
    ],
  },
  {
    id: 'puanlama',
    title: '7. Açık Puanlama ve Oylama',
    paragraphs: [
      <>
        Yarışma <strong>açık puanlama</strong> ile değerlendirilir. Değerlendirme kapalı bir jüri
        tarafından değil, yarışmaya katılan tasarımcılar tarafından yapılır.
      </>,
    ],
    items: [
      'Teslim süresi dolduğunda tüm projeler oylama sayfasında hero görselleriyle birlikte yayınlanır.',
      'Oylama yalnızca yarışmaya katılan ve projesini teslim etmiş kullanıcılara açıktır.',
      'Hiçbir katılımcı kendi projesine oy veremez; sistem bunu teknik olarak engeller.',
      'Puanlama üç başlıkta yapılır: Tasarım & Deneyim, SEO, Güvenlik. Her başlık 1–10 arası puanlanır.',
      'Toplam puan, üç başlığın ortalamalarının toplamıdır. Eşitlik hâlinde sırasıyla Tasarım, Güvenlik ve SEO puanı yüksek olan öne geçer.',
      'Oy ticareti, karşılıklı oy anlaşması veya organize oy yönlendirmesi tespit edilen katılımcılar diskalifiye edilir.',
      'Puanlar ve sıralama, oylama kapandıktan sonra sıralama sayfasında herkese açık şekilde yayınlanır.',
    ],
  },
  {
    id: 'oduller',
    title: '8. Ödüller, Sertifika ve Rozetler',
    paragraphs: [
      <>
        GurX<sup>™</sup> yarışmalarında nakit ödül verilmez. Ödüller, kariyerinizde kalıcı olarak
        kullanabileceğiniz doğrulanabilir dijital belgelerden oluşur.
      </>,
    ],
    items: [
      'Katılım Belgesi (01): Projesini süresi içinde ve kurallara uygun teslim eden her katılımcıya verilir.',
      'Best Design (02): Tasarım ve deneyim başlığında en yüksek puanı alan projeye verilir.',
      'Best SEO (03): SEO başlığında en yüksek puanı alan projeye verilir.',
      'Best Security (04): Güvenlik başlığında en yüksek puanı alan projeye verilir.',
      'Grand Winner (05): Toplam puanda birinci olan projeye verilen ana ödüldür.',
      'Sertifikalar PDF olarak katılımcı panelinden indirilir; rozetler PNG olarak verilir ve portfolyo ile GitHub profillerinde kullanılabilir.',
    ],
  },
  {
    id: 'sertifika-kodu',
    title: '9. Sertifika Kodu ve Doğrulama',
    paragraphs: [
      <>
        Her sertifika benzersiz bir kodla üretilir. Örnek:{' '}
        <code className="font-mono font-semibold">GYD-26-0001-01</code>
      </>,
    ],
    items: [
      <>
        <code className="font-mono font-semibold">GYD</code> — Etkinlik kodu (GurX Youth Design)
      </>,
      <>
        <code className="font-mono font-semibold">26</code> — Yıl (2026)
      </>,
      <>
        <code className="font-mono font-semibold">0001</code> — Katılımcı / kullanıcı ID (sıralı,
        benzersiz)
      </>,
      <>
        <code className="font-mono font-semibold">01</code> — Belge veya ödül türü kodu: 01 Katılımcı
        Belgesi · 02 Best Design · 03 Best SEO · 04 Best Security · 05 Grand Winner
      </>,
      <>
        Doğrulama adresi:{' '}
        <code className="font-mono">https://gurx.gurlabs.com/certificate/verify/&lt;KOD&gt;</code>
      </>,
      'Doğrulama sayfası; sertifika sahibinin adını, ödül türünü, veriliş tarihini ve düzenleyen kurumu gösterir.',
      'Organizatör, kural ihlali tespit ettiği sertifikaları iptal etme hakkını saklı tutar. İptal edilen kodlar doğrulama sayfasında geçersiz olarak görünür.',
    ],
  },
  {
    id: 'ozgunluk',
    title: '10. Özgünlük ve Fikri Haklar',
    items: [
      'Proje, yarışma süresi içinde ve katılımcının kendisi tarafından üretilmiş olmalıdır.',
      'Hazır şablonların birebir kullanımı, başka bir tasarımın kopyalanması veya başkasına ait çalışmanın teslim edilmesi diskalifiye sebebidir.',
      'Projenin tüm fikri mülkiyet hakları katılımcıya aittir.',
      'Katılımcı, projesinin görsellerinin ve adının GurX™ ve GurLabs Foundation™ tarafından tanıtım, arşiv ve sonuç yayınları amacıyla kullanılmasına izin verir.',
      'Üçüncü taraf görsel, font ve kütüphanelerin lisans koşullarına uyulması katılımcının sorumluluğundadır.',
    ],
  },
  {
    id: 'davranis',
    title: '11. Davranış Kuralları',
    items: [
      'Nefret söylemi, ayrımcılık, taciz veya yasa dışı içerik barındıran projeler doğrudan diskalifiye edilir.',
      'Diğer katılımcıların projelerine zarar vermeye yönelik her türlü teknik girişim yasaktır.',
      'Oylama sürecinde diğer katılımcılara baskı yapmak veya oy talep etmek yasaktır.',
      'Organizatör ekibine yanıltıcı bilgi vermek diskalifiye sebebidir.',
    ],
  },
  {
    id: 'diskalifiye',
    title: '12. Diskalifiye ve İtiraz',
    items: [
      'Kural ihlali tespit edilen katılımcının teslimi puanlamadan çıkarılır ve varsa belgeleri iptal edilir.',
      'Diskalifiye kararı katılımcıya e-posta ile bildirilir.',
      'Katılımcı, bildirimden itibaren 5 gün içinde itiraz edebilir. İtirazlar Organizatör tarafından değerlendirilir ve sonuç yazılı olarak bildirilir.',
      'İtiraz sonucunda verilen karar nihaidir.',
    ],
  },
  {
    id: 'gizlilik',
    title: '13. Gizlilik Politikası',
    items: [
      'Kayıt ve başvuru sırasında yalnızca yarışmanın yürütülmesi için gerekli veriler toplanır: ad soyad, e-posta, doğum yılı, referans bağlantıları ve proje bilgileri.',
      'Doğum yılı yalnızca yaş uygunluğunun kontrolü için kullanılır ve herkese açık olarak yayınlanmaz.',
      'E-posta adresiniz üçüncü taraflarla paylaşılmaz; yalnızca yarışma duyuruları ve sonuç bildirimleri için kullanılır.',
      'Sıralama ve sertifika doğrulama sayfalarında yalnızca ad soyad, proje adı ve ödül bilgisi görünür.',
      'Veriler Supabase altyapısında saklanır ve erişim yetkilendirme kuralları ile sınırlandırılmıştır.',
    ],
  },
  {
    id: 'kvkk',
    title: '14. KVKK ve Veri Sahibi Hakları',
    paragraphs: [
      <>
        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu GurLabs Foundation
        <sup>™</sup>’dır.
      </>,
    ],
    items: [
      'Kişisel verileriniz, yarışmanın yürütülmesi ve belgelendirme yükümlülüğünün yerine getirilmesi amacıyla işlenir.',
      'Verilerinize erişme, düzeltilmesini isteme, silinmesini talep etme ve işlenmesine itiraz etme hakkına sahipsiniz.',
      'Taleplerinizi gurx@gurlabs.com adresine iletebilirsiniz; başvurular en geç 30 gün içinde yanıtlanır.',
      'Sertifika doğrulama kayıtları, belgenin geçerliliğini sürdürebilmek amacıyla süresiz olarak saklanır. Hesabınızı sildirmeniz durumunda doğrulama sayfasında yalnızca sertifika sahibinin adı kalır.',
    ],
  },
  {
    id: 'sorumluluk',
    title: '15. Sorumluluğun Sınırlandırılması',
    items: [
      'Organizatör, üçüncü taraf servislerde (Google AI Studio, Vercel, Netlify, Supabase) yaşanabilecek kesintilerden sorumlu değildir.',
      'Katılımcının internet bağlantısı, cihazı veya hesap erişimi kaynaklı sorunlar süre uzatımı gerekçesi sayılmaz.',
      'Projelerin içeriğinden ve barındırdığı üçüncü taraf materyallerden katılımcı sorumludur.',
    ],
  },
  {
    id: 'degisiklik',
    title: '16. Değişiklikler ve Yürürlük',
    items: [
      'Organizatör, bu metinde değişiklik yapma hakkını saklı tutar. Değişiklikler bu sayfada yayınlandığı anda yürürlüğe girer.',
      'Yarışma süresi başladıktan sonra yapılan değişiklikler, katılımcı aleyhine sonuç doğuracak şekilde uygulanmaz.',
      'Bu metnin herhangi bir maddesinin geçersiz sayılması diğer maddelerin geçerliliğini etkilemez.',
      'Uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır.',
    ],
  },
];
