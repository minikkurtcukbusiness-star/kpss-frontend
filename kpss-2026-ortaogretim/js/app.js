/* ==========================================================================
   app.js — Uygulama mantığı, sayfa render'ları, etkileşimler
   ========================================================================== */

const uiState = {
  sayfa: "anasayfa",
  dersDetay: null,
  gbFiltre: "Tümü"
};

const pomo = {
  mod: "calisma",        // calisma | mola
  kalanSaniye: 0,
  calisiyor: false,
  intervalId: null,
  dersId: "turkce"
};

/* ============================================================
   YARDIMCI FONKSİYONLAR
   ============================================================ */
function $(sel, kok) { return (kok || document).querySelector(sel); }
function $all(sel, kok) { return Array.from((kok || document).querySelectorAll(sel)); }

function dkFormat(dk) {
  dk = Math.round(dk || 0);
  const s = Math.floor(dk / 60);
  const d = dk % 60;
  if (s <= 0) return `${d} dk`;
  if (d === 0) return `${s} sa`;
  return `${s} sa ${d} dk`;
}

function yuzde(dogru, toplam) {
  if (!toplam) return 0;
  return Math.round((dogru / toplam) * 100);
}

function dersAdi(id) {
  const d = SUBJECTS_META.find(x => x.id === id);
  return d ? d.name : id;
}
function dersRenk(id) {
  const d = SUBJECTS_META.find(x => x.id === id);
  return d ? d.renk : "#999";
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function tarihUzunGoster(iso) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) { return iso; }
}

function haftaninGunu(d) {
  const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return gunler[d.getDay()];
}

function sonNGun(n) {
  const gunler = [];
  for (let i = n - 1; i >= 0; i--) {
    gunler.push(bugunStr(new Date(Date.now() - i * 86400000)));
  }
  return gunler;
}

function dersToplamCalisma(ders) {
  const konuToplam = ders.konular.reduce((t, k) => t + (k.calismaDk || 0), 0);
  return (ders.calismaDk || 0) + konuToplam;
}

function genelToplamSoru() {
  return SUBJECTS_META.reduce((t, d) => t + STATE.dersler[d.id].soru, 0);
}
function genelToplamDogru() {
  return SUBJECTS_META.reduce((t, d) => t + STATE.dersler[d.id].dogru, 0);
}
function genelToplamYanlis() {
  return SUBJECTS_META.reduce((t, d) => t + STATE.dersler[d.id].yanlis, 0);
}
function genelToplamCalismaDk() {
  return SUBJECTS_META.reduce((t, d) => t + dersToplamCalisma(STATE.dersler[d.id]), 0);
}

/* ============================================================
   NAVİGASYON
   ============================================================ */
function sayfaGec(sayfaId) {
  uiState.sayfa = sayfaId;
  if (sayfaId !== "dersler") uiState.dersDetay = null;
  $all(".page").forEach(p => p.classList.toggle("active", p.dataset.page === sayfaId));
  $all(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === sayfaId));
  $all(".bn-item").forEach(b => b.classList.toggle("active", b.dataset.page === sayfaId));
  renderSayfa(sayfaId);
  window.scrollTo(0, 0);
}

function navBaglantilariniKur() {
  $all(".nav-item, .bn-item").forEach(btn => {
    btn.addEventListener("click", () => sayfaGec(btn.dataset.page));
  });
}

function renderSayfa(sayfaId) {
  if (sayfaId === "anasayfa") renderAnaSayfa();
  else if (sayfaId === "dersler") renderDersler();
  else if (sayfaId === "plan") renderPlan();
  else if (sayfaId === "denemeler") renderDenemeler();
  else if (sayfaId === "istatistik") renderIstatistik();
  else if (sayfaId === "guncel") renderGuncel();
  else if (sayfaId === "aiogretmen") renderAiOgretmen();
  else if (sayfaId === "ayarlar") renderAyarlar();
}

/* ============================================================
   MODAL
   ============================================================ */
function modalAc(baslik, icHTML, ayakHTML) {
  $("#modalBox").innerHTML = `
    <div class="modal-head"><h3>${baslik}</h3><button class="modal-close" id="modalKapatBtn">✕</button></div>
    <div class="modal-body">${icHTML}</div>
    ${ayakHTML ? `<div class="modal-foot">${ayakHTML}</div>` : ""}
  `;
  $("#modalOverlay").classList.add("open");
  $("#modalKapatBtn").addEventListener("click", modalKapat);
}
function modalKapat() {
  $("#modalOverlay").classList.remove("open");
  $("#modalBox").innerHTML = "";
}
$("#modalOverlay").addEventListener("click", (e) => { if (e.target.id === "modalOverlay") modalKapat(); });

/* ============================================================
   TEMA
   ============================================================ */
function temaUygula() {
  const tema = STATE.ayarlar.tema;
  document.documentElement.setAttribute("data-theme", tema);
  $("#temaToggleLabel").textContent = tema === "koyu" ? "Aydınlık tema" : "Koyu tema";
}
function temaDegistir() {
  STATE.ayarlar.tema = STATE.ayarlar.tema === "koyu" ? "acik" : "koyu";
  stateKaydet();
  temaUygula();
}

/* ============================================================
   ANA SAYFA
   ============================================================ */
function gunSayaciHesapla() {
  const bugun = new Date(); bugun.setHours(0,0,0,0);
  const sinav = new Date(STATE.ayarlar.sinavTarihi + "T00:00:00");
  const fark = Math.ceil((sinav - bugun) / 86400000);
  return fark;
}

function motivasyonSozu() {
  const bugun = bugunStr();
  let toplam = 0;
  for (let i = 0; i < bugun.length; i++) toplam += bugun.charCodeAt(i);
  return MOTIVASYON_SOZLERI[toplam % MOTIVASYON_SOZLERI.length];
}

function tekrarGerekenler() {
  const liste = [];
  SUBJECTS_META.forEach(ders => {
    STATE.dersler[ders.id].konular.forEach(k => {
      if (k.durum === "tekrar") liste.push({ dersId: ders.id, dersAdi: ders.name, konu: k });
    });
  });
  return liste;
}

