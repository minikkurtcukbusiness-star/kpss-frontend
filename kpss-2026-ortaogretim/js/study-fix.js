/* Çalışma merkezi sağlamlaştırma katmanı. */
(function () {
  function konuBul(dersId, konuId) {
    const ders = STATE?.dersler?.[dersId];
    return ders?.konular?.find(k => String(k.id) === String(konuId));
  }

  function calismaModaliniAc(btn) {
    const dersId = btn.dataset.studyDers;
    const konuId = btn.dataset.studyStart;
    const ders = SUBJECTS_META.find(d => String(d.id) === String(dersId));
    const konu = konuBul(dersId, konuId);
    if (!ders || !konu) {
      console.error("Çalışma konusu bulunamadı", { dersId, konuId });
      if (typeof toast === "function") toast("Konu bulunamadı.");
      return;
    }

    if (konu.durum === "baslamadim") {
      konu.durum = "calisiyorum";
      stateKaydet();
    }

    const hedef = Math.max(1, Number(STATE.ayarlar?.pomodoroCalismaDk) || 25);
    const modal = document.querySelector("#modalOverlay");
    const box = document.querySelector("#modalBox");
    if (!modal || !box) {
      console.error("Modal DOM elemanları bulunamadı.");
      return;
    }

    box.innerHTML = `
      <div class="modal-head">
        <h3>📖 ${konu.ad}</h3>
        <button class="modal-close" id="studyFixClose" type="button">✕</button>
      </div>
      <div class="modal-body">
        <div class="study-modal-intro"><span class="study-subject-dot" style="background:${ders.renk}"></span>${ders.name}</div>
        <div class="study-focus-box"><strong>Bugünkü mini hedef</strong><p>15 dakika konu tekrarı + ardından 5 soru. Mükemmel olmak zorunda değilsin; ilerlemek yeter.</p></div>
        <div class="study-note-label">Kendi notun</div>
        <textarea id="studyFixNot" rows="5" placeholder="Bu konuda aklında kalması gerekenleri yaz..."></textarea>
        <div class="study-modal-stats">
          <span>📚 ${konu.soru || 0} soru</span>
          <span>⏱️ ${konu.calismaDk || 0} dk</span>
          <span>🎯 ${yuzde(konu.dogru, (konu.dogru || 0) + (konu.yanlis || 0))}% başarı</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" id="studyFixSave">Notu Kaydet</button>
        <button type="button" class="btn btn-primary" id="studyFixTimer">⏱️ ${hedef} dk Başlat</button>
      </div>`;

    document.querySelector("#studyFixNot").value = konu.not || "";
    modal.classList.add("open");

    document.querySelector("#studyFixClose").addEventListener("click", modalKapat);
    document.querySelector("#studyFixSave").addEventListener("click", () => {
      konu.not = document.querySelector("#studyFixNot").value;
      stateKaydet();
      toast("Konu notu kaydedildi.");
    });
    document.querySelector("#studyFixTimer").addEventListener("click", () => {
      modalKapat();
      pomo.dersId = dersId;
      if (!pomo.calisiyor) pomoBaslatDuraklat();
      toast(`${ders.name} • ${konu.ad} için çalışma başladı.`);
    });
  }

  /* Capture fazında çalışır; study.js veya başka bir listener ne yaparsa yapsın
     butonu doğrudan ele alır. */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest?.("[data-study-start]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    calismaModaliniAc(btn);
  }, true);
})();
