/* ============================================================
   KONU ÖĞRETİM MODU
   Çalış butonundan açılan, adım adım konu anlatımı.
   İnternet/AI olmadan da temel ders akışı çalışır.
   ============================================================ */

const DERS_OGRETIM = {
  "Ses Bilgisi": {
    tanim: "Türkçede seslerin özelliklerini, ünlü-ünsüz ayrımını ve ses olaylarını inceler.",
    adimlar: [
      { baslik: "Önce temel ayrım", metin: "Türkçedeki sesler iki ana gruptur: ünlüler ve ünsüzler. Ünlüler söylenirken hava akımı ağızdan engellenmeden çıkar; ünsüzlerde ise bir engelle karşılaşır.", ipucu: "Ünlüleri hatırlamak için: a, e, ı, i, o, ö, u, ü.", ornek: "kalem → a, e ünlüdür; k, l, m ünsüzdür." },
      { baslik: "Ünlülerin özellikleri", metin: "Ünlüler kalın-incelik ve düzlük-yuvarlaklık bakımından sınıflandırılır. Büyük ünlü uyumunda kalın ünlüden sonra kalın, ince ünlüden sonra ince ünlü gelir.", ipucu: "Kalın: a, ı, o, u. İnce: e, i, ö, ü.", ornek: "kitap → i-a uymaz; gözlük → ö-ü uyumludur." },
      { baslik: "Ses olaylarına geç", metin: "Ünlü düşmesi, ünlü daralması, ünsüz yumuşaması, ünsüz benzeşmesi ve ünsüz düşmesi KPSS'de sık karşılaşacağın başlıklardır.", ipucu: "Kelimenin ek aldığında değişip değişmediğine bak.", ornek: "ağız + ı → ağzı: ünlü düşmesi." },
      { baslik: "KPSS tuzağı", metin: "Her ses değişimini aynı olay sanma. Önce kök ve ek sınırını belirle, sonra hangi sesin değiştiğini kontrol et.", ipucu: "Değişen harfi bulmadan ses olayının adını söyleme.", ornek: "kitap + ı → kitabı: p'nin b'ye dönüşmesi ünsüz yumuşamasıdır." }
    ]
  },
  "Yazım Kuralları": {
    tanim: "Kelimelerin ve eklerin Türkçenin yazım kurallarına uygun biçimde yazılmasını öğretir.",
    adimlar: [
      { baslik: "Büyük harfle başlama", metin: "Cümleler ve özel adlar büyük harfle başlar. Kurum, kuruluş, yer, kişi ve eser adlarında büyük harf kullanımına özellikle dikkat et.", ipucu: "Özel isim gördüğünde büyük harfi kontrol et.", ornek: "Ankara, Ahmet, Türk Dil Kurumu." },
      { baslik: "De / da", metin: "Bağlaç olan de/da ayrı yazılır ve cümleden çıkarıldığında temel yapı genellikle bozulmaz. Bulunma hâli eki olan -de/-da ise kelimeye bitişir.", ipucu: "'dahi' anlamı varsa çoğunlukla ayrı yazılır.", ornek: "Ben de geleceğim. / Evde bekliyorum." },
      { baslik: "Ki", metin: "Bağlaç olan ki ayrı yazılır; bazı kalıplaşmış kelimelerdeki -ki bitişiktir. Ek olan -ki de kelimeye bitişir.", ipucu: "Bağlaç olan ki'yi cümleden çıkarıp anlamı kontrol et.", ornek: "Duydum ki gelmiş. / Evdeki kitap." },
      { baslik: "KPSS kontrolü", metin: "Soru kökünde 'hangisinde yazım yanlışı vardır?' denirse önce büyük harfleri, de/da ve ki yazımını, ardından birleşik kelimeleri kontrol et.", ipucu: "En bilinen kurallardan başlayarak eleme yap." }
    ]
  },
  "Noktalama İşaretleri": {
    tanim: "Noktalama işaretleri cümlenin anlamını, duraklarını ve yapısını belirginleştirir.",
    adimlar: [
      { baslik: "Nokta ve virgül", metin: "Nokta cümle sonunu belirtir. Virgül eş görevli kelimeleri, ara sözleri ve bazı sıralı yapıları ayırır.", ipucu: "Virgülün görevi sadece nefes almak değildir; cümledeki yapıyı düşün.", ornek: "Elma, armut ve portakal aldım." },
      { baslik: "Noktalı virgül", metin: "Virgülle ayrılmış grupları birbirinden ayırmada kullanılır. Özellikle kendi içinde virgül bulunan sıralamalarda önemlidir.", ipucu: "Virgül grupların içinde, noktalı virgül grupların arasında olabilir.", ornek: "Pazardan elma, armut; manavdan portakal aldım." },
      { baslik: "İki nokta ve tırnak", metin: "İki nokta açıklama veya örnekten önce; tırnak işareti aktarılan sözlerde kullanılır.", ipucu: "Arkasından açıklama/örnek geliyorsa iki noktayı düşün.", ornek: "Şunu unutma: düzenli tekrar önemlidir." },
      { baslik: "KPSS tuzağı", metin: "Noktalama sorularında işaretin adını değil, cümledeki görevini sorarlar. Önce cümlenin yapısını belirle.", ipucu: "Aynı işaret farklı bağlamlarda farklı görev üstlenebilir." }
    ]
  },
  "Sözcükte Anlam": {
    tanim: "Bir sözcüğün cümle içindeki gerçek, mecaz, terim ve yan anlamlarını ayırt etmeyi öğretir.",
    adimlar: [
      { baslik: "Gerçek anlam", metin: "Sözcüğün akla gelen ilk anlamına gerçek anlam denir.", ipucu: "Sözlükteki temel anlamı düşün.", ornek: "Masanın ayağı kırıldı." },
      { baslik: "Mecaz anlam", metin: "Sözcük gerçek anlamından uzaklaşıp soyut veya başka bir anlam kazandığında mecaz anlam ortaya çıkar.", ipucu: "Kelimeyi fiziksel anlamıyla düşünmek anlamsızlaşıyorsa mecaz olabilir.", ornek: "Bu sözler beni çok kırdı." },
      { baslik: "Terim anlam", metin: "Bir bilim, sanat, spor veya meslek alanına özgü özel anlam terim anlamdır.", ipucu: "Belirli bir alanın kavramı mı?", ornek: "Üçgenin iç açıları toplamı 180 derecedir." },
      { baslik: "KPSS tuzağı", metin: "Yan anlam ile mecaz anlamı karıştırma. Yan anlam gerçek anlama bağlı bir genişlemedir; mecazda anlam daha belirgin biçimde soyutlaşır." }
    ]
  },
  "Cümlede Anlam": {
    tanim: "Cümlede verilmek istenen düşünceyi, ilişkiyi ve anlam özelliklerini çözmeyi öğretir.",
    adimlar: [
      { baslik: "Önce yargıyı bul", metin: "Bir cümlede asıl olarak ne söylendiğini belirle. Özellikle uzun cümlelerde yan ifadeler seni ana yargıdan uzaklaştırabilir.", ipucu: "Cümleyi 'Bu cümlede asıl söylenen nedir?' diye özetle." },
      { baslik: "Neden-sonuç", metin: "Bir olayın gerçekleşme nedeninin ve sonucunun birlikte verildiği cümleler neden-sonuç ilişkisidir.", ipucu: "'Neden?' sorusuna cevap ara.", ornek: "Yağmur yağdığı için maç ertelendi." },
      { baslik: "Amaç-sonuç ve koşul", metin: "Amaçta yapılan işin hedefi; koşulda gerçekleşmenin bağlı olduğu şart vardır.", ipucu: "'Ne amaçla?' ve 'Hangi şartla?' sorularını kullan." },
      { baslik: "KPSS tuzağı", metin: "'İçin' her zaman amaç bildirmez; neden de bildirebilir. Cümlenin tamamındaki ilişkiye bak." }
    ]
  },
  "Paragrafta Anlam": {
    tanim: "Paragrafın ana düşüncesini, yardımcı düşüncelerini ve yazarın anlatımını hızlı ve doğru biçimde çözmeyi öğretir.",
    adimlar: [
      { baslik: "Ana düşünce", metin: "Paragrafın tamamının ulaşmak istediği temel yargıdır. Tek bir ayrıntı değil, bütün paragrafı kapsayan düşüncedir.", ipucu: "'Yazar bu paragrafı neden yazmış?' diye sor." },
      { baslik: "Yardımcı düşünce", metin: "Ana düşünceyi destekleyen ayrıntılardır. 'Değinilmiştir/değinilmemiştir' soruları çoğunlukla bunları ölçer.", ipucu: "Seçenekleri paragrafta kanıtlayabiliyor musun?" },
      { baslik: "Paragrafın akışı", metin: "Cümleleri bağlayan zamir, bağlaç, tekrar edilen kavram ve zaman ifadeleri akışı bulmana yardım eder.", ipucu: "Önceki cümleye ihtiyaç duyan ifadeleri yakala." },
      { baslik: "KPSS stratejisi", metin: "Önce soru kökünü oku, sonra paragrafı amaçlı oku. Aşırı yorum içeren seçenekleri paragraftaki kanıtla ele." }
    ]
  },
  "Fiil (Eylem)": {
    tanim: "Fiilleri; anlam, zaman, kişi, kip ve yapı bakımından tanımayı öğretir.",
    adimlar: [
      { baslik: "Fiili bul", metin: "Fiiller iş, oluş veya durum bildirir. Cümlede yüklemi bulmak çoğu zaman ilk adımdır.", ipucu: "'Ne yaptı, ne oluyor, ne olacak?' sorularını dene.", ornek: "Öğrenciler sınava çalışıyor. → çalışıyor" },
      { baslik: "Kip ve zaman", metin: "Bildirme kipleri zaman anlamı taşır: görülen geçmiş, öğrenilen geçmiş, şimdiki, gelecek ve geniş zaman. Tasarlama kipleri ise dilek anlamı verir.", ipucu: "-di, -miş, -yor, -ecek ve geniş zaman eklerini ayırt et." },
      { baslik: "Kişi", metin: "Fiilin kim tarafından yapıldığını kişi ekleri veya kişi zamirleri gösterir. Özne ile yüklemin kişi bakımından uyumuna dikkat et.", ornek: "Biz geliyoruz. → 1. çoğul kişi" },
      { baslik: "KPSS tuzağı", metin: "Fiilimsiler fiilden türese de çekimli fiil değildir. Önce yüklem olup olmadığını kontrol et." }
    ]
  },
  "Fiilimsi": {
    tanim: "Fiil kök veya gövdelerinden türeyip fiil anlamını korurken isim, sıfat veya zarf görevinde kullanılan sözcükleri öğretir.",
    adimlar: [
      { baslik: "İsim-fiil", metin: "-ma/-me, -mak/-mek, -ış/-iş/-uş/-üş ekleriyle kurulabilir ve isim görevinde kullanılır.", ornek: "Kitap okumak güzeldir." },
      { baslik: "Sıfat-fiil", metin: "Fiili sıfat görevine sokar. -an, -ası, -mez, -ar, -dik, -ecek, -miş gibi eklerle kurulabilir.", ornek: "Gelen öğrenci yerine oturdu." },
      { baslik: "Zarf-fiil", metin: "Fiili zarf görevine sokarak eylemin nasıl, ne zaman veya hangi koşulda yapıldığını belirtir.", ornek: "Gülerek içeri girdi." },
      { baslik: "KPSS tuzağı", metin: "Bir ek gördüğünde hemen fiilimsi deme. Sözcüğün cümledeki görevini de kontrol et." }
    ]
  }
};