function renderAnaSayfa() {
  const kalanGun = gunSayaciHesapla();
  const kayit = gunlukKayitAl();
  const hedefSoru = STATE.ayarlar.gunlukSoruHedefi;
  const hedefDk = STATE.ayarlar.gunlukCalismaHedefiDk;
  const soruYuzde = Math.min(100, yuzde(kayit.soru, hedefSoru));
  const dkYuzde = Math.min(100, yuzde(kayit.calismaDk, hedefDk));
  const genelBasari = yuzde(genelToplamDogru(), genelToplamDogru() + genelToplamYanlis());
  const tekrarListe = tekrarGerekenler();
  const bugunTarihUzun = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  const bugunPlan = STATE.plan;
  const tamamlananBugun = STATE.planTamamlanan[bugunStr()] || {};

  $("#page-anasayfa").innerHTML = `
    <div class="page-head">
      <h1>2026 KPSS Ortaöğretim</h1>
      <div class="alt">${bugunTarihUzun} · ${haftaninGunu(new Date())}</div>
    </div>

    <div class="ticket">
      <div class="ticket-main">
        <div class="ticket-eyebrow">Sınava Kalan Süre</div>
        <div class="ticket-daysrow">
          <span class="ticket-days tabular">${kalanGun >= 0 ? kalanGun : 0}</span>
          <span class="ticket-days-label">gün kaldı</span>
        </div>
        <div class="ticket-date">KPSS Ortaöğretim · ${tarihUzunGoster(STATE.ayarlar.sinavTarihi)}</div>
      </div>
      <div class="ticket-stub">
        <div class="ticket-stub-row"><span class="k">Bugünkü hedef</span><span class="v">${hedefSoru} soru</span></div>
        <div class="ticket-stub-row"><span class="k">Bugün çözülen</span><span class="v">${kayit.soru} / ${hedefSoru}</span></div>
        <div class="ticket-stub-row"><span class="k">Seri</span><span class="v">${STATE.seri.guncel} gün 🔥</span></div>
      </div>
    </div>

    <div class="motiv-strip"><span class="ic">✎</span><span>${motivasyonSozu()}</span></div>

    <button class="btn btn-accent btn-block" id="anaSoruCozBtn" style="margin-bottom:20px; padding:16px; font-size:16px; font-weight:700;">
      🎯 Soru Çözmeye Başla (${hedefSoru} Soru · Tüm Derslerden Karma)
    </button>

    <div class="grid grid-4" style="margin-bottom:20px;">
      <div class="card stat-card">
        <span class="label">Bugünkü Çalışma</span>
        <span class="value tabular">${dkFormat(kayit.calismaDk)}</span>
        <span class="sub">Hedef: ${dkFormat(hedefDk)}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${dkYuzde}%"></div></div>
      </div>
      <div class="card stat-card">
        <span class="label">Bugün Çözülen Soru</span>
        <span class="value tabular">${kayit.soru} / ${hedefSoru}</span>
        <span class="sub">${kayit.dogru} doğru · ${kayit.yanlis} yanlış</span>
        <div class="progress-track"><div class="progress-fill accent" style="width:${soruYuzde}%"></div></div>
      </div>
      <div class="card stat-card">
        <span class="label">Toplam Çözülen Soru</span>
        <span class="value tabular">${genelToplamSoru()}</span>
        <span class="sub">Tüm dersler toplamı</span>
      </div>
      <div class="card stat-card">
        <span class="label">Genel Başarı</span>
        <span class="value tabular">%${genelBasari}</span>
        <span class="sub">${genelToplamDogru()} doğru / ${genelToplamDogru() + genelToplamYanlis()} soru</span>
      </div>
    </div>

    <div class="grid grid-2" style="align-items:start;">
      <div class="card card-pad pomo-card" id="anaPomoCard"></div>
      <div class="card card-pad">
        <div class="section-title">Bugünün Planı <button class="btn btn-outline btn-sm" data-git="plan">Plana git</button></div>
        <div id="anaPlanListe"></div>
      </div>
    </div>

    <div class="card card-pad" style="margin-top:16px;">
      <div class="section-title">Tekrar Etmen Gerekenler <span class="badge badge-tekrar">${tekrarListe.length}</span></div>
      <div id="anaTekrarListe">
        ${tekrarListe.length === 0
          ? `<div class="empty-state">Şu anda "Tekrar gerekli" olarak işaretlenmiş konu yok. Böyle devam! 👍</div>`
          : tekrarListe.map(t => `
            <div class="tekrar-item">
              <span>${t.dersAdi} <span class="yol">→</span> ${t.konu.ad}</span>
              <button class="btn btn-outline btn-sm" data-konu-git="${t.dersId}">Konuya git</button>
            </div>`).join("")}
      </div>
    </div>
  `;

  $all("[data-git='plan']").forEach(b => b.addEventListener("click", () => sayfaGec("plan")));
  $all("[data-konu-git]").forEach(b => b.addEventListener("click", () => {
    uiState.dersDetay = b.dataset.konuGit;
    sayfaGec("dersler");
  }));
  $("#anaSoruCozBtn").addEventListener("click", karisikTestBaslat);

  renderAnaPlanListe(bugunPlan, tamamlananBugun);
  pomoWidgetOlustur($("#anaPomoCard"));
}

/* Ana sayfadaki "Soru Çözmeye Başla" — tüm derslerden karma, gerçek soru testi. */
async function karisikTestBaslat() {
  if (!apiBaseUrlAl()) {
    modalAc("Sunucu adresi tanımlı değil", `
      <p>Gerçek soru üretebilmek için önce Ayarlar sayfasından yapay zekâ sunucu adresini (API_BASE_URL) girmen gerekiyor.</p>
    `, `<button class="btn btn-accent" id="ayarlaraGitBtn">Ayarlara Git</button>`);
    $("#ayarlaraGitBtn").addEventListener("click", () => { modalKapat(); sayfaGec("ayarlar"); });
    return;
  }

  const hedef = STATE.ayarlar.gunlukSoruHedefi || 80;
  const dersListesi = SUBJECTS_META; // 6 ders
  const temelPay = Math.floor(hedef / dersListesi.length);
  let kalan = hedef - temelPay * dersListesi.length;

  const istekler = dersListesi.map((ders, i) => {
    const konular = TOPICS_SEED[ders.id] || [ders.name];
    const seciliKonu = konular[Math.floor(Math.random() * konular.length)];
    const sayi = temelPay + (i < kalan ? 1 : 0);
    return { subject: ders.name, topic: seciliKonu, difficulty: "orta", count: Math.max(sayi, 1) };
  }).filter(istek => istek.count > 0);

  modalAc("Sorular Hazırlanıyor", `
    <div style="text-align:center; padding:20px 0;">
      <div class="alt">Her dersten karma sorular üretiliyor, ${hedef} soru için bu 1-2 dakika sürebilir. Lütfen bekle…</div>
    </div>
  `, "");

  const sonuc = await apiKarisikTestOlustur(istekler);

  if (!sonuc.ok) {
    modalAc("Sorular hazırlanamadı", `<p>${sonuc.mesaj}</p>`, `<button class="btn btn-accent" id="testHataKapatBtn">Kapat</button>`);
    $("#testHataKapatBtn").addEventListener("click", modalKapat);
    return;
  }

  const sorular = sonuc.veri.sorular || [];
  if (sorular.length === 0) {
    modalAc("Sorular hazırlanamadı", `<p>Şu an soru üretilemedi. Lütfen birkaç dakika sonra tekrar dene.</p>`, `<button class="btn btn-accent" id="testHataKapatBtn">Kapat</button>`);
    $("#testHataKapatBtn").addEventListener("click", modalKapat);
    return;
  }

  testModalBaslat(sorular, `Karma Soru Testi (${sorular.length} Soru)`, (soru, dogruMu) => {
    const dersMeta = SUBJECTS_META.find(m => m.name === soru.subject);
    if (dersMeta) {
      const dersState = STATE.dersler[dersMeta.id];
      dersState.soru += 1;
      if (dogruMu) dersState.dogru += 1; else dersState.yanlis += 1;
    }
    const kayit = gunlukKayitAl();
    kayit.soru += 1;
    if (dogruMu) kayit.dogru += 1; else kayit.yanlis += 1;
    seriyiGuncelle();
    stateKaydet();
  }, () => {
    if (uiState.sayfa === "anasayfa") renderAnaSayfa();
  });
}

function renderAnaPlanListe(plan, tamamlanan) {
  const kok = $("#anaPlanListe");
  if (!kok) return;
  if (plan.length === 0) {
    kok.innerHTML = `<div class="empty-state">Henüz bir plan oluşturmadın.</div>`;
    return;
  }
  kok.innerHTML = plan.slice().sort((a,b) => a.saat.localeCompare(b.saat)).map(p => {
    const done = !!tamamlanan[p.id];
    return `
      <div class="plan-check-row ${done ? "done" : ""}">
        <span class="saat tabular">${p.saat}</span>
        <input type="checkbox" data-plan-check="${p.id}" ${done ? "checked" : ""}>
        <span class="lbl">${dersAdi(p.dersId)}</span>
      </div>`;
  }).join("");
  $all("[data-plan-check]", kok).forEach(cb => {
    cb.addEventListener("change", () => {
      const tarih = bugunStr();
      if (!STATE.planTamamlanan[tarih]) STATE.planTamamlanan[tarih] = {};
      STATE.planTamamlanan[tarih][cb.dataset.planCheck] = cb.checked;
      stateKaydet();
      renderAnaSayfa();
    });
  });
}

/* ============================================================
   POMODORO
   ============================================================ */
function pomoSifirla() {
  clearInterval(pomo.intervalId);
  pomo.intervalId = null;
  pomo.calisiyor = false;
  pomo.mod = "calisma";
  pomo.kalanSaniye = STATE.ayarlar.pomodoroCalismaDk * 60;
}
pomoSifirla();

