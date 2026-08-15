/* =========================================================
   زاد الآخرة - التخطيط المشترك لكل الصفحات
   ========================================================= */

const NAV_ITEMS = [
  {href:"index.html", label:"الرئيسية", icon:"🏠"},
  {href:"quran.html", label:"القرآن الكريم", icon:"📖"},
  {href:"tilawat.html", label:"المكتبة الصوتية", icon:"🎧"},
  {href:"tilawat.html#recitations", label:"التلاوات", icon:"🎙️"},
  {href:"external.html", label:"حفلات خارجية", icon:"🔊"},
  {href:"ibtihalat.html", label:"الابتهالات", icon:"⭐"},
  {href:"khawatir.html", label:"خواطر الشعراوي", icon:"✍️"},
  {href:"azkar.html", label:"الأذكار", icon:"📿"},
  {href:"adhan.html", label:"الأذان", icon:"🕌"},
  {href:"sadaqa.html", label:"صدقة جارية", icon:"💚"},
  {href:"favorites.html", label:"المفضلة", icon:"🤍"},
  {href:"settings.html", label:"الإعدادات", icon:"⚙️"},
];

function buildShell(){
  const shell = document.createElement("div");
  shell.id = "app-shell";

  const current = location.pathname.split("/").pop() || "index.html";

  shell.innerHTML = `
    <aside id="nav-col">
      <a href="index.html" class="brand">
        <div>
          <h1>زاد الآخرة</h1>
          <span>خير الزاد ليوم المعاد</span>
        </div>
        <div class="brand-icon">🕌</div>
      </a>
      <nav class="nav-links">
        ${NAV_ITEMS.map(it=>`
          <a href="${it.href}" class="${current===it.href.split('#')[0] ? 'active':''}">
            <span>${it.label}</span>
            <span class="nav-ico">${it.icon}</span>
          </a>`).join("")}
      </nav>
    </aside>

    <main id="main-col">
      <div id="topbar">
        <button class="top-icon-btn" id="theme-toggle">🌙</button>
        <button class="top-icon-btn" id="share-btn">🔗</button>
        <div class="search-box">
          <input id="global-search" placeholder="ابحث في زاد الآخرة...">
          <span>🔍</span>
        </div>
      </div>
      <div id="page-content"></div>
    </main>

    <aside id="prayer-col">
      <div class="panel" id="prayer-panel">
        <h3>مواقيت الصلاة</h3>
        <div class="sub" id="prayer-location">جارٍ تحديد الموقع...</div>
        <div class="prayer-list" id="prayer-list">
          <div class="empty-msg">جارٍ تحميل المواقيت...</div>
        </div>
        <div class="countdown-box">
          <div class="lbl" id="countdown-label">الوقت المتبقي للصلاة القادمة</div>
          <div class="val" id="countdown-val">--:--:--</div>
        </div>
      </div>

      <div class="panel radio-panel">
        <span class="live-tag"><span class="dot"></span> مباشر</span>
        <h3 style="margin-top:8px">إذاعة القرآن الكريم</h3>
        <div class="sub">استمع إلى البث المباشر لإذاعة القرآن الكريم</div>
        <div class="radio-controls">
          <button id="radio-play">▶</button>
          <div class="radio-progress"><i></i></div>
          <span>🔊</span>
        </div>
      </div>

      <div class="panel">
        <div class="adhan-card">
          <div class="info">
            <div class="lbl">الأذان الآن</div>
            <div class="val" id="next-prayer-name">--</div>
          </div>
          <button class="adhan-btn" id="listen-adhan-btn">استمع للأذان</button>
        </div>
      </div>
    </aside>
  `;
  document.body.prepend(shell);

  const bar = document.createElement("div");
  bar.id = "player-bar";
  bar.innerHTML = `
    <div class="player-track">
      <img id="pt-img" src="https://commons.wikimedia.org/wiki/Special:FilePath/Old%20Quran.jpg" alt="">
      <div>
        <div class="t1" id="pt-title">لم يتم اختيار مقطع</div>
        <div class="t2" id="pt-sub">زاد الآخرة</div>
      </div>
    </div>
    <div class="player-center">
      <div class="player-controls">
        <button id="p-shuffle">🔀</button>
        <button id="p-prev">⏮</button>
        <button class="play-main" id="p-play">▶</button>
        <button id="p-next">⏭</button>
        <button id="p-repeat">🔁</button>
      </div>
      <div class="player-seek">
        <span id="p-cur">00:00</span>
        <div class="bar" id="p-bar"><i id="p-bar-fill"></i></div>
        <span id="p-dur">00:00</span>
      </div>
    </div>
    <div class="player-extra">
      <span>🔊</span>
      <input type="range" id="p-volume" min="0" max="100" value="80">
    </div>
  `;
  document.body.appendChild(bar);

  const toast = document.createElement("div");
  toast.id = "toast"; toast.className="toast";
  document.body.appendChild(toast);
}

