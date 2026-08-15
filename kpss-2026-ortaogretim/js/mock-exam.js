/* Gerçek deneme modu: mevcut manuel deneme ekranını bozmadan üstüne eklenir. */
(function () {
  const eskiRenderDenemeler = window.renderDenemeler;
  let aktif = null;

  function esc(v) {
    return String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function butonEkle() {
    const form = document.querySelector("#denemeForm");
    if (!form || document.querySelector("#gercekDenemeBtn")) return;
    const box = document.createElement("div");
    box.style.cssText = "margin-bottom:14px;padding:14px;border:1px solid var(--border,#ddd);border-radius:12px";
    box.innerHTML = `<strong>Gerçek Deneme Modu</strong><div class="alt" style="margin:5px 0 10px">AI ile 20 soruluk, süreli deneme oluştur. Bitince netini ve zayıf derslerini gör.</div><button class="btn btn-accent btn-block" id="gercekDenemeBtn">🚀 Süreli Deneme Başlat</button>`;
    form.prepend(box);
    document.querySelector("#gercekDenemeBtn").addEventListener("click", denemeBaslat);
  }

  window.renderDenemeler = function () {
    eskiRenderDenemeler();
    butonEkle();
  };

  async function denemeBaslat() {
    if (!apiBaseUrlAl()) { toast("Önce Ayarlar'dan sunucu adresini gir."); return; }
    const btn = document.querySelector("#gercekDenemeBtn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Deneme hazırlanıyor..."; }

    const istekler = SUBJECTS_META.map(d => {
      const konular = TOPICS_SEED[d.id] || [d.name];
      return { subject: d.name, topic: konular[Math.floor(Math.random() * konular.length)], difficulty: "orta", count: d.id === "turkce" || d.id === "matematik" ? 4 : 3 };
    });
    // Toplamı yaklaşık 20'ye sabitle.
    while (istekler.reduce((t, x) => t + x.count, 0) > 20) istekler[istekler.length - 1].count--;

    const sonuc = await apiKarisikTestOlustur(istekler);
    if (btn) { btn.disabled = false; btn.textContent = "🚀 Süreli Deneme Başlat"; }
    if (!sonuc.ok) { toast(sonuc.mesaj); return; }
    const sorular = (sonuc.veri.sorular || []).slice(0, 20);
    if (sorular.length < 5) { toast("Yeterli soru üretilemedi. Tekrar deneyin."); return; }
    aktif = { sorular, cevaplar: {}, index: 0, baslangic: Date.now(), kalan: 25 * 60, interval: null };
    aktif.interval = setInterval(() => { aktif.kalan--; if (aktif.kalan <= 0) { aktif.kalan = 0; denemeBitir(); } else denemeCiz(); }, 1000);
    denemeCiz();
  }

  function denemeCiz() {
    if (!aktif) return;
    const s = aktif.sorular[aktif.index];
    const sec = s.secenekler || s.options || {};
    const sure = `${String(Math.floor(aktif.kalan / 60)).padStart(2,"0")}:${String(aktif.kalan % 60).padStart(2,"0")}`;
    const numaralar = aktif.sorular.map((_, i) => `<button class="btn btn-sm ${i === aktif.index ? "btn-accent" : ""}" data-dno="${i}" style="min-width:38px">${i+1}${aktif.cevaplar[i] ? " ✓" : ""}</button>`).join(" ");
    modalAc("KPSS Süreli Deneme", `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="badge">Soru ${aktif.index+1} / ${aktif.sorular.length}</span><strong class="tabular" style="font-size:20px">⏱ ${sure}</strong></div>
      <div class="chip-row" style="margin-bottom:14px;gap:5px">${numaralar}</div>
      <div style="font-weight:700;line-height:1.5;margin-bottom:16px">${esc(s.soru || s.question)}</div>
      <div id="denemeSecimler">${Object.entries(sec).map(([h,m]) => `<button class="btn btn-sm" data-dcevap="${esc(h)}" style="display:block;width:100%;text-align:left;margin:8px 0;${aktif.cevaplar[aktif.index]===h ? "border-color:var(--accent,#c79b4b)" : ""}">${esc(h)}) ${esc(m)}</button>`).join("")}</div>
      <div class="alt" style="margin-top:12px">Cevabını değiştirebilirsin. Süre bitince deneme otomatik teslim edilir.</div>
    `, `<button class="btn btn-outline" id="denemeCikBtn">Çık</button><button class="btn btn-accent" id="denemeBitirBtn">Denemeyi Bitir</button>`);

    document.querySelectorAll("[data-dcevap]").forEach(b => b.addEventListener("click", () => { aktif.cevaplar[aktif.index] = b.dataset.dcevap; denemeCiz(); }));
    document.querySelectorAll("[data-dno]").forEach(b => b.addEventListener("click", () => { aktif.index = Number(b.dataset.dno); denemeCiz(); }));
    document.querySelector("#denemeBitirBtn").addEventListener("click", () => denemeBitir(true));
    document.querySelector("#denemeCikBtn").addEventListener("click", () => { if (confirm("Denemeden çıkarsan ilerleme kaydedilmeyecek. Çıkılsın mı?")) denemeIptal(); });
  }

  function denemeIptal() {
    if (aktif?.interval) clearInterval(aktif.interval);
    aktif = null;
    modalKapat();
  }

  async function denemeBitir(kullanici = false) {
    if (!aktif) return;
    if (kullanici && !confirm("Denemeyi şimdi teslim etmek istiyor musun?")) return;
    clearInterval(aktif.interval);
    const sonuc = denemeSonucuOlustur(aktif.sorular, aktif.cevaplar, (Date.now() - aktif.baslangic) / 1000);
    denemeKaydet(sonuc);
    const zayiflar = Object.values(sonuc.dersler).map(x => ({...x, oran: (x.dogru + x.yanlis) ? x.dogru / (x.dogru+x.yanlis) : 0})).sort((a,b) => a.oran-b.oran);
    const oneri = zayiflar[0] && (zayiflar[0].dogru + zayiflar[0].yanlis) ? `${esc(zayiflar[0].ad)} dersine öncelik ver; başarı oranın %${Math.round(zayiflar[0].oran*100)}.` : "Önce birkaç deneme tamamla; sistem sana daha isabetli öneriler sunacak.";
    try { await ilerlemeTestSonucuKaydet({ testTuru:"deneme", dogru:sonuc.dogru, yanlis:sonuc.yanlis, bos:sonuc.bos }); } catch (_) {}
    aktif = null;
    modalAc("Deneme Sonucu", `
      <div style="text-align:center;padding:8px 0 18px"><div style="font-size:38px;font-weight:800">${sonuc.net} net</div><div class="alt">${sonuc.dogru} doğru · ${sonuc.yanlis} yanlış · ${sonuc.bos} boş</div></div>
      <div class="grid grid-2">${Object.values(sonuc.dersler).map(d => `<div class="card card-pad"><strong>${esc(d.ad)}</strong><div class="alt">${d.dogru}D · ${d.yanlis}Y · ${d.bos}B</div></div>`).join("")}</div>
      <div class="motiv-strip" style="margin-top:14px">🧠 <span>${oneri}</span></div>
    `, `<button class="btn btn-accent" id="denemeSonKapat">Sonuçları Kaydet ve Kapat</button>`);
    document.querySelector("#denemeSonKapat").addEventListener("click", () => { modalKapat(); renderDenemeler(); });
  }
})();