function pomoWidgetOlustur(kok) {
  if (!kok) return;
  kok.innerHTML = `
    <div class="pomo-ring-wrap">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r="48" fill="none" stroke="var(--surface-alt)" stroke-width="9"/>
        <circle id="pomoRing" cx="54" cy="54" r="48" fill="none" stroke="var(--accent)" stroke-width="9"
          stroke-linecap="round" transform="rotate(-90 54 54)" stroke-dasharray="301.6" stroke-dashoffset="0"/>
      </svg>
      <div class="pomo-time tabular" id="pomoSure">25:00</div>
    </div>
    <div class="pomo-meta">
      <div class="pomo-mode-label" id="pomoModEtiket">ÇALIŞMA SÜRESİ</div>
      <div class="field" style="margin-bottom:8px;">
        <label>Çalışılan ders</label>
        <select id="pomoDersSecim">
          ${SUBJECTS_META.map(d => `<option value="${d.id}" ${d.id === pomo.dersId ? "selected" : ""}>${d.name}</option>`).join("")}
        </select>
      </div>
      <div class="pomo-controls">
        <button class="btn btn-primary btn-sm" id="pomoBaslatBtn">${pomo.calisiyor ? "Duraklat" : "Başlat"}</button>
        <button class="btn btn-outline btn-sm" id="pomoSifirlaBtn">Sıfırla</button>
      </div>
    </div>
  `;
  $("#pomoDersSecim").addEventListener("change", (e) => { pomo.dersId = e.target.value; });
  $("#pomoBaslatBtn").addEventListener("click", pomoBaslatDuraklat);
  $("#pomoSifirlaBtn").addEventListener("click", () => { pomoSifirla(); pomoGoruntuGuncelle(); });
  pomoGoruntuGuncelle();
}

function pomoBaslatDuraklat() {
  if (pomo.calisiyor) {
    clearInterval(pomo.intervalId);
    pomo.intervalId = null;
    pomo.calisiyor = false;
  } else {
    pomo.calisiyor = true;
    pomo.intervalId = setInterval(pomoTik, 1000);
  }
  pomoGoruntuGuncelle();
}

function pomoTik() {
  pomo.kalanSaniye -= 1;
  if (pomo.kalanSaniye <= 0) {
    pomoTamamlandi();
    return;
  }
  pomoGoruntuGuncelle();
}

function pomoTamamlandi() {
  clearInterval(pomo.intervalId);
  pomo.intervalId = null;
  pomo.calisiyor = false;

  if (pomo.mod === "calisma") {
    const dk = STATE.ayarlar.pomodoroCalismaDk;
    STATE.dersler[pomo.dersId].calismaDk += dk;
    gunlukKayitAl().calismaDk += dk;
    STATE.calismaOturumlari.push({ tarih: bugunStr(), dersId: pomo.dersId, dakika: dk, ts: Date.now() });
    seriyiGuncelle();
    stateKaydet();
    toast(`${dersAdi(pomo.dersId)} için ${dk} dakika kaydedildi.`);
    pomo.mod = "mola";
    pomo.kalanSaniye = STATE.ayarlar.pomodoroMolaDk * 60;
    if (uiState.sayfa === "anasayfa") renderAnaSayfa();
    if (uiState.sayfa === "dersler") renderDersler();
  } else {
    toast("Mola bitti. Çalışmaya devam edebilirsin.");
    pomo.mod = "calisma";
    pomo.kalanSaniye = STATE.ayarlar.pomodoroCalismaDk * 60;
  }
  pomoGoruntuGuncelle();
}

function pomoGoruntuGuncelle() {
  const sureEl = $("#pomoSure");
  if (!sureEl) return;
  const dk = Math.floor(pomo.kalanSaniye / 60);
  const sn = pomo.kalanSaniye % 60;
  sureEl.textContent = `${String(dk).padStart(2,"0")}:${String(sn).padStart(2,"0")}`;
  $("#pomoModEtiket").textContent = pomo.mod === "calisma" ? "ÇALIŞMA SÜRESİ" : "MOLA";
  $("#pomoBaslatBtn").textContent = pomo.calisiyor ? "Duraklat" : "Başlat";

  const toplamSn = (pomo.mod === "calisma" ? STATE.ayarlar.pomodoroCalismaDk : STATE.ayarlar.pomodoroMolaDk) * 60;
  const oran = toplamSn > 0 ? pomo.kalanSaniye / toplamSn : 0;
  const cevre = 301.6;
  const ring = $("#pomoRing");
  if (ring) ring.setAttribute("stroke-dashoffset", String(cevre * (1 - oran)));
}

/* ============================================================
   DERSLER
   ============================================================ */
function renderDersler() {
  if (uiState.dersDetay) {
    renderDersDetay(uiState.dersDetay);
    return;
  }
  $("#page-dersler").innerHTML = `
    <div class="page-head">
      <h1>Dersler</h1>
      <div class="alt">Her dersin ilerlemesini ve başarı oranını buradan takip et.</div>
    </div>
    <div class="grid grid-3" id="derslerGrid"></div>
  `;
  const grid = $("#derslerGrid");
  grid.innerHTML = SUBJECTS_META.map(meta => {
    const d = STATE.dersler[meta.id];
    const basari = yuzde(d.dogru, d.dogru + d.yanlis);
    const tamamlananKonu = d.konular.filter(k => k.durum === "tamamlandi").length;
    const konuYuzde = yuzde(tamamlananKonu, d.konular.length);
    return `
      <div class="card ders-card" data-ders-ac="${meta.id}">
        <div class="ders-card-top">
          <span class="ders-name">${meta.name}</span>
          <span class="ders-dot" style="background:${meta.renk}"></span>
        </div>
        <div class="ders-mini-stats">
          <div><span class="n tabular">${dkFormat(dersToplamCalisma(d))}</span><span class="l">Süre</span></div>
          <div><span class="n tabular">${d.soru}</span><span class="l">Soru</span></div>
          <div><span class="n tabular">%${basari}</span><span class="l">Başarı</span></div>
        </div>
        <div class="ders-stats-row"><span>Konu ilerlemesi</span><span class="tabular">${tamamlananKonu}/${d.konular.length}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${konuYuzde}%; background:${meta.renk}"></div></div>
      </div>`;
  }).join("");
  $all("[data-ders-ac]", grid).forEach(c => c.addEventListener("click", () => {
    uiState.dersDetay = c.dataset.dersAc;
    renderDersler();
  }));
}

function renderDersDetay(dersId) {
  const meta = SUBJECTS_META.find(x => x.id === dersId);
  const d = STATE.dersler[dersId];
  const basari = yuzde(d.dogru, d.dogru + d.yanlis);

  $("#page-dersler").innerHTML = `
    <button class="back-link" id="dersGeriBtn">← Derslere dön</button>
    <div class="page-head" style="display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap;">
      <div>
        <h1>${meta.name}</h1>
        <div class="alt">${dkFormat(dersToplamCalisma(d))} çalışıldı · ${d.soru} soru çözüldü · %${basari} başarı</div>
      </div>
      <button class="btn btn-primary" id="soruEkleBtn">+ Soru Ekle</button>
    </div>

    <div class="grid grid-4" style="margin-bottom:18px;">
      <div class="card stat-card"><span class="label">Çözülen Soru</span><span class="value tabular">${d.soru}</span></div>
      <div class="card stat-card"><span class="label">Doğru</span><span class="value tabular" style="color:var(--success)">${d.dogru}</span></div>
      <div class="card stat-card"><span class="label">Yanlış</span><span class="value tabular" style="color:var(--danger)">${d.yanlis}</span></div>
      <div class="card stat-card"><span class="label">Başarı</span><span class="value tabular">%${basari}</span></div>
    </div>

    <div class="card card-pad">
      <div class="section-title">Konular</div>
      <div id="konuListe"></div>
    </div>
  `;

  $("#dersGeriBtn").addEventListener("click", () => { uiState.dersDetay = null; renderDersler(); });
  $("#soruEkleBtn").addEventListener("click", () => soruEkleModalAc(dersId));

  const liste = $("#konuListe");
  liste.innerHTML = d.konular.map(k => `
    <div class="konu-row">
      <span class="konu-ad" data-konu-detay="${k.id}">${k.ad}</span>
      <select class="konu-durum-select" data-konu-durum="${k.id}">
        ${KONU_DURUMLARI.map(s => `<option value="${s.id}" ${s.id === k.durum ? "selected" : ""}>${s.ad}</option>`).join("")}
      </select>
    </div>`).join("");

  $all("[data-konu-detay]", liste).forEach(el => el.addEventListener("click", () => konuDetayModalAc(dersId, el.dataset.konuDetay)));
  $all("[data-konu-durum]", liste).forEach(sel => sel.addEventListener("change", () => {
    const konu = d.konular.find(k => k.id === sel.dataset.konuDurum);
    konu.durum = sel.value;
    stateKaydet();
    renderDersDetay(dersId);
    if (uiState.sayfa === "anasayfa") renderAnaSayfa();
  }));
}

