/* ============================================================
   ÇALIŞMA MERKEZİ
   Test çözme akışından ayrı, sade bir konu çalışma alanı.
   ============================================================ */
const calismaUI = { ders: "tumu", durum: "tumu", arama: "" };

function calismaKonulariniGetir() {
  const liste = [];
  SUBJECTS_META.forEach(ders => {
    const state = STATE.dersler[ders.id];
    (state?.konular || []).forEach(konu => liste.push({ ...konu, dersId: ders.id, ders: ders.name, renk: ders.renk }));
  });
  return liste;
}

function calismaOzet() {
  const konular = calismaKonulariniGetir();
  const tamam = konular.filter(k => k.durum === "tamamlandi").length;
  const aktif = konular.filter(k => k.durum === "calisiyorum").length;
  const tekrar = konular.filter(k => k.durum === "tekrar").length;
  return { toplam: konular.length, tamam, aktif, tekrar, yuzde: yuzde(tamam, konular.length) };
}

function calismaSayfasiniAc() {
  $all(".page").forEach(p => p.classList.remove("active"));
  const sayfa = $("#page-calisma");
  if (!sayfa) return;
  sayfa.classList.add("active");
  $all(".nav-item, .bn-item").forEach(b => b.classList.toggle("active", b.dataset.page === "calisma"));
  renderCalisma();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCalisma() {
  const ozet = calismaOzet();
  $("#page-calisma").innerHTML = `
    <div class="study-hero"><div><div class="study-eyebrow">🎯 ÇALIŞMA MERKEZİ</div><h1>Bugün ne çalışıyoruz?</h1><p>Konunu seç, kısa bir hedef koy ve ilerlemeni işaretle. Karmaşık planlar yok; kaldığın yerden devam.</p></div><div class="study-hero-score"><strong>%${ozet.yuzde}</strong><span>Konu tamamlandı</span></div></div>
    <div class="study-quick-grid"><div class="study-stat"><span>📚</span><strong>${ozet.toplam}</strong><small>Toplam konu</small></div><div class="study-stat"><span>🔥</span><strong>${ozet.aktif}</strong><small>Şu an çalışılan</small></div><div class="study-stat"><span>✅</span><strong>${ozet.tamam}</strong><small>Tamamlanan</small></div><div class="study-stat"><span>🔁</span><strong>${ozet.tekrar}</strong><small>Tekrar bekleyen</small></div></div>
    <div class="card study-today-card"><div><span class="study-mini-label">⚡ HIZLI BAŞLANGIÇ</span><h3>15 dakikalık mini tur</h3><p>Bir konu seç, 15 dakika odaklan ve ardından birkaç soru çöz.</p></div><button class="btn btn-accent" id="studyRastgeleBtn">🎲 Bana konu seç</button></div>
    <div class="study-toolbar"><input id="studyArama" class="study-search" type="search" placeholder="🔎 Konu ara..." value="${calismaUI.arama}"><select id="studyDers"><option value="tumu">Tüm dersler</option>${SUBJECTS_META.map(d => `<option value="${d.id}" ${calismaUI.ders===d.id?"selected":""}>${d.name}</option>`).join("")}</select><select id="studyDurum"><option value="tumu">Tüm durumlar</option><option value="baslamadim" ${calismaUI.durum==="baslamadim"?"selected":""}>Başlamadım</option><option value="calisiyorum" ${calismaUI.durum==="calisiyorum"?"selected":""}>Çalışıyorum</option><option value="tamamlandi" ${calismaUI.durum==="tamamlandi"?"selected":""}>Tamamlandı</option><option value="tekrar" ${calismaUI.durum==="tekrar"?"selected":""}>Tekrar gerekli</option></select></div>
    <div class="study-section-head"><div><h2>Konu haritası</h2><span class="alt">İlerledikçe kartların durumu değişir.</span></div><span id="studyCount" class="study-count"></span></div><div id="studyTopicGrid" class="study-topic-grid"></div>`;

  $("#studyArama").addEventListener("input", e => { calismaUI.arama = e.target.value; studyKartlariCiz(); });
  $("#studyDers").addEventListener("change", e => { calismaUI.ders = e.target.value; studyKartlariCiz(); });
  $("#studyDurum").addEventListener("change", e => { calismaUI.durum = e.target.value; studyKartlariCiz(); });
  $("#studyRastgeleBtn").addEventListener("click", studyRastgeleKonu);
  studyKartlariCiz();
}

function studyKartlariCiz() {
  const kok = $("#studyTopicGrid");
  if (!kok) return;
  const arama = calismaUI.arama.trim().toLocaleLowerCase("tr-TR");
  const liste = calismaKonulariniGetir().filter(k =>
    (calismaUI.ders === "tumu" || k.dersId === calismaUI.ders) &&
    (calismaUI.durum === "tumu" || k.durum === calismaUI.durum) &&
    (!arama || `${k.ad} ${k.ders}`.toLocaleLowerCase("tr-TR").includes(arama))
  );
  $("#studyCount").textContent = `${liste.length} konu`;
  if (!liste.length) {
    kok.innerHTML = `<div class="empty-state">Bu filtrede konu bulunamadı. Aramayı veya filtreyi değiştir.</div>`;
    return;
  }

  kok.innerHTML = liste.map(k => {
    const durum = k.durum === "tamamlandi" ? ["Tamamlandı", "done"] : k.durum === "calisiyorum" ? ["Çalışıyorum", "active"] : k.durum === "tekrar" ? ["Tekrar gerekli", "review"] : ["Başlamadım", "new"];
    const basari = yuzde(k.dogru, k.dogru + k.yanlis);
    return `<article class="study-topic-card ${durum[1]}">
      <div class="study-card-top"><span class="study-subject-dot" style="background:${k.renk}"></span><span>${k.ders}</span><span class="study-status ${durum[1]}">${durum[0]}</span></div>
      <h3>${k.ad}</h3>
      <div class="study-card-meta"><span>${k.soru || 0} soru</span><span>${basari ? `%${basari} başarı` : "Henüz veri yok"}</span><span>${k.calismaDk || 0} dk</span></div>
      <div class="study-card-actions"><button type="button" class="btn btn-primary btn-sm" data-study-start="${k.id}" data-study-ders="${k.dersId}">📖 Çalış</button><button type="button" class="btn btn-outline btn-sm" data-study-status="${k.id}" data-study-ders="${k.dersId}">Durumu değiştir</button></div>
    </article>`;
  }).join("");

  // Kartlar her filtrelemede yeniden üretildiği için doğrudan listener'ları burada tekrar bağlıyoruz.
  $all("[data-study-start]", kok).forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      studyKonuAc(btn.dataset.studyDers, btn.dataset.studyStart);
    });
  });
  $all("[data-study-status]", kok).forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      studyDurumDegistir(btn.dataset.studyDers, btn.dataset.studyStatus);
    });
  });
}

