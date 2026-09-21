/* =========================================================
   زاد الآخرة - الهيكل العام المشترك بين كل الصفحات
   ========================================================= */

const NAV_ITEMS = [
  {href:"index.html", label:"الرئيسية", icon:"🏠"},
  {href:"quran.html", label:"القرآن الكريم", icon:"📖"},
  {href:"tilawat.html", label:"التلاوات النادرة", icon:"🎙️"},
  {href:"external.html", label:"الحفلات الخارجية", icon:"🕌"},
  {href:"ibtihalat.html", label:"الابتهالات", icon:"🎵"},
  {href:"khawatir.html", label:"خواطر الشعراوي", icon:"✍️"},
  {href:"azkar.html", label:"الأذكار", icon:"📿"},
  {href:"adhan.html", label:"مواقيت الصلاة", icon:"🕋"},
  {href:"sadaqa.html", label:"الصدقة الجارية", icon:"💚"},
  {href:"favorites.html", label:"المفضلة", icon:"⭐"},
  {href:"settings.html", label:"الإعدادات", icon:"⚙️"},
];

const PRAYER_NAMES = {
  Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء"
};

let currentQueue = [];
let currentIndex = -1;
const audioEl = new Audio();

function buildShell(){
  const shell = document.createElement("div");
  shell.id = "app-shell";

  const current = location.pathname.split("/").pop() || "index.html";

  shell.innerHTML = `
    <header id="topnav">
      <a href="index.html" class="brand">
        <div class="brand-icon">🕌</div>
        <div>
          <h1>زاد الآخرة</h1>
          <span>طريقك إلى الخير والسكينة</span>
        </div>
      </a>
      <nav class="nav-links">
        ${NAV_ITEMS.map(it=>`
          <a href="${it.href}" class="${current===it.href.split('#')[0] ? 'active':''}">
            <span>${it.label}</span>
          </a>`).join("")}
      </nav>
      <div class="topnav-actions">
        <div class="search-box">
          <span>🔍</span>
          <input id="global-search" placeholder="ابحث هنا...">
          <button class="top-icon-btn" id="settings-btn" style="width:24px;height:24px;border:none;background:none;">⚙️</button>
        </div>
        <button class="top-icon-btn" id="theme-toggle">🌙</button>
        <button class="login-btn" id="login-btn">تسجيل الدخول</button>
      </div>
    </header>

    <main id="main-col">
      <div id="page-content"></div>
    </main>

    <footer id="site-footer">
      <div class="visitor-counter">
        <span class="vc-label">عدد زوار الموقع</span>
        <img src="https://visitor-badge.laobi.icu/badge?page_id=saidelghysh.zad-elakhera&left_text=Visitors&left_color=0c1424&right_color=c9a961&format=true"
             alt="عداد زوار الموقع" loading="lazy" onerror="this.style.display='none'; document.getElementById('vc-fallback').style.display='inline';">
        <span id="vc-fallback" style="display:none; color:var(--text-muted); font-size:.78rem;">تعذّر تحميل العداد الآن</span>
      </div>
      <div class="footer-note">زاد الآخرة 🕌 صدقة جارية لوجه الله تعالى</div>
    </footer>

    <div id="player-bar">
      <div class="p-track">
        <img id="pt-cover" src="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23131f36%22/><text x=%2250%22 y=%2262%22 font-size=%2245%22 text-anchor=%22middle%22>🕌</text></svg>" alt="">
        <div>
          <div class="p-title" id="pt-title">لم يتم اختيار مقطع</div>
          <div class="p-sub" id="pt-sub">زاد الآخرة</div>
        </div>
      </div>
      <div class="p-center">
        <div class="p-controls">
          <button id="p-shuffle">🔀</button>
          <button id="p-prev">⏮</button>
          <button id="p-play">▶</button>
          <button id="p-next">⏭</button>
          <button id="p-repeat">🔁</button>
        </div>
        <div class="p-progress">
          <span id="p-cur">00:00</span>
          <div class="p-bar" id="p-bar"><div class="p-bar-fill" id="p-bar-fill"></div></div>
          <span id="p-dur">00:00</span>
        </div>
      </div>
      <div class="p-right">
        <span>🔊</span>
        <input type="range" id="p-volume" min="0" max="100" value="80">
        <button id="p-settings">⚙️</button>
        <button id="p-queue">قائمة التشغيل ▾</button>
      </div>
    </div>
  `;
  document.body.prepend(shell);
}