function konuDetayModalAc(dersId, konuId) {
  const meta = SUBJECTS_META.find(x => x.id === dersId);
  const konu = STATE.dersler[dersId].konular.find(k => k.id === konuId);
  modalAc(`${meta.name} · ${konu.ad}`, `
    <div class="field">
      <label>Durum</label>
      <select id="mDurum">${KONU_DURUMLARI.map(s => `<option value="${s.id}" ${s.id === konu.durum ? "selected" : ""}>${s.ad}</option>`).join("")}</select>
    </div>
    <div class="field-row">
      <div class="field"><label>Çalışma süresi (dk)</label><input type="number" min="0" id="mDk" value="${konu.calismaDk}"></div>
      <div class="field"><label>Çözülen soru</label><input type="number" min="0" id="mSoru" value="${konu.soru}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Doğru</label><input type="number" min="0" id="mDogru" value="${konu.dogru}"></div>
      <div class="field"><label>Yanlış</label><input type="number" min="0" id="mYanlis" value="${konu.yanlis}"></div>
    </div>
    <div class="field"><label>Notlar</label><textarea id="mNot" rows="3" placeholder="Bu konuyla ilgili notların...">${konu.not || ""}</textarea></div>
  `, `
    <button class="btn btn-outline" id="mVazgec">Vazgeç</button>
    <button class="btn btn-primary" id="mKaydet">Kaydet</button>
  `);
  $("#mVazgec").addEventListener("click", modalKapat);
  $("#mKaydet").addEventListener("click", () => {
    konu.durum = $("#mDurum").value;
    konu.calismaDk = Math.max(0, parseInt($("#mDk").value) || 0);
    konu.soru = Math.max(0, parseInt($("#mSoru").value) || 0);
    konu.dogru = Math.max(0, parseInt($("#mDogru").value) || 0);
    konu.yanlis = Math.max(0, parseInt($("#mYanlis").value) || 0);
    konu.not = $("#mNot").value.trim();
    stateKaydet();
    modalKapat();
    toast("Konu bilgileri kaydedildi.");
    renderDersDetay(dersId);
  });
}

