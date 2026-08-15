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
    ad,
    durum: "baslamadim",
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
    surumu: 2,
    ayarlar: {
      sinavTarihi: SINAV_TARIHI_VARSAYILAN,
      gunlukSoruHedefi: 80,
      gunlukCalismaHedefiDk: 180,
      pomodoroCalismaDk: 25,
      pomodoroMolaDk: 5,
      tema: "acik",
      bildirimAcik: false,
      bildirimSaati: "20:00"
    },
    dersler,
    plan: DEFAULT_PLAN.map(p => ({ ...p, id: uid() })),
    planTamamlanan: {},
    gunlukKayitlar: {},
    calismaOturumlari: [],
    denemeler: [],
    okunanGuncel: {},
    seri: { guncel: 0, sonTarih: null },
    motivasyonIndex: null
  };
}

function konulariMigrateEt(varsayiDers, kayitliDers) {
  if (!kayitliDers || typeof kayitliDers !== "object") return varsayiDers;

  const eskiKonular = Array.isArray(kayitliDers.konular) ? kayitliDers.konular : [];
  const eskiByAd = new Map(eskiKonular.map(k => [String(k.ad).trim().toLocaleLowerCase("tr-TR"), k]));

  // Seed'deki bütün konuları koru; kullanıcının eski ilerleme/not verisini aynı konuya taşı.
  const yeniKonular = (varsayiDers.konular || []).map(yeni => {
    const eski = eskiByAd.get(String(yeni.ad).trim().toLocaleLowerCase("tr-TR"));
    return eski ? {
      ...yeni,
      id: eski.id || yeni.id,
      durum: eski.durum || yeni.durum,
      calismaDk: Number(eski.calismaDk) || 0,
      soru: Number(eski.soru) || 0,
      dogru: Number(eski.dogru) || 0,
      yanlis: Number(eski.yanlis) || 0,
      not: typeof eski.not === "string" ? eski.not : ""
    } : yeni;
  });

  // Kullanıcının seed dışında elle eklediği konuları da kaybetme.
  const seedAdlari = new Set(yeniKonular.map(k => String(k.ad).trim().toLocaleLowerCase("tr-TR")));
  eskiKonular.forEach(eski => {
    const anahtar = String(eski.ad || "").trim().toLocaleLowerCase("tr-TR");
    if (anahtar && !seedAdlari.has(anahtar)) yeniKonular.push(eski);
  });

  return { ...varsayiDers, ...kayitliDers, konular: yeniKonular };
}

function derinBirlestir(varsayilan, kayitli) {
  const sonuc = JSON.parse(JSON.stringify(varsayilan));
  if (!kayitli || typeof kayitli !== "object") return sonuc;

  for (const anahtar in kayitli) {
    if (anahtar === "dersler") continue;
    if (kayitli[anahtar] && typeof kayitli[anahtar] === "object" && !Array.isArray(kayitli[anahtar])
        && sonuc[anahtar] && typeof sonuc[anahtar] === "object" && !Array.isArray(sonuc[anahtar])) {
      sonuc[anahtar] = derinBirlestir(sonuc[anahtar], kayitli[anahtar]);
    } else {
      sonuc[anahtar] = kayitli[anahtar];
    }
  }

  // Dersleri özel olarak birleştiriyoruz. Böylece eski localStorage'da
  // yalnızca birkaç konu olsa bile yeni TOPICS_SEED'deki bütün konular görünür.
  if (kayitli.dersler && typeof kayitli.dersler === "object") {
    Object.keys(sonuc.dersler).forEach(dersId => {
      sonuc.dersler[dersId] = konulariMigrateEt(
        sonuc.dersler[dersId],
        kayitli.dersler[dersId]
      );
    });

    // Geçmişte seed'de olmayan bir ders kaydı varsa onu da koru.
    Object.keys(kayitli.dersler).forEach(dersId => {
      if (!sonuc.dersler[dersId]) sonuc.dersler[dersId] = kayitli.dersler[dersId];
    });
  }

  sonuc.surumu = 2;
  return sonuc;
}

function stateYukle() {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanDurum();
    const kayitli = JSON.parse(ham);
    const sonuc = derinBirlestir(varsayilanDurum(), kayitli);
    // Migration'ı bir kere de hemen diske yaz; kullanıcı eski localStorage ile
    // tekrar karşılaşmasın.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sonuc));
    return sonuc;
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
  if (STATE.seri.sonTarih === bugun) return;
  if (STATE.seri.sonTarih === dun) STATE.seri.guncel += 1;
  else STATE.seri.guncel = 1;
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
