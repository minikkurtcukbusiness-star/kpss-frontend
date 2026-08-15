/* Yeni özellikleri mevcut akışı bozmadan ayrı bir Gelişim panelinde tutar. */
(function () {
  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
  }

  function ekle() {
    if (!document.querySelector("#gelisimNavBtn")) {
      const nav = document.querySelector("#navList");
      if (nav) nav.insertAdjacentHTML("beforeend", '<li><button class="nav-item" id="gelisimNavBtn" type="button"><span class="nav-ico">↗</span><span>Gelişimim</span></button></li>');
    }
    if (!document.querySelector("#gelisimPanel")) {
      document.querySelector("main.content")?.insertAdjacentHTML("beforeend", '<section class="page" data-page="gelisim" id="page-gelisim"><div id="gelisimPanel"></div></section>');
    }
    document.querySelector("#gelisimNavBtn")?.addEventListener("click", () => gelisimiAc());
  }

  async function gelisimiAc() {
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === "page-gelisim"));
    document.querySelectorAll(".nav-item,.bn-item").forEach(b => b.classList.toggle("active", b.dataset.page === "gelisim"));
    const panel = document.querySelector("#gelisimPanel");
    panel.innerHTML = '<div class="page-head"><h1>Gelişimim</h1><div class="alt">Sonuçlarını takip et, zayıf olduğun alanlara odaklan.</div></div><div class="card card-pad"><div>Veriler yükleniyor…</div></div>';
    const cevap = await ilerlemeOzetiGetir();
    if (!cevap.ok) {
      panel.innerHTML = `<div class="page-head"><h1>Gelişimim</h1></div><div class="card card-pad"><div class="empty-state">${escapeHtml(cevap.mesaj || "İlerleme verileri alınamadı.")}<br><small>Sunucu bağlantısı yoksa uygulama yerel verilerinle çalışmaya devam eder.</small></div></div>`;
      return;
    }
    const t = cevap.veri.toplam || {};
    const dersler = cevap.veri.dersler || [];
    const oneri = typeof akilliCalismaOnerisi === "function" ? akilliCalismaOnerisi() : null;
    panel.innerHTML = `
      <div class="page-head"><h1>Gelişimim</h1><div class="alt">Kendi performansını tek ekranda gör.</div></div>
      <div class="grid grid-4">
        <div class="card stat-card"><span class="label">Test</span><span class="value tabular">${t.testSayisi || 0}</span><span class="sub">tamamlanan</span></div>
        <div class="card stat-card"><span class="label">Soru</span><span class="value tabular">${t.soruSayisi || 0}</span><span class="sub">${t.dogru || 0} doğru · ${t.yanlis || 0} yanlış</span></div>
        <div class="card stat-card"><span class="label">Başarı</span><span class="value tabular">%${t.basariYuzdesi || 0}</span><span class="sub">genel ortalama</span></div>
        <div class="card stat-card"><span class="label">Çalışma</span><span class="value tabular">${t.calismaSaati || 0} sa</span><span class="sub">toplam süre</span></div>
      </div>
      <div class="grid grid-2" style="margin-top:16px;align-items:start">
        <div class="card card-pad"><div class="section-title">🎯 Akıllı öneri</div><h3>${escapeHtml(oneri?.baslik || "Bugünkü hedef")}</h3><p class="alt">${escapeHtml(oneri?.metin || "Bir test çözerek başlayabilirsin.")}</p><button class="btn btn-accent" id="gelisimTestBtn">Soru çözmeye başla</button></div>
        <div class="card card-pad"><div class="section-title">📚 Ders performansı</div>${dersler.length ? dersler.map(d => `<div style="margin:12px 0"><div style="display:flex;justify-content:space-between"><strong>${escapeHtml(d.subject)}</strong><span>%${d.basariYuzdesi}</span></div><div class="progress-track"><div class="progress-fill accent" style="width:${Math.min(100,d.basariYuzdesi)}%"></div></div></div>`).join("") : '<div class="empty-state">Henüz yeterli veri yok. İlk testini çöz.</div>'}</div>
      </div>
      <div class="card card-pad" style="margin-top:16px"><div class="section-title">📌 Kısa özet</div><p>Yanlış soruların: <strong>${t.yanlisSayisi || 0}</strong> · Çalışma süren: <strong>${t.calismaDakikasi || 0} dk</strong></p></div>`;
    document.querySelector("#gelisimTestBtn")?.addEventListener("click", () => { if (typeof sayfaGec === "function") sayfaGec("anasayfa"); document.querySelector("#anaSoruCozBtn")?.click(); });
  }

  document.addEventListener("DOMContentLoaded", () => { ekle(); });
  window.gelisimiAc = gelisimiAc;
})();
