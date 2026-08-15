/*
 * Çalışma merkezi uyumluluk düzeltmesi.
 *
 * study.js, modalAc() çağrısının başarılı olduğunu kontrol ediyor.
 * Eski modalAc() herhangi bir değer döndürmediği için konu penceresi
 * oluşturulsa bile studyKonuAc() hemen geri dönüyordu.
 *
 * Ayrıca Ders Çalış sayfasını ana render yönlendirmesine açıkça bağlarız.
 * Bu dosya app.js'den sonra yüklendiği için mevcut kodu ezmeden tamamlar.
 */
(function () {
  const eskiModalAc = window.modalAc;
  if (typeof eskiModalAc === "function") {
    window.modalAc = function () {
      eskiModalAc.apply(this, arguments);
      return true;
    };
  }

  const eskiRenderSayfa = window.renderSayfa;
  if (typeof eskiRenderSayfa === "function") {
    window.renderSayfa = function (sayfaId) {
      if (sayfaId === "calisma" && typeof window.renderCalisma === "function") {
        window.renderCalisma();
        return;
      }
      return eskiRenderSayfa(sayfaId);
    };
  }
})();
