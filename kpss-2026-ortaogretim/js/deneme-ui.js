/* Gerçek deneme UI'si. Mevcut manuel deneme formunu bozmadan renderDenemeler'i genişletir. */

let GERCEK_DENEME = null;

function gercekDenemeIstekleriOlustur() {
  const dersler = SUBJECTS_META;
  const toplam = 20;
  const temel = Math.floor(toplam / dersler.length);
  let kalan = toplam - temel * dersler.length;
  return dersler.map((ders, i) => {
    const konular = TOPICS_SEED[ders.id] || [];
    return {
      subject: ders.name,
      topic: konular.length ? konular[Math.floor(Math.random() * konular.length)] : "Genel",
      difficulty: "orta",
      count: temel + (i < kalan ? 1 : 0)
    };
  });
}

async function gercekDenemeBaslat() {
  if (typeof apiBaseUrlAl === "function" && !apiBaseUrlAl()) {
    modalAc("Sunucu adresi gerekli", "<p>Gerçek deneme oluşturmak için <b>Ayarlar</b> bölümünden backend adresini girmen gerekiyor.</p>", '<button class="btn btn-accent" id="denemeAyarBtn">Ayarlara Git</button>');
    $("#denemeAyarBtn").addEventListener("click", () => { modalKapat(); sayfaGec("ayarlar"); });
    return;
  }

  const istekler = gercekDenemeIstekleriOlustur();
  modalAc("Deneme Hazırlanıyor", '<div style="text-align:center;padding:20px 0"><div class="alt">20 soruluk deneme hazırlanıyor. Sorular birkaç paket halinde üretilebilir; bu işlem biraz sürebilir.</div><div class="progress-track" style="margin-top:18px"><div class="progress-fill" id="denemeHazirlikBar" style="width:8%"></div></div><div id="denemeHazirlikMetni" style="margin-top:10px;font-weight:600">Sorular hazırlanıyor…</div></div>', "");

  try {
    // Backend'de mevcut ve çalışan uç: /api/ai/generate-mixed-test
    // /generate-mock-exam mevcut backend'de olmadığı için "Uç bulunamadı" hatası veriyordu.
    const sonuc = await apiKarisikTestOlustur(istekler);
    if (!sonuc.ok) throw new Error(sonuc.mesaj || "Deneme oluşturulamadı.");
    const sorular = sonuc.veri?.sorular || [];
    if (sorular.length < 20) throw new Error(`Yapay zekâ ${sorular.length} soru hazırladı. 20 soru tamamlanamadı.`);
    modalKapat();
    gercekDenemeSinaviniAc(sorular.slice(0, 20));
  } catch (e) {
    modalAc("Deneme oluşturulamadı", `<p>${String(e.message || e).replace(/[<>]/g, "")}</p><p class="alt">Backend'in çalıştığından, Ayarlar'daki API adresinin doğru olduğundan ve OpenRouter servisinin erişilebilir olduğundan emin ol.</p>`, '<button class="btn btn-accent" id="denemeHataKapat">Kapat</button>');
    $("#denemeHataKapat").addEventListener("click", modalKapat);
  }
}

function gercekDenemeSinaviniAc(sorular) {
  const state = { sorular, cevaplar: {}, index: 0, baslangic: Date.now(), sureSn: 25 * 60, interval: null };
  GERCEK_DENEME = state;

  const tick = () => {
    const gecen = Math.floor((Date.now() - state.baslangic) / 1000);
    const kalan = Math.max(0, state.sureSn - gecen);
    const el = $("#gercekDenemeSure");
    if (el) el.textContent = `${String(Math.floor(kalan / 60)).padStart(2,"0")}:${String(kalan % 60).padStart(2,"0")}`;
    if (kalan <= 0) gercekDenemeBitir(true);
  };
  state.interval = setInterval(tick, 1000);

  modalAc("KPSS 2026 — Süreli Deneme", '<div id="gercekDenemeGovde"></div>', '<button class="btn btn-outline" id="gercekDenemeBitirBtn">Denemeyi Bitir</button>');
  $("#gercekDenemeBitirBtn").addEventListener("click", () => gercekDenemeBitir(false));
  gercekDenemeSoruCiz();
  tick();
}