function el(id){ return document.getElementById(id); }
function on(id, evt, fn){ const node = el(id); if(node) node[evt] = fn; }

function fmtTime(s){
  if(!isFinite(s) || isNaN(s)) return "00:00";
  const m = Math.floor(s/60), ss = Math.floor(s%60);
  return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}

function playQueue(queue, index){
  currentQueue = queue;
  currentIndex = index;
  const item = queue[index];
  audioEl.src = item.url;
  audioEl.load();

  if(el("pt-title")) el("pt-title").textContent = item.title;
  if(el("pt-sub")) el("pt-sub").textContent = "⏳ جارٍ التحميل... " + (item.subtitle || "زاد الآخرة");
  if(el("p-play")) el("p-play").textContent = "⏳";

  // نمهل الملف حتى 25 ثانية قبل ما نعتبره فشل (بعض الملفات كبيرة الحجم والتحميل من الأرشيف قد يبطئ أحيانًا)
  let settled = false;
  const onPlaying = ()=>{
    settled = true;
    if(el("pt-sub")) el("pt-sub").textContent = item.subtitle || "زاد الآخرة";
    if(el("p-play")) el("p-play").textContent = "⏸";
    audioEl.removeEventListener("playing", onPlaying);
  };
  audioEl.addEventListener("playing", onPlaying);

  const playPromise = audioEl.play();
  if(playPromise && playPromise.catch){
    playPromise.catch(()=>{
      // ما نستعجلش برسالة الفشل - ممكن يكون لسه بيحمّل
    });
  }

  setTimeout(()=>{
    if(!settled && audioEl.src === item.url && audioEl.paused){
      showToast("الملف بياخد وقت أطول من المتوقع... تقدر تفتحه مباشرة من زر ↗ بجانبه");
      if(el("pt-sub")) el("pt-sub").textContent = item.subtitle || "زاد الآخرة";
      if(el("p-play")) el("p-play").textContent = "▶";
    }
  }, 25000);
}

function playSingle(title, subtitle, url){
  playQueue([{title, subtitle, url}], 0);
}

function playNext(){
  if(currentIndex < currentQueue.length-1){ playQueue(currentQueue, currentIndex+1); }
}
function playPrev(){
  if(currentIndex > 0){ playQueue(currentQueue, currentIndex-1); }
}

function togglePlay(){
  if(audioEl.paused){
    audioEl.play().catch(()=> showToast("تعذّر تشغيل الصوت الآن"));
    if(el("p-play")) el("p-play").textContent = "⏸";
  } else {
    audioEl.pause();
    if(el("p-play")) el("p-play").textContent = "▶";
  }
}

