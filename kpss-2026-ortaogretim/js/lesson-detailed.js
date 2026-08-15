/* KPSS 2026 — Detaylı ders anlatım motoru
   Mevcut lesson/lesson-all içeriklerini bozmadan, her konuyu daha öğretici bir yapıya taşır. */
(function(){
  const clean = s => String(s||'').trim();
  const base = window.KPSS_LESSONS || window.lessonData || {};
  const subjectTips = {
    'Türkçe':'Kuralı örnek üzerinde gör, ardından istisnayı kontrol et.','Matematik':'Verilenleri sembolleştir; işlemden önce hangi yöntemin uygun olduğunu belirle.','Tarih':'Olayı ezberlemek yerine neden → gelişme → sonuç bağlantısını kur.','Coğrafya':'Bilgiyi Türkiye üzerindeki yer ve neden-sonuç ilişkisiyle eşleştir.','Vatandaşlık':'Kavramı, yetkiyi ve kurumlar arasındaki farkı birlikte öğren.','Güncel Bilgiler':'Bilgiyi kişi/kurum, tarih ve önem bağlantısıyla tekrar et.'
  };
  function inferSubject(topic){
    const d=(window.DERSLER||window.dersler||[]);
    for(const x of d){ if((x.konular||[]).some(k=>clean(k.ad||k)===topic)) return x.ad||x.name; }
    return 'KPSS';
  }
  function build(topic, raw){
    const subject = raw?.ders || raw?.subject || inferSubject(topic);
    const steps = raw?.adimlar || raw?.steps || [];
    const detail = [];
    if(raw?.tanim) detail.push({baslik:'Konuya giriş',metin:raw.tanim});
    if(steps[0]?.metin) detail.push({baslik:'Temeli öğren',metin:steps[0].metin,ipucu:steps[0].ipucu});
    if(steps[1]?.metin) detail.push({baslik:'Mantığını kur',metin:steps[1].metin,ipucu:steps[1].ipucu});
    detail.push({baslik:'Nasıl çalışmalısın?',metin:subjectTips[subject]||'Önce kavramı öğren, sonra örnek üzerinde uygula ve en son kendini kısa sorularla kontrol et.'});
    if(steps[2]?.metin) detail.push({baslik:'KPSS örneği',metin:steps[2].metin,ipucu:steps[2].ipucu});
    if(steps[3]?.metin) detail.push({baslik:'⚠️ KPSS tuzağı',metin:steps[3].metin,ipucu:steps[3].ipucu});
    detail.push({baslik:'🧠 Hızlı tekrar',metin:`${topic} için önce ana kavramı hatırla, ardından temel kuralı kendi cümlenle söyle. Son olarak bir örnek üzerinden uygula. ${subjectTips[subject]||''}`});
    return {topic,subject,sections:detail};
  }
  window.getDetailedLesson = function(topic){
    const key=clean(topic); const raw=base[key] || base[topic] || null;
    return build(key,raw);
  };
})();
