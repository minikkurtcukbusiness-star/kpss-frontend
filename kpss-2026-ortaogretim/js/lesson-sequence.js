/* KPSS 2026 - Sıralı ve gerçekten değişen konu anlatımı */
(function () {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function ekOrnek(ders, konu, adim) {
    const d = String(ders || '').toLocaleLowerCase('tr-TR');
    const t = String(konu || '').toLocaleLowerCase('tr-TR');
    if (d.includes('matematik')) {
      if (t.includes('kök')) return [
        '√72 = √(36×2) = 6√2. Tam kare olan 36 kökün dışına 6 olarak çıkar.',
        '√50 = √(25×2) = 5√2. İki köklü ifade çarpılırken √a×√b = √(ab) kuralı kullanılır.',
        'Örneğin √12 + √27 = 2√3 + 3√3 = 5√3. Önce sadeleştir, sonra benzer kökleri topla.',
        '⚠️ √(a+b) genel olarak √a+√b değildir. Örneğin √9=3 iken √4+√5=5 değildir.'
      ][adim];
      if (t.includes('üslü')) return [
        '2³ = 2×2×2 = 8. Üs, tabanın kaç kez çarpıldığını gösterir.',
        '2³×2² = 2⁵ = 32; aynı tabanlı çarpımda üsler toplanır.',
        '2⁵÷2² = 2³ = 8 ve (2²)³ = 2⁶ = 64; bölmede üsler çıkar, kuvvetin kuvvetinde çarpılır.',
        '⚠️ 2³+2² = 8+4 = 12; toplamada üsler toplanmaz.'
      ][adim];
      if (t.includes('oran') || t.includes('orantı')) return [
        '12 kız ve 6 erkek varsa kızların erkeklere oranı 12/6 = 2 olur.',
        '3 kalem 24 TL ise 5 kalem 40 TL olur; miktar ile fiyat doğru orantılıdır.',
        '4 işçi bir işi 6 günde bitiriyorsa aynı hızla 8 işçi 3 günde bitirir; işçi sayısı ile süre ters orantılıdır.',
        '⚠️ Doğru mu ters mi orantı olduğunu belirlemeden çapraz çarpım yapmak hatalı sonuç verebilir.'
      ][adim];
      if (t.includes('yüzde')) return [
        '240 sayısının %15’i = 240×15/100 = 36’dır.',
        '500 TL’ye %20 indirim: 500×0,80 = 400 TL.',
        '400 TL’ye %10 zam: 400×1,10 = 440 TL. Değişimler yeni değer üzerinden yapılır.',
        '⚠️ %20 artış ve ardından %20 azalış birbirini götürmez: 100→120→96.'
      ][adim];
      if (t.includes('mutlak')) return [
        '|−7|=7 ve |7|=7. Çünkü mutlak değer 0’a uzaklıktır.',
        '|x−3|=4 ise x−3=4 veya x−3=−4; x=7 veya x=−1.',
        '|x−2|<3 ise −3<x−2<3; buradan −1<x<5 bulunur.',
        '⚠️ Mutlak değer sonucu negatif olamaz; ancak mutlak değerli eşitsizliklerde aralık mantığı gerekir.'
      ][adim];
      if (t.includes('denklem')) return [
        '3x+5=20 denkleminde amaç x’i yalnız bırakmaktır.',
        '3x+5=20 → 3x=15 → x=5.',
        'Kontrol: 3×5+5=20. Sonucu yerine koymak işlem hatasını yakalar.',
        '⚠️ Eşitliğin yalnız bir tarafına işlem uygulamak dengeyi bozar.'
      ][adim];
      if (t.includes('bölme') || t.includes('bölünebil')) return [
        '124 sayısının son rakamı 4 olduğu için 2’ye bölünür.',
        '372’nin rakamları toplamı 12 olduğu için 3’e bölünür.',
        '1 248’in son üç basamağı 248 ve 248, 8’e bölündüğü için sayı da 8’e bölünür.',
        '⚠️ 6’ya bölünebilmek için sayı hem 2’ye hem 3’e bölünebilmelidir.'
      ][adim];
      if (t.includes('ebob') || t.includes('ekok')) return [
        '12 ve 18’in ortak bölenleri 1, 2, 3, 6’dır; EBOB=6.',
        '12=2²×3 ve 18=2×3². EBOB için küçük üsler seçilir: 2×3=6.',
        'Aynı sayılarda EKOK=2²×3²=36; büyük üsler alınır.',
        '⚠️ EBOB küçük üsleri, EKOK büyük üsleri kullanır; bu ikisini ters çevirmek yaygın hatadır.'
      ][adim];
      if (t.includes('yaş')) return [
        '12 ve 20 yaş arasındaki fark 8’dir. 5 yıl sonra yaşlar 17 ve 25 olur; fark yine 8.',
        'Yaşlar toplamı 36 ve biri diğerinin 2 katıysa x+2x=36 → x=12.',
        '5 yıl önce toplam 30 ise bugün iki kişinin toplam yaşı 30+10=40 olur.',
        '⚠️ “5 yıl sonra” ifadesi yalnız bir kişiye değil, sorudaki tüm kişilere uygulanır.'
      ][adim];
      if (t.includes('sayı basamak')) return [
        '47’de 4 onlar basamağındadır ve basamak değeri 40’tır; rakam değeri 4’tür.',
        '3a5 sayısı 300+10a+5 şeklinde yazılır.',
        '3a5’in rakamları toplamı 3+a+5=8+a olur; basamak sorularında sayıyı açmak işlemi kolaylaştırır.',
        '⚠️ Rakam 0-9 arasındadır; basamak değeri ise bulunduğu yere göre değişir.'
      ][adim];
    }
    if (d.includes('tarih')) return [
      'Önce olayın ne olduğunu ve yaklaşık dönemini öğren. Tek başına tarih ezberlemek yerine olayla eşleştir.',
      'Örnek kronoloji: 19 Mayıs 1919 Samsun → 23 Nisan 1920 TBMM → 30 Ağustos 1922 Başkomutanlık → 29 Ekim 1923 Cumhuriyet.',
      'Bir soru 1920 diyorsa TBMM’nin açılışını; 1922 diyorsa askerî zaferleri; 1923 diyorsa Cumhuriyet ve Lozan sonrası gelişmeleri kronolojiyle karşılaştır.',
      '⚠️ Benzer isimli olayları yalnız tarihle değil, neden ve sonuçlarıyla ayır.'
    ][adim];
    if (d.includes('coğrafya')) return [
      'Coğrafyada önce “nerede?” sorusunu cevapla; sonra bunun hangi sonucu doğurduğunu düşün.',
      'Türkiye 36°–42° K ve 26°–45° D arasındadır. Enlem sıcaklık, meridyen ise yerel saat gibi sonuçlarla ilişkilidir.',
      '100 000 kişi 500 km² alandaysa nüfus yoğunluğu 100 000/500=200 kişi/km² olur.',
      '⚠️ Haritadaki görsel büyüklüğe güvenme; soru kökündeki konum, sayı ve neden-sonuç bilgilerini kullan.'
    ][adim];
    if (d.includes('vatandaşlık')) return [
      'Her kavramı tanım + yetki + kurum şeklinde öğren. Böylece benzer kavramları daha kolay ayırırsın.',
      'TBMM 600 milletvekilinden oluşur ve yasama yetkisi Türk Milleti adına TBMM tarafından kullanılır.',
      'Bir soru kurum soruyorsa önce organı, sonra görevini, ardından benzer organlardan farkını kontrol et.',
      '⚠️ Bir kurumun genel görevini başka bir kurumun özel yetkisiyle karıştırma; seçeneklerde bu ayrım sık kullanılır.'
    ][adim];
    if (d.includes('güncel')) return [
      'Güncel bilgiyi kişi/kurum + olay + tarih şeklinde kartlaştır.',
      'Örneğin bir kurum başkanı veya güncel sayı değişebileceği için kartın üzerine “son kontrol tarihi” ekle.',
      'Sınavdan önce dönemsel bilgileri yeniden kontrol et; kalıcı bilgilerle değişebilen bilgileri ayrı tut.',
      '⚠️ Güncel bilgi eskiyebilir. Özellikle isim, görev, sayı ve tarihleri son tekrar döneminde doğrula.'
    ][adim];
    return [
      'Bu adımda konunun temel kavramını öğren ve kendi cümlenle tekrar et.',
      'Şimdi temel kuralın nasıl uygulandığını örnek üzerinden gör. Verilen bilgiyi kuralla eşleştir.',
      'Örneği kendin çözmeyi dene: önce isteneni bul, sonra kuralı uygula ve sonucu kontrol et.',
      '⚠️ Son adımda sık yapılan karıştırmayı kontrol et. Yanlış seçeneği neden yanlış olduğunu açıklayabiliyorsan konuyu öğrenmişsindir.'
    ][adim];
  }

  dersOgrenmeRender = function () {
    if (!dersOgrenme) return;
    const {meta, konu, paket, adim} = dersOgrenme;
    const kart = paket.adimlar[adim];
    const toplam = paket.adimlar.length;
    const son = adim + 1 >= toplam;
    const yuz = Math.round(((adim + 1) / toplam) * 100);
    const ek = ekOrnek(meta.name, konu.ad, adim);

    modalAc(`📖 ${konu.ad}`, `
      <div class="lesson-head"><span class="study-subject-dot" style="background:${meta.renk}"></span><span>${esc(meta.name)}</span><span class="lesson-progress-text">${adim+1}/${toplam}</span></div>
      ${adim===0 ? `<div class="lesson-intro"><span>🎯</span><div><strong>Bu derste ne öğreneceksin?</strong><p>${esc(paket.tanim)}</p></div></div>` : ''}
      <div class="lesson-progress"><span style="width:${yuz}%"></span></div>
      <article class="lesson-step lesson-step-rich">
        <div class="lesson-step-number">${adim+1}</div>
        <div class="lesson-step-body">
          <span class="lesson-kicker">${son?'SON TEKRAR':'ŞİMDİ ÖĞREN'}</span>
          <h3>${esc(kart.baslik)}</h3>
          <p>${esc(kart.metin)}</p>
          <div class="lesson-example"><strong>📌 ÖRNEK / UYGULAMA</strong><p>${esc(ek)}</p></div>
          ${kart.ipucu ? `<div class="lesson-tip"><strong>💡 Akılda tut</strong><p>${esc(kart.ipucu)}</p></div>` : ''}
          <div class="lesson-rich-solution"><strong>🧩 BU ADIMDA NE YAP?</strong><p>${esc(adim===0?'Kavramı kendi cümlenle tekrar et.':adim===1?'Kuralın neden çalıştığını örneğe bakarak açıkla.':adim===2?'Örneği kapatıp kendin çöz, ardından sonucunu kontrol et.':'Tuzak noktayı belirle ve yanlış seçeneğin neden yanlış olduğunu söyle.')}</p></div>
        </div>
      </article>
      <div class="lesson-check"><span>${son?'🎉':'📌'}</span><span>${son?'Bu konu anlatımının son adımındasın. Tamamladığında sıradaki konuya geçebilirsin.':'Bu adımı gerçekten anladıysan sonraki sayfaya geç. Takıldığın yerde önceki adıma dön.'}</span></div>
    `, `<button type="button" class="btn btn-outline" id="lessonNotBtn">📝 Not al</button><button type="button" class="btn btn-primary" id="lessonNextBtn">${son?'Sonraki konu →':'Sonraki →'}</button>`);

    document.getElementById('lessonNextBtn')?.addEventListener('click',()=>{
      if(!son){ dersOgrenme.adim++; dersOgrenmeRender(); return; }
      dersOgrenme.konu.durum='tamamlandi'; stateKaydet();
      const list=STATE.dersler[dersOgrenme.dersId]?.konular||[];
      const i=list.findIndex(k=>String(k.id)===String(dersOgrenme.konuId));
      const sonraki=list[i+1];
      if(sonraki){ toast(`✅ ${dersOgrenme.konu.ad} tamamlandı. Sıradaki konuya geçiyoruz.`); dersOgrenmeBaslat(dersOgrenme.dersId,sonraki.id); }
      else { const ad=dersOgrenme.konu.ad; dersOgrenme=null; modalKapat(); renderCalisma(); toast(`🎉 ${ad} tamamlandı!`); }
    });
    document.getElementById('lessonNotBtn')?.addEventListener('click',()=>{
      const v=dersOgrenme.konu.not||'';
      modalAc(`📝 ${dersOgrenme.konu.ad} — Notun`,`<div class="study-note-label">Bu konuda aklında kalmasını istediğin şeyi yaz.</div><textarea id="lessonNote" rows="7" placeholder="Önemli kural, püf nokta, kendi cümlen...">${esc(v)}</textarea>`,`<button type="button" class="btn btn-primary" id="lessonSaveNote">Notu kaydet</button>`);
      document.getElementById('lessonSaveNote')?.addEventListener('click',()=>{ dersOgrenme.konu.not=document.getElementById('lessonNote').value; stateKaydet(); dersOgrenmeRender(); toast('Notun kaydedildi.'); });
    });
  };
})();
