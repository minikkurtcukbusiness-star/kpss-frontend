/* ============================================================
   SIRALI KONU AKIŞI
   Son adımda konuyu tamamlar ve aynı dersteki bir sonraki konuya
   geçmeyi teklif eder. Mevcut lesson.js davranışını bozmadan
   render fonksiyonunu zenginleştirir.
   ============================================================ */

const _temelDersOgrenmeRender = dersOgrenmeRender;

dersOgrenmeRender = function () {
  if (!dersOgrenme) return;
  const { meta, konu, paket, adim } = dersOgrenme;
  const toplam = paket.adimlar.length;
  const kart = paket.adimlar[adim];
  const sonAdim = adim + 1 >= toplam;
  const ilerleme = Math.round(((adim + 1) / toplam) * 100);

  modalAc(`📖 ${konu.ad}`, `
    <div class="lesson-head"><span class="study-subject-dot" style="background:${meta.renk}"></span><span>${meta.name}</span><span class="lesson-progress-text">${adim + 1}/${toplam}</span></div>
    ${adim === 0 ? `<div class="lesson-intro"><span>🎯</span><div><strong>Bu derste ne öğreneceksin?</strong><p>${paket.tanim}</p></div></div>` : ""}
    <div class="lesson-progress"><span style="width:${ilerleme}%"></span></div>
    <article class="lesson-step">
      <div class="lesson-step-number">${adim + 1}</div>
      <div class="lesson-step-body"><span class="lesson-kicker">${sonAdim ? "SON TEKRAR" : "ŞİMDİ ÖĞREN"}</span><h3>${kart.baslik}</h3><p>${kart.metin}</p>${kart.ornek ? `<div class="lesson-example"><strong>Örnek</strong><p>${kart.ornek}</p></div>` : ""}${kart.ipucu ? `<div class="lesson-tip"><strong>💡 Akılda tut</strong><p>${kart.ipucu}</p></div>` : ""}</div>
    </article>
    <div class="lesson-check"><span>${sonAdim ? "🎉" : "📌"}</span><span>${sonAdim ? "Bu konunun temel anlatımını tamamladın. Şimdi istersen sıradaki konuya geçebilir veya 5 soru çözebilirsin." : "Bu adımı anladıysan devam et. Takıldığın yerde geri dönüp tekrar okuyabilirsin."}</span></div>
  `, `<button type="button" class="btn btn-outline" id="lessonNotBtn">📝 Not al</button><button type="button" class="btn btn-primary" id="lessonNextBtn">${sonAdim ? "Sonraki konu →" : "Sonraki →"}</button>`);

  $("#lessonNextBtn")?.addEventListener("click", () => {
    if (!sonAdim) {
      dersOgrenme.adim += 1;
      dersOgrenmeRender();
      return;
    }

    dersOgrenme.konu.durum = "tamamlandi";
    stateKaydet();
    const dersId = dersOgrenme.dersId;
    const mevcutId = dersOgrenme.konuId;
    const konular = (STATE.dersler[dersId]?.konular || []);
    const index = konular.findIndex(k => String(k.id) === String(mevcutId));
    const sonraki = index >= 0 ? konular[index + 1] : null;

    if (sonraki) {
      toast(`✅ ${dersOgrenme.konu.ad} tamamlandı. Sıradaki konuya geçiyoruz.`);
      dersOgrenmeBaslat(dersId, sonraki.id);
    } else {
      modalKapat();
      renderCalisma();
      toast(`🎉 ${dersOgrenme.konu.ad} tamamlandı! Bu dersteki son konuyu bitirdin.`);
      dersOgrenme = null;
    }
  });

  $("#lessonNotBtn")?.addEventListener("click", () => {
    const mevcut = dersOgrenme.konu.not || "";
    modalAc(`📝 ${dersOgrenme.konu.ad} — Notun`, `<div class="study-note-label">Bu konuda aklında kalmasını istediğin şeyi yaz.</div><textarea id="lessonNote" rows="7" placeholder="Önemli kural, püf nokta, kendi cümlen...">${mevcut}</textarea>`, `<button type="button" class="btn btn-primary" id="lessonSaveNote">Notu kaydet</button>`);
    $("#lessonSaveNote")?.addEventListener("click", () => { dersOgrenme.konu.not = $("#lessonNote").value; stateKaydet(); dersOgrenmeRender(); toast("Notun kaydedildi."); });
  });
};
