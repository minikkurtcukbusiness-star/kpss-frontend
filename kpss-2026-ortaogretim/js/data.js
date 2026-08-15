/* ==========================================================================
   data.js — KPSS 2026 Ortaöğretim Takip
   Statik veri: dersler, konu listeleri, motivasyon sözleri,
   güncel bilgiler (elle güncellenen seed liste) ve varsayılan çalışma planı.
   ========================================================================== */

const SINAV_TARIHI_VARSAYILAN = "2026-10-25";

const SUBJECTS_META = [
  { id: "turkce",      name: "Türkçe",           renk: "#29467B" },
  { id: "matematik",   name: "Matematik",        renk: "#B0562C" },
  { id: "tarih",       name: "Tarih",             renk: "#7A5230" },
  { id: "cografya",    name: "Coğrafya",          renk: "#3E8E63" },
  { id: "vatandaslik", name: "Vatandaşlık",       renk: "#5C4A9C" },
  { id: "guncel",      name: "Güncel Bilgiler",   renk: "#C0483D" }
];

const TOPICS_SEED = {
  turkce: [
    "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcükte Anlam",
    "Cümlede Anlam", "Paragrafta Anlam", "Anlatım Bozuklukları",
    "İsim (Ad)", "Sıfat", "Zamir", "Zarf", "Edat - Bağlaç - Ünlem",
    "Fiil (Eylem)", "Fiilde Çatı", "Fiilimsi", "Cümlenin Öğeleri", "Cümle Türleri"
  ],
  matematik: [
    "Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "EBOB - EKOK",
    "Rasyonel Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar",
    "Köklü Sayılar", "Çarpanlara Ayırma", "Oran - Orantı", "Denklem Çözme",
    "Sayı Problemleri", "Yaş Problemleri", "Kesir Problemleri", "Hareket Problemleri",
    "İşçi - Havuz Problemleri", "Yüzde Problemleri", "Kar - Zarar Problemleri",
    "Karışım Problemleri", "Kümeler", "Fonksiyonlar", "Permütasyon - Kombinasyon - Olasılık",
    "Geometri: Temel Kavramlar", "Üçgenler", "Çokgenler", "Çember ve Daire",
    "Analitik Geometri", "Katı Cisimler"
  ],
  tarih: [
    "İslamiyet Öncesi Türk Tarihi", "İlk Türk İslam Devletleri", "Türkiye Selçuklu Tarihi",
    "Osmanlı Kuruluş Dönemi", "Osmanlı Yükselme Dönemi", "Osmanlı Duraklama Dönemi",
    "Osmanlı Gerileme Dönemi", "Osmanlı Dağılma Dönemi", "Osmanlı Kültür ve Medeniyeti",
    "XX. Yüzyıl Başlarında Osmanlı Devleti", "I. Dünya Savaşı", "Milli Mücadele Hazırlık Dönemi",
    "Kurtuluş Savaşı Cepheleri", "TBMM'nin Açılışı ve İç İsyanlar", "Atatürk İlkeleri",
    "Atatürk İnkılapları", "Atatürk Dönemi Türk Dış Politikası", "İnkılap Tarihi Genel Tekrar"
  ],
  cografya: [
    "Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Coğrafi Konum",
    "İklim Bilgisi", "Türkiye'nin İklimi", "Dünya'da Yerşekilleri",
    "Türkiye'nin Yerşekilleri", "Nüfus ve Yerleşme", "Türkiye'de Nüfus",
    "Göç", "Ekonomik Faaliyetler", "Tarım - Hayvancılık - Madencilik",
    "Sanayi", "Ulaşım ve Ticaret", "Türkiye'nin Bölgeleri", "Çevre ve Toplum"
  ],
  vatandaslik: [
    "Hukukun Temel Kavramları", "Devlet Şekilleri", "Türk Anayasa Hareketleri",
    "1982 Anayasası Genel Esasları", "Yasama (TBMM)", "Yürütme",
    "Cumhurbaşkanı", "Bakanlıklar", "Yargı", "Anayasa Mahkemesi",
    "Yerel Yönetimler", "Temel Hak ve Özgürlükler", "Uluslararası Kuruluşlar (BM, AB, NATO vb.)"
  ],
  guncel: [
    "Türkiye Gündemi", "Dünya Gündemi", "Ekonomi Gündemi", "Bilim ve Teknoloji",
    "Kültür - Sanat", "Spor", "Ödüller", "Önemli Kurumlar", "Uluslararası Gelişmeler",
    "Devlet Kurumları ile İlgili Gelişmeler"
  ]
};