function showToast(msg){
  let t = document.getElementById("zad-toast");
  if(!t){
    t = document.createElement("div");
    t.id = "zad-toast";
    t.style.cssText = "position:fixed;bottom:110px;left:50%;transform:translateX(-50%);background:#131f36;color:#f1eee6;padding:10px 20px;border-radius:20px;border:1px solid #c9a961;font-size:.85rem;z-index:9999;transition:opacity .3s;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>{ t.style.opacity = "0"; }, 2500);
}

function wirePlayer(){
  on("p-play","onclick", togglePlay);
  on("p-next","onclick", playNext);
  on("p-prev","onclick", playPrev);
  const vol = el("p-volume");
  if(vol) vol.oninput = (e)=>{ audioEl.volume = e.target.value/100; };
  audioEl.volume = 0.8;

  audioEl.addEventListener("timeupdate", ()=>{
    if(el("p-cur")) el("p-cur").textContent = fmtTime(audioEl.currentTime);
    if(el("p-dur")) el("p-dur").textContent = fmtTime(audioEl.duration);
    const pct = audioEl.duration ? (audioEl.currentTime/audioEl.duration*100) : 0;
    if(el("p-bar-fill")) el("p-bar-fill").style.width = pct+"%";
  });
  const pbar = el("p-bar");
  if(pbar) pbar.addEventListener("click", (e)=>{
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (rect.right - e.clientX) / rect.width; // RTL
    if(audioEl.duration) audioEl.currentTime = ratio * audioEl.duration;
  });
  audioEl.addEventListener("ended", ()=>{
    if(currentIndex < currentQueue.length-1) playNext();
    else if(el("p-play")) el("p-play").textContent="▶";
  });

  // راديو القرآن الكريم المباشر - عدة روابط HTTPS يتم تجربتها تلقائيًا واحدًا وراء الآخر
  const RADIO_SOURCES = [
    "https://backup.qurango.net/radio/mix",
    "https://backup.qurango.net/radio/tarateel",
    "https://stream.radiojar.com/8s5u5tpdtwzuv",
  ];
  let radioPlaying = false;
  let radioSourceIndex = 0;

  function tryRadioSource(i){
    if(i >= RADIO_SOURCES.length){
      console.error("زاد الآخرة: فشلت كل روابط البث المباشر المتاحة.");
      showToast("تعذّر الاتصال بالبث المباشر حاليًا، حاول لاحقًا");
      radioPlaying = false;
      if(el("radio-play")) el("radio-play").textContent = "▶";
      if(el("p-play")) el("p-play").textContent = "▶";
      return;
    }
    radioSourceIndex = i;
    console.log("زاد الآخرة: تجربة رابط البث رقم", i, RADIO_SOURCES[i]);
    audioEl.src = RADIO_SOURCES[i];
    audioEl.load();
    const playPromise = audioEl.play();
    if(playPromise && playPromise.catch){
      playPromise.catch(err=>{
        console.error("زاد الآخرة: فشل تشغيل الرابط", RADIO_SOURCES[i], err);
        tryRadioSource(i+1);
      });
    }
    if(el("pt-title")) el("pt-title").textContent = "إذاعة القرآن الكريم";
    if(el("pt-sub")) el("pt-sub").textContent = "بث مباشر";
  }

  on("radio-play","onclick", ()=>{
    if(!radioPlaying){
      radioPlaying = true;
      currentQueue = []; currentIndex = -1; // البث المباشر مش جزء من قائمة تشغيل عادية
      tryRadioSource(0);
      if(el("radio-play")) el("radio-play").textContent = "⏸";
      if(el("p-play")) el("p-play").textContent = "⏸";
    } else {
      audioEl.pause();
      if(el("radio-play")) el("radio-play").textContent = "▶";
      if(el("p-play")) el("p-play").textContent = "▶";
      radioPlaying = false;
    }
  });

  // لو حصل عطل فجأة أثناء التشغيل (انقطاع الشبكة أو تعطل السيرفر) جرّب الرابط التالي تلقائيًا
  audioEl.addEventListener("error", ()=>{
    console.error("زاد الآخرة: حدث خطأ audio element", audioEl.error);
    if(radioPlaying) tryRadioSource(radioSourceIndex+1);
  });

  on("listen-adhan-btn","onclick", ()=>{ location.href = "adhan.html"; });

  on("theme-toggle","onclick", ()=>{ document.body.classList.toggle("light-mode"); });
  on("login-btn","onclick", ()=>{ showToast("تسجيل الدخول قريبًا بإذن الله"); });
}

function initPrayerTimes(){
  const saved = localStorage.getItem("zad_location");
  if(saved){
    try{
      const loc = JSON.parse(saved);
      if(loc && typeof loc.lat === "number" && typeof loc.lng === "number"){
        loadPrayerTimes(loc.lat, loc.lng, loc.label || "موقع محفوظ");
        return;
      }
    }catch(e){ /* تجاهل بيانات تالفة والانتقال لتحديد الموقع تلقائيًا */ }
  }
  if(!navigator.geolocation){
    loadPrayerTimes(30.0444, 31.2357, "القاهرة (افتراضي)");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => loadPrayerTimes(pos.coords.latitude, pos.coords.longitude, "موقعك الحالي (GPS)"),
    () => loadPrayerTimes(30.0444, 31.2357, "القاهرة (افتراضي)")
  );
}

function loadPrayerTimes(lat, lng, cityLabel){
  if(!document.getElementById("prayer-list")) return; // اللوحة غير موجودة في هذه الصفحة
  const method = localStorage.getItem("zad_calc_method") || "4";
  const url = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now()/1000)}?latitude=${lat}&longitude=${lng}&method=${method}`;
  fetch(url).then(r=>r.json()).then(data=>{
    const t = data.data.timings;
    if(document.getElementById("prayer-location")) document.getElementById("prayer-location").textContent = cityLabel;
    const list = document.getElementById("prayer-list");
    if(!list) return;
    list.innerHTML = "";
    const now = new Date();
    let nextName = null, nextDate = null;
    ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"].forEach(key=>{
      const timeStr = t[key].split(" ")[0];
      const [h,m] = timeStr.split(":").map(Number);
      const d = new Date(); d.setHours(h,m,0,0);
      if(!nextDate && d > now){ nextDate = d; nextName = key; }

      const row = document.createElement("div");
      row.className = "prayer-row";
      row.dataset.key = key;
      row.innerHTML = `<span class="name">${PRAYER_NAMES[key]}</span><span class="time">${timeStr}</span>`;
      list.appendChild(row);
    });
    if(!nextDate){ // بعد العشاء -> الفجر غدًا
      nextName = "Fajr";
      nextDate = new Date(); nextDate.setDate(nextDate.getDate()+1);
      const [h,m] = t.Fajr.split(" ")[0].split(":").map(Number);
      nextDate.setHours(h,m,0,0);
    }
    const nextRow = list.querySelector(`[data-key="${nextName}"]`);
    if(nextRow) nextRow.classList.add("active");
    if(el("next-prayer-name")) el("next-prayer-name").textContent = PRAYER_NAMES[nextName];
    if(el("countdown-label")) el("countdown-label").textContent = `الوقت المتبقي لصلاة ${PRAYER_NAMES[nextName]}`;

    setInterval(()=>{
      const diff = nextDate - new Date();
      const val = diff<=0 ? "00:00:00" : (()=>{
        const hh = String(Math.floor(diff/3600000)).padStart(2,"0");
        const mm = String(Math.floor(diff/60000)%60).padStart(2,"0");
        const ss = String(Math.floor(diff/1000)%60).padStart(2,"0");
        return `${hh}:${mm}:${ss}`;
      })();
      if(el("countdown-val")) el("countdown-val").textContent = val;
    }, 1000);
  }).catch(()=>{
    const l = document.getElementById("prayer-list");
    if(l) l.innerHTML = `<div class="empty-msg">تعذّر تحميل المواقيت (تحقق من الاتصال بالإنترنت)</div>`;
  });
}

function surahAudioUrl(reciterId, surahNum){
  const n = String(surahNum).padStart(3,"0");
  return `https://server8.mp3quran.net/${reciterId}/${n}.mp3`;
}

/* ---------- المفضلة (localStorage) ---------- */
function getFavorites(){
  try{
    return JSON.parse(localStorage.getItem("zad_favorites") || "[]");
  }catch(e){ return []; }
}
function saveFavorites(list){
  localStorage.setItem("zad_favorites", JSON.stringify(list));
}
function isFavorite(url){
  return getFavorites().some(f=>f.url === url);
}
function toggleFavorite(item){
  const list = getFavorites();
  const idx = list.findIndex(f=>f.url === item.url);
  if(idx >= 0){
    list.splice(idx,1);
    showToast("تم الحذف من المفضلة");
  } else {
    list.push(item);
    showToast("تمت الإضافة إلى المفضلة 💚");
  }
  saveFavorites(list);
}

document.addEventListener("DOMContentLoaded", ()=>{
  buildShell();
  wirePlayer();
  initPrayerTimes();
  if(typeof renderPage === "function") renderPage();
});
