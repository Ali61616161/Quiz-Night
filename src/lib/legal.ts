export const LEGAL: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  kvkk: { title: "KVKK aydınlatma metni", sections: [
    { h: "Veri sorumlusu ve işleyen", p: "Oyuncu verileri bakımından veri sorumlusu oyunu düzenleyen mekandır; platform, mekan adına verileri işleyen konumundadır. Mekan hesabı verileri bakımından platform veri sorumlusudur." },
    { h: "İşlenen veriler", p: "Oyuncular için yalnızca takma ad, takım adı ve oyun içi cevap/puan bilgisi işlenir. Ad-soyad, telefon, e-posta ya da konum toplanmaz. Mekan sahipleri için e-posta, mekan adı ve fatura bilgileri işlenir." },
    { h: "Amaç ve hukuki sebep", p: "Oyunun yürütülmesi, skor tablosu, hesabın yönetimi ve yasal yükümlülükler. Açık rıza gerektirmeyen asgari veri işlenir (KVKK m.5/2-c, m.5/2-f)." },
    { h: "Saklama ve silme", p: "Oyuncu verileri oyundan 30 gün sonra anonimleştirilir (süre ayarlanabilir). Hesap verileri hesap silinene kadar, fatura kayıtları yasal süre boyunca saklanır." },
    { h: "Takma ad ve kayıtlar", p: "Takma ad ve takım adı tek başına kimliği belirlemez; ancak kişisel veri sayılabileceği varsayılarak korunur. Güvenlik amacıyla IP adresi, tarayıcı bilgisi ve erişim zamanı kayıtları sınırlı süre tutulur (5651 sayılı Kanun kapsamındaki yükümlülükler saklıdır)." },
    { h: "Aktarım ve alıcı grupları", p: "Veriler; barındırma, e-posta gönderimi, ödeme ve (mekan isterse) yapay zekâ destekli soru taslağı hizmeti sağlayan altyapı sağlayıcılarına, yalnızca hizmetin gerektirdiği ölçüde aktarılır. Bu sağlayıcılardan bir kısmı yurt dışında bulunabilir; yurt dışına aktarım KVKK m.9 ve Kurul düzenlemelerine uygun güvenceyle (standart sözleşme, taahhüt ya da yeterlilik kararı) yapılır ve yapılacak bildirimler yerine getirilir. Oyuncu adı/cevabı yapay zekâ sağlayıcısına gönderilmez." },
    { h: "Yaş sınırı", p: "Alkollü mekanlarda yapılan geceler 18 yaş ve üzeri katılımcılar içindir. 18 yaş altı bireylerin katılımından mekan sorumludur; platform bilerek 18 yaş altından veri toplamaz." },
    { h: "Haklarınız", p: "KVKK m.11 kapsamında bilgi isteme, düzeltme, silme, aktarılan kişileri öğrenme ve itiraz haklarına sahipsiniz. Başvurular en geç 30 gün içinde yanıtlanır; destek e-postası ya da KEP adresi üzerinden yapılabilir. Kurul'a şikâyet hakkınız saklıdır." },
  ] },
  gizlilik: { title: "Gizlilik politikası", sections: [
    { h: "Ne topluyoruz", p: "Oyuncu hesabı yoktur. Takma ad ve takım adı oyun süresince tutulur. Oyun sırasında cihazınızda yalnızca oturum için bir takım anahtarı saklanır." },
    { h: "Kimlerle paylaşılır", p: "Veriler üçüncü taraflara satılmaz. Altyapı sağlayıcıları (barındırma, e-posta, ödeme) yalnızca hizmetin gerektirdiği ölçüde veri işler." },
    { h: "Güvenlik", p: "Şifreler tek yönlü şifreli (scrypt) saklanır, bağlantılar TLS ile korunur, oyuncu uçları hız sınırlıdır." },
  ] },
  kosullar: { title: "Kullanım koşulları", sections: [
    { h: "Hizmet", p: "Platform, mekanlara quiz gecesi düzenleme yazılımı sunar. Oyuncular ücretsiz katılır; mekanlar plana göre abonelik öder." },
    { h: "Kabul edilebilir kullanım", p: "Takım adları ve mekan içerikleri hakaret, nefret söylemi ve telifli materyal içeremez. Kuralları ihlal eden içerik kaldırılabilir." },
    { h: "Abonelik ve iptal", p: "Abonelikler dönem sonunda yenilenir. İptal edilirse dönem sonuna kadar plan geçerlidir. Plan düşürüldüğünde ileri özellikler kapanır, verileriniz silinmez." },
    { h: "Sorumluluk", p: "Soru içeriği özenle hazırlanır ancak hatasız olduğu garanti edilmez; host hatalı soruları iptal edebilir. Platform kesintisiz çalışma taahhüdü vermez; bakım ve olağanüstü durumlar saklıdır." },
    { h: "Ödüller, bahis ve alkol", p: "Platform ödül dağıtmaz ve bahis/şans oyunu aracı değildir. Mekanın verdiği ödüller bilgi ve beceriye dayalı yarışma sonucuna bağlı olmalıdır; şans unsuruna dayalı çekiliş, para ya da para yerine geçen değerle oynatma, yürürlükteki mevzuat (özellikle 7258 sayılı Kanun) kapsamında izne tabi olabilir ve mekanın sorumluluğundadır. Alkol satışı ve yaş doğrulaması mekanın sorumluluğundadır." },
    { h: "Fiyat, fatura ve ayrılma", p: "Fiyatlara KDV dahil/hariç olduğu satın alma ekranında belirtilir. Fatura e-fatura/e-arşiv olarak düzenlenir. Hizmet, ifasına başlandıktan sonra anında ifa edilen elektronik hizmet niteliğindedir; mesafeli sözleşme kapsamındaki tüketiciler için cayma hakkının istisnaları ön bilgilendirme formunda belirtilir. Mekan hesabı iptal edildiğinde dönem sonuna kadar kullanım sürer." },
    { h: "Fikrî mülkiyet", p: "Platform yazılımı ve soru bankası sağlayıcıya aittir; mekana yalnızca abonelik süresince kullanım lisansı verilir. Mekan, yüklediği içeriğin haklarına sahip olduğunu beyan eder." },
    { h: "Uygulanacak hukuk", p: "Türk hukuku uygulanır; uyuşmazlıklarda sağlayıcının yerleşim yerindeki mahkemeler ve icra daireleri (tüketici işlemlerinde tüketici hakem heyetleri/mahkemeleri) yetkilidir." },
  ] },
  cerez: { title: "Çerez politikası", sections: [
    { h: "Zorunlu çerezler", p: "Mekan paneli oturumu için HttpOnly, SameSite=Lax bir oturum çerezi kullanılır. Oyuncu tarafında çerez yerine tarayıcı yerel depolaması kullanılır (takım anahtarı, host cihaz kimliği)." },
    { h: "İzleme", p: "Reklam ya da üçüncü taraf izleme çerezi kullanılmaz." },
  ] },
};