function dersGenelAnlatim(ders, konu) {
  const sozluk = {
    matematik: `${konu} konusunda önce tanımları ve temel bağıntıları öğren, ardından kolay örneklerle yöntemi oturt ve son olarak KPSS tipi sorularla hız kazan.`,
    tarih: `${konu} konusunda önce olayların zaman sırasını kur. Ardından neden-sonuç ilişkilerini ve önemli kişi, kurum ve gelişmeleri eşleştir.`,
    cografya: `${konu} konusunda önce temel kavramları öğren. Sonra Türkiye ve dünya üzerindeki örnekleri harita mantığıyla ilişkilendir.`,
    vatandaslik: `${konu} konusunda önce kavramı ve hukuki çerçeveyi öğren. Ardından yetki, görev ve kurum ilişkilerini karşılaştır.`,
    guncel: `${konu} konusunda sınav dönemine yakın bilgileri ayrıca güncelle. Önce kavramı öğren, sonra önemli kurum, olay ve kişileri eşleştir.`,
    turkce: `${konu} konusunda önce temel kuralı öğren, ardından kısa örnekleri incele ve son olarak KPSS tarzı seçeneklerde kuralı uygula.`
  };
  return sozluk[ders] || `${konu} konusunu önce temel kavramlardan başlayarak adım adım öğreneceğiz.`;
}