function soruEkleModalAc(onSeciliDersId) {
  modalAc("Soru Ekle", `
    <div class="field">
      <label>Ders</label>
      <select id="sDers">
        ${SUBJECTS_META.map(d => `<option value="${d.id}" ${d.id === onSeciliDersId ? "selected" : ""}>${d.name}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label>Konu (isteğe bağlı)</label>
      <select id="sKonu"><option value="">Genel (konu seçmedim)</option></select>
    </div>
    <div class="field-row">
      <div class="field"><label>Doğru</label><input type="number" min="0" id="sDogru" value="0"></div>
      <div class="field"><label>Yanlış</label><input type="number" min="0" id="sYanlis" value="0"></div>
    </div>
    <div class="field"><label>Toplam soru</label><input type="number" id="sToplam" value="0" disabled></div>
  `, `
    <button class="btn btn-outline" id="sVazgec">Vazgeç</button>
    <button class="btn btn-primary" id="sKaydet">Kaydet</button>
  `);

  function konuSecenekDoldur(dersId) {
    const konular = STATE.dersler[dersId].konular;
    $("#sKonu").innerHTML = `<option value="">Genel (konu seçmedim)</option>` +
      konular.map(k => `<option value="${k.id}">${k.ad}</option>`).join("");
  }
  konuSecenekDoldur(onSeciliDersId);
  $("#sDers").addEventListener("change", (e) => konuSecenekDoldur(e.target.value));

  function toplamiGuncelle() {
    const dg = parseInt($("#sDogru").value) || 0;
    const yn = parseInt($("#sYanlis").value) || 0;
    $("#sToplam").value = dg + yn;
  }
  $("#sDogru").addEventListener("input", toplamiGuncelle);
  $("#sYanlis").addEventListener("input", toplamiGuncelle);

  $("#sVazgec").addEventListener("click", modalKapat);
  $("#sKaydet").addEventListener("click", () => {
    const dersId = $("#sDers").value;
    const konuId = $("#sKonu").value;
    const dogru = Math.max(0, parseInt($("#sDogru").value) || 0);
    const yanlis = Math.max(0, parseInt($("#sYanlis").value) || 0);
    const soru = dogru + yanlis;
    if (soru <= 0) { toast("Doğru veya yanlış sayısı girmelisin."); return; }

    const ders = STATE.dersler[dersId];
    ders.soru += soru; ders.dogru += dogru; ders.yanlis += yanlis;
    if (konuId) {
      const konu = ders.konular.find(k => k.id === konuId);
      if (konu) { konu.soru += soru; konu.dogru += dogru; konu.yanlis += yanlis; }
    }
    const kayit = gunlukKayitAl();
    kayit.soru += soru; kayit.dogru += dogru; kayit.yanlis += yanlis;
    seriyiGuncelle();
    stateKaydet();
    modalKapat();
    toast(`${soru} soru eklendi (${dogru} doğru, ${yanlis} yanlış).`);
    renderSayfa(uiState.sayfa);
  });
}

/* ============================================================
   PLAN
   ============================================================ */
function renderPlan() {
  $("#page-plan").innerHTML = `
    <div class="page-head">
      <h1>Günlük Çalışma Planı</h1>
      <div class="alt">Bu plan her gün için aynı şablonu kullanır — saatleri ve dersleri istediğin gibi düzenle.</div>
    </div>
    <div class="grid grid-2" style="align-items:start;">
      <div class="card card-pad">
        <div class="section-title">Plan Şablonu</div>
        <div id="planDuzenleListe"></div>
        <button class="btn btn-outline btn-block" id="planEkleBtn" style="margin-top:12px;">+ Yeni satır ekle</button>
      </div>
      <div class="card card-pad">
        <div class="section-title">Bugünün Kontrol Listesi</div>
        <div id="planBugunListe"></div>
      </div>
    </div>
  `;

  const duzenleKok = $("#planDuzenleListe");
  function duzenleCiz() {
    if (STATE.plan.length === 0) {
      duzenleKok.innerHTML = `<div class="empty-state">Henüz plan satırı yok.</div>`;
      return;
    }
    duzenleKok.innerHTML = STATE.plan.map(p => `
      <div class="plan-row">
        <input type="time" value="${p.saat}" data-plan-saat="${p.id}">
        <select data-plan-ders="${p.id}">
          ${SUBJECTS_META.map(d => `<option value="${d.id}" ${d.id === p.dersId ? "selected" : ""}>${d.name}</option>`).join("")}
        </select>
        <button class="btn-ghost" data-plan-sil="${p.id}">🗑</button>
      </div>`).join("");

    $all("[data-plan-saat]", duzenleKok).forEach(inp => inp.addEventListener("change", () => {
      STATE.plan.find(p => p.id === inp.dataset.planSaat).saat = inp.value;
      stateKaydet(); duzenleCiz(); bugunCiz();
    }));
    $all("[data-plan-ders]", duzenleKok).forEach(sel => sel.addEventListener("change", () => {
      STATE.plan.find(p => p.id === sel.dataset.planDers).dersId = sel.value;
      stateKaydet(); bugunCiz();
    }));
    $all("[data-plan-sil]", duzenleKok).forEach(btn => btn.addEventListener("click", () => {
      STATE.plan = STATE.plan.filter(p => p.id !== btn.dataset.planSil);
      stateKaydet(); duzenleCiz(); bugunCiz();
    }));
  }

  function bugunCiz() {
    renderAnaPlanListeIcin($("#planBugunListe"));
  }

  $("#planEkleBtn").addEventListener("click", () => {
    STATE.plan.push({ id: uid(), saat: "09:00", dersId: "turkce" });
    stateKaydet(); duzenleCiz(); bugunCiz();
  });

  duzenleCiz();
  bugunCiz();
}

function renderAnaPlanListeIcin(kok) {
  const plan = STATE.plan;
  const tarih = bugunStr();
  const tamamlanan = STATE.planTamamlanan[tarih] || {};
  if (plan.length === 0) { kok.innerHTML = `<div class="empty-state">Plan boş.</div>`; return; }
  kok.innerHTML = plan.slice().sort((a,b) => a.saat.localeCompare(b.saat)).map(p => {
    const done = !!tamamlanan[p.id];
    return `
      <div class="plan-check-row ${done ? "done" : ""}">
        <span class="saat tabular">${p.saat}</span>
        <input type="checkbox" data-planb-check="${p.id}" ${done ? "checked" : ""}>
        <span class="lbl">${dersAdi(p.dersId)}</span>
      </div>`;
  }).join("");
  $all("[data-planb-check]", kok).forEach(cb => cb.addEventListener("change", () => {
    if (!STATE.planTamamlanan[tarih]) STATE.planTamamlanan[tarih] = {};
    STATE.planTamamlanan[tarih][cb.dataset.planbCheck] = cb.checked;
    stateKaydet();
    renderAnaPlanListeIcin(kok);
  }));
}

/* ============================================================
   DENEMELER
   ============================================================ */
function renderDenemeler() {
  $("#page-denemeler").innerHTML = `
    <div class="page-head">
      <h1>Denemeler</h1>
      <div class="alt">Deneme sonuçlarını gir, net gelişimini grafikte takip et.</div>
    </div>
    <div class="grid grid-2" style="align-items:start; margin-bottom:18px;">
      <div class="card card-pad">
        <div class="section-title">Yeni Deneme Ekle</div>
        <div id="denemeForm"></div>
      </div>
      <div class="card chart-card">
        <div class="chart-title">Deneme Netlerinin Değişimi</div>
        <canvas id="denemeNetGrafik" height="220"></canvas>
      </div>
    </div>
    <div class="card card-pad">
      <div class="section-title">Deneme Geçmişi</div>
      <div class="tbl-wrap" id="denemeTablo"></div>
    </div>
  `;
  denemeFormCiz();
  denemeTabloCiz();
  denemeGrafikCiz();
}

function denemeFormCiz() {
  const kok = $("#denemeForm");
  kok.innerHTML = `
    <div class="field-row">
      <div class="field"><label>Deneme adı</label><input type="text" id="dnAd" placeholder="Örn. Hızlı Deneme 5"></div>
      <div class="field"><label>Tarih</label><input type="date" id="dnTarih" value="${bugunStr()}"></div>
    </div>
    ${SUBJECTS_META.map(d => `
      <div class="field-row">
        <div class="field" style="flex:1.2;"><label>${d.name}</label></div>
        <div class="field"><label>Doğru</label><input type="number" min="0" class="dn-dogru" data-ders="${d.id}" value="0"></div>
        <div class="field"><label>Yanlış</label><input type="number" min="0" class="dn-yanlis" data-ders="${d.id}" value="0"></div>
      </div>`).join("")}
    <button class="btn btn-primary btn-block" id="dnKaydetBtn">Deneme Ekle</button>
  `;
  $("#dnKaydetBtn").addEventListener("click", () => {
    const ad = $("#dnAd").value.trim() || `Deneme ${STATE.denemeler.length + 1}`;
    const tarih = $("#dnTarih").value || bugunStr();
    const dersler = {};
    let toplamD = 0, toplamY = 0, net = 0;
    SUBJECTS_META.forEach(d => {
      const dg = Math.max(0, parseInt($(`.dn-dogru[data-ders="${d.id}"]`).value) || 0);
      const yn = Math.max(0, parseInt($(`.dn-yanlis[data-ders="${d.id}"]`).value) || 0);
      dersler[d.id] = { dogru: dg, yanlis: yn };
      toplamD += dg; toplamY += yn;
      net += dg - (yn / 4);
    });
    if (toplamD + toplamY === 0) { toast("En az bir ders için sonuç girmelisin."); return; }
    STATE.denemeler.push({ id: uid(), ad, tarih, dersler, toplamDogru: toplamD, toplamYanlis: toplamY, net: Math.round(net * 100) / 100 });
    STATE.denemeler.sort((a,b) => a.tarih.localeCompare(b.tarih));
    stateKaydet();
    toast("Deneme kaydedildi.");
    renderDenemeler();
  });
}

function denemeTabloCiz() {
  const kok = $("#denemeTablo");
  if (STATE.denemeler.length === 0) {
    kok.innerHTML = `<div class="empty-state">Henüz deneme eklenmedi.</div>`;
    return;
  }
  const siraliDenemeler = STATE.denemeler.slice().sort((a,b) => b.tarih.localeCompare(a.tarih));
  kok.innerHTML = `
    <table>
      <thead><tr><th>Deneme</th><th>Tarih</th><th>Doğru</th><th>Yanlış</th><th>Net</th><th></th></tr></thead>
      <tbody>
        ${siraliDenemeler.map(d => `
          <tr>
            <td>${d.ad}</td>
            <td class="tabular">${tarihUzunGoster(d.tarih)}</td>
            <td class="tabular" style="color:var(--success)">${d.toplamDogru}</td>
            <td class="tabular" style="color:var(--danger)">${d.toplamYanlis}</td>
            <td class="tabular"><strong>${d.net}</strong></td>
            <td><button class="btn-ghost" data-deneme-sil="${d.id}">🗑</button></td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
  $all("[data-deneme-sil]", kok).forEach(btn => btn.addEventListener("click", () => {
    STATE.denemeler = STATE.denemeler.filter(d => d.id !== btn.dataset.denemeSil);
    stateKaydet();
    renderDenemeler();
  }));
}

function denemeGrafikCiz() {
  const canvas = $("#denemeNetGrafik");
  const siralanmis = STATE.denemeler.slice().sort((a,b) => a.tarih.localeCompare(b.tarih));
  cizgiGrafikCiz(canvas, siralanmis.map(d => d.ad), siralanmis.map(d => d.net));
}

/* ============================================================
   İSTATİSTİK
   ============================================================ */
function renderIstatistik() {
  $("#page-istatistik").innerHTML = `
    <div class="page-head">
      <h1>İstatistikler</h1>
      <div class="alt">Kayıtlı verilerinden oluşturulan gerçek zamanlı özet.</div>
    </div>
    <div class="grid grid-4" style="margin-bottom:18px;">
      <div class="card stat-card"><span class="label">Toplam Çözülen Soru</span><span class="value tabular">${genelToplamSoru()}</span></div>
      <div class="card stat-card"><span class="label">Toplam Çalışma Süresi</span><span class="value tabular">${dkFormat(genelToplamCalismaDk())}</span></div>
      <div class="card stat-card"><span class="label">Genel Başarı</span><span class="value tabular">%${yuzde(genelToplamDogru(), genelToplamDogru()+genelToplamYanlis())}</span></div>
      <div class="card stat-card"><span class="label">Toplam Deneme</span><span class="value tabular">${STATE.denemeler.length}</span></div>
    </div>
    <div class="grid grid-2" style="margin-bottom:14px;">
      <div class="card chart-card"><div class="chart-title">Son 7 Gün — Çalışma Süresi (dk)</div><canvas id="grf7Sure" height="200"></canvas></div>
      <div class="card chart-card"><div class="chart-title">Son 7 Gün — Çözülen Soru</div><canvas id="grf7Soru" height="200"></canvas></div>
    </div>
    <div class="grid grid-2">
      <div class="card chart-card"><div class="chart-title">Derslere Göre Başarı (%)</div><canvas id="grfDersBasari" height="200"></canvas></div>
      <div class="card chart-card"><div class="chart-title">Deneme Netlerinin Değişimi</div><canvas id="grfDenemeNet" height="200"></canvas></div>
    </div>
  `;

  const gunler = sonNGun(7);
  const gunEtiket = gunler.map(g => g.slice(5).split("-").reverse().join("/"));
  const sureVeri = gunler.map(g => (STATE.gunlukKayitlar[g] || {}).calismaDk || 0);
  const soruVeri = gunler.map(g => (STATE.gunlukKayitlar[g] || {}).soru || 0);
  cubukGrafikCiz($("#grf7Sure"), gunEtiket, sureVeri, "var(--primary)");
  cubukGrafikCiz($("#grf7Soru"), gunEtiket, soruVeri, "var(--accent)");

  const dersEtiket = SUBJECTS_META.map(d => d.name.slice(0, 6));
  const dersBasariVeri = SUBJECTS_META.map(d => {
    const x = STATE.dersler[d.id];
    return yuzde(x.dogru, x.dogru + x.yanlis);
  });
  cubukGrafikCiz($("#grfDersBasari"), dersEtiket, dersBasariVeri, "var(--success)");

  const siralanmis = STATE.denemeler.slice().sort((a,b) => a.tarih.localeCompare(b.tarih));
  cizgiGrafikCiz($("#grfDenemeNet"), siralanmis.map((d,i) => `#${i+1}`), siralanmis.map(d => d.net));
}

/* ============================================================
   BASİT CANVAS GRAFİKLERİ (harici kütüphane kullanılmaz)
   ============================================================ */
function canvasHazirla(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const oran = getComputedStyle(canvas).getPropertyValue("height") || "200px";
  const genislik = canvas.clientWidth || canvas.parentElement.clientWidth || 300;
  const yukseklik = parseInt(canvas.getAttribute("height")) || 200;
  canvas.width = genislik * dpr;
  canvas.height = yukseklik * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w: genislik, h: yukseklik };
}

function renkCoz(cssVar) {
  if (!cssVar || cssVar[0] !== "v") return cssVar || "#29467B";
  const tmp = document.createElement("span");
  tmp.style.color = cssVar;
  document.body.appendChild(tmp);
  const c = getComputedStyle(tmp).color;
  document.body.removeChild(tmp);
  return c;
}

function cubukGrafikCiz(canvas, etiketler, degerler, renkVar) {
  if (!canvas) return;
  const { ctx, w, h } = canvasHazirla(canvas);
  ctx.clearRect(0, 0, w, h);
  const renk = renkCoz(renkVar || "var(--primary)");
  const izSoft = renkCoz("var(--ink-faint)");
  const altPay = 26, ustPay = 14;
  const maks = Math.max(1, ...degerler);
  const genBirim = w / etiketler.length;
  const cubukGen = Math.min(38, genBirim * 0.5);

  ctx.font = "11px Inter, sans-serif";
  ctx.fillStyle = izSoft;
  ctx.textAlign = "center";

  degerler.forEach((deger, i) => {
    const x = genBirim * i + genBirim / 2;
    const yuk = (h - altPay - ustPay) * (deger / maks);
    const y = h - altPay - yuk;
    ctx.fillStyle = renk;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x - cubukGen/2, y, cubukGen, yuk, 4) : ctx.rect(x - cubukGen/2, y, cubukGen, yuk);
    ctx.fill();
    ctx.fillStyle = izSoft;
    ctx.fillText(String(deger), x, y - 5);
    ctx.fillText(etiketler[i], x, h - 8);
  });
}

function cizgiGrafikCiz(canvas, etiketler, degerler) {
  if (!canvas) return;
  const { ctx, w, h } = canvasHazirla(canvas);
  ctx.clearRect(0, 0, w, h);
  if (degerler.length === 0) {
    ctx.fillStyle = renkCoz("var(--ink-faint)");
    ctx.font = "13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Henüz veri yok", w/2, h/2);
    return;
  }
  const renk = renkCoz("var(--primary)");
  const izSoft = renkCoz("var(--ink-faint)");
  const altPay = 24, ustPay = 18, solPay = 10, sagPay = 10;
  const maks = Math.max(1, ...degerler);
  const min = Math.min(0, ...degerler);
  const genBirim = degerler.length > 1 ? (w - solPay - sagPay) / (degerler.length - 1) : 0;

  ctx.strokeStyle = renk;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  degerler.forEach((deger, i) => {
    const x = solPay + genBirim * i;
    const oran = (deger - min) / (maks - min || 1);
    const y = h - altPay - (h - altPay - ustPay) * oran;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.font = "10.5px Inter, sans-serif";
  ctx.fillStyle = izSoft;
  ctx.textAlign = "center";
  degerler.forEach((deger, i) => {
    const x = solPay + genBirim * i;
    const oran = (deger - min) / (maks - min || 1);
    const y = h - altPay - (h - altPay - ustPay) * oran;
    ctx.fillStyle = renk;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = izSoft;
    ctx.fillText(String(deger), x, y - 8);
    if (etiketler[i] !== undefined && degerler.length <= 14) ctx.fillText(String(etiketler[i]).slice(0,8), x, h - 6);
  });
}

/* ============================================================
   GÜNCEL BİLGİLER
   ============================================================ */
function renderGuncel() {
  const kategoriler = ["Tümü", ...Array.from(new Set(GUNCEL_BILGILER_SEED.map(g => g.kategori)))];
  $("#page-guncel").innerHTML = `
    <div class="page-head">
      <h1>Güncel Bilgiler</h1>
      <div class="alt">Sınav dönemine özel güncel bilgi başlıkları.</div>
    </div>
    <div class="gb-note">Bu içerikler elle hazırlanmış sabit bir başlangıç setidir ve internet bağlantısı olmadan da görüntülenir. Canlı güncel bilgiler ve bugünün testi için aşağıdaki butonları kullanabilirsin (backend adresi Ayarlar'da tanımlı olmalı).</div>
    <div class="card gb-canli-kart" style="margin-bottom:16px;">
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-accent" id="gbCanliCekBtn">🔄 Canlı Güncel Bilgileri Getir</button>
        <button class="btn btn-primary" id="gbGununTestiBtn">📅 Bugünün Testini Çöz</button>
      </div>
      <div id="gbCanliDurum" class="alt" style="margin-top:8px;"></div>
      <div id="gbCanliListe"></div>
    </div>
    <div class="chip-row" id="gbChipRow">
      ${kategoriler.map(k => `<button class="chip ${k === uiState.gbFiltre ? "active" : ""}" data-gb-filtre="${k}">${k}</button>`).join("")}
    </div>
    <div id="gbListe"></div>
  `;
  $all("[data-gb-filtre]").forEach(c => c.addEventListener("click", () => {
    uiState.gbFiltre = c.dataset.gbFiltre;
    renderGuncel();
  }));
  $("#gbCanliCekBtn").addEventListener("click", gbCanliBilgileriGetir);
  $("#gbGununTestiBtn").addEventListener("click", gbGununTestiniBaslat);
  gbListeCiz();
}

async function gbCanliBilgileriGetir() {
  const durum = $("#gbCanliDurum");
  const liste = $("#gbCanliListe");
  durum.textContent = "Güncel bilgiler getiriliyor, bu biraz sürebilir…";
  liste.innerHTML = "";

  const sonuc = await apiGuncelBilgilerGetir();
  if (!sonuc.ok) {
    durum.textContent = sonuc.mesaj;
    return;
  }
  const bilgiler = sonuc.veri.bilgiler || [];
  if (bilgiler.length === 0) {
    durum.textContent = "Şu an için canlı güncel bilgi bulunamadı.";
    return;
  }
  durum.textContent = `${sonuc.veri.tarih} tarihli ${bilgiler.length} güncel bilgi bulundu:`;
  liste.innerHTML = bilgiler.map(b => `
    <div class="card gb-card">
      <span class="gb-cat">${b.kategori}</span>
      <div class="gb-title">${b.baslik}</div>
      <div class="gb-text">${b.ozet}</div>
      <div class="gb-foot">
        <span class="gb-tekrar-sayisi">${b.tarih}</span>
        ${b.kaynakUrl ? `<a class="btn btn-sm" href="${b.kaynakUrl}" target="_blank" rel="noopener">Kaynağı Gör (${b.kaynakAdi}) →</a>` : ""}
      </div>
    </div>`).join("");
}

async function gbGununTestiniBaslat() {
  const durum = $("#gbCanliDurum");
  durum.textContent = "Bugünün testi hazırlanıyor…";

  const sonuc = await apiGununTestiOlustur();
  if (!sonuc.ok) {
    durum.textContent = sonuc.mesaj;
    return;
  }
  const sorular = sonuc.veri.sorular || [];
  if (sorular.length === 0) {
    durum.textContent = "Bugün için test oluşturulamadı.";
    return;
  }
  durum.textContent = "";
  testModalBaslat(sorular, "Bugünün KPSS Güncel Bilgiler Testi");
}

/* Basit tek-modal test akışı: hem "Bugünün Testi" hem AI'nın ürettiği sorular için kullanılır. */
function testModalBaslat(sorular, baslik, kayitCallback, bitisCallback) {
  let index = 0;
  let dogru = 0, yanlis = 0;

  function soruCiz() {
    const s = sorular[index];
    const secenekler = s.secenekler || s.options;
    const html = `
      <div class="alt" style="margin-bottom:8px;">Soru ${index + 1} / ${sorular.length}</div>
      <div style="font-weight:600; margin-bottom:12px;">${s.soru || s.question}</div>
      <div id="testSecenekler">
        ${Object.entries(secenekler).map(([harf, metin]) => `
          <button class="btn btn-sm" style="display:block; width:100%; text-align:left; margin-bottom:6px;" data-secenek="${harf}">${harf}) ${metin}</button>
        `).join("")}
      </div>
      <div id="testAciklama" style="margin-top:10px;"></div>
    `;
    modalAc(baslik, html, `<button class="btn" id="testIleriBtn" style="display:none;">${index + 1 < sorular.length ? "Sonraki Soru" : "Testi Bitir"}</button>`);

    $all("[data-secenek]").forEach(btn => btn.addEventListener("click", () => {
      const secilen = btn.dataset.secenek;
      const dogruCevap = s.dogruCevap || s.correctAnswer;
      const dogruMu = secilen === dogruCevap;
      $all("[data-secenek]").forEach(b => b.disabled = true);
      if (dogruMu) {
        dogru++;
        btn.style.borderColor = "var(--basari, #3E8E63)";
      } else {
        yanlis++;
        btn.style.borderColor = "var(--hata, #C0483D)";
      }
      $("#testAciklama").innerHTML = `<strong>Doğru cevap: ${dogruCevap}</strong><br>${s.aciklama || s.explanation || ""}`;
      $("#testIleriBtn").style.display = "inline-block";
      if (typeof kayitCallback === "function") kayitCallback(s, dogruMu);
    }));

    $("#testIleriBtn").addEventListener("click", () => {
      index++;
      if (index < sorular.length) {
        soruCiz();
      } else {
        modalAc(baslik, `<div style="text-align:center; padding:20px 0;">
          <div style="font-size:28px; font-weight:700;">${dogru} / ${sorular.length}</div>
          <div class="alt">Doğru: ${dogru} · Yanlış: ${yanlis}</div>
        </div>`, `<button class="btn btn-accent" id="testKapatBtn">Kapat</button>`);
        $("#testKapatBtn").addEventListener("click", modalKapat);
        if (typeof bitisCallback === "function") bitisCallback();
      }
    });
  }

  soruCiz();
}

function gbListeCiz() {
  const kok = $("#gbListe");
  const liste = GUNCEL_BILGILER_SEED.filter(g => uiState.gbFiltre === "Tümü" || g.kategori === uiState.gbFiltre);
  kok.innerHTML = liste.map(g => {
    const sayac = STATE.okunanGuncel[g.id] || 0;
    return `
      <div class="card gb-card">
        <span class="gb-cat">${g.kategori}</span>
        <div class="gb-title">${g.baslik}</div>
        <div class="gb-text">${g.metin}</div>
        <div class="gb-foot">
          <span class="gb-tekrar-sayisi">${sayac > 0 ? `${sayac} kez tekrar edildi` : "Henüz tekrar edilmedi"}</span>
          <button class="btn btn-accent btn-sm" data-gb-tekrar="${g.id}">Bu bilgiyi tekrar et</button>
        </div>
      </div>`;
  }).join("");
  $all("[data-gb-tekrar]", kok).forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.gbTekrar;
    STATE.okunanGuncel[id] = (STATE.okunanGuncel[id] || 0) + 1;
    stateKaydet();
    toast("Tekrar kaydedildi.");
    gbListeCiz();
  }));
}

