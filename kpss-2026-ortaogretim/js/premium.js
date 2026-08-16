/* ============================================================
   PREMIUM UX — gerçek çalışma akışlarını bozmadan üst katman
   ============================================================ */
(function(){
  const oldHome = window.renderAnaSayfa;
  const oldStudy = window.renderCalisma;
  const oldTests = window.renderDenemeler;
  let testCount = 10;
  let cerosClicks = 0;

  function esc(s){ return String(s ?? '').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m])); }
  function totalKonu(){ return SUBJECTS_META.reduce((n,d)=>n+(STATE.dersler[d.id]?.konular?.length||0),0); }
  function doneKonu(){ return SUBJECTS_META.reduce((n,d)=>n+(STATE.dersler[d.id]?.konular||[]).filter(k=>k.durum==='tamamlandi').length,0); }
  function nextTopic(){
    for(const d of SUBJECTS_META){
      const k=(STATE.dersler[d.id]?.konular||[]).find(x=>x.durum!=='tamamlandi');
      if(k) return {d,k};
    }
    return null;
  }
  function today(){ return typeof bugunStr==='function'?bugunStr():new Date().toISOString().slice(0,10); }
  function todayRecord(){ return typeof gunlukKayitAl==='function'?gunlukKayitAl():(STATE.gunlukKayitlar[today()]||{soru:0,dogru:0,yanlis:0,calismaDk:0}); }

  function enhanceHome(){
    const root=$("#page-anasayfa"); if(!root) return;
    root.querySelectorAll('.premium-hero,.premium-grid').forEach(x=>x.remove());
    const rec=todayRecord(), hedef=STATE.ayarlar.gunlukSoruHedefi||20, pct=Math.min(100,Math.round((rec.soru/Math.max(1,hedef))*100));
    const nxt=nextTopic(); const completed=doneKonu(), total=totalKonu();
    const hero=document.createElement('div'); hero.className='premium-hero';
    hero.innerHTML=`<div class="premium-kicker">Kişisel çalışma merkezi</div><h2>Bugün küçük bir adım, sınavda büyük fark. 🚀</h2><p>${rec.soru>=hedef?'Bugünkü soru hedefini tamamladın. İstersen yanlışlarını tekrar et veya bir konu ilerlet.':'Hedefine ulaşmak için bugün sadece bir sonraki adımı seç. Sistem ilerlemeni otomatik takip eder.'}</p><div class="premium-actions"><button type="button" class="btn" id="premiumStartTest">🎯 ${testCount} Soruluk Akıllı Test</button><button type="button" class="btn" id="premiumStartStudy">📖 Konuya Devam Et</button></div>`;
    const first=root.firstElementChild; root.insertBefore(hero,first?.nextSibling||root.firstChild);
    const grid=document.createElement('div'); grid.className='premium-grid';
    grid.innerHTML=`<div class="premium-stat"><span class="ps-icon">🎯</span><span class="ps-value">${rec.soru}/${hedef}</span><span class="ps-label">Bugünkü soru hedefi</span><div class="ps-bar"><span style="width:${pct}%"></span></div></div><div class="premium-stat"><span class="ps-icon">⏱️</span><span class="ps-value">${rec.calismaDk||0} dk</span><span class="ps-label">Bugünkü çalışma</span></div><div class="premium-stat"><span class="ps-icon">📚</span><span class="ps-value">${completed}/${total}</span><span class="ps-label">Tamamlanan konu</span></div><div class="premium-stat"><span class="ps-icon">🔥</span><span class="ps-value">${STATE.seri.guncel||0}</span><span class="ps-label">Günlük seri</span></div>`;
    hero.after(grid);
    $("#premiumStartTest")?.addEventListener('click',()=>smartTestModal());
    $("#premiumStartStudy")?.addEventListener('click',()=>{ if(nxt){ dersOgrenmeBaslat(nxt.d.id,nxt.k.id); } else toast('🎉 Tüm konuları tamamladın!'); });
    const start=root.querySelector('#anaSoruCozBtn'); if(start) start.textContent='🎯 Soru Çözmeye Başla';
  }

  function enhanceStudy(){
    const root=$("#page-calisma"); if(!root) return;
    root.querySelectorAll('.premium-study-tools').forEach(x=>x.remove());
    const bar=document.createElement('div'); bar.className='premium-study-tools';
    bar.innerHTML=`<button type="button" class="premium-tool" id="studyFocus"><span>⏱️ Odak</span><b>Odak Oturumunu Başlat</b><span>25 dakikalık kesintisiz çalışma</span></button><button type="button" class="premium-tool" id="studyWeak"><span>🧠 Zayıf Konular</span><b>Tekrar odaklı çalış</b><span>En çok ihtiyaç duyduğun konuları bul</span></button><button type="button" class="premium-tool" id="studyRandom"><span>🎲 Rastgele</span><b>Bana bir konu seç</b><span>Kararsızsan sistemi kullan</span></button><button type="button" class="premium-tool" id="studyReview"><span>🔁 Tekrar Modu</span><b>Tekrar gerekenler</b><span>Unutmadan pekiştir</span></button>`;
    root.insertBefore(bar,root.children[1]||root.firstChild);
    $("#studyFocus")?.addEventListener('click',()=>{ const hub=document.querySelector('#hubFocusBtn'); if(hub) return hub.click(); toast('Odak oturumu hazırlanıyor.'); });
    $("#studyRandom")?.addEventListener('click',()=>{const all=[];SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum!=='tamamlandi')all.push({d,k});}));if(!all.length)return toast('Tüm konuları tamamladın! 🎉');const x=all[Math.floor(Math.random()*all.length)];dersOgrenmeBaslat(x.d.id,x.k.id);});
    $("#studyWeak")?.addEventListener('click',()=>{const a=[];SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum==='tekrar'||((k.soru||0)>0&&((k.dogru||0)/Math.max(1,k.soru||0)<.6)))a.push({d,k});}));if(!a.length)return toast('Şimdilik belirgin bir zayıf konu yok. Harikasın!');const x=a[0];dersOgrenmeBaslat(x.d.id,x.k.id);});
    $("#studyReview")?.addEventListener('click',()=>{const a=[];SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum==='tekrar')a.push({d,k});}));if(!a.length)return toast('Tekrar listesi boş. 👍');const x=a[0];dersOgrenmeBaslat(x.d.id,x.k.id);});
  }

  function enhanceTests(){
    const root=$("#page-denemeler"); if(!root) return;
    root.querySelectorAll('.premium-testbar').forEach(x=>x.remove());
    const panel=document.createElement('div'); panel.className='premium-testbar';
    panel.innerHTML=`<div><strong>⚡ Akıllı Test Merkezi</strong><div class="sub">10, 20 veya 40 soruluk gerçek AI testi oluştur.</div></div><div class="premium-test-options"><button type="button" class="btn btn-sm active" data-test-count="10">10</button><button type="button" class="btn btn-sm" data-test-count="20">20</button><button type="button" class="btn btn-sm" data-test-count="40">40</button><button type="button" class="btn btn-accent btn-sm" id="premiumGenerateTest">Testi Oluştur</button></div>`;
    root.insertBefore(panel,root.firstElementChild?.nextSibling||root.firstChild);
    $all('[data-test-count]',panel).forEach(b=>b.addEventListener('click',()=>{$all('[data-test-count]',panel).forEach(x=>x.classList.remove('active'));b.classList.add('active');testCount=Number(b.dataset.testCount);}));
    $("#premiumGenerateTest")?.addEventListener('click',()=>smartTestModal());
  }

  function paketIstekleri(count,subject,difficulty){
    const dersler=subject==='tumu'?SUBJECTS_META:SUBJECTS_META.filter(d=>d.id===subject);const kaynak=dersler.length?dersler:SUBJECTS_META;const paketler=[];let kalan=count,i=0;
    while(kalan>0){const d=kaynak[i%kaynak.length];const topics=TOPICS_SEED[d.id]||[d.name];const topic=topics[Math.floor(Math.random()*topics.length)];const n=Math.min(5,kalan);paketler.push({subject:d.name,topic,difficulty,count:n});kalan-=n;i++;}
    return paketler;
  }

  async function smartTestModal(){
    if(!apiBaseUrlAl()){modalAc('AI bağlantısı gerekli','<p>Akıllı test için Ayarlar bölümünden backend adresini kaydet.</p>','<button type="button" class="btn btn-accent" id="goSettings">Ayarlara Git</button>');$("#goSettings").onclick=()=>{modalKapat();sayfaGec('ayarlar');};return;}
    const dersler=SUBJECTS_META;
    modalAc('⚡ Akıllı Test',`<div class="field"><label>Ders</label><select id="smartSubject"><option value="tumu">Tüm dersler</option>${dersler.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></div><div class="field"><label>Zorluk</label><select id="smartDifficulty"><option>orta</option><option>kolay</option><option>zor</option></select></div><p class="alt">${testCount} soru hazırlanacak. Backend'in çalışan <b>generate-mixed-test</b> uç noktasına 5'li paketler gönderilecek.</p>`,'<button type="button" class="btn btn-accent" id="smartGo">Soruları Getir</button>');
    $("#smartGo").onclick=async()=>{const subject=$("#smartSubject").value;const difficulty=$("#smartDifficulty").value;const paketler=paketIstekleri(testCount,subject,difficulty);const started=Date.now();modalAc('⏳ Test hazırlanıyor',`<div class="ai-progress"><strong>${paketler.length} paket hazırlanıyor…</strong><p>Gerçek AI soruları backend'den alınıyor.</p><div class="ai-progress-bar"><i style="width:8%"></i></div><small id="aiProgressTime">Geçen süre: 0 sn</small></div>`,'<button type="button" class="btn btn-outline" id="aiCancelBtn">İptal</button>');const timeTick=setInterval(()=>{const e=Math.floor((Date.now()-started)/1000);const el=document.querySelector('#aiProgressTime');if(el)el.textContent=`Geçen süre: ${e} sn`;},1000);
      try{const r=await apiKarisikTestOlustur(paketler);clearInterval(timeTick);if(!r.ok){modalAc('Test oluşturulamadı',`<p>${esc(r.mesaj)}</p><p class="alt">Backend cevap veremedi veya AI sağlayıcısı başarısız oldu. Test eksik başlatılmadı.</p>`,'<button type="button" class="btn btn-accent" id="smartClose">Kapat</button>');$("#smartClose").onclick=modalKapat;return;}const qs=r.veri?.sorular||r.veri?.questions||[];if(qs.length!==testCount){modalAc('Eksik soru döndü',`<p>İstenen ${testCount} soru yerine ${qs.length} soru geldi. Eksik test başlatmadım.</p>`,'<button type="button" class="btn btn-accent" id="smartClose">Kapat</button>');$("#smartClose").onclick=modalKapat;return;}modalKapat();testModalBaslat(qs,`${subject==='tumu'?'Karma':dersAdi(subject)} — ${testCount} Soruluk Akıllı Test`);}catch(err){clearInterval(timeTick);modalAc('Test oluşturulamadı',`<p>${esc(err?.message||'Beklenmeyen bir hata oluştu.')}</p>`,'<button type="button" class="btn btn-accent" id="smartClose">Kapat</button>');$("#smartClose").onclick=modalKapat;}};
  }

  function cerosModal(){modalAc('💌 Ceroş\'a özel',`<div class="ceros-secret"><div class="heart">💗</div><h2>Selam Ceroş!</h2><p>Bu uygulamanın içinde sana ayrılmış küçük bir köşe var. Bazen ders çalışmak zor gelebilir ama sen bir adım attıkça hedefine biraz daha yaklaşıyorsun.</p><p><strong>Bugün mükemmel olmak zorunda değilsin.</strong> Sadece 20 dakika başla. Gerisi gelir. 🌸</p><p>Ve evet… burada seni düşünen biri var. 😄</p><div class="signature">— Ceroş'un gizli KPSS köşesi ❤️</div></div>`,'<button type="button" class="btn btn-accent" id="cerosClose">Tamam 💗</button>');$("#cerosClose").onclick=modalKapat;}

  if(oldHome) window.renderAnaSayfa=function(){oldHome();enhanceHome();};
  if(oldStudy) window.renderCalisma=function(){oldStudy();enhanceStudy();};
  if(oldTests) window.renderDenemeler=function(){oldTests();enhanceTests();};
  document.addEventListener('click',e=>{const mark=e.target.closest('.nav-brand-mark');if(!mark)return;cerosClicks++;if(cerosClicks>=5){cerosClicks=0;cerosModal();}});
})();