const MOTIVASYON_SOZLERI = [
  "Bugün çözdüğün 20 soru, sınav günü karşına çıkacak 1 soruya dönüşebilir.",
  "Düzenli 2 saat, düzensiz 6 saatten daha değerlidir.",
  "Bilmediğin bir konuyu bugün gördün diye üzülme; sınavda görmeden önce görmüş oldun.",
  "Küçük ilerlemeler, büyük net farklarını oluşturur.",
  "Bugün yorulmak, sınav günü rahat olmak demektir.",
  "Tekrar etmediğin bilgi, unutmaya adaydır.",
  "Hedefin 80 soru ise 79'da bırakma.",
  "Konuyu bitirmek değil, konuyu unutmamak asıl iştir.",
  "Yanlışların, doğrularının haritasını çizer.",
  "Bugünkü çalışma, ekim ayındaki sana bir mektuptur.",
  "Zor gelen konu, en çok net kazandıracak konudur.",
  "Sınav sabahı pişman olmamak için bugün bir soru daha çöz.",
  "Süreklilik, yetenekten daha güçlüdür.",
  "Bir konuyu 3 kez tekrar etmek, 3 farklı konuyu bir kez görmekten daha değerlidir.",
  "Bugün attığın adım küçük görünebilir, ama geri sayım sayacı bunu unutmuyor.",
  "Deneme sonucun bir sonuç değil, bir uyarıdır.",
  "Vazgeçmek işe yaramaz; sadece durur, hiçbir şeyi çözmez.",
  "En iyi zaman, şu an çalıştığın zamandır.",
  "Bugünün 80 sorusu, ekimin 1 netidir.",
  "Yorgunluk geçer, bıraktığın yer kalır."
];

/* Güncel Bilgiler — elle hazırlanmış / güncellenebilen sabit içerik seti.
   Uygulama internete bağlı değilken de çalışsın diye statik olarak burada tutulur.
   "sonGuncelleme" alanını Ayarlar > içerik güncellemesi ile birlikte elle yenileyebilirsiniz. */