/* ============================================================
   AI ÖĞRETMEN
   ============================================================ */
let aiSohbetGecmisi = [];

function renderAiOgretmen() {
  $("#page-aiogretmen").innerHTML = `
    <div class="page-head">
      <h1>AI Öğretmen</h1>
      <div class="alt">KPSS ile ilgili soru sor, yapay zekâ sınav odaklı cevap versin. Güncel bir konu sorarsan internetten güvenilir kaynaklarla destekler.</div>
    </div>
    <div class="card" style="margin-bottom:14px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <input type="file" id="aiFotoInput" accept="image/*" capture="environment" style="display:none;">
        <button class="btn btn-sm" id="aiFotoBtn">📸 Fotoğraftan Soru Çöz</button>
      </div>
    </div>
    <div id="aiSohbetKutu" class="ai-sohbet-kutu"></div>
    <div class="ai-giris-satiri" style="display:flex; gap:8px; margin-top:10px;">
      <input type="text" id="aiSoruInput" placeholder="Örn: Saltanat hangi tarihte kaldırıldı?" style="flex:1;">
      <button class="btn btn-accent" id="aiGonderBtn">Gönder</button>
    </div>
  `;

  aiSohbetGecmisiCiz();

  $("#aiGonderBtn").addEventListener("click", aiSoruGonder);
  $("#aiSoruInput").addEventListener("keydown", (e) => { if (e.key === "Enter") aiSoruGonder(); });
  $("#aiFotoBtn").addEventListener("click", () => $("#aiFotoInput").click());
  $("#aiFotoInput").addEventListener("change", aiFotoYuklendi);
}

