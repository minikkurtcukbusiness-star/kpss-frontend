/* 15 Dakikalık Mini Tur — konu seçimini sayfadan çıkmadan aç. */
(function(){
  window.studyRastgeleKonu=function(){
    const topics=typeof calismaKonulariniGetir==='function'?calismaKonulariniGetir().filter(k=>k.durum!=='tamamlandi'):[];
    if(!topics.length){toast('🎉 Tüm konuları tamamladın!');return;}
    const dersGruplari={};topics.forEach(k=>(dersGruplari[k.ders]??=[]).push(k));
    modalAc('🎯 15 Dakikalık Mini Tur',`<p class="alt">Çalışmak istediğin konuyu seç. Sayfanın konumu değişmez.</p><div style="display:grid;gap:8px;max-height:55vh;overflow:auto">${Object.entries(dersGruplari).map(([ders,arr])=>`<div><strong>${ders}</strong><div style="display:grid;gap:6px;margin:6px 0 12px">${arr.map(k=>`<button type="button" class="btn btn-outline" data-mini-konu="${k.dersId}|${k.id}" style="text-align:left">📖 ${k.ad}<span class="alt"> · ${k.durum==='tekrar'?'Tekrar gerekli':k.durum==='calisiyorum'?'Çalışıyorum':'Başlamadım'}</span></button>`).join('')}</div></div>`).join('')}</div>`,'<button type="button" class="btn btn-outline" id="miniTurKapat">Kapat</button>');
    document.querySelector('#miniTurKapat')?.addEventListener('click',modalKapat);
    document.querySelectorAll('[data-mini-konu]').forEach(btn=>btn.addEventListener('click',()=>{const [d,k]=btn.dataset.miniKonu.split('|');modalKapat();studyKonuAc(d,k);}));
  };
})();
