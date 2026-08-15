/* Ders Çalış > Çalış için bağımsız son katman.
   Ana uygulamanın nav/render akışına veya modalAc dönüş değerine bağlı değildir. */
(function () {
  function ac(dersId, konuId) {
    const ders = STATE && STATE.dersler ? STATE.dersler[dersId] : null;
    const konu = ders && Array.isArray(ders.konular) ? ders.konular.find(k => String(k.id) === String(konuId)) : null;
    const meta = typeof SUBJECTS_META !== "undefined" ? SUBJECTS_META.find(d => d.id === dersId) : null;
    if (!konu || !meta) {
      alert("Konu bilgisi bulunamadı. Sayfayı yenileyip tekrar deneyin.");
      return;
    }
    if (konu.durum === "baslamadim") { konu.durum = "calisiyorum"; stateKaydet(); }
    const overlay = document.getElementById("modalOverlay");
    const box = document.getElementById("modalBox");
    if (!overlay || !box) return;
    const hedef = Math.max(1, Number(STATE.ayarlar.pomodoroCalismaDk) || 25);
    box.innerHTML = `
      <div class="modal-head"><h3>📖 ${konu.ad}</h3><button class="modal-close" id="hotfixClose">✕</button></div>
      <div class="modal-body">
        <div class="study-modal-intro"><span class="study-subject-dot" style="background:${meta.renk}"></span>${meta.name}</div>
        <div class="study-focus-box"><strong>Bugünkü mini hedef</strong><p>15 dakika konu tekrarı + ardından 5 soru. Küçük adımlarla ilerle.</p></div>
        <div class="study-note-label">Kendi notun</div>
        <textarea id="hotfixNote" rows="5" placeholder="Bu konuda aklında kalması gerekenleri yaz...">${konu.not || ""}</textarea>
        <div class="study-modal-stats"><span>📚 ${konu.soru || 0} soru</span><span>⏱️ ${konu.calismaDk || 0} dk</span><span>🎯 ${yuzde(konu.dogru, (konu.dogru || 0) + (konu.yanlis || 0))}% başarı</span></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" id="hotfixSave">Notu Kaydet</button><button type="button" class="btn btn-primary" id="hotfixTimer">⏱️ ${hedef} dk Başlat</button></div>`;
    overlay.classList.add("open");
    document.getElementById("hotfixClose").onclick = () => overlay.classList.remove("open");
    document.getElementById("hotfixSave").onclick = () => { konu.not = document.getElementById("hotfixNote").value; stateKaydet(); toast("Konu notu kaydedildi."); };
    document.getElementById("hotfixTimer").onclick = () => {
      overlay.classList.remove("open");
      pomo.dersId = dersId;
      if (!pomo.calisiyor && typeof pomoBaslatDuraklat === "function") pomoBaslatDuraklat();
      toast(`${meta.name} • ${konu.ad} için çalışma başladı.`);
    };
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest && e.target.closest("[data-study-start]");
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    ac(btn.getAttribute("data-study-ders"), btn.getAttribute("data-study-start"));
  }, true);
})();