/* ---------------- Global Audio Player ---------------- */
const audioEl = new Audio();
let currentQueue = [];
let currentIndex = -1;

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2200);
}

function fmtTime(sec){
  if(!isFinite(sec)) return "00:00";
  const m = Math.floor(sec/60), s = Math.floor(sec%60);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function playQueue(queue, index){
  currentQueue = queue; currentIndex = index;
  const item = currentQueue[currentIndex];
  if(!item) return;
  audioEl.src = item.url;
  audioEl.play().catch(()=>showToast("تعذّر تشغيل الصوت الآن"));
  document.getElementById("pt-title").textContent = item.title;
  document.getElementById("pt-sub").textContent = item.subtitle || "زاد الآخرة";
  document.getElementById("p-play").textContent = "⏸";
}

function playSingle(title, subtitle, url){
  playQueue([{title,subtitle,url}], 0);
}

function togglePlay(){
  if(!audioEl.src){ showToast("اختر مقطعًا للاستماع أولاً"); return; }
  if(audioEl.paused){ audioEl.play(); document.getElementById("p-play").textContent="⏸"; }
  else { audioEl.pause(); document.getElementById("p-play").textContent="▶"; }
}

function playNext(){
  if(currentIndex < currentQueue.length-1){ playQueue(currentQueue, currentIndex+1); }
}
function playPrev(){
  if(currentIndex > 0){ playQueue(currentQueue, currentIndex-1); }
}

function wirePlayer(){
  document.getElementById("p-play").onclick = togglePlay;
  document.getElementById("p-next").onclick = playNext;
  document.getElementById("p-prev").onclick = playPrev;
  document.getElementById("p-volume").oninput = (e)=>{ audioEl.volume = e.target.value/100; };
  audioEl.volume = 0.8;

  audioEl.addEventListener("timeupdate", ()=>{
    document.getElementById("p-cur").textContent = fmtTime(audioEl.currentTime);
    document.getElementById("p-dur").textContent = fmtTime(audioEl.duration);
    const pct = audioEl.duration ? (audioEl.currentTime/audioEl.duration*100) : 0;
    document.getElementById("p-bar-fill").style.width = pct+"%";
  });
  document.getElementById("p-bar").addEventListener("click", (e)=>{
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (rect.right - e.clientX) / rect.width; // RTL
    if(audioEl.duration) audioEl.currentTime = ratio * audioEl.duration;
  });
  audioEl.addEventListener("ended", ()=>{
    if(currentIndex < currentQueue.length-1) playNext();
    else document.getElementById("p-play").textContent="▶";
  });

  // راديو القرآن الكريم المباشر (إذاعة القرآن الكريم - القاهرة)
  const RADIO_URL = "https://stream.radiojar.com/0tpy1h0kxtzuv";
  let radioPlaying = false;
  document.getElementById("radio-play").onclick = ()=>{
    if(!radioPlaying){
      playSingle("إذاعة القرآن الكريم", "بث مباشر", RADIO_URL);
      document.getElementById("radio-play").textContent = "⏸";
      radioPlaying = true;
    } else {
      audioEl.pause();
      document.getElementById("radio-play").textContent = "▶";
      document.getElementById("p-play").textContent = "▶";
      radioPlaying = false;
    }
  };

  document.getElementById("listen-adhan-btn").onclick = ()=>{
    location.href = "adhan.html";
  };

  document.getElementById("theme-toggle").onclick = ()=>{
    document.body.classList.toggle("light-mode");
  };
  document.getElementById("share-btn").onclick = ()=>{
    if(navigator.share){ navigator.share({title:document.title, url:location.href}); }
    else { navigator.clipboard.writeText(location.href); showToast("تم نسخ رابط الصفحة"); }
  };
}

/* ---------------- Prayer Times ---------------- */
const PRAYER_NAMES = {Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء"};

function loadPrayerTimes(lat, lng, cityLabel){
  const method = localStorage.getItem("zad_calc_method") || "4";
  const url = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now()/1000)}?latitude=${lat}&longitude=${lng}&method=${method}`;
  fetch(url).then(r=>r.json()).then(data=>{
    const t = data.data.timings;
    document.getElementById("prayer-location").textContent = cityLabel;
    const list = document.getElementById("prayer-list");
    const now = new Date();
    let nextName=null, nextDate=null;
    list.innerHTML = "";
    Object.keys(PRAYER_NAMES).forEach(key=>{
      const timeStr = t[key].split(" ")[0];
      const [h,m] = timeStr.split(":").map(Number);
      const d = new Date(); d.setHours(h,m,0,0);
      if(!nextDate && d > now){ nextDate = d; nextName = key; }
      const row = document.createElement("div");
      row.className = "prayer-row";
      row.innerHTML = `<span class="name">${PRAYER_NAMES[key]}</span><span class="time">${timeStr}</span>`;
      list.appendChild(row);
    });
    if(!nextDate){ // بعد العشاء -> الفجر غدًا
      nextName = "Fajr";
      nextDate = new Date(); nextDate.setDate(nextDate.getDate()+1);
      const [h,m] = t.Fajr.split(" ")[0].split(":").map(Number);
      nextDate.setHours(h,m,0,0);
    }
    document.getElementById("next-prayer-name").textContent = PRAYER_NAMES[nextName];
    document.getElementById("countdown-label").textContent = `الوقت المتبقي لصلاة ${PRAYER_NAMES[nextName]}`;

    setInterval(()=>{
      const diff = nextDate - new Date();
      if(diff<=0){ document.getElementById("countdown-val").textContent="00:00:00"; return; }
      const hh = String(Math.floor(diff/3600000)).padStart(2,"0");
      const mm = String(Math.floor(diff/60000)%60).padStart(2,"0");
      const ss = String(Math.floor(diff/1000)%60).padStart(2,"0");
      document.getElementById("countdown-val").textContent = `${hh}:${mm}:${ss}`;
    }, 1000);
  }).catch(()=>{
    document.getElementById("prayer-list").innerHTML = `<div class="empty-msg">تعذّر تحميل المواقيت (تحقق من الاتصال بالإنترنت)</div>`;
  });
}

function initPrayerTimes(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>loadPrayerTimes(pos.coords.latitude, pos.coords.longitude, "موقعك الحالي"),
      ()=>loadPrayerTimes(21.4225, 39.8262, "مكة المكرمة (افتراضي)"),
      {timeout:6000}
    );
  } else {
    loadPrayerTimes(21.4225, 39.8262, "مكة المكرمة (افتراضي)");
  }
}

/* ---------------- Favorites (localStorage) ---------------- */
function getFavorites(){
  try{ return JSON.parse(localStorage.getItem("zad_favorites")||"[]"); }catch(e){ return []; }
}
function isFavorite(url){
  return getFavorites().some(f=>f.url===url);
}
function toggleFavorite(item){
  let favs = getFavorites();
  if(favs.some(f=>f.url===item.url)){
    favs = favs.filter(f=>f.url!==item.url);
    showToast("تمت الإزالة من المفضلة");
  } else {
    favs.push(item);
    showToast("أُضيف إلى المفضلة 🤍");
  }
  localStorage.setItem("zad_favorites", JSON.stringify(favs));
}

document.addEventListener("DOMContentLoaded", ()=>{
  buildShell();
  wirePlayer();
  initPrayerTimes();
  if(typeof renderPage === "function") renderPage();
});