const GUNCEL_BILGILER_SEED = [
  {
    id: "g1", kategori: "Türkiye",
    baslik: "Cumhurbaşkanlığı ve yasama yılı açılışı",
    metin: "TBMM'nin yasama yılı her yıl 1 Ekim'de, gerekirse Cumhurbaşkanı'nın çağrısıyla daha önce de açılabilir. Meclis açılışı ve bütçe görüşmeleri KPSS Vatandaşlık'ta sık sorulan bir başlıktır; TBMM'nin çalışma takvimini ve tatil dönemlerini tekrar edin."
  },
  {
    id: "g2", kategori: "Dünya",
    baslik: "Uluslararası kuruluşlar güncel liderlik bilgisi",
    metin: "BM Genel Sekreteri, AB Komisyonu Başkanı, NATO Genel Sekreteri gibi görevlerin güncel isimlerini sınav öncesi güncel bir kaynaktan mutlaka teyit edin; bu bilgiler sık değiştiğinden uygulama içindeki isim listeleri yerine güncel haber kaynaklarını referans alın."
  },
  {
    id: "g3", kategori: "Bilim-Teknoloji",
    baslik: "Türkiye'nin uzay ve savunma sanayii gündemi",
    metin: "TÜBİTAK ve savunma sanayii kuruluşlarının yürüttüğü yerli proje ve fırlatma haberlerini takip edin. KPSS'de yerli/milli teknoloji hamleleri (insansız hava araçları, uydu projeleri, yerli otomobil vb.) sık işlenen bir güncel bilgi başlığıdır."
  },
  {
    id: "g4", kategori: "Ekonomi",
    baslik: "TCMB politika faizi ve enflasyon verileri",
    metin: "Türkiye Cumhuriyet Merkez Bankası'nın güncel politika faizi ve TÜİK'in aylık enflasyon açıklamaları, sınav dönemine yakın güncellenmesi gereken sayısal verilerdir. Bu rakamları sınavdan birkaç hafta önce güncel bir kaynaktan tazeleyin."
  },
  {
    id: "g5", kategori: "Kültür-Sanat",
    baslik: "UNESCO Dünya Mirası Listesi'ndeki Türkiye kalıntıları",
    metin: "Göbeklitepe, Nemrut Dağı, Efes gibi UNESCO listesine kayıtlı Türkiye'deki alanları ve varsa yeni eklenen yerleri gözden geçirin; kültür-sanat başlığında coğrafya ile kesişen sorular çıkabilir."
  },
  {
    id: "g6", kategori: "Spor",
    baslik: "Milli takımların güncel katıldığı organizasyonlar",
    metin: "Türkiye'nin katıldığı büyük turnuvalar (Avrupa/Dünya şampiyonaları, olimpiyatlar) ve elde edilen dereceler güncel bilgiler bölümünde çıkabilir; turnuva takvimini sınav tarihine göre kontrol edin."
  },
  {
    id: "g7", kategori: "Önemli Kurumlar",
    baslik: "Kamu kurumlarının güncel görev alanları",
    metin: "TÜİK, TÜBİTAK, RTÜK, SPK, BDDK gibi kurumların kısaltmalarını, bağlı oldukları bakanlığı ve temel görev alanlarını tekrar edin; bu kurumlar Vatandaşlık ve Güncel Bilgiler sorularında sık birlikte sorulur."
  },
  {
    id: "g8", kategori: "Ödüller",
    baslik: "Yılın büyük bilim ve kültür ödülleri",
    metin: "Nobel ödülleri (özellikle barış ve edebiyat), varsa Türk isimlerin aldığı uluslararası ödüller güncel bilgiler açısından takip edilmesi gereken bir başlıktır."
  },
  {
    id: "g9", kategori: "Uluslararası Gelişmeler",
    baslik: "Türkiye'nin taraf olduğu güncel anlaşmalar",
    metin: "Türkiye'nin imzaladığı veya gündemde olan uluslararası anlaşma ve zirveleri (G20, D-8, Türk Devletleri Teşkilatı zirveleri vb.) takip edin; tarih ve ev sahibi ülke bilgisi sorulabilir."
  },
  {
    id: "g10", kategori: "Devlet Kurumları",
    baslik: "Yeni kurulan/yeniden yapılandırılan kurumlar",
    metin: "Cumhurbaşkanlığı kararnameleriyle kurulan veya yeniden yapılandırılan kurul ve başkanlıkları (örn. Strateji ve Bütçe Başkanlığı, Dijital Dönüşüm Ofisi) tekrar edin; bu kurumların bağlılık ilişkisi sık sorulur."
  }
];

/* Varsayılan günlük çalışma planı (kullanıcı Plan sayfasından değiştirebilir) */
const DEFAULT_PLAN = [
  { saat: "09:00", dersId: "turkce" },
  { saat: "10:00", dersId: "matematik" },
  { saat: "11:00", dersId: "tarih" },
  { saat: "14:00", dersId: "cografya" },
  { saat: "15:00", dersId: "vatandaslik" },
  { saat: "16:00", dersId: "guncel" }
];

const KONU_DURUMLARI = [
  { id: "baslamadim", ad: "Başlamadım" },
  { id: "calisiyorum", ad: "Çalışıyorum" },
  { id: "tamamlandi", ad: "Tamamlandı" },
  { id: "tekrar", ad: "Tekrar gerekli" }
];
