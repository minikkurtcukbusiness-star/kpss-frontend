/* Backend ilerleme senkronizasyonu. Frontend localStorage çalışmaya devam eder. */

async function ilerlemeTestSonucuKaydet({ testTuru = "konu", dogru = 0, yanlis = 0, bos = 0, detay = [] } = {}) {
  return apiIstek("/api/progress/test-result", {
    method: "POST",
    body: { testTuru, dogru, yanlis, bos, detay },
    timeoutMs: 10000
  });
}

async function calismaOturumuSenkronla(dakika, subject = "Genel") {
  if (!dakika || dakika < 1) return { ok: false, mesaj: "Kaydedilecek süre yok." };
  return apiIstek("/api/progress/study-session", {
    method: "POST",
    body: { dakika: Math.round(dakika), subject },
    timeoutMs: 10000
  });
}

async function ilerlemeOzetiGetir() {
  return apiIstek("/api/progress/summary", { timeoutMs: 10000 });
}

async function testGecmisiGetir(limit = 20) {
  const n = Math.min(Math.max(Number(limit) || 20, 1), 50);
  return apiIstek(`/api/progress/history?limit=${n}`, { timeoutMs: 10000 });
}