function aiSohbetGecmisiCiz() {
  const kutu = $("#aiSohbetKutu");
  if (!kutu) return;
  if (aiSohbetGecmisi.length === 0) {
    kutu.innerHTML = `<div class="alt" style="padding:20px 0;">Henüz bir soru sormadın. Yukarıdan yazabilir veya fotoğraf yükleyebilirsin.</div>`;
    return;
  }
  kutu.innerHTML = aiSohbetGecmisi.map(msj => {
    if (msj.rol === "kullanici") {
      return `<div class="ai-msj ai-msj-kullanici">${msj.metin}</div>`;
    }
    const kaynakHtml = (msj.kaynaklar && msj.kaynaklar.length)
      ? `<div class="ai-kaynaklar">${msj.kaynaklar.map(k => `<a href="${k.url}" target="_blank" rel="noopener">${k.kaynak}</a>`).join(" · ")}</div>`
      : "";
    const belirsizHtml = msj.belirsiz ? `<div class="alt">Bu bilgi güncel kaynaklardan kesin olarak doğrulanamadı.</div>` : "";
    return `<div class="ai-msj ai-msj-bot">${msj.metin}${belirsizHtml}${kaynakHtml}</div>`;
  }).join("");
  kutu.scrollTop = kutu.scrollHeight;
}

async function aiSoruGonder() {
  const input = $("#aiSoruInput");
  const soru = input.value.trim();
  if (!soru) return;
  input.value = "";

  aiSohbetGecmisi.push({ rol: "kullanici", metin: soru });
  aiSohbetGecmisi.push({ rol: "bot", metin: "Düşünüyor…", yukleniyor: true });
  aiSohbetGecmisiCiz();

  const sonuc = await apiAiOgretmenSor(soru);

  aiSohbetGecmisi.pop(); // "Düşünüyor…" mesajını kaldır
  if (!sonuc.ok) {
    aiSohbetGecmisi.push({ rol: "bot", metin: sonuc.mesaj });
  } else {
    aiSohbetGecmisi.push({
      rol: "bot",
      metin: sonuc.veri.cevap,
      kaynaklar: sonuc.veri.kaynaklar,
      belirsiz: sonuc.veri.belirsiz
    });
  }
  aiSohbetGecmisiCiz();
}

function aiFotoYuklendi(e) {
  const dosya = e.target.files[0];
  if (!dosya) return;

  const okuyucu = new FileReader();
  okuyucu.onload = async () => {
    aiSohbetGecmisi.push({ rol: "kullanici", metin: "📸 Fotoğraf gönderildi." });
    aiSohbetGecmisi.push({ rol: "bot", metin: "Fotoğraf okunuyor…", yukleniyor: true });
    aiSohbetGecmisiCiz();

    const sonuc = await apiFotoCoz(okuyucu.result, dosya.type);
    aiSohbetGecmisi.pop();

    if (!sonuc.ok) {
      aiSohbetGecmisi.push({ rol: "bot", metin: sonuc.mesaj });
    } else {
      const s = sonuc.veri;
      const secenekMetni = Object.entries(s.secenekler || {}).map(([h, m]) => `${h}) ${m}`).join("<br>");
      aiSohbetGecmisi.push({
        rol: "bot",
        metin: `<strong>${s.soru}</strong><br>${secenekMetni}<br><br><strong>Doğru cevap: ${s.dogruCevap}</strong><br>${s.aciklama || ""}`
      });
    }
    aiSohbetGecmisiCiz();
  };
  okuyucu.readAsDataURL(dosya);
  e.target.value = "";
}

/* ============================================================
   AYARLAR
   ============================================================ */