function studyKonuBul(dersId, konuId) {
  return STATE.dersler[dersId]?.konular.find(k => k.id === konuId);
}

function studyKonuAc(dersId, konuId) {
  const meta = SUBJECTS_META.find(d => d.id === dersId);
  const konu = studyKonuBul(dersId, konuId);
  if (!meta || !konu) {
    console.warn("Çalışma konusu bulunamadı:", dersId, konuId);
    toast("Bu konu bulunamadı. Sayfayı yenileyip tekrar deneyin.");
    return;
  }

  if (konu.durum === "baslamadim") {
    konu.durum = "calisiyorum";
    stateKaydet();
  }

  const hedef = Math.max(1, Number(STATE.ayarlar.pomodoroCalismaDk) || 25);
  const acildi = modalAc(`📖 ${konu.ad}`, `
    <div class="study-modal-intro"><span class="study-subject-dot" style="background:${meta.renk}"></span>${meta.name}</div>
    <div class="study-focus-box"><strong>Bugünkü mini hedef</strong><p>15 dakika konu tekrarı + ardından 5 soru. Mükemmel olmak zorunda değilsin; ilerlemek yeter.</p></div>
    <div class="study-note-label">Kendi notun</div>
    <textarea id="studyKonuNot" rows="5" placeholder="Bu konuda aklında kalması gerekenleri yaz...">${konu.not || ""}</textarea>
    <div class="study-modal-stats"><span>📚 ${konu.soru || 0} soru</span><span>⏱️ ${konu.calismaDk || 0} dk</span><span>🎯 ${yuzde(konu.dogru, konu.dogru + konu.yanlis)}% başarı</span></div>
  `, `<button type="button" class="btn btn-outline" id="studyNotKaydet">Notu Kaydet</button><button type="button" class="btn btn-primary" id="studyTimerBaslat">⏱️ ${hedef} dk Başlat</button>`);

  if (!acildi) return;

  const notBtn = $("#studyNotKaydet");
  const timerBtn = $("#studyTimerBaslat");
  if (notBtn) notBtn.addEventListener("click", () => {
    konu.not = $("#studyKonuNot").value;
    stateKaydet();
    toast("Konu notu kaydedildi.");
  });

  if (timerBtn) timerBtn.addEventListener("click", () => {
    modalKapat();
    pomo.dersId = dersId;
    if (!pomo.calisiyor) pomoBaslatDuraklat();
    toast(`${meta.name} • ${konu.ad} için çalışma başladı.`);
  });
}

function studyDurumDegistir(dersId, konuId) {
  const konu = studyKonuBul(dersId, konuId);
  if (!konu) return;
  const sira = ["baslamadim", "calisiyorum", "tamamlandi", "tekrar"];
  konu.durum = sira[(sira.indexOf(konu.durum) + 1) % sira.length];
  stateKaydet();
  renderCalisma();
  toast(`Konu durumu: ${KONU_DURUMLARI.find(x => x.id === konu.durum)?.ad || konu.durum}`);
}

function studyRastgeleKonu() {
  const adaylar = calismaKonulariniGetir().filter(k => k.durum !== "tamamlandi");
  if (!adaylar.length) return toast("Harika! Tüm konuları tamamlamışsın.");
  const konu = adaylar[Math.floor(Math.random() * adaylar.length)];
  calismaUI.ders = konu.dersId;
  calismaUI.durum = "tumu";
  calismaUI.arama = konu.ad;
  renderCalisma();
  setTimeout(() => studyKonuAc(konu.dersId, konu.id), 50);
}

/* Yedek event delegation: doğrudan listener herhangi bir nedenle kaybolsa bile kartlar çalışır. */
document.addEventListener("click", e => {
  const start = e.target.closest?.("[data-study-start]");
  if (start) {
    e.preventDefault();
    e.stopPropagation();
    studyKonuAc(start.dataset.studyDers, start.dataset.studyStart);
    return;
  }
  const status = e.target.closest?.("[data-study-status]");
  if (status) {
    e.preventDefault();
    e.stopPropagation();
    studyDurumDegistir(status.dataset.studyDers, status.dataset.studyStatus);
  }
}, false);

document.addEventListener("click", e => {
  const btn = e.target.closest?.("[data-page='calisma']");
  if (!btn) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  calismaSayfasiniAc();
}, true);
