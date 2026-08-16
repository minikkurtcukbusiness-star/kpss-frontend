/* Central browser API client. */
const API_STORAGE_KEY="kpss2026_api_ayarlari_v1";
const DEFAULT_API_BASE="https://kpss-backend-production.up.railway.app";
function apiAyarlariOku(){try{const ham=localStorage.getItem(API_STORAGE_KEY);return ham?JSON.parse(ham):{baseUrl:DEFAULT_API_BASE}}catch{return{baseUrl:DEFAULT_API_BASE}}}
function apiAyarlariKaydet(a){localStorage.setItem(API_STORAGE_KEY,JSON.stringify(a))}
function apiBaseUrlAl(){const raw=(apiAyarlariOku().baseUrl||DEFAULT_API_BASE).trim();return raw.replace(/\/+$/,'').replace(/\/api$/i,'')}
function apiBaseUrlAyarla(url){apiAyarlariKaydet({baseUrl:(url||DEFAULT_API_BASE).trim().replace(/\/+$/,'').replace(/\/api$/i,'')})}
function cihazKullaniciId(){const key="kpss2026_cihaz_id";let id=localStorage.getItem(key);if(!id){id="cihaz_"+Date.now().toString(36)+Math.random().toString(36).slice(2,10);localStorage.setItem(key,id)}return id}
async function apiIstek(yol,{method="GET",body,timeoutMs=25000}={}){const baseUrl=apiBaseUrlAl();if(!navigator.onLine)return{ok:false,cozumsuz:true,mesaj:"İnternet bağlantısı gerekiyor."};const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{const res=await fetch(baseUrl+yol,{method,headers:{"Content-Type":"application/json","X-User-Id":cihazKullaniciId()},body:body?JSON.stringify(body):undefined,signal:controller.signal});const veri=await res.json().catch(()=>({}));if(!res.ok)return{ok:false,status:res.status,mesaj:veri.hata||`Sunucu ${res.status} döndürdü.`,yol,baseUrl};return{ok:true,veri}}catch(err){if(err.name==="AbortError")return{ok:false,mesaj:"İstek zaman aşımına uğradı. Sunucu yanıt vermedi."};return{ok:false,mesaj:"Sunucuya şu anda ulaşılamıyor. Lütfen tekrar deneyin."}}finally{clearTimeout(timer)}}
async function apiBaglantiTesti(){return apiIstek("/health",{timeoutMs:10000})}
async function apiAiOgretmenSor(soru){return apiIstek("/api/ai/teacher",{method:"POST",body:{soru},timeoutMs:60000})}
async function apiSoruUret({subject,topic,difficulty,count}){const n=Math.max(1,Number(count)||10);return apiIstek("/api/ai/generate-questions",{method:"POST",body:{subject,topic,difficulty,count:n},timeoutMs:Math.min(480000,Math.max(90000,n*20000))})}
async function apiKarisikTestOlustur(istekler){return apiIstek("/api/ai/generate-mixed-test",{method:"POST",body:{istekler},timeoutMs:120000})}
async function apiGercekDenemeOlustur(istekler){return apiIstek("/api/ai/generate-mock-exam",{method:"POST",body:{istekler},timeoutMs:480000})}
async function apiFotoCoz(imageBase64,mimeType){return apiIstek("/api/ai/solve-image",{method:"POST",body:{imageBase64,mimeType},timeoutMs:90000})}
async function apiGuncelBilgilerGetir(){return apiIstek("/api/current-affairs/today?refresh=1",{timeoutMs:180000})}
async function apiGununTestiOlustur(){return apiIstek("/api/current-affairs/quiz",{method:"POST",timeoutMs:180000})}
async function apiSoruEkle(soruNesnesi){return apiIstek("/api/questions",{method:"POST",body:soruNesnesi})}
async function apiYanlisKaydet(questionId,verilenCevap){return apiIstek("/api/questions/wrong",{method:"POST",body:{questionId,verilenCevap}})}
async function apiYanlislarGetir(){return apiIstek("/api/questions/wrong",{timeoutMs:15000})}
async function apiSoruBildir(questionId,sebep){return apiIstek("/api/questions/report",{method:"POST",body:{questionId,sebep}})}