function renderAyarlar() {
  const a = STATE.ayarlar;
  $("#page-ayarlar").innerHTML = `
    <div class="page-head"><h1>Ayarlar</h1><div class="alt">Hedeflerini, sayaç sürelerini ve verilerini yönet.</div></div>

    <div class="card card-pad settings-block">
      <h3>Hedefler</h3>
      <div class="field-row">
        <div class="field"><label>Günlük soru hedefi</label><input type="number" min="0" id="aySoruHedef" value="${a.gunlukSoruHedefi}"></div>
        <div class="field"><label>Günlük çalışma hedefi (dk)</label><input type="number" min="0" id="ayCalismaHedef" value="${a.gunlukCalismaHedefiDk}"></div>
      </div>
      <div class="field"><label>Sınav tarihi</label><input type="date" id="aySinavTarihi" value="${a.sinavTarihi}"></div>
    </div>

    <div class="card card-pad settings-block">
      <h3>Pomodoro / Çalışma Sayacı</h3>
      <div class="field-row">
        <div class="field"><label>Çalışma süresi (dk)</label><input type="number" min="1" id="ayPomoCalisma" value="${a.pomodoroCalismaDk}"></div>
        <div class="field"><label>Mola süresi (dk)</label><input type="number" min="1" id="ayPomoMola" value="${a.pomodoroMolaDk}"></div>
      </div>
    </div>

    <div class="card card-pad settings-block">
      <h3>Görünüm</h3>
      <div class="settings-row">
        <div class="txt"><strong>Koyu tema</strong><span>Göz yormayan koyu görünüme geç</span></div>
        <label class="switch"><input type="checkbox" id="ayTemaSw" ${a.tema === "koyu" ? "checked" : ""}><span class="track"></span></label>
      </div>
    </div>

    <div class="card card-pad settings-block">
      <h3>Hatırlatıcı</h3>
      <div class="settings-row">
        <div class="txt"><strong>Günlük hatırlatıcı</strong><span>"Bugünkü KPSS çalışmanı yaptın mı?" bildirimi</span></div>
        <label class="switch"><input type="checkbox" id="ayBildirimSw" ${a.bildirimAcik ? "checked" : ""}><span class="track"></span></label>
      </div>
      <div class="field" style="margin-top:10px;"><label>Bildirim saati</label><input type="time" id="ayBildirimSaat" value="${a.bildirimSaati}"></div>
      <div class="alt" style="font-size:12px;">Tarayıcı bildirim izni gerektirir; izin verilmezse hatırlatıcı yalnızca uygulama açıkken çalışır.</div>
    </div>

    <div class="card card-pad settings-block">
      <h3>Yapay Zekâ Sunucusu</h3>
      <div class="alt" style="margin-bottom:8px;">AI Öğretmen, güncel bilgiler ve fotoğraftan soru çözme özellikleri kendi kurduğun backend sunucusuna bağlanır. API anahtarların hiçbir zaman bu uygulamanın içinde saklanmaz.</div>
      <div class="field"><label>Sunucu Adresi (API_BASE_URL)</label><input type="text" id="ayApiBaseUrl" placeholder="https://kpss-backend-production.up.railway.app" value="${apiBaseUrlAl()}"></div>
      <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
        <button class="btn btn-sm" id="ayApiKaydetBtn">Kaydet</button>
        <button class="btn btn-sm btn-outline" id="ayApiTestBtn">Bağlantıyı Test Et</button>
        <span id="ayApiDurum" class="alt"></span>
      </div>
    </div>

    <div class="card card-pad settings-block">
      <h3>Veri Yönetimi</h3>
      <div class="field-row">
        <button class="btn btn-outline btn-block" id="ayDisaAktarBtn">Verileri Dışa Aktar</button>
        <button class="btn btn-outline btn-block" id="ayIceAktarBtn">Verileri İçe Aktar</button>
      </div>
      <input type="file" id="ayIceAktarFile" accept="application/json" style="display:none;">
    </div>

    <div class="danger-zone">
      <strong>Tehlikeli Bölge</strong>
      <p class="alt" style="margin:6px 0 12px;">Tüm çalışma verilerini kalıcı olarak siler. Bu işlem geri alınamaz.</p>
      <button class="btn" style="background:var(--danger); color:#fff;" id="aySifirlaBtn">Verileri Sıfırla</button>
    </div>
  `;

  $("#aySoruHedef").addEventListener("change", (e) => { a.gunlukSoruHedefi = Math.max(0, parseInt(e.target.value)||0); stateKaydet(); });
  $("#ayCalismaHedef").addEventListener("change", (e) => { a.gunlukCalismaHedefiDk = Math.max(0, parseInt(e.target.value)||0); stateKaydet(); });
  $("#aySinavTarihi").addEventListener("change", (e) => { a.sinavTarihi = e.target.value; stateKaydet(); toast("Sınav tarihi güncellendi."); });
  $("#ayPomoCalisma").addEventListener("change", (e) => { a.pomodoroCalismaDk = Math.max(1, parseInt(e.target.value)||25); stateKaydet(); if (!pomo.calisiyor && pomo.mod === "calisma") { pomo.kalanSaniye = a.pomodoroCalismaDk*60; } });
  $("#ayPomoMola").addEventListener("change", (e) => { a.pomodoroMolaDk = Math.max(1, parseInt(e.target.value)||5); stateKaydet(); });
  $("#ayTemaSw").addEventListener("change", (e) => { a.tema = e.target.checked ? "koyu" : "acik"; stateKaydet(); temaUygula(); });
  $("#ayBildirimSw").addEventListener("change", (e) => {
    a.bildirimAcik = e.target.checked;
    stateKaydet();
    if (a.bildirimAcik && "Notification" in window) Notification.requestPermission();
  });
  $("#ayBildirimSaat").addEventListener("change", (e) => { a.bildirimSaati = e.target.value; stateKaydet(); });

  $("#ayDisaAktarBtn").addEventListener("click", () => {
    const blob = new Blob([verileriDisaAktar()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `kpss2026-yedek-${bugunStr()}.json`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast("Veriler dışa aktarıldı.");
  });
  $("#ayApiKaydetBtn").addEventListener("click", () => {
    apiBaseUrlAyarla($("#ayApiBaseUrl").value);
    toast("Sunucu adresi kaydedildi.");
  });
  $("#ayApiTestBtn").addEventListener("click", async () => {
    apiBaseUrlAyarla($("#ayApiBaseUrl").value);
    const durum = $("#ayApiDurum");
    durum.textContent = "Test ediliyor…";
    const sonuc = await apiBaglantiTesti();
    durum.textContent = sonuc.ok ? "✅ Bağlantı başarılı." : `❌ ${sonuc.mesaj}`;
  });

  $("#ayIceAktarBtn").addEventListener("click", () => $("#ayIceAktarFile").click());
  $("#ayIceAktarFile").addEventListener("change", (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    const okuyucu = new FileReader();
    okuyucu.onload = () => {
      try {
        verileriIceAktar(okuyucu.result);
        toast("Veriler içe aktarıldı.");
        temaUygula();
        renderSayfa(uiState.sayfa);
      } catch (err) {
        toast("Dosya okunamadı. Geçerli bir yedek dosyası seçin.");
      }
    };
    okuyucu.readAsText(dosya);
  });

  $("#aySifirlaBtn").addEventListener("click", () => {
    if (confirm("Tüm çalışma verilerin kalıcı olarak silinecek. Emin misin?")) {
      verileriSifirla();
      pomoSifirla();
      temaUygula();
      renderSayfa(uiState.sayfa);
      toast("Tüm veriler sıfırlandı.");
    }
  });
}

/* ============================================================
   BİLDİRİM KONTROLÜ (basit — uygulama açıkken çalışır)
   ============================================================ */
let sonBildirimTarihi = null;
function bildirimKontrolEt() {
  const a = STATE.ayarlar;
  if (!a.bildirimAcik) return;
  const simdi = new Date();
  const saatStr = `${String(simdi.getHours()).padStart(2,"0")}:${String(simdi.getMinutes()).padStart(2,"0")}`;
  const bugun = bugunStr();
  if (saatStr === a.bildirimSaati && sonBildirimTarihi !== bugun) {
    sonBildirimTarihi = bugun;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("KPSS 2026 Ortaöğretim", { body: "Bugünkü KPSS çalışmanı yaptın mı?" });
    } else {
      toast("Bugünkü KPSS çalışmanı yaptın mı?");
    }
  }
}
setInterval(bildirimKontrolEt, 30000);

/* ============================================================
   BAŞLAT
   ============================================================ */
function init() {
  temaUygula();
  navBaglantilariniKur();
  $("#temaToggleBtn").addEventListener("click", temaDegistir);
  sayfaGec("anasayfa");
}
document.addEventListener("DOMContentLoaded", init);
