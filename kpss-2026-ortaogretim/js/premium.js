/* ============================================================
   PREMIUM UX
   Mevcut uygulamayı bozmadan üstüne modern çalışma katmanı ekler.
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
    const rec=todayRecord(), hedef=STATE.ayarlar.gunlukSoruHedefi||20, pct=Math.min(100,Math.round((rec.soru/Math.max(1,hedef))*100));
    const nxt=nextTopic(); const completed=doneKonu(), total=totalKonu();
    const hero=document.createElement('div'); hero.className='premium-hero';
    hero.innerHTML=`<div class="premium-kicker">Kişisel çalışma merkezi</div><h2>Bugün küçük bir adım, sınavda büyük fark. 🚀</h2><p>${rec.soru>=hedef?'Bugünkü soru hedefini tamamladın. İstersen yanlışlarını tekrar et veya bir konu ilerlet.':'Hedefine ulaşmak için bugün sadece bir sonraki adımı seç. Sistem ilerlemeni otomatik takip eder.'}</p><div class="premium-actions"><button class="btn" id="premiumStartTest">🎯 ${testCount} Soruluk Akıllı Test</button><button class="btn" id="premiumStartStudy">📖 Konuya Devam Et</button><button class="btn" id="premiumCerosBtn">💌 Özel Sürpriz</button></div>`;
    const first=root.firstElementChild; root.insertBefore(hero,first?.nextSibling||root.firstChild);
    const grid=document.createElement('div'); grid.className='premium-grid';
    grid.innerHTML=`<div class="premium-stat"><span class="ps-icon">🎯</span><span class="ps-value">${rec.soru}/${hedef}</span><span class="ps-label">Bugünkü soru hedefi</span><div class="ps-bar"><span style="width:${pct}%"></span></div></div><div class="premium-stat"><span class="ps-icon">⏱️</span><span class="ps-value">${rec.calismaDk||0} dk</span><span class="ps-label">Bugünkü çalışma</span></div><div class="premium-stat"><span class="ps-icon">📚</span><span class="ps-value">${completed}/${total}</span><span class="ps-label">Tamamlanan konu</span></div><div class="premium-stat"><span class="ps-icon">🔥</span><span class="ps-value">${STATE.seri.guncel||0}</span><span class="ps-label">Günlük seri</span></div>`;
    hero.after(grid);
    $("#premiumStartTest")?.addEventListener('click',()=>smartTestModal());
    $("#premiumStartStudy")?.addEventListener('click',()=>{ if(nxt){ dersOgrenmeBaslat(nxt.d.id,nxt.k.id); } else toast('🎉 Tüm konuları tamamladın!'); });
    $("#premiumCerosBtn")?.addEventListener('click',cerosModal);
  }

  function enhanceStudy(){
    const root=$("#page-calisma"); if(!root) return;
    const bar=document.createElement('div'); bar.className='premium-study-tools';
    bar.innerHTML=`<button class="premium-tool" id="studyWeak"><span>🧠 Zayıf Konular</span><b>Tekrar odaklı çalış</b><span>En çok ihtiyaç duyduğun konuları bul</span></button><button class="premium-tool" id="studyRandom"><span>🎲 Rastgele</span><b>Bana bir konu seç</b><span>Kararsızsan sistemi kullan</span></button><button class="premium-tool" id="studyReview"><span>🔁 Tekrar Modu</span><b>Tekrar gerekenler</b><span>Unutmadan pekiştir</span></button>`;
    root.insertBefore(bar,root.children[1]||root.firstChild);
    $("#studyRandom")?.addEventListener('click',()=>{
      const all=[]; SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum!=='tamamlandi')all.push({d,k});}));
      if(!all.length)return toast('Tüm konuları tamamladın! 🎉'); const x=all[Math.floor(Math.random()*all.length)]; dersOgrenmeBaslat(x.d.id,x.k.id);
    });
    $("#studyWeak")?.addEventListener('click',()=>{ const a=[]; SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum==='tekrar'||(k.soru||0)>0&&((k.dogru||0)/(Math.max(1,(k.soru||0)))<.6))a.push({d,k});})); if(!a.length)return toast('Şimdilik belirgin bir zayıf konu yok. Harikasın!'); const x=a[0]; dersOgrenmeBaslat(x.d.id,x.k.id); });
    $("#studyReview")?.addEventListener('click',()=>{const a=[]; SUBJECTS_META.forEach(d=>(STATE.dersler[d.id]?.konular||[]).forEach(k=>{if(k.durum==='tekrar')a.push({d,k});})); if(!a.length)return toast('Tekrar listesi boş. 👍'); const x=a[0]; dersOgrenmeBaslat(x.d.id,x.k.id);});
  }

  function enhanceTests(){
    const root=$("#page-denemeler"); if(!root) return;
    const panel=document.createElement('div'); panel.className='premium-testbar';
    panel.innerHTML=`<div><strong>⚡ Akıllı Test Merkezi</strong><div class="sub">AI ile seçtiğin uzunlukta, sınav odaklı test oluştur.</div></div><div class="premium-test-options"><button class="btn btn-sm active" data-test-count="10">10</button><button class="btn btn-sm" data-test-count="20">20</button><button class="btn btn-sm" data-test-count="40">40</button><button class="btn btn-accent btn-sm" id="premiumGenerateTest">Testi Oluştur</button></div>`;
    root.insertBefore(panel,root.firstElementChild?.nextSibling||root.firstChild);
    $all('[data-test-count]',panel).forEach(b=>b.addEventListener('click',()=>{$all('[data-test-count]',panel).forEach(x=>x.classList.remove('active'));b.classList.add('active');testCount=Number(b.dataset.testCount);}));
    $("#premiumGenerateTest")?.addEventListener('click',()=>smartTestModal());
  }

  async function smartTestModal(){
    if(!apiBaseUrlAl()){modalAc('AI bağlantısı gerekli','<p>Akıllı test için Ayarlar bölümünden backend adresini kaydet.</p>','<button class="btn btn-accent" id="goSettings">Ayarlara Git</button>');$("#goSettings").onclick=()=>{modalKapat();sayfaGec('ayarlar');};return;}
    const dersler=SUBJECTS_META;
    modalAc('⚡ Akıllı Test',`<div class="field"><label>Ders</label><select id="smartSubject">${dersler.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></div><div class="field"><label>Zorluk</label><select id="smartDifficulty"><option>orta</option><option>kolay</option><option>zor</option></select></div><p class="alt">${testCount} soru üretilecek. Soruların geçerli JSON olması ve açıklama içermesi istenecek.</p>`,'<button class="btn btn-accent" id="smartGo">Soruları Getir</button>');
    $("#smartGo").onclick=async()=>{const subject=$("#smartSubject").value;const difficulty=$("#smartDifficulty").value;modalAc('⏳ Test hazırlanıyor',`<div style="padding:24px;text-align:center">AI soruları hazırlıyor…<br><span class="alt">Bu işlem biraz sürebilir.</span></div>`);const r=await apiSoruUret({subject,topic:'Karışık',difficulty,count:testCount});if(!r.ok){modalAc('Test oluşturulamadı',`<p>${esc(r.mesaj)}</p>`,'<button class="btn" id="smartClose">Kapat</button>');$("#smartClose").onclick=modalKapat;return;}const qs=r.veri?.sorular||r.veri?.questions||[];if(!qs.length){modalAc('Test oluşturulamadı','<p>Sunucu geçerli soru döndürmedi. Lütfen tekrar deneyin.</p>');return;}modalKapat();testModalBaslat(qs,`${dersAdi(subject)} — Akıllı Test`);};
  }

  function cerosModal(){
    modalAc('💌 Ceroş\'a özel',`<div class="ceros-secret"><div class="heart">💗</div><h2>Selam Ceroş!</h2><p>Bu uygulamanın içinde sana ayrılmış küçük bir köşe var. Bazen ders çalışmak zor gelebilir ama sen bir adım attıkça hedefine biraz daha yaklaşıyorsun.</p><p><strong>Bugün mükemmel olmak zorunda değilsin.</strong> Sadece 20 dakika başla. Gerisi gelir. 🌸</p><p>Ve evet… burada seni düşünen biri var. 😄</p><div class="signature">— Ceroş'un gizli KPSS köşesi ❤️</div></div>`,'<button class="btn btn-accent" id="cerosClose">Tamam 💗</button>'); $("#cerosClose").onclick=modalKapat;
  }

  if(oldHome) window.renderAnaSayfa=function(){oldHome();enhanceHome();};
  if(oldStudy) window.renderCalisma=function(){oldStudy();enhanceStudy();};
  if(oldTests) window.renderDenemeler=function(){oldTests();enhanceTests();};

  document.addEventListener('click',e=>{
    const mark=e.target.closest('.nav-brand-mark'); if(!mark)return; cerosClicks++; if(cerosClicks>=5){cerosClicks=0;cerosModal();}
  });
})();
