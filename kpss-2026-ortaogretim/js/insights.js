/* Basit, yerel ve güvenli çalışma içgörüleri. */

function akilliCalismaOnerisi() {
  const adaylar = [];
  SUBJECTS_META.forEach(ders => {
    const state = STATE.dersler[ders.id];
    if (!state) return;
    const toplam = (state.dogru || 0) + (state.yanlis || 0);
    const basari = toplam ? (state.dogru || 0) / toplam : 0;
    adaylar.push({ id: ders.id, ad: ders.name, basari, soru: state.soru || 0, yanlis: state.yanlis || 0 });
  });

  if (!adaylar.length) return { baslik: "Bugün küçük bir adım at", metin: "Bir ders seçip 10 soru çözerek başlayabilirsin." };

  const zayif = adaylar.filter(x => x.soru > 0).sort((a, b) => a.basari - b.basari)[0];
  if (!zayif) return { baslik: "İlk hedefini belirle", metin: "Bir dersten 10 soru çöz; sistem sana zamanla daha iyi öneriler sunacak." };

  if (zayif.basari < 0.6) return { baslik: `${zayif.ad} öncelikli`, metin: `Başarı oranın %${Math.round(zayif.basari * 100)}. Önce bu dersten kısa bir tekrar, ardından 10 soru öneriyorum.` };
  return { baslik: `${zayif.ad} ile devam`, metin: `Bu ders diğerlerine göre daha düşük performanslı. 15 soru çözerek açığı kapatabilirsin.` };
}

function gunlukHedefDurumu() {
  const kayit = gunlukKayitAl();
  const soruHedef = Math.max(Number(STATE.ayarlar.gunlukSoruHedefi) || 0, 0);
  const dkHedef = Math.max(Number(STATE.ayarlar.gunlukCalismaHedefiDk) || 0, 0);
  return {
    soru: { mevcut: kayit.soru || 0, hedef: soruHedef, oran: soruHedef ? Math.min(100, Math.round((kayit.soru || 0) / soruHedef * 100)) : 0 },
    calisma: { mevcut: kayit.calismaDk || 0, hedef: dkHedef, oran: dkHedef ? Math.min(100, Math.round((kayit.calismaDk || 0) / dkHedef * 100)) : 0 }
  };
}
