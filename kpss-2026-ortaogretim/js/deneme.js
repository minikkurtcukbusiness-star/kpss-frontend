/* Deneme motoru: mevcut STATE.deneme yapısını kullanır, ana soru akışına dokunmaz. */

function denemeNetHesapla(dogru, yanlis) {
  return Math.round((dogru - yanlis / 4) * 100) / 100;
}

function denemeSonucuOlustur(sorular, cevaplar, sureSn) {
  let dogru = 0, yanlis = 0, bos = 0;
  const dersler = {};

  sorular.forEach((soru, i) => {
    const verilen = cevaplar[i];
    const meta = SUBJECTS_META.find(d => d.name === soru.subject);
    const key = meta ? meta.id : (soru.subject || "genel");
    if (!dersler[key]) dersler[key] = { ad: soru.subject || "Genel", dogru: 0, yanlis: 0, bos: 0 };

    if (!verilen) {
      bos++; dersler[key].bos++;
    } else if (verilen === soru.dogruCevap) {
      dogru++; dersler[key].dogru++;
    } else {
      yanlis++; dersler[key].yanlis++;
    }
  });

  return {
    tarih: bugunStr(),
    soruSayisi: sorular.length,
    dogru,
    yanlis,
    bos,
    net: denemeNetHesapla(dogru, yanlis),
    sureSn: Math.max(0, Math.round(sureSn || 0)),
    dersler
  };
}

function denemeKaydet(sonuc) {
  STATE.denemeler.unshift({ id: uid(), ...sonuc });
  STATE.denemeler = STATE.denemeler.slice(0, 100);
  stateKaydet();
}

function denemeOzetMetni(sonuc) {
  return `${sonuc.dogru} doğru · ${sonuc.yanlis} yanlış · ${sonuc.bos} boş · ${sonuc.net} net`;
}
