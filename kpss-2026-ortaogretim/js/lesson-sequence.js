/* KPSS 2026 - Zengin Konu Anlatimi
   Mevcut konu akisini korur; her adima detayli anlatim, ornek,
   adim adim dusunme ve mini kontrol ekler.
*/
(function () {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function rich(meta, konu, kart) {
    const d = String(meta.name || '').toLocaleLowerCase('tr-TR');
    const t = String(konu.ad || '').toLocaleLowerCase('tr-TR');
    if (d.includes('matematik')) {
      if (t.includes('kök')) return [
        'Kok icindeki tam kare carpani disari cikarilir. Ornegin √72 = √(36×2) = 6√2. Once sayiyi tam kare carpana ayirmayi ogren; sonra sadeleştir.',
        'Ornek: √50 = √(25×2) = 5√2. 25 tam karedir ve kokun disina 5 olarak cikar.',
        'Adim adim: sayiyi carp → tam kareyi bul → tam kareyi kok disina cikar → kalan koklu kismi yaz.',
        'Mini kontrol: √18 = ?'
      ];
      if (t.includes('üslü')) return [
        'Uslu ifadede us, tabanin kac kez carpildigini gosterir. Ayni tabanli carpimda usler toplanir; bolmede cikarilir; kuvvetin kuvvetinde usler carpilir.',
        'Ornek: 2³×2² = 2⁵ = 32. (2³)² = 2⁶ = 64. Dikkat: 2³+2², usleri toplamak degil, 8+4=12 demektir.',
        'Once tabanlari esit hale getir. Sonra islemin carpma, bolme veya kuvvetin kuvveti olup olmadigina gore kural sec.',
        'Mini kontrol: 3²×3³ = ?'
      ];
      if (t.includes('mutlak')) return [
        'Mutlak deger bir sayinin 0 noktasina olan uzakligidir. Uzaklik negatif olamayacagi icin mutlak deger sonucu da negatif olamaz. |−7|=7 ve |7|=7.',
        'Ornek: |x−3|=4 ise iki durum vardir: x−3=4 veya x−3=−4. Buradan x=7 veya x=−1 bulunur.',
        'Mutlak degerli denklemde once iki olasilik kur. Sonucu yerine koyarak kontrol et.',
        'Mini kontrol: |x|=5 denkleminin kac farkli cozumu vardir?'
      ];
      if (t.includes('yüzde')) return [
        'Yuzde 100 uzerinden pay demektir. Bir sayinin %15i, o sayinin 15/100 ile carpimidir. Artis ve azalislarda carpani kullanmak daha hizlidir.',
        'Ornek: 500 TL %20 indirimle 500×0,80=400 TL olur. Sonra %10 zam gelirse 400×1,10=440 TL olur.',
        'Artista 1+oran, azalista 1−oran carpani kullan. Ardışık yuzdeleri dogrudan toplama; her degisim yeni deger uzerinden yapilir.',
        'Mini kontrol: 100 sayisi once %20 artip sonra %20 azalirsa yine 100 olur mu?'
      ];
      if (t.includes('oran') || t.includes('orantı')) return [
        'Oran iki coklugun karsilastirilmasidir. Dogru orantida iki degisken ayni yonde degisir; ters orantida biri artarken digeri azalir.',
        'Ornek: 3 kalem 24 TL ise ayni birim fiyatla 5 kalem 40 TL olur. 4 isci 6 gunde bitiriyorsa ayni hizla 8 isci 3 gunde bitirir.',
        'Once dogru mu ters mi oranti oldugunu belirle. Sonra verilen oranlari esitlik olarak kur.',
        'Mini kontrol: 4 isci 6 gunde bitiriyorsa 8 isci kac gunde bitirir?'
      ];
      if (t.includes('hareket')) return [
        'Hareket sorularinin temel baglantisi yol = hiz × zamandir. Birimler ayni olmali. Karsilasma sorularinda zit yonlerdeki hizlar toplanir.',
        'Ornek: 60 km/sa hizla 2,5 saat giden arac 60×2,5=150 km yol alir. 90 km/sa hizla 180 km yol ise 2 saatte tamamlanir.',
        'Verilenleri hiz-yol-zaman olarak ayir → birimleri esit → uygun bagintiyi yaz → sonucu birimle kontrol et.',
        'Mini kontrol: 75 km/sa ile 225 km kac saatte alinir?'
      ];
      if (t.includes('yaş')) return [
        'Yas farki zaman gecse de degismez. 12 ve 20 yasindaki iki kisinin farki 8dir; 5 yil sonra 17 ve 25 olurlar ve fark yine 8 kalir.',
        'Ornek: Yaslar toplami 36 ve biri digerinin 2 katiysa x+2x=36 → x=12. Yaslar 12 ve 24tur.',
        'Bilinmeyen yasi x al. Diger yasi x ile ifade et. Toplam/fark bilgisini denkleme cevir ve sonucu kontrol et.',
        'Mini kontrol: 5 yil once yaslari toplami 30 olan iki kisinin bugunku yaslari toplami kac olur?'
      ];
      if (t.includes('denklem')) return [
        'Denklemde amac bilinmeyeni yalniz birakmaktir. Esitligin bir tarafina yaptigin islemi diger tarafina da uygulamak gerekir.',
        'Ornek: 3x+5=20 → 3x=15 → x=5. Kontrol: 3×5+5=20. Kontrol yapmak islem hatalarini yakalar.',
        'Parantezleri ac → benzer terimleri birlestir → bilinmeyenli terimleri bir tarafa topla → sabitleri diger tarafa tasi → katsayiya bol.',
        'Mini kontrol: 2x−7=9 icin x kac?'
      ];
      if (t.includes('bölme') || t.includes('bölünebil')) return [
        'Bazi sayilarda uzun bolme yapmadan bolunebilme kurali kullanilir. 2 icin son rakam cift, 5 icin 0 veya 5, 3 ve 9 icin rakamlar toplami, 4 icin son iki basamak, 8 icin son uc basamak kontrol edilir.',
        'Ornek: 4572nin rakamlar toplami 18 oldugu icin 3 ve 9a bolunur. Son iki basamak 72 oldugu icin 4e de bolunur.',
        'Soruda hangi bolen soruluyorsa o kurali sec. Gereksiz yere sayinin tamamini bolme.',
        'Mini kontrol: 1248 sayisi 8e bolunur mu?'
      ];
      if (t.includes('ebob') || t.includes('ekok')) return [
        'EBOB ortak bolenlerin en buyugu, EKOK ortak katlarin en kucugudur. Asal carpan yonteminde EBOB icin kucuk usler, EKOK icin buyuk usler secilir.',
        'Ornek: 12=2²×3 ve 18=2×3². EBOB=2×3=6, EKOK=2²×3²=36.',
        'Sayilari asal carpanlarina ayir → usleri karsilastir → EBOBda kucuk, EKOKta buyuk usleri al.',
        'Mini kontrol: EBOB(8,12) = ?'
      ];
      if (t.includes('sayı basamak')) return [
        'Basamak degeri, rakamin bulundugu basamaga gore aldigi degerdir. 47 sayisinda 4 onlar basamagindadir ve basamak degeri 40tir; rakam degeri ise 4tur.',
        'Ornek: 3a5 sayisi 300+10a+5 seklinde yazilir. Rakamlar toplami 3+a+5=8+a olur.',
        'Sayi basamak sorularinda sayiyi basamaklarina ayir. Rakam kosullarini degiskenlere uygula ve gerekirse 0-9 araligini kullan.',
        'Mini kontrol: 52 sayisinda 5in basamak degeri kac?'
      ];
    }
    if (d.includes('tarih')) return [
      'Tarih konularini tek tek ezberlemek yerine zaman + neden + gelisme + sonuc baglantisi kur. Kronoloji, KPSSde secenek elemede cok kullanislidir.',
      'Ornek kronoloji: 19 Mayis 1919 Samsun → 23 Nisan 1920 TBMM → 30 Agustos 1922 Baskomutanlik Meydan Muharebesi → 29 Ekim 1923 Cumhuriyet.',
      'Once olayın tarihini bul. Sonra hangi gelismeden once/sonra geldigini belirle. Kisi veriliyorsa yaptigi en onemli gelismeyle eslestir.',
      'Mini kontrol: Bir olayın tarihini unuttugunda onu hangi iki olay arasina yerlestirebilecegini dusun.'
    ];
    if (d.includes('coğrafya')) return [
      'Cografyada ezberden once konum ve neden-sonuc iliskisi kur. Turkiye 36°–42° kuzey paralelleri ile 26°–45° dogu meridyenleri arasindadir.',
      'Ornek: 100000 kisi 500 km² alanda yasiyorsa aritmetik nufus yogunlugu 100000/500=200 kisi/km² olur. Konum bilgisi ise iklim ve yerel saat gibi sonuclara baglanabilir.',
      'Once nerede sorusunu cevapla → fizikî veya beserî ozelligi bul → nedenini acikla → sonucu kontrol et.',
      'Mini kontrol: Yuzolcumu sabitken nufus artarsa nufus yogunlugu nasil degisir?'
    ];
    if (d.includes('vatandaşlık')) return [
      'Vatandaslikta kavrami tek basina ezberleme. Tanimi, yetkili kurum, gorev ve benzer kavramdan farkini birlikte ogren.',
      'Ornek: TBMM 600 milletvekilinden olusur ve yasama yetkisi Turk Milleti adina TBMM tarafindan kullanilir. Soruda kurum ve yetkiyi birlikte ara.',
      'Kavramin tanimini soyle → yetkili organi bul → gorevini yaz → benzer kurumlarla karsilastir → istisnayi kontrol et.',
      'Mini kontrol: Bir kurumun gorevini benzer kurumdan ayiran en belirgin yetki nedir?'
    ];
    if (d.includes('güncel')) return [
      'Guncel bilgilerde degisebilecek isim ve rakamlari sinavdan once mutlaka guncel kaynaktan kontrol et. Kalici bilgiler ile donemsel bilgileri ayri kartlarda tut.',
      'Ornek tekrar karti: Kisi/kurum – olay – tarih – neden onemli. Sayisal bir veri varsa kayit tarihini de ekle.',
      'Bilgiyi kaydet → tarih ekle → sinavdan once guncelle → benzer kisi, kurum veya olaylarla karistirmadigini kontrol et.',
      'Mini kontrol: Bir guncel bilginin eskiyebilecegini nasil anlarsin?'
    ];
    return [
      `${kart.metin || konu.ad + ' konusunun temel kuralini ogren.'} Tanimi ezberlemekle kalma; kuralin soru icinde nasil uygulandigini gor ve neden dogru oldugunu kendi cumlenle acikla.`,
      kart.ornek || `Ornek: ${konu.ad} basligindan bir soru geldiginde once sorunun neyi olctugunu belirle, sonra ilgili kurali uygula ve secenegini gerekcelendir.`,
      'Adim adim: 1) Sorunun istedigini bul. 2) Ana kurali hatirla. 3) Verilenleri kurala bagla. 4) Sonucu kisa bir kontrolle dogrula.',
      'Mini kontrol: Bu kurali kendi cumlenle bir kez anlatabiliyor musun? Anlatabiliyorsan ezberden uygulamaya gecmissindir.'
    ];
  }

  dersOgrenmeRender = function () {
    if (!dersOgrenme) return;
    const { meta, konu, paket, adim } = dersOgrenme;
    const kart = paket.adimlar[adim];
    const toplam = paket.adimlar.length;
    const son = adim + 1 >= toplam;
    const yuz = Math.round(((adim + 1) / toplam) * 100);
    const z = rich(meta, konu, kart);

    modalAc(`📖 ${konu.ad}`, `
      <div class="lesson-head"><span class="study-subject-dot" style="background:${meta.renk}"></span><span>${esc(meta.name)}</span><span class="lesson-progress-text">${adim + 1}/${toplam}</span></div>
      ${adim === 0 ? `<div class="lesson-intro"><span>🎯</span><div><strong>Bu derste ne öğreneceksin?</strong><p>${esc(paket.tanim)}</p></div></div>` : ''}
      <div class="lesson-progress"><span style="width:${yuz}%"></span></div>
      <article class="lesson-step lesson-step-rich">
        <div class="lesson-step-number">${adim + 1}</div>
        <div class="lesson-step-body">
          <span class="lesson-kicker">${son ? 'SON TEKRAR' : 'ŞİMDİ ÖĞREN'}</span>
          <h3>${esc(kart.baslik)}</h3>
          <p>${esc(z[0])}</p>
          <div class="lesson-example"><strong>📌 SAYILARLA / ÖRNEKLE</strong><p>${esc(z[1])}</p></div>
          <div class="lesson-rich-solution"><strong>🧩 NASIL DÜŞÜNMELİSİN?</strong><p>${esc(z[2])}</p></div>
          ${kart.ipucu ? `<div class="lesson-tip"><strong>💡 Akılda tut</strong><p>${esc(kart.ipucu)}</p></div>` : ''}
          <div class="lesson-rich-check"><strong>🎯 Mini kontrol</strong><p>${esc(z[3])}</p></div>
        </div>
      </article>
      <div class="lesson-check"><span>${son ? '🎉' : '📌'}</span><span>${son ? 'Bu konunun anlatımını tamamladın. Sıradaki konuya geçebilir veya test çözebilirsin.' : 'Örneği önce kendin çözmeyi dene. Hazırsan sonraki adıma geç.'}</span></div>
    `, `<button type="button" class="btn btn-outline" id="lessonNotBtn">📝 Not al</button><button type="button" class="btn btn-primary" id="lessonNextBtn">${son ? 'Sonraki konu →' : 'Sonraki →'}</button>`);

    document.getElementById('lessonNextBtn')?.addEventListener('click', () => {
      if (!son) { dersOgrenme.adim += 1; dersOgrenmeRender(); return; }
      dersOgrenme.konu.durum = 'tamamlandi';
      stateKaydet();
      const list = STATE.dersler[dersOgrenme.dersId]?.konular || [];
      const i = list.findIndex(k => String(k.id) === String(dersOgrenme.konuId));
      const next = list[i + 1];
      if (next) {
        const ad = dersOgrenme.konu.ad;
        toast(`✅ ${ad} tamamlandı. Sıradaki konuya geçiyoruz.`);
        dersOgrenmeBaslat(dersOgrenme.dersId, next.id);
      } else {
        const ad = dersOgrenme.konu.ad;
        dersOgrenme = null; modalKapat(); renderCalisma(); toast(`🎉 ${ad} tamamlandı!`);
      }
    });

    document.getElementById('lessonNotBtn')?.addEventListener('click', () => {
      const v = dersOgrenme.konu.not || '';
      modalAc(`📝 ${dersOgrenme.konu.ad} — Notun`, `<div class="study-note-label">Bu konuda aklında kalmasını istediğin şeyi yaz.</div><textarea id="lessonNote" rows="7" placeholder="Önemli kural, püf nokta, kendi cümlen...">${esc(v)}</textarea>`, `<button type="button" class="btn btn-primary" id="lessonSaveNote">Notu kaydet</button>`);
      document.getElementById('lessonSaveNote')?.addEventListener('click', () => {
        dersOgrenme.konu.not = document.getElementById('lessonNote').value;
        stateKaydet(); dersOgrenmeRender(); toast('Notun kaydedildi.');
      });
    });
  };
})();
