/* ========================================================================== 
   api.js — Backend ile konuşan tek merkezi katman.
   ========================================================================== */

const API_STORAGE_KEY = "kpss2026_api_ayarlari_v1";

function apiAyarlariOku() {
  try {
    const ham = localStorage.getItem(API_STORAGE_KEY);
    return ham ? JSON.parse(ham) : { baseUrl: "" };
  } catch {
    return { baseUrl: "" };
  }
}

function apiAyarlariKaydet(ayarlar) {
  localStorage.setItem(API_STORAGE_KEY, JSON.stringify(ayarlar));
}

function apiBaseUrlAl() {
  return (apiAyarlariOku().baseUrl || "").replace(/\/$/, "");
}

function apiBaseUrlAyarla(url) {
  apiAyarlariKaydet({ baseUrl: (url || "").trim() });
}

function cihazKullaniciId() {
  const key = "kpss2026_cihaz_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = "cihaz_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

async function apiIstek(yol, { method = "GET", body, timeoutMs = 25000 } = {}) {
  const baseUrl = apiBaseUrlAl();
  if (!baseUrl) {
    return { ok: false, cozumsuz: true, mesaj: "Önce Ayarlar sayfasından sunucu adresini (API_BASE_URL) gir." };
  }
  if (!navigator.onLine) {
    return { ok: false, cozumsuz: true, mesaj: "İnternet bağlantısı gerekiyor." };
  }

  const controller = new AbortController();
  const zamanAsimi = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(baseUrl + yol, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": cihazKullaniciId()
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(zamanAsimi);
    const veri = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, mesaj: veri.hata || "Sunucu bir hata döndürdü." };
    }

    return { ok: true, veri };
  } catch (err) {
    clearTimeout(zamanAsimi);
    if (err.name === "AbortError") {
      return { ok: false, mesaj: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin." };
    }
    return { ok: false, mesaj: "Sunucuya şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin." };
  }
}

async function apiBaglantiTesti() {
  return apiIstek("/health");
}

async function apiAiOgretmenSor(soru) {
  return apiIstek("/api/ai/teacher", {
    method: "POST",
    body: { soru }
  });
}

async function apiSoruUret({ subject, topic, difficulty, count }) {
  return apiIstek("/api/ai/generate-questions", {
    method: "POST",
    body: { subject, topic, difficulty, count },
    timeoutMs: 45000
  });
}

async function apiKarisikTestOlustur(istekler) {
  return apiIstek("/api/ai/generate-mixed-test", {
    method: "POST",
    body: { istekler },
    timeoutMs: 90000
  });
}

async function apiFotoCoz(imageBase64, mimeType) {
  return apiIstek("/api/ai/solve-image", {
    method: "POST",
    body: { imageBase64, mimeType },
    timeoutMs: 30000
  });
}

async function apiGuncelBilgilerGetir() {
  return apiIstek("/api/current-affairs/today", { timeoutMs: 40000 });
}

async function apiGununTestiOlustur() {
  return apiIstek("/api/current-affairs/quiz", {
    method: "POST",
    timeoutMs: 45000
  });
}

async function apiSoruEkle(soruNesnesi) {
  return apiIstek("/api/questions", {
    method: "POST",
    body: soruNesnesi
  });
}

async function apiYanlisKaydet(questionId, verilenCevap) {
  return apiIstek("/api/questions/wrong", {
    method: "POST",
    body: { questionId, verilenCevap }
  });
}

async function apiYanlislarGetir() {
  return apiIstek("/api/questions/wrong", { timeoutMs: 15000 });
}

async function apiSoruBildir(questionId, sebep) {
  return apiIstek("/api/questions/report", {
    method: "POST",
    body: { questionId, sebep }
  });
}