function gercekDenemeSoruCiz() {
  const s = GERCEK_DENEME;
  if (!s) return;
  const soru = s.sorular[s.index];
  const govde = $("#gercekDenemeGovde");
  if (!govde) return;
  const secilen = s.cevaplar[s.index];
  govde.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px"><b>${s.index + 1} / ${s.sorular.length}</b><strong id="gercekDenemeSure" class="tabular">25:00</strong></div>
    <div class="progress-track" style="margin-bottom:18px"><div class="progress-fill" style="width:${((s.index + 1) / s.sorular.length) * 100}%"></div></div>
    <div class="alt" style="margin-bottom:7px">${soru.subject} · ${soru.topic}</div>
    <div style="font-size:16px;font-weight:600;line-height:1.55;margin-bottom:16px">${soru.soru}</div>
    <div style="display:grid;gap:9px">${["A","B","C","D","E"].map(h => `<button class="btn ${secilen === h ? "btn-primary" : "btn-outline"}" data-deneme-cevap="${h}" style="text-align:left;white-space:normal">${h}) ${soru.secenekler[h]}</button>`).join("")}</div>
    <div style="display:flex;justify-content:space-between;margin-top:18px;gap:8px"><button class="btn btn-outline" id="denemeOncekiBtn" ${s.index === 0 ? "disabled" : ""}>← Önceki</button><button class="btn btn-primary" id="denemeSonrakiBtn">${s.index === s.sorular.length - 1 ? "Bitir" : "Sonraki →"}</button></div>
  `;
  $all("[data-deneme-cevap]", govde).forEach(btn => btn.addEventListener("click", () => { s.cevaplar[s.index] = btn.dataset.denemeCevap; gercekDenemeSoruCiz(); }));
  $("#denemeOncekiBtn").addEventListener("click", () => { if (s.index > 0) { s.index--; gercekDenemeSoruCiz(); } });
  $("#denemeSonrakiBtn").addEventListener("click", () => { if (s.index === s.sorular.length - 1) gercekDenemeBitir(false); else { s.index++; gercekDenemeSoruCiz(); } });
}

async function gercekDenemeBitir(sureDoldu) {
  const s = GERCEK_DENEME;
  if (!s) return;
  clearInterval(s.interval);
  let dogru = 0, yanlis = 0, bos = 0;
  const dersler = {};
  s.sorular.forEach((q, i) => {
    const cevap = s.cevaplar[i];
    const key = (SUBJECTS_META.find(x => x.name === q.subject) || { id: "genel", name: q.subject || "Genel" });
    dersler[key.id] ||= { ad: key.name, dogru: 0, yanlis: 0, bos: 0 };
    if (!cevap) { bos++; dersler[key.id].bos++; }
    else if (cevap === q.dogruCevap) { dogru++; dersler[key.id].dogru++; }
    else { yanlis++; dersler[key.id].yanlis++; }
  });
  const net = Math.round((dogru - yanlis / 4) * 100) / 100;
  const sonuc = { id: uid(), ad: "AI Gerçek Deneme", tarih: bugunStr(), toplamDogru: dogru, toplamYanlis: yanlis, bos, net, sureSn: Math.floor((Date.now() - s.baslangic) / 1000), dersler };
  STATE.denemeler.push(sonuc);
  stateKaydet();
  try { if (typeof ilerlemeTestSonucuKaydet === "function") await ilerlemeTestSonucuKaydet({ testTuru: "gercek-deneme", dogru, yanlis, bos }); } catch (_) {}
  GERCEK_DENEME = null;
  modalAc("Deneme Sonucu", `<div class="grid grid-4"><div class="card stat-card"><span class="label">Doğru</span><span class="value">${dogru}</span></div><div class="card stat-card"><span class="label">Yanlış</span><span class="value">${yanlis}</span></div><div class="card stat-card"><span class="label">Boş</span><span class="value">${bos}</span></div><div class="card stat-card"><span class="label">Net</span><span class="value">${net}</span></div></div><div style="margin-top:18px"><b>${sureDoldu ? "⏰ Süre doldu." : "✅ Deneme tamamlandı."}</b><p class="alt">${enZayifDersMetni(dersler)}</p></div>`, '<button class="btn btn-accent" id="sonucKapatBtn">Kapat</button>');
  $("#sonucKapatBtn").addEventListener("click", () => { modalKapat(); if (uiState.sayfa === "denemeler") renderDenemeler(); });
}

function enZayifDersMetni(dersler) {
  const arr = Object.entries(dersler).map(([id, d]) => ({ ...d, basari: (d.dogru + d.yanlis) ? d.dogru / (d.dogru + d.yanlis) : 0 }));
  arr.sort((a,b) => a.basari - b.basari);
  if (!arr.length) return "Sonuçlarına göre henüz öneri oluşturulamadı.";
  return `<b>Çalışma önerisi:</b> ${arr[0].ad} alanına ağırlık ver. Bu dersten kısa tekrar yapıp 10-15 soru çözmen faydalı olur.`;
}

const _eskiRenderDenemeler = window.renderDenemeler;
window.renderDenemeler = function() {
  if (typeof _eskiRenderDenemeler === "function") _eskiRenderDenemeler();
  const form = $("#denemeForm");
  if (!form || $("#gercekDenemeCard")) return;
  const card = document.createElement("div");
  card.id = "gercekDenemeCard";
  card.className = "card";
  card.style.marginBottom = "16px";
  card.innerHTML = `<div style="padding:16px"><div class="section-title">Gerçek Deneme Modu</div><p style="margin:0 0 12px">AI ile 20 soruluk, süreli deneme oluştur. Bitince netini ve zayıf derslerini gör.</p><button class="btn btn-accent btn-block" id="gercekDenemeBaslatBtn">🚀 20 Soruluk Denemeyi Başlat</button></div>`;
  form.parentNode.insertBefore(card, form);
  $("#gercekDenemeBaslatBtn").addEventListener("click", gercekDenemeBaslat);
};