function dersIcinAdimlar(dersMeta, konu) {
  const ozel = DERS_OGRETIM[konu.ad];
  if (ozel) return { tanim: ozel.tanim, adimlar: ozel.adimlar };
  return {
    tanim: dersGenelAnlatim(dersMeta.id, konu.ad),
    adimlar: [
      { baslik: "1. Konuyu tanı", metin: `${konu.ad}, ${dersMeta.name} dersinin KPSS Ortaöğretim kapsamında çalışılması gereken konularından biridir. İlk hedefimiz temel kavramları birbirinden ayırmak.` },
      { baslik: "2. Temel mantığı kur", metin: `${dersGenelAnlatim(dersMeta.id, konu.ad)} Burada ezberden önce kavramlar arasındaki ilişkiyi kurmaya odaklan.` , ipucu: "Kendine şu soruyu sor: 'Bu konunun sınavda benden istediği temel beceri ne?'" },
      { baslik: "3. Örnekle pekiştir", metin: `Şimdi ${konu.ad} ile ilgili kısa bir örnek düşün. Önce soruyu kendin çözmeye çalış, sonra seçenekleri karşılaştır.`, ipucu: "Doğru cevabı bulduktan sonra neden diğer seçeneklerin yanlış olduğunu da düşün." },
      { baslik: "4. KPSS kontrolü", metin: `Bu konudan soru çözerken anahtar kelimeleri, istisnaları ve birbirine benzeyen kavramları özellikle kontrol et. ${konu.ad} için ilk tekrarını tamamladığında durumu 'Tamamlandı' yapabilirsin.`, ipucu: "Öğrendikten hemen sonra 5 soru çözmek bilgiyi kalıcılaştırır." }
    ]
  };
}

