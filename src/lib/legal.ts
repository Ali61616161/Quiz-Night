export const LEGAL: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  kvkk: { title: "KVKK aydınlatma metni", sections: [
    { h: "Veri sorumlusu ve işleyen", p: "Oyuncu verileri bakımından veri sorumlusu oyunu düzenleyen mekandır; platform, mekan adına verileri işleyen konumundadır. Mekan hesabı verileri bakımından platform veri sorumlusudur." },
    { h: "İşlenen veriler", p: "Oyuncular için yalnızca takma ad, takım adı ve oyun içi cevap/puan bilgisi işlenir. Ad-soyad, telefon, e-posta ya da konum toplanmaz. Mekan sahipleri için e-posta, mekan adı ve fatura bilgileri işlenir." },
    { h: "Amaç ve hukuki sebep", p: "Oyunun yürütülmesi, skor tablosu, hesabın yönetimi ve yasal yükümlülükler. Açık rıza gerektirmeyen asgari veri işlenir (KVKK m.5/2-c, m.5/2-f)." },
    { h: "Saklama ve silme", p: "Oyuncu verileri oyundan 30 gün sonra anonimleştirilir (süre ayarlanabilir). Hesap verileri hesap silinene kadar, fatura kayıtları yasal süre boyunca saklanır." },
    { h: "Haklarınız", p: "KVKK m.11 kapsamında bilgi isteme, düzeltme, silme ve itiraz haklarına sahipsiniz. Başvuru için destek e-posta adresine yazabilirsiniz." },
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
    { h: "Sorumluluk", p: "Soru içeriği özenle hazırlanır ancak hatasız olduğu garanti edilmez; host hatalı soruları iptal edebilir." },
  ] },
  cerez: { title: "Çerez politikası", sections: [
    { h: "Zorunlu çerezler", p: "Mekan paneli oturumu için HttpOnly, SameSite=Lax bir oturum çerezi kullanılır. Oyuncu tarafında çerez yerine tarayıcı yerel depolaması kullanılır (takım anahtarı, host cihaz kimliği)." },
    { h: "İzleme", p: "Reklam ya da üçüncü taraf izleme çerezi kullanılmaz." },
  ] },
};
