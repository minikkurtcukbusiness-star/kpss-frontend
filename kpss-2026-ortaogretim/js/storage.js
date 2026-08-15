/* ==========================================================================
   storage.js — Kalıcı veri katmanı (localStorage)
   Tüm uygulama verisi tek bir JSON nesnesi olarak localStorage'da tutulur.
   ========================================================================== */

const STORAGE_KEY = "kpss2026_state_v1";

function bugunStr(d) {
  const t = d ? new Date(d) : new Date();
  const yil = t.getFullYear();
  const ay = String(t.getMonth() + 1).padStart(2, "0");
  const gun = String(t.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function konuNesnesiOlustur(ad) {
  return {
    id: uid(),
    ad: ad,
    durum: "baslamadim",   // baslamadim | calisiyorum | tamamlandi | tekrar
    calismaDk: 0,
    soru: 0,
    dogru: 0,
    yanlis: 0,
    not: ""
  };
}

function varsayilanDurum() {
  const dersler = {};
  SUBJECTS_META.forEach(ders => {
    dersler[ders.id] = {
      calismaDk: 0,
      soru: 0,
      dogru: 0,
      yanlis: 0,
      konular: (TOPICS_SEED[ders.id] || []).map(konuNesnesiOlustur)
    };
  });

  return {
    surumu: 1,
    ayarlar: {
      sinavTarihi: SINAV_TARIHI_VARSAYILAN,
      gunlukSoruHedefi: 80,
      gunlukCalismaHedefiDk: 180,
      pomodoroCalismaDk: 25,
      pomodoroMolaDk: 5,
      tema: "acik",           // acik | koyu
      bildirimAcik: false,
      bildirimSaati: "20:00"
    },
    dersler: dersler,
    plan: DEFAULT_PLAN.map(p => ({ ...p, id: uid() })),
    planTamamlanan: {},       // { "YYYY-MM-DD": { planId: true } }
    gunlukKayitlar: {},       // { "YYYY-MM-DD": { calismaDk, soru, dogru, yanlis } }
    calismaOturumlari: [],    // pomodoro/tekrar oturum geçmişi
    denemeler: [],
    okunanGuncel: {},         // { guncelId: tekrarSayisi }
    seri: { guncel: 0, sonTarih: null },
    motivasyonIndex: null
  };
}

function derinBirlestir(varsayilan, kayitli) {
  // Eksik alanları varsayılan değerlerle tamamlayan basit birleştirme
  const sonuc = JSON.parse(JSON.stringify(varsayilan));
  if (!kayitli || typeof kayitli !== "object") return sonuc;

  for (const anahtar in kayitli) {
    if (kayitli[anahtar] && typeof kayitli[anahtar] === "object" && !Array.isArray(kayitli[anahtar])
        && sonuc[anahtar] && typeof sonuc[anahtar] === "object" && !Array.isArray(sonuc[anahtar])) {
      sonuc[anahtar] = derinBirlestir(sonuc[anahtar], kayitli[anahtar]);
    } else {
      sonuc[anahtar] = kayitli[anahtar];
    }
  }
  return sonuc;
}

function stateYukle() {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanDurum();
    const kayitli = JSON.parse(ham);
    return derinBirlestir(varsayilanDurum(), kayitli);
  } catch (e) {
    console.error("Veri okunamadı, varsayılan durum kullanılıyor.", e);
    return varsayilanDurum();
  }
}

let STATE = stateYukle();

function stateKaydet() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    return true;
  } catch (e) {
    console.error("Veri kaydedilemedi.", e);
    return false;
  }
}

function gunlukKayitAl(tarih) {
  const t = tarih || bugunStr();
  if (!STATE.gunlukKayitlar[t]) {
    STATE.gunlukKayitlar[t] = { calismaDk: 0, soru: 0, dogru: 0, yanlis: 0 };
  }
  return STATE.gunlukKayitlar[t];
}

function seriyiGuncelle() {
  const bugun = bugunStr();
  const dun = bugunStr(new Date(Date.now() - 86400000));
  const kayit = STATE.gunlukKayitlar[bugun];
  if (!kayit || (kayit.calismaDk <= 0 && kayit.soru <= 0)) return;

  if (STATE.seri.sonTarih === bugun) return; // bugün zaten sayıldı
  if (STATE.seri.sonTarih === dun) {
    STATE.seri.guncel += 1;
  } else {
    STATE.seri.guncel = 1;
  }
  STATE.seri.sonTarih = bugun;
}

function verileriDisaAktar() {
  return JSON.stringify(STATE, null, 2);
}

function verileriIceAktar(jsonMetin) {
  const gelen = JSON.parse(jsonMetin);
  STATE = derinBirlestir(varsayilanDurum(), gelen);
  stateKaydet();
}

function verileriSifirla() {
  STATE = varsayilanDurum();
  stateKaydet();
}