let dersOgrenme = null;

function dersOgrenmeBaslat(dersId, konuId) {
  const meta = SUBJECTS_META.find(d => String(d.id) === String(dersId));
  const konu = studyKonuBul(dersId, konuId);
  if (!meta || !konu) return toast("Konu bulunamadı.");
  if (konu.durum === "baslamadim") konu.durum = "calisiyorum";
  stateKaydet();
  const paket = dersIcinAdimlar(meta, konu);
  dersOgrenme = { dersId: String(dersId), konuId: String(konuId), meta, konu, paket, adim: 0 };
  dersOgrenmeRender();
}

function dersOgrenmeRender() {
  if (!dersOgrenme) return;
  const { meta, konu, paket, adim } = dersOgrenme;
  const toplam = paket.adimlar.length;
  const kart = paket.adimlar[adim];
  const ilerleme = Math.round(((adim + 1) / toplam) * 100);
  modalAc(`📖 ${konu.ad}`, `
    <div class="lesson-head"><span class="study-subject-dot" style="background:${meta.renk}"></span><span>${meta.name}</span><span class="lesson-progress-text">${adim + 1}/${toplam}</span></div>
    ${adim === 0 ? `<div class="lesson-intro"><span>🎯</span><div><strong>Bu derste ne öğreneceksin?</strong><p>${paket.tanim}</p></div></div>` : ""}
    <div class="lesson-progress"><span style="width:${ilerleme}%"></span></div>
    <article class="lesson-step">
      <div class="lesson-step-number">${adim + 1}</div>
      <div class="lesson-step-body"><span class="lesson-kicker">ŞİMDİ ÖĞREN</span><h3>${kart.baslik}</h3><p>${kart.metin}</p>${kart.ornek ? `<div class="lesson-example"><strong>Örnek</strong><p>${kart.ornek}</p></div>` : ""}${kart.ipucu ? `<div class="lesson-tip"><strong>💡 Akılda tut</strong><p>${kart.ipucu}</p></div>` : ""}</div>
    </article>
    <div class="lesson-check"><span>📌</span><span>Bu adımı anladıysan devam et. Takıldığın yerde geri dönüp tekrar okuyabilirsin.</span></div>
  `, `<button type="button" class="btn btn-outline" id="lessonNotBtn">📝 Not al</button><button type="button" class="btn btn-primary" id="lessonNextBtn">${adim + 1 < toplam ? "Sonraki →" : "Konuyu tamamla ✓"}</button>`);

  $("#lessonNextBtn")?.addEventListener("click", () => {
    if (dersOgrenme.adim + 1 < dersOgrenme.paket.adimlar.length) {
      dersOgrenme.adim += 1;
      dersOgrenmeRender();
    } else {
      dersOgrenme.konu.durum = "tamamlandi";
      stateKaydet();
      modalKapat();
      renderCalisma();
      toast(`🎉 ${dersOgrenme.konu.ad} tamamlandı! Şimdi 5 soru çözebilirsin.`);
      dersOgrenme = null;
    }
  });
  $("#lessonNotBtn")?.addEventListener("click", () => {
    const mevcut = dersOgrenme.konu.not || "";
    modalAc(`📝 ${dersOgrenme.konu.ad} — Notun`, `<div class="study-note-label">Bu konuda aklında kalmasını istediğin şeyi yaz.</div><textarea id="lessonNote" rows="7" placeholder="Önemli kural, püf nokta, kendi cümlen...">${mevcut}</textarea>`, `<button type="button" class="btn btn-primary" id="lessonSaveNote">Notu kaydet</button>`);
    $("#lessonSaveNote")?.addEventListener("click", () => { dersOgrenme.konu.not = $("#lessonNote").value; stateKaydet(); dersOgrenmeRender(); toast("Notun kaydedildi."); });
  });
}

/* Çalış butonunun mevcut davranışını öğretim moduna yönlendir. */
document.addEventListener("click", e => {
  const btn = e.target.closest?.("[data-study-start]");
  if (!btn) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  dersOgrenmeBaslat(btn.dataset.studyDers, btn.dataset.studyStart);
}, true);
