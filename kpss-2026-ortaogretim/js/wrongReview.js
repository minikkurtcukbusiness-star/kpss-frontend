/* Yanlışlarım: backend'deki yanlış soruları basit aralıklı tekrar mantığıyla gösterir. */
const WRONG_REVIEW_KEY = "kpss2026_wrong_review_v1";

function yanlisTekrarState() {
  try { return JSON.parse(localStorage.getItem(WRONG_REVIEW_KEY) || "{}"); } catch { return {}; }
}
function yanlisTekrarKaydet(v) { localStorage.setItem(WRONG_REVIEW_KEY, JSON.stringify(v)); }
function tekrarAraligi(n) { return [1, 2, 4, 7, 14, 30][Math.min(Math.max(n, 0), 5)]; }
function tekrarZamani(id, state) {
  const x = state[id];
  if (!x || !x.son) return true;
  const gun = Math.floor((Date.now() - new Date(x.son).getTime()) / 86400000);
  return gun >= tekrarAraligi(x.seviye || 0);
}

function yanlisSayfaHazirla() {
  if ($("#page-yanlislar")) return;
  const hedef = $("#page-istatistik");
  if (!hedef) return;
  const section = document.createElement("section");
  section.className = "page";
  section.dataset.page = "yanlislar";
  section.id = "page-yanlislar";
  hedef.parentNode.insertBefore(section, $("#page-guncel"));

  const nav = $("#navList");
  if (nav && !nav.querySelector('[data-page="yanlislar"]')) {
    const li = document.createElement("li");
    li.innerHTML = '<button class="nav-item" data-page="yanlislar"><span class="nav-ico">✕</span><span>Yanlışlarım</span></button>';
    nav.insertBefore(li, nav.lastElementChild);
    li.querySelector("button").addEventListener("click", () => yanlislarGoster());
  }
  const bottom = $("#bottomNav");
  if (bottom && !bottom.querySelector('[data-page="yanlislar"]')) {
    const b = document.createElement("button");
    b.className = "bn-item"; b.dataset.page = "yanlislar"; b.innerHTML = "<span>✕</span>Yanlış";
    bottom.insertBefore(b, bottom.lastElementChild);
    b.addEventListener("click", () => yanlislarGoster());
  }
}

async function yanlislarGoster() {
  yanlisSayfaHazirla();
  const page = $("#page-yanlislar");
  if (!page) return;
  $all(".page").forEach(p => p.classList.toggle("active", p === page));
  $all(".nav-item, .bn-item").forEach(b => b.classList.toggle("active", b.dataset.page === "yanlislar"));
  uiState.sayfa = "yanlislar";
  page.innerHTML = '<div class="page-head"><h1>Yanlışlarım</h1><div class="alt">Yanlış yaptığın soruları unutma; doğru cevaplayana kadar tekrar et.</div></div><div class="card card-pad">Sorular yükleniyor…</div>';

  const sonuc = await apiYanlislarGetir();
  if (!sonuc.ok) {
    page.innerHTML = `<div class="page-head"><h1>Yanlışlarım</h1></div><div class="card card-pad"><div class="empty-state">${sonuc.mesaj}</div></div>`;
    return;
  }
  const liste = sonuc.veri.yanlislar || [];
  const state = yanlisTekrarState();
  const due = liste.filter(x => tekrarZamani(x.id, state));
  const goster = due.length ? due : liste;

  page.innerHTML = `<div class="page-head"><h1>Yanlışlarım</h1><div class="alt">${liste.length} kayıt · ${due.length} soru tekrar için hazır</div></div>
    <div class="card card-pad" style="margin-bottom:16px"><div class="section-title">🧠 Akıllı Tekrar <span class="badge">${due.length}</span></div><p style="margin:0;color:var(--muted)">${due.length ? "Bugün öncelikle aşağıdaki soruları tekrar çöz." : "Bugünkü tekrar tamam. İstersen geçmiş yanlışlarını da gözden geçir."}</p></div>
    <div id="yanlisListe"></div>`;

  const root = $("#yanlisListe");
  if (!goster.length) { root.innerHTML = '<div class="card card-pad empty-state">Henüz kaydedilmiş yanlış soru yok. Test çözdükçe yanlışların burada birikecek. 🎯</div>'; return; }
  root.innerHTML = goster.map((x, i) => {
    const q = x.soru || {}; const sec = q.options || {};
    return `<article class="card card-pad" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><strong>${q.subject || "Genel"}${q.topic ? " · " + q.topic : ""}</strong><span class="badge">${i + 1}</span></div>
      <p style="font-weight:600;line-height:1.55">${q.question || "Soru bulunamadı."}</p>
      <div style="display:grid;gap:7px">${Object.entries(sec).map(([k,v]) => `<div style="padding:9px;border:1px solid var(--border);border-radius:8px"><b>${k})</b> ${v}</div>`).join("")}</div>
      <details style="margin-top:12px"><summary>Doğru cevap ve açıklama</summary><p><b>${q.correctAnswer || "-"}</b> — ${q.explanation || "Açıklama bulunmuyor."}</p></details>
      <button class="btn btn-primary btn-sm" style="margin-top:10px" data-review-done="${x.id}">Tekrar ettim ✓</button>
    </article>`;
  }).join("");

  $all("[data-review-done]", root).forEach(btn => btn.addEventListener("click", () => {
    const s = yanlisTekrarState(); const eski = s[btn.dataset.reviewDone] || { seviye: 0 };
    s[btn.dataset.reviewDone] = { seviye: Math.min((eski.seviye || 0) + 1, 5), son: new Date().toISOString() };
    yanlisTekrarKaydet(s); toast("Tekrar kaydedildi. Bir sonraki tekrar zamanı planlandı."); btn.closest("article").remove();
  }));
}

window.addEventListener("load", () => {
  yanlisSayfaHazirla();
});
