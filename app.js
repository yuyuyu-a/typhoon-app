/* 台风实况 - 前端逻辑 */
"use strict";

// ===== 强度配置 =====
const INTENSITY = {
  TD: { name: { zh: "热带低压", en: "Tropical Depression", ja: "熱帯低気圧" }, color: "#5dade2" },
  TS: { name: { zh: "热带风暴", en: "Tropical Storm", ja: "熱帯低気圧" }, color: "#2ecc71" },
  STS: { name: { zh: "强热带风暴", en: "Severe Tropical Storm", ja: "台風" }, color: "#f1c40f" },
  TY: { name: { zh: "台风", en: "Typhoon", ja: "台風" }, color: "#e67e22" },
  STY: { name: { zh: "强台风", en: "Severe Typhoon", ja: "強い台風" }, color: "#e74c3c" },
  SuperTY: { name: { zh: "超强台风", en: "Super Typhoon", ja: "非常に強い台風" }, color: "#9b59b6" },
};

// 风速(m/s) → 等级码 (预报点可能没有 grade 字段时用)
function windToGrade(w) {
  if (w == null) return "TD";
  if (w < 17.2) return "TD";
  if (w < 24.4) return "TS";
  if (w < 32.7) return "STS";
  if (w < 41.5) return "TY";
  if (w < 51.0) return "STY";
  return "SuperTY";
}
function gradeOf(point) {
  return INTENSITY[point.grade] ? point.grade : windToGrade(point.wind);
}
function gradeInfo(g) {
  const info = INTENSITY[g] || INTENSITY.TD;
  const lang = state.lang || "zh";
  return { name: info.name[lang] || info.name.zh, color: info.color };
}

// 风圈 tier: knot 标签 → {tier, color}
const WIND_TIER = {
  "30KTS": { tier: 7, color: "#5dade2", fill: "rgba(93,173,226,0.13)" },
  "50KTS": { tier: 10, color: "#f1c40f", fill: "rgba(241,196,15,0.16)" },
  "64KTS": { tier: 12, color: "#e74c3c", fill: "rgba(231,76,60,0.20)" },
};

// 预报机构代号 → 中文名
const AGENCY_CN = {
  BABJ: "中央气象台",
  RJTD: "日本气象厅",
  PGTW: "美国联合台风警报中心",
};
function agencyCn(code) { return AGENCY_CN[code] || code; }

// ===== 多语言 (i18n) =====
const I18N = {
  zh: {
    _label: "中文",
    title: "台风实况",
    subtitle: "实时路径 · 预报 · 风圈 · 历史",
    dataSource: "数据：中央气象台 CMA（主路径 + 官方预报）· 浙江省水利厅（中/台/日/美 四机构预报，国内直连免外网）",
    updated: "更新于",
    autoRefresh: "自动刷新",
    refresh: "刷新",
    themeTip: "切换白天/夜晚模式",
    loading: "加载中…",
    loadFailed: "加载失败, 请检查网络",
    noRecord: "该年无台风记录",
    countSuffix: "个台风",
    live: "活跃",
    stopped: "已停",
    stopped2: "已停止",
    replay: "回放",
    yearSuffix: " 年",
    legendTitle: "强度等级",
    windTitle: "风圈",
    wind7: "7级",
    wind10: "10级",
    wind12: "12级",
    typhoonNo: "号",
    currentPos: "当前位置",
    forecastBy: "预报",
    hours: "小时",
    baseTime: "基报时",
    level: "等级",
    position: "中心位置",
    pressure: "中心气压",
    wind: "最大风速",
    moveDir: "移动方向",
    moveSpeed: "移动速度",
    latestPos: "最新位置",
    warningTitle: "台风预警",
    warningBody: "当前为",
    warningTail: "中心附近最大风力",
    warningTip: "请相关海域注意防范。",
    loadTip: "加载台风数据…",
    mapAttr: "地图底图 © 高德地图 (AutoNavi) · 台风数据 © 中央气象台",
    north: "北纬",
    east: "东经",
    threePath: "三条路径对比",
    cmpRef: "参考",
    cmpDev: "偏差",
    cmpNoData: "暂无该台风数据",
    cmpFail: "获取失败",
    cmpNetErr: "源不可达（网络限制）",
    cmpNetErrTip: "该源服务器在国外或被网络防火墙拦截，国内部分网络环境无法直接访问。可尝试：①关闭代理/VPN后刷新 ②在代理例外中添加该域名",
    chipFcUnit: "个点",
    chipFc: "预报",
    chipWind: "风圈",
  },
  en: {
    _label: "English",
    title: "Typhoon Live",
    subtitle: "Track · Forecast · Wind Circle · History",
    dataSource: "Source: CMA (track + official forecast)",
    updated: "Updated",
    autoRefresh: "Auto-refresh",
    refresh: "Refresh",
    themeTip: "Toggle day/night theme",
    loading: "Loading…",
    loadFailed: "Load failed, please check network",
    noRecord: "No typhoon records this year",
    countSuffix: "typhoons",
    live: "Active",
    stopped: "Ended",
    stopped2: "Stopped",
    replay: "Replay",
    yearSuffix: "",
    legendTitle: "Intensity Scale",
    windTitle: "Wind Circle",
    wind7: "Force 7",
    wind10: "Force 10",
    wind12: "Force 12",
    typhoonNo: "No.",
    currentPos: "Current Position",
    forecastBy: "Forecast",
    hours: "h",
    baseTime: "Base Time",
    level: "Level",
    position: "Center Position",
    pressure: "Central Pressure",
    wind: "Max Wind",
    moveDir: "Moving Direction",
    moveSpeed: "Moving Speed",
    latestPos: "Latest Position",
    warningTitle: "Typhoon Warning",
    warningBody: "Currently",
    warningTail: "Max wind near center",
    warningTip: "Relevant sea areas, please take precautions.",
    loadTip: "Loading typhoon data…",
    mapAttr: "Map © AutoNavi (Gaode) · Typhoon data © CMA",
    north: "N",
    east: "E",
    threePath: "3-Path Comparison",
    cmpRef: "Ref",
    cmpDev: "Dev",
    cmpNoData: "No data for this storm",
    cmpFail: "Fetch failed",
    cmpNetErr: "Unreachable (network)",
    cmpNetErrTip: "This source is hosted overseas and may be blocked by your network firewall. Try: ①Disable proxy/VPN and refresh ②Add domain to proxy exceptions",
    chipFcUnit: " pts",
    chipFc: "Fcst",
    chipWind: "Wind",
  },
  ja: {
    _label: "日本語",
    title: "台風実況",
    subtitle: "進路・予報・風域・履歴",
    dataSource: "データ元：CMA（主経路+公式予報）· 浙江省水利庁（中/台/日/米 4機関予報、国内直結）",
    updated: "更新",
    autoRefresh: "自動更新",
    refresh: "更新",
    themeTip: "昼/夜モード切替",
    loading: "読み込み中…",
    loadFailed: "読み込み失敗, ネットワークを確認してください",
    noRecord: "該当年の台風記録なし",
    countSuffix: "個の台風",
    live: "活動中",
    stopped: "終了",
    stopped2: "終了",
    replay: "再生",
    yearSuffix: "年",
    legendTitle: "強度階級",
    windTitle: "風域",
    wind7: "7級",
    wind10: "10級",
    wind12: "12級",
    typhoonNo: "号",
    currentPos: "現在位置",
    forecastBy: "予報",
    hours: "時間",
    baseTime: "基準時刻",
    level: "階級",
    position: "中心位置",
    pressure: "中心気圧",
    wind: "最大風速",
    moveDir: "進行方向",
    moveSpeed: "進行速度",
    latestPos: "最新位置",
    warningTitle: "台風警報",
    warningBody: "現在",
    warningTail: "中心付近の最大風力",
    warningTip: "該当海域は警戒してください。",
    loadTip: "台風データを読み込み中…",
    mapAttr: "地図 © 高徳地図 (AutoNavi) · 台風データ © 中央気象台",
    north: "北緯",
    east: "東経",
    threePath: "3経路比較",
    cmpRef: "基準",
    cmpDev: "差",
    cmpNoData: "この台風のデータなし",
    cmpFail: "取得失敗",
    cmpNetErr: "到達不可（ネットワーク）",
    cmpNetErrTip: "このソースは海外にホストされており、ネットワークファイアウォールでブロックされている可能性があります。①プロキシ/VPNをオフにしてリロード ②プロキシ例外にドメインを追加",
    chipFcUnit: "点",
    chipFc: "予報",
    chipWind: "風域",
  },
};
const LANG_KEY = "typhoon-lang";
function t(key) {
  const lang = state.lang || "zh";
  return (I18N[lang] && I18N[lang][key]) || I18N.zh[key] || key;
}
// 台风名按语言选字段: 中文用 name_cn, 英文/日文用 name_en (CMA 数据只有中英文名)
function tyName(ty) {
  const lang = state.lang || "zh";
  return lang === "zh" ? (ty.name_cn || ty.name_en) : (ty.name_en || ty.name_cn);
}
function applyLang(lang) {
  state.lang = lang;
  document.documentElement.setAttribute("data-lang", lang);
  const sel = document.getElementById("langSelect");
  if (sel) sel.value = lang;
}
// 切换语言后全站重渲染
function refreshLangUI() {
  // 静态文本
  document.title = t("title") + " · 实时追踪";
  document.getElementById("hdrTitle").textContent = t("title");
  document.getElementById("hdrSub").textContent = t("subtitle");
  document.getElementById("hdrSrc").textContent = t("dataSource");
  document.getElementById("lblAuto").textContent = t("autoRefresh");
  el.btnRefresh.textContent = t("refresh");
  document.getElementById("btnTheme").title = t("themeTip");
  document.getElementById("loaderText").textContent = t("loadTip");
  // 动态内容
  fillYearSelect();
  buildLegend();
  switchBaseLayer();   // 切换底图地名语言
  renderList();
  el.updated.textContent = `${t("updated")} ${new Date().toLocaleTimeString("zh-CN")}`;
  if (state.typhoons.length) {
    el.hint.textContent = `${state.typhoons.length} ${t("countSuffix")}`;
  }
  // 重渲染当前台风详情 (弹窗/详情卡/预警)
  if (state.currentTyphoon) {
    state.fitOnRender = false;
    renderTyphoon(state.currentTyphoon);
  } else {
    el.loader.hidden = true;
  }
}
function initLang() {
  let lang;
  try { lang = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (!lang || !I18N[lang]) {
    const nav = (navigator.language || "zh").toLowerCase();
    if (nav.startsWith("ja")) lang = "ja";
    else if (nav.startsWith("en")) lang = "en";
    else lang = "zh";
  }
  applyLang(lang);
}

// 16 风向 → 中文
const DIR_CN = {
  N: "北", NNE: "北东北", NE: "东北", ENE: "东东北",
  E: "东", ESE: "东东南", SE: "东南", SSE: "南东南",
  S: "南", SSW: "南西南", SW: "西南", WSW: "西西南",
  W: "西", WNW: "西西北", NW: "西北", NNW: "北西北",
};
function dirCn(d) { return DIR_CN[d] || d || "—"; }

// 风向 → 方位角(度, 北=0 顺时针), 用于外推实时位置
const DIR_BEARING = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};
function dirBearing(d) { return DIR_BEARING[d]; }

// 时间 "202607281200" → "2026-07-28 12:00"
function fmtTime(s) {
  if (!s || s.length < 12) return s || "—";
  return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)} ${s.slice(8,10)}:${s.slice(10,12)}`;
}

// 时间字符串 "202607281200" → 毫秒时间戳(UTC)
function parseTimeMs(s) {
  if (!s || s.length < 12) return null;
  return Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12));
}

// ===== 地理计算 =====
function destination(lat, lon, bearingDeg, distKm) {
  const R = 6371;
  const d = distKm / R;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

// 四象限风圈半径 → 平滑多边形顶点 (北=0°, 顺时针)
function windCircleLatLngs(lat, lon, ne, se, sw, nw, steps = 72) {
  // 象限中心: NE@45, SE@135, SW@225, NW@315；边界取相邻象限均值
  const centers = [
    [0, (nw + ne) / 2], [45, ne], [90, (ne + se) / 2],
    [135, se], [180, (se + sw) / 2], [225, sw],
    [270, (sw + nw) / 2], [315, nw], [360, (nw + ne) / 2],
  ];
  function rAt(theta) {
    for (let i = 0; i < centers.length - 1; i++) {
      if (theta >= centers[i][0] && theta <= centers[i + 1][0]) {
        const t = (theta - centers[i][0]) / (centers[i + 1][0] - centers[i][0]);
        return centers[i][1] + (centers[i + 1][1] - centers[i][1]) * t;
      }
    }
    return 0;
  }
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 360;
    const r = rAt(theta);
    if (r > 0) pts.push(destination(lat, lon, theta, r));
  }
  return pts;
}

// 路径点边框/风圈空心色: 跟随主题 (深色主题用深底色, 浅色主题用浅底色)
function bgStrokeColor() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "#ffffff" : "#0a0e14";
}

// ===== 地图初始化 =====
const map = L.map("map", {
  zoomControl: true,
  attributionControl: true,
  worldCopyJump: true,
}).setView([20, 140], 4);

// ===== 底图系统: 高德地图瓦片 (国内直连, GCJ-02 坐标) + 自建三语地名标注层 =====
// OSM / CartoDB 等境外瓦片源在中国大陆被墙, 故改用高德 (wprd0{1-4}.is.autonavi.com, 免 key, HTTP 200)。
// 高德瓦片为 GCJ-02 偏移坐标, 因此所有台风数据在归一化时统一 WGS-84→GCJ-02 转换, 保证与底图对齐。
// 自建三语地名标注层同样做 GCJ-02 转换, 切语言时跟着切换。
let baseLayer = null;
let labelLayer = null;

function makeBaseLayer() {
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  const tileClass = theme === "light" ? "tiles-light" : "tiles-dark";
  const layer = L.tileLayer(
    "https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x={x}&y={y}&z={z}",
    {
      attribution: "",
      subdomains: "1234",
      maxZoom: 18,
      className: tileClass,
    }
  );
  // 瓦片加载失败重试一次, 避免灰色占位块
  layer.on("tileerror", (e) => {
    const tile = e.tile;
    if (tile && tile.dataset && !tile.dataset.retried) {
      tile.dataset.retried = "1";
      const src = tile.src;
      tile.src = "";
      setTimeout(() => { tile.src = src + (src.includes("?") ? "&" : "?") + "r=" + Math.random(); }, 500);
    }
  });
  return layer;
}
function switchBaseLayer() {
  if (baseLayer) map.removeLayer(baseLayer);
  baseLayer = makeBaseLayer();
  baseLayer.addTo(map);
  baseLayer.bringToBack();
  renderPlaceLabels();
  refreshAttribution();
}
// 渲染多语言地名标注层
function renderPlaceLabels() {
  if (labelLayer) map.removeLayer(labelLayer);
  labelLayer = L.layerGroup();
  const lang = state.lang || "zh";
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  if (!window.PLACE_LABELS) return;
  window.PLACE_LABELS.forEach((p) => {
    const name = p[lang] || p.zh;
    const [gLat, gLon] = wgs84ToGcj02(p.lat, p.lon);
    const icon = L.divIcon({
      className: "place-label",
      html: `<span class="pl pl-${p.type}">${name}</span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([gLat, gLon], { icon, interactive: false, keyboard: false }).addTo(labelLayer);
  });
  labelLayer.addTo(map);
}
function refreshAttribution() {
  map.attributionControl.setPrefix("");
  if (map.attributionControl && map.attributionControl._container) {
    map.attributionControl._container.innerHTML =
      `<span class="attr-text">${t("mapAttr")}</span>`;
  }
}

// 比例尺控件 (公制, 右下)
L.control.scale({ imperial: false, metric: true, position: "bottomright" }).addTo(map);

// 修复 Leaflet 在弹性容器内尺寸不准导致瓦片只渲染一部分的问题
requestAnimationFrame(() => map.invalidateSize());
window.addEventListener("resize", () => map.invalidateSize());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) setTimeout(() => map.invalidateSize(), 100);
});

// ===== 主题切换 (白天/夜晚) =====
const THEME_KEY = "typhoon-theme";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  // 主题切换时重建底图, 同步滤镜类 (保留当前语言 hl)
  switchBaseLayer();
  const btn = document.getElementById("btnTheme");
  if (btn) btn.setAttribute("data-current", theme);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  // 切换主题后重渲染当前台风, 让路径点边框/风圈空心色跟随主题
  if (state.currentTyphoon) {
    state.fitOnRender = false;
    renderTyphoon(state.currentTyphoon);
  }
}
function initTheme() {
  let theme;
  try { theme = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (!theme) {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  applyTheme(theme);
}

// 图层组
const layers = {
  track: L.layerGroup().addTo(map),
  forecast: L.layerGroup().addTo(map),
  wind: L.layerGroup().addTo(map),
  marker: L.layerGroup().addTo(map),
  compare: L.layerGroup().addTo(map),   // (保留兼容) 多源对比已改用 cmpLayers 独立图层
  live: L.layerGroup().addTo(map),  // 实时估算标记 (独立于其它层, 不被 clearLayers 清除)
};
// 多源对比: 每个机构一个独立图层组, 支持单独开关
const cmpLayers = {};
const cmpVisible = {};
function cmpLayer(id) {
  if (!cmpLayers[id]) cmpLayers[id] = L.layerGroup().addTo(map);
  return cmpLayers[id];
}

// ===== 状态 =====
const state = {
  typhoons: [],
  selectedId: null,
  currentTyphoon: null,
  year: new Date().getFullYear(),
  fitOnRender: true,
  autoTimer: null,
  liveTimer: null,
  lang: "zh",
  offline: false,
  replay: { active: false, index: 0, playing: false, timer: null, speed: 1 },
};

// ===== UI 元素 =====
const el = {
  yearSelect: document.getElementById("yearSelect"),
  prevYear: document.getElementById("prevYear"),
  nextYear: document.getElementById("nextYear"),
  list: document.getElementById("tyList"),
  hint: document.getElementById("sidebarHint"),
  loader: document.getElementById("loader"),
  detailCard: document.getElementById("detailCard"),
  warningBanner: document.getElementById("warningBanner"),
  warnText: document.getElementById("warnText"),
  updated: document.getElementById("updated"),
  autoToggle: document.getElementById("autoToggle"),
  btnRefresh: document.getElementById("btnRefresh"),
  legendRows: document.getElementById("legendRows"),
  timeline: document.getElementById("timeline"),
  tlPlay: document.getElementById("tlPlay"),
  tlRange: document.getElementById("tlRange"),
  tlTime: document.getElementById("tlTime"),
  tlSpeed: document.getElementById("tlSpeed"),
  tlLive: document.getElementById("tlLive"),
};

// ===== 图例 =====
function buildLegend() {
  const order = ["TD", "TS", "STS", "TY", "STY", "SuperTY"];
  el.legendRows.innerHTML = order
    .map(
      (g) =>
        `<div class="legend-row"><i style="background:${gradeInfo(g).color}"></i>` +
        `<span>${gradeInfo(g).name} (${g})</span></div>`
    )
    .join("") +
    `<div class="legend-row"><i style="border:1px dashed #00e5ff;background:transparent"></i>` +
    `<span>实时估算位置</span></div>`;
  document.getElementById("legendTitle1").textContent = t("legendTitle");
  document.getElementById("legendTitle2").textContent = t("windTitle");
  const ct = document.getElementById("cmpTitle");
  if (ct) ct.textContent = t("threePath");
  document.getElementById("legendW7").textContent = t("wind7");
  document.getElementById("legendW10").textContent = t("wind10");
  document.getElementById("legendW12").textContent = t("wind12");
}

// ===== 年份选择器 =====
function fillYearSelect() {
  const cur = new Date().getFullYear();
  let html = "";
  for (let y = cur; y >= 2000; y--) {
    html += `<option value="${y}"${y === state.year ? " selected" : ""}>${y}${t("yearSuffix")}</option>`;
  }
  el.yearSelect.innerHTML = html;
}

// ===== 加载台风列表 =====
async function loadList(year) {
  state.year = year;
  el.hint.textContent = t("loading");
  el.list.innerHTML = "";
  try {
    const data = await cmaFetch(cmaListUrl(year), TTL_LIST);
    state.typhoons = normalizeList(data);
    renderList();
    el.updated.textContent = `${t("updated")} ${new Date().toLocaleTimeString("zh-CN")}`;
    // 默认选中活跃台风 (若无活跃, 选最新一个)
    if (state.typhoons.length) {
      const active = state.typhoons.find((t2) => t2.state === "start");
      const target = active || state.typhoons[0];
      selectTyphoon(target.id, { fit: true });
    }
  } catch (e) {
    el.hint.textContent = t("loadFailed");
  }
}

function renderList() {
  if (!state.typhoons.length) {
    el.hint.textContent = t("noRecord");
    return;
  }
  el.hint.textContent = `${state.typhoons.length} ${t("countSuffix")}`;
  el.list.innerHTML = state.typhoons
    .map((ty) => {
      const live = ty.state === "start";
      const main = tyName(ty);
      const sub = state.lang === "zh" ? ty.name_en : (ty.name_cn || ty.name_en);
      return `<li class="ty-item${ty.id === state.selectedId ? " active" : ""}" data-id="${ty.id}">
        <span class="ty-num">${ty.num}</span>
        <div class="ty-main">
          <div class="ty-name">${main}</div>
          <div class="ty-en">${sub}</div>
        </div>
        <span class="ty-state ${live ? "live" : "done"}">${live ? t("live") : t("stopped")}</span>
      </li>`;
    })
    .join("");
  el.list.querySelectorAll(".ty-item").forEach((node) => {
    node.addEventListener("click", () => {
      const id = Number(node.dataset.id);
      selectTyphoon(id, { fit: true });
    });
  });
}

// ===== 选中并加载详情 =====
async function selectTyphoon(id, opts = {}) {
  state.selectedId = id;
  state.fitOnRender = !!opts.fit;
  el.loader.hidden = false;
  document.getElementById("loaderText").textContent = t("loadTip");
  // 高亮列表
  el.list.querySelectorAll(".ty-item").forEach((n) =>
    n.classList.toggle("active", Number(n.dataset.id) === id)
  );
  try {
    const data = await cmaFetch(cmaViewUrl(id), TTL_DETAIL);
    const ty = normalizeTyphoon(data);
    if (!ty) throw new Error("empty");
    state.currentTyphoon = ty;
    renderTyphoon(ty);
    initTimeline(ty);
  } catch (e) {
    el.loader.hidden = true;
  }
}

// ===== 渲染台风 =====
function clearLayers() {
  layers.track.clearLayers();
  layers.forecast.clearLayers();
  layers.wind.clearLayers();
  layers.marker.clearLayers();
  Object.values(cmpLayers).forEach((l) => l.clearLayers());
}

// ===== 实时估算标记 (两次官方播报之间持续外推移动) =====
let liveMarker = null, liveConnector = null;
// 基于官方最新定位 + 航向/移速, 外推"当前"实时估算位置
function estimateCurrent(ty) {
  const pts = ty.points;
  if (!pts || !pts.length) return null;
  const last = pts[pts.length - 1];
  const bear = dirBearing(last.moveDir);
  const speed = Number(last.moveSpeed) || 0; // km/h
  if (bear == null || !speed) return { lat: last.lat, lon: last.lon, fromObs: true, obsTime: last.time };
  const tObs = parseTimeMs(last.time);
  if (!tObs) return { lat: last.lat, lon: last.lon, fromObs: true, obsTime: last.time };
  let dtH = (Date.now() - tObs) / 3600000;
  if (dtH < 0) dtH = 0;
  if (dtH > 72) dtH = 72; // 超过 3 天不再外推, 防止漂移过大
  const [elat, elon] = destination(last.lat, last.lon, bear, speed * dtH);
  return { lat: elat, lon: elon, ageH: dtH, fromObs: false, obsTime: last.time };
}
// 绘制/重建实时估算标记与连线 (renderTyphoon 时调用)
function updateLiveEstimate(ty) {
  layers.live.clearLayers();
  liveMarker = null; liveConnector = null;
  if (!ty || ty.state !== "start") return;
  const est = estimateCurrent(ty);
  if (!est) return;
  const last = ty.points[ty.points.length - 1];
  if (!est.fromObs) {
    liveConnector = L.polyline([[last.lat, last.lon], [est.lat, est.lon]], {
      color: "#00e5ff", weight: 2, opacity: 0.6, dashArray: "3 6", interactive: false,
    }).addTo(layers.live);
  }
  const icon = L.divIcon({
    className: "live-marker live-est",
    html: '<div class="live-ring"></div><div class="live-ring live-ring-2"></div><div class="live-core"></div>',
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
  liveMarker = L.marker([est.lat, est.lon], { icon, interactive: false }).addTo(layers.live).bindPopup(
    '<div class="popup-title">📡 实时估算位置</div>' +
    `<div class="popup-row">估算: <b>${est.lat.toFixed(2)}°, ${est.lon.toFixed(2)}°</b></div>` +
    `<div class="popup-row">官方定位: <b>${last.lat.toFixed(1)}°, ${last.lon.toFixed(1)}°</b></div>` +
    (est.obsTime ? `<div class="popup-row">官方时间: <b>${fmtTime(est.obsTime)}</b></div>` : "") +
    (est.ageH != null ? `<div class="popup-row">外推时长: <b>${est.ageH.toFixed(1)}</b> 小时</div>` : "") +
    '<div class="popup-row" style="opacity:.7">基于航向/移速外推, 仅供参考</div>'
  );
}
// 每 3 秒平滑移动估算标记 (不重建, 动画不中断)
function tickLiveEstimate() {
  if (state.replay.active) return; // 回放时不移动实时估算标记
  if (!state.currentTyphoon || state.currentTyphoon.state !== "start") return;
  const est = estimateCurrent(state.currentTyphoon);
  if (!est) return;
  const last = state.currentTyphoon.points[state.currentTyphoon.points.length - 1];
  if (!liveMarker) { updateLiveEstimate(state.currentTyphoon); return; }
  liveMarker.setLatLng([est.lat, est.lon]);
  if (liveConnector) liveConnector.setLatLngs([[last.lat, last.lon], [est.lat, est.lon]]);
}
function startLiveTick() {
  if (state.liveTimer) clearInterval(state.liveTimer);
  state.liveTimer = setInterval(tickLiveEstimate, 3000);
}

function renderTyphoon(ty, curIndex) {
  clearLayers();
  layers.live.clearLayers(); // 回放时清掉实时估算标记
  if (!ty || !ty.points || !ty.points.length) {
    el.loader.hidden = true;
    return;
  }
  const pts = ty.points;
  const n = pts.length;
  const cur = (curIndex == null) ? n - 1 : Math.min(Math.max(0, curIndex | 0), n - 1);
  const atEnd = cur === n - 1;
  const live = ty.state === "start";
  const head = pts[cur];
  const lastGrade = gradeOf(head);

  // --- 历史路径: 分段按强度着色 (只画到 cur) ---
  for (let i = 0; i < cur; i++) {
    const g = gradeOf(pts[i]);
    const color = gradeInfo(g).color;
    L.polyline(
      [[pts[i].lat, pts[i].lon], [pts[i + 1].lat, pts[i + 1].lon]],
      { color, weight: 3.5, opacity: 0.95 }
    ).addTo(layers.track);
  }

  // --- 路径点标记 + 弹窗 (只画到 cur) ---
  pts.forEach((p, i) => {
    if (i > cur) return;
    const g = gradeOf(p);
    const isHead = i === cur;
    const color = gradeInfo(g).color;
    if (isHead) {
      // 回放头: 醒目青环 (不论是否最新点)
      L.circleMarker([p.lat, p.lon], {
        radius: 6, color: "#00e5ff", weight: 2.5,
        fillColor: color, fillOpacity: 1,
      }).addTo(layers.marker).bindPopup(popupHtml(p, ty, false));
    } else {
      L.circleMarker([p.lat, p.lon], {
        radius: 3.5, color: bgStrokeColor(), weight: 1,
        fillColor: color, fillOpacity: 1,
      }).addTo(layers.marker).bindPopup(popupHtml(p, ty, false));
    }
  });

  // --- 预报路径 (虚线, 仅最新点 atEnd 时绘制) ---
  if (atEnd) {
    const agencies = Object.keys(ty.forecast || {});
    agencies.forEach((ag) => {
      const fc = ty.forecast[ag];
      if (!fc || !fc.length) return;
      const pathPts = [{ lat: head.lat, lon: head.lon, grade: lastGrade, wind: head.wind, time: head.time, lead: 0 }];
      fc.forEach((f) => pathPts.push(f));
      for (let i = 0; i < pathPts.length - 1; i++) {
        const a = pathPts[i], b = pathPts[i + 1];
        const g = gradeOf(b);
        L.polyline(
          [[a.lat, a.lon], [b.lat, b.lon]],
          { color: gradeInfo(g).color, weight: 2, opacity: 0.8, dashArray: "5 5" }
        ).addTo(layers.forecast);
      }
      // 预报点标记 (空心)
      fc.forEach((f) => {
        const g = gradeOf(f);
        L.circleMarker([f.lat, f.lon], {
          radius: 3,
          color: gradeInfo(g).color,
          weight: 1.5,
          fillColor: bgStrokeColor(),
          fillOpacity: 1,
        })
          .addTo(layers.forecast)
          .bindPopup(forecastPopupHtml(f, ag, ty));
      });
    });
  }

  // --- 风圈 (回放头位置的四象限) ---
  renderWindCircles(head);

  // --- 详情卡 + 预警 ---
  updateDetailCard(head, ty, state.replay.active);
  updateWarning(head, ty, live && atEnd);

  // --- 视图适配 (仅首次) ---
  if (state.fitOnRender) {
    const all = [[head.lat, head.lon]];
    pts.forEach((p, i) => { if (i <= cur) all.push([p.lat, p.lon]); });
    if (atEnd) Object.keys(ty.forecast || {}).forEach((ag) => (ty.forecast[ag] || []).forEach((f) => all.push([f.lat, f.lon])));
    map.fitBounds(L.latLngBounds(all), { padding: [40, 40], maxZoom: 7 });
  }

  // --- 多源对比 + 实时估算: 仅在最新点且非回放时 ---
  if (atEnd && !state.replay.active) {
    loadCompareSources(ty);
    updateLiveEstimate(ty);
  }

  el.loader.hidden = true;
}

// ===== 多源对比注册表 (可插拔) =====
// 每个源: id, 名称(多语), 颜色, 虚线样式, 是否需要 key, 是否启用,
//   load(cmaTy, key) → { name, track:[{lat,lon,time?,grade?,isNow?}], forecast:[{lat,lon,lead?,time?}] } | null
// 新增数据源只需往此数组里加一项, 渲染与对比面板会自动适配。

// ===== 浙江省水利厅台风 API (国内政府源, 多机构预报聚合) =====
// 免 key / JSON 直出 / CORS `*`; 单接口聚合 中国·中国台湾·日本·美国 四家预报路径
// 经国内域名直连, 无需外网 (绕开 JMA/EONET 被墙问题); 仅含当前活跃台风
// 列表: /Api/TyhoonActivity (站点拼写 bug: Tyhoon 漏 p)  详情: /Api/TyphoonInfo/{tfid}
const ZJ_BASE = "https://typhoon.slt.zj.gov.cn";
const ZJ_AGENCIES = ["中国", "中国台湾", "日本", "美国"];
const _zjCache = new Map(); // num -> { t, v }

async function zjFetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("ZJ_HTTP_" + res.status);
  const text = await res.text();
  if (!text || text.length < 20) throw new Error("ZJ_EMPTY");
  return text;
}

// 解析浙江详情 → { points:[历史实况], forecasts:{机构:[预报路径点]} }
function parseZjDetail(detail) {
  const points = (detail.points || []).map((p) => ({
    time: p.time, lat: +p.lat, lon: +p.lng,
    strong: p.strong || "", power: +p.power || 0,
    speed: +p.speed || 0, pressure: +p.pressure || 0,
    movedirection: p.movedirection || "", movespeed: +p.movespeed || 0,
    forecast: p.forecast || [],  // 保留内嵌的多机构预报 (每个点含 forecast[])
  }));
  const last = points[points.length - 1];
  const forecasts = {};
  ZJ_AGENCIES.forEach((ag) => {
    const fc = last && last.forecast ? (last.forecast.find((f) => f.tm === ag) || null) : null;
    if (!fc || !fc.forecastpoints || !fc.forecastpoints.length) { forecasts[ag] = []; return; }
    // 路径 = 最新实况点 + 该机构未来预报点
    const pts = fc.forecastpoints.map((fp) => ({
      time: fp.time, lat: +fp.lat, lon: +fp.lng,
      strong: fp.strong || "", power: +fp.power || 0,
      speed: +fp.speed || 0, pressure: +fp.pressure || 0,
    }));
    forecasts[ag] = [last, ...pts];
  });
  return { points, forecasts };
}

async function fetchZjDetail(cmaTy) {
  const now = Date.now();
  const key = "num:" + cmaTy.num;
  if (_zjCache.has(key)) {
    const c = _zjCache.get(key);
    if (now - c.t < 5 * 60 * 1000) return c.v; // 5 分钟缓存 (中/台/日/美 四家源共享, 避免重复拉取)
  }
  // 1) 列表匹配 tfid
  const list = JSON.parse(await zjFetchText(`${ZJ_BASE}/Api/TyhoonActivity`));
  const ename = (cmaTy.name_en || "").trim().toUpperCase();
  const item = (list || []).find((t) => {
    if (ename && (t.enname || "").trim().toUpperCase() === ename) return true;
    return t.tfid && cmaTy.num && String(t.tfid).slice(-4) === String(cmaTy.num).slice(-4);
  });
  if (!item) { _zjCache.set(key, { t: now, v: null }); return null; } // 该台风不在浙江列表(多为已停编), 视为无数据
  // 2) 详情 → 解析 + 转 GCJ-02 (与高德底图对齐)
  const detail = JSON.parse(await zjFetchText(`${ZJ_BASE}/Api/TyphoonInfo/${item.tfid}`));
  const parsed = parseZjDetail(detail);
  [...parsed.points, ...Object.values(parsed.forecasts).flat()].forEach(toGcj);
  _zjCache.set(key, { t: now, v: parsed });
  return parsed;
}

// 为某机构生成对比源 (forecastOnly 模式: 只画预报线, 不重复画实况)
function makeZjSource(id, nameObj, color, dash, agency) {
  return {
    id, name: nameObj, color, dash,
    needKey: false, enabled: true,
    async load(cmaTy) {
      const parsed = await fetchZjDetail(cmaTy);
      if (!parsed) return null;
      const fc = parsed.forecasts[agency] || [];
      if (!fc.length) return null;
      return {
        name: agency,
        track: [],
        forecast: fc.map((f, i) => ({
          lat: f.lat, lon: f.lon, time: f.time,
          grade: gradeOf({ wind: f.speed }),
          wind: f.speed, pressure: f.pressure,
          lead: i, // 0 = 起点(最新实况点)
        })),
        forecastOnly: true,
      };
    },
  };
}

const COMPARE_SOURCES = [
  {
    id: "cma_fc",
    name: { zh: "CMA 官方预报", en: "CMA Forecast", ja: "CMA 予報" },
    color: "#f39c12", dash: "5 5", needKey: false, enabled: true, builtIn: true,
    // CMA 自身预报数据: 从已加载的 cmaTy.forecast 中提取主预报机构(优先 CMA, 其次任一有数据的)
    // 无需额外网络请求, 只要 CMA 主数据加载成功就一定可用
    load(cmaTy) {
      const agencies = Object.keys(cmaTy.forecast || {});
      if (!agencies.length) return null;
      // 优先取 CMA 自身预报, 其次取第一个有数据的机构
      const ag = agencies.find((a) => /cma|中央/i.test(a)) || agencies[0];
      const fc = cmaTy.forecast[ag];
      if (!fc || !fc.length) return null;
      return {
        name: ag,
        track: [],  // 预报源不画独立实况路径(避免与主路径重复)
        forecast: fc.map((f) => ({
          lat: f.lat, lon: f.lon, lead: f.lead, time: f.time,
          grade: f.grade, wind: f.wind, pressure: f.pressure,
        })),
        // 标记这是纯预报源(用于面板特殊显示)
        forecastOnly: true,
      };
    },
  },
  makeZjSource("zj_cn", { zh: "中国预报 (CMA)", en: "China (CMA)", ja: "中国予報 (CMA)" }, "#2ecc71", "1 6", "中国"),
  makeZjSource("zj_tw", { zh: "中国台湾预报 (CWB)", en: "Taiwan (CWB)", ja: "台湾予報 (CWB)" }, "#3498db", "6 4", "中国台湾"),
  makeZjSource("zj_jp", { zh: "日本预报 (JMA)", en: "Japan (JMA)", ja: "日本予報 (JMA)" }, "#9b59b6", "2 5", "日本"),
  makeZjSource("zj_us", { zh: "美国预报 (JTWC)", en: "USA (JTWC)", ja: "米国予報 (JTWC)" }, "#e74c3c", "8 4", "美国"),
  {
    id: "jma",
    name: { zh: "日本气象厅 JMA", en: "JMA (Japan)", ja: "気象庁 JMA" },
    color: "#9b59b6", dash: "8 4", needKey: false, enabled: false,  // 国外站点, 国内网络可能不可达, 按需手动开启
    async load(cmaTy) {
      const listData = await jmaFetch(`${JMA_BASE}/data/targetTc.json`, TTL_LIST);
      const jmaItem = (listData || []).find((t) => t.typhoonNumber === String(cmaTy.num));
      if (!jmaItem) return null;  // JMA 无此台风(可能已停编或非活跃)
      const rawJma = await jmaFetch(`${JMA_BASE}/data/${jmaItem.tropicalCyclone}/forecast.json`, TTL_DETAIL);
      const jma = normalizeJmaTyphoon(rawJma);
      if (!jma || !jma.track) return null;
      return { name: jma.name_jp || jma.name_en || "", track: jma.track, forecast: jma.forecast };
    },
  },
  {
    id: "eonet",
    name: { zh: "NASA EONET", en: "NASA EONET", ja: "NASA EONET" },
    color: "#e67e22", dash: "2 6", needKey: false, enabled: false,  // 国外站点, 国内网络可能不可达, 按需手动开启
    async load(cmaTy) {
      // NASA EONET: 公开免费 / 免 Key / 开放 CORS, 提供全球热带气旋逐点轨迹
      const data = await fetchEonet();
      const ename = (cmaTy.name_en || "").trim().toUpperCase();
      if (!ename) return null;
      const ev = (data.events || []).find((e) => {
        const title = (e.title || "").toUpperCase();
        return title.includes(ename);   // "SUPER TYPHOON DOLPHIN" 含 "DOLPHIN"
      });
      if (!ev) return null;
      const pts = (ev.geometry || [])
        .filter((g) => g.type === "Point" && g.coordinates && g.coordinates.length >= 2)
        .map((g) => {
          const lon = +g.coordinates[0], lat = +g.coordinates[1];
          const mag = g.magnitudeValue != null ? +g.magnitudeValue : null;
          return {
            lat, lon,
            time: g.date || null,
            wind: mag != null ? mag * 0.514444 : null, // knots → m/s, 与 CMA/JMA 一致
          };
        })
        .sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0))
        .map(toGcj);
      if (!pts.length) return null;
      return { name: ev.title || "", track: pts, forecast: [] };
    },
  },
];

// NASA EONET 事件列表(含全球热带气旋逐点轨迹), 内存缓存 10 分钟避免重复拉取
let _eonetCache = null, _eonetCacheT = 0;
async function fetchEonet() {
  const now = Date.now();
  if (_eonetCache && now - _eonetCacheT < 10 * 60 * 1000) return _eonetCache;
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&days=60&status=all";
  const res = await fetch(url);
  if (!res.ok) throw new Error("EONET " + res.status);
  const text = await res.text();
  if (!text || text.length < 20) throw new Error("EONET_EMPTY");
  _eonetCache = JSON.parse(text);
  _eonetCacheT = now;
  return _eonetCache;
}

// 数据源名(按当前语言)
function srcName(src) { const n = src.name || {}; return n[state.lang] || n.zh || src.id; }

// 入口: 加载所有已启用的对比源, 绘制并填充面板
async function loadCompareSources(cmaTy) {
  Object.values(cmpLayers).forEach((l) => l.clearLayers());
  const panel = document.getElementById("comparePanel");
  if (!panel) return;
  if (!cmaTy || !cmaTy.num) { panel.hidden = true; return; }
  panel.hidden = false;
  const results = [];
  for (const src of COMPARE_SOURCES) {
    if (!src.enabled) continue;
    if (!(src.id in cmpVisible)) cmpVisible[src.id] = true;
    if (src.needKey) { results.push({ src, status: "nokey" }); continue; }
    try {
      const data = await src.load(cmaTy);
      // forecastOnly 源(如 cma_fc)无实况 track, 只看 forecast; 常规源必须有 track
      const hasData = data && (
        (data.track && data.track.length) ||
        (data.forecastOnly && data.forecast && data.forecast.length)
      );
      if (!hasData) { results.push({ src, status: "empty" }); continue; }
      drawCompareSource(src, data);
      const lyr = cmpLayers[src.id];
      if (lyr) { if (cmpVisible[src.id]) map.addLayer(lyr); else map.removeLayer(lyr); }
      results.push({ src, status: "ok", data });
    } catch (e) {
      const isNet = !navigator.onLine || (e && /fetch|network|timeout|Failed to fetch|EONET_EMPTY|_EMPTY/i.test(String(e.message)));
      results.push({ src, status: isNet ? "neterr" : "error", error: e });
    }
  }
  renderComparePanel(cmaTy, results);
}

// 跨 180° 经线时把折线拆成多段, 避免地图上画出横贯地球的错线
function antimeridianSegments(latlngs) {
  const segs = [];
  let cur = [];
  for (let i = 0; i < latlngs.length; i++) {
    if (cur.length && Math.abs(latlngs[i][1] - latlngs[i - 1][1]) > 180) {
      segs.push(cur); cur = [];
    }
    cur.push(latlngs[i]);
  }
  if (cur.length) segs.push(cur);
  return segs;
}

function drawCompareSource(src, data) {
  const layer = cmpLayer(src.id);

  // 纯预报源(如 CMA 自身预报): 不画实况路径, 只从当前位置起画预报
  if (data.forecastOnly && data.forecast && data.forecast.length) {
    // 预报线: 从 CMA 最后一个实况点连到各预报点
    const fcLatLngs = data.forecast.map((f) => [f.lat, f.lon]);
    if (fcLatLngs.length > 0) {
      // 画预报折线段
      for (let i = 0; i < fcLatLngs.length - 1; i++) {
        L.polyline([fcLatLngs[i], fcLatLngs[i + 1]], {
          color: src.color, weight: 3, opacity: 0.85, dashArray: src.dash,
        }).addTo(layer);
      }
      // 预报点标记
      data.forecast.forEach((f) => {
        const g = f.grade || gradeOf(f);
        L.circleMarker([f.lat, f.lon], {
          radius: 4.5, color: src.color, weight: 2,
          fillColor: gradeInfo(g).color || bgStrokeColor(), fillOpacity: 1,
        }).addTo(layer).bindPopup(
          `<div class="popup-title">${srcName(src)}</div>` +
          `<div class="popup-row">${t("forecast")} ${f.lead != null ? f.lead + "h" : ""}</div>` +
          `<div class="popup-row">${f.lat.toFixed(1)}°, ${f.lon.toFixed(1)}°</div>` +
          (f.wind ? `<div class="popup-row">${t("wind")}: <b>${f.wind.toFixed(1)} m/s</b></div>` : "") +
          (f.pressure ? `<div class="popup-row">${t("pressure")}: <b>${f.pressure} hPa</b></div>` : "")
        );
      });
    }
    return;
  }

  // 常规源: 画实况路径 + 预报
  const latlngs = data.track.map((p) => [p.lat, p.lon]);
  if (latlngs.length > 1) {
    antimeridianSegments(latlngs).forEach((seg) => {
      L.polyline(seg, { color: src.color, weight: 3, opacity: 0.85, dashArray: src.dash })
        .addTo(layer)
        .bindPopup(
          `<div class="popup-title">${srcName(src)} 路径</div>` +
          `<div class="popup-row">来源: ${srcName(src)}</div>` +
          `<div class="popup-row">实况点数: <b>${data.track.length}</b></div>`
        );
    });
  }
  if (data.forecast && data.forecast.length) {
    const lastT = data.track[data.track.length - 1];
    const fcLatLngs = [[lastT.lat, lastT.lon], ...data.forecast.map((f) => [f.lat, f.lon])];
    L.polyline(fcLatLngs, { color: src.color, weight: 2, opacity: 0.65, dashArray: "2 7" })
      .addTo(layer);
    data.forecast.forEach((f) => {
      L.circleMarker([f.lat, f.lon], {
        radius: 4, color: src.color, weight: 1.5, fillColor: bgStrokeColor(), fillOpacity: 1,
      }).addTo(layer).bindPopup(
        `<div class="popup-title">${srcName(src)} 预报</div>` +
        `<div class="popup-row">位置: <b>${f.lat.toFixed(1)}°, ${f.lon.toFixed(1)}°</b></div>`
      );
    });
  }
  // 风圈 (该源有半径数据时绘制, 如 JMA 预报点的概率风圈)
  drawCompareWindCircles(src, data, layer);
}

// 对比源风圈: 在带半径数据的位置绘制 (JMA 预报点 probabilityCircle.radius, 单位米)
function drawCompareWindCircles(src, data, layer) {
  (data.forecast || []).forEach((f) => {
    if (!f.radius) return;
    L.circle([f.lat, f.lon], {
      radius: f.radius,
      color: src.color, weight: 1, opacity: 0.5,
      fillColor: src.color, fillOpacity: 0.06, interactive: false,
    }).addTo(layer);
  });
}

function renderComparePanel(cmaTy, results) {
  const panel = document.getElementById("comparePanel");
  if (!panel) return;
  if (!cmaTy) { panel.hidden = true; return; }
  panel.hidden = false;
  const lang = state.lang || "zh";
  const T = (k) => t(k);
  const cmaLast = cmaTy.points[cmaTy.points.length - 1];
  // 图例 = 各对比源开关 + 预报/风圈可用性
  let legendHtml = "";
  COMPARE_SOURCES.forEach((s) => {
    if (s.enabled && !s.needKey) {
      const r = results.find((x) => x.src.id === s.id);
      const hasFc = !!(r && r.status === "ok" && r.data.forecast && r.data.forecast.length);
      const hasWind = !!(r && r.status === "ok" && (r.data.forecast || []).some((f) => f.radius));
      const chk = cmpVisible[s.id] ? "checked" : "";
      legendHtml += `<label class="lg-row toggle">
        <input type="checkbox" data-cmp="${s.id}" ${chk} />
        <span class="lg-dot" style="background:${s.color}"></span>
        <span class="lg-name">${s.name[lang] || s.name.zh}</span>
        <span class="chip ${hasFc ? "on" : "off"}">${T("chipFc")}${hasFc ? "✓" : "–"}</span>
        <span class="chip ${hasWind ? "on" : "off"}">${T("chipWind")}${hasWind ? "✓" : "–"}</span>
      </label>`;
    }
  });
  document.getElementById("cmpLegend").innerHTML = legendHtml;
  document.querySelectorAll("#cmpLegend input[data-cmp]").forEach((cb) => {
    cb.onchange = () => {
      const id = cb.getAttribute("data-cmp");
      cmpVisible[id] = cb.checked;
      const lyr = cmpLayers[id];
      if (!lyr) return;
      if (cb.checked) map.addLayer(lyr); else map.removeLayer(lyr);
    };
  });
  // 位置 / 偏差 行: CMA 参考 + 各对比源
  let rows = `<div class="cmp-source-row">
    <div class="cmp-src-name"><span class="dot" style="background:#2dd4bf"></span>CMA ${T("cmpRef")}</div>
    <div class="cmp-pos">${cmaLast.lat.toFixed(1)}°, ${cmaLast.lon.toFixed(1)}°</div>
  </div>`;
  results.forEach((r) => {
    if (r.status === "ok") {
      if (r.data.forecastOnly) {
        // 纯预报源: 显示预报点数和末点位置
        const fcLast = r.data.forecast[r.data.forecast.length - 1];
        const dist = haversine(cmaLast.lat, cmaLast.lon, fcLast.lat, fcLast.lon);
        rows += `<div class="cmp-source-row">
          <div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}${r.data.name ? " · " + r.data.name : ""}</div>
          <div class="cmp-pos">${T("chipFc")} ${r.data.forecast.length}${T("chipFcUnit") || "pt"} · 末点 ${fcLast.lat.toFixed(1)}°, ${fcLast.lon.toFixed(1)}°</div>
          <div class="cmp-dev">${T("cmpDev")} ${dist.toFixed(0)} km</div>
        </div>`;
      } else {
        const last = r.data.track[r.data.track.length - 1];
        const dist = haversine(cmaLast.lat, cmaLast.lon, last.lat, last.lon);
        rows += `<div class="cmp-source-row">
          <div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}${r.data.name ? " · " + r.data.name : ""}</div>
          <div class="cmp-pos">${last.lat.toFixed(1)}°, ${last.lon.toFixed(1)}°</div>
          <div class="cmp-dev">${T("cmpDev")} ${dist.toFixed(0)} km</div>
        </div>`;
      }
    } else if (r.status === "empty") {
      rows += `<div class="cmp-source-row"><div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}</div><div class="cmp-na">${T("cmpNoData")}</div></div>`;
    } else if (r.status === "neterr") {
      rows += `<div class="cmp-source-row"><div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}</div><div class="cmp-na" title="${T("cmpNetErrTip") || ""}">${T("cmpNetErr") || "源不可达"}</div></div>`;
    } else {
      rows += `<div class="cmp-source-row"><div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}</div><div class="cmp-na">${T("cmpFail")}</div></div>`;
    }
  });
  document.getElementById("cmpRows").innerHTML = rows;
  const title = document.getElementById("cmpTitle");
  if (title) title.textContent = T("threePath");
}

// 两点间大圆距离(km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== 数据源 (浏览器直连, 无需后端代理) =====
// CMA 中央气象台: HTTPS + 开放 CORS, 返回 JSONP 包裹(需剥离外壳); 主路径 + 内置预报对比源
// 浙江省水利厅: 国内政府源, 免 key, JSON 直出, CORS `*`, 单接口聚合 中国/中国台湾/日本/美国 四家预报; 经国内域名直连, 无需外网
// JMA 日本气象厅 / NASA EONET: 已禁用(需外网, 国内部分网络不可达), 可手动 enabled:true 开启
// 整个站点可纯静态部署、永久可达、无需梯子
const CMA_BASE = "https://typhoon.nmc.cn/weatherservice/typhoon/jsons";
const JMA_BASE = "https://www.jma.go.jp/bosai/typhoon";

// 客户端 TTL 缓存, 避免频繁请求被上游限流
const _cache = new Map();
function _cacheGet(url, ttl) {
  const c = _cache.get(url);
  if (c && Date.now() - c.ts < ttl) return c.data;
  return null;
}
function _cacheSet(url, data) { _cache.set(url, { data, ts: Date.now() }); }

// 剥离 JSONP 外壳: 取首个 { 到最后一个 } 之间的内容
function stripJsonp(text) {
  const s = String(text).trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) throw new Error("CMA 返回格式异常");
  return JSON.parse(s.slice(first, last + 1));
}

async function cmaFetch(url, ttl) {
  const cached = _cacheGet(url, ttl);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CMA ${res.status}`);
  const data = stripJsonp(await res.text());
  _cacheSet(url, data);
  return data;
}
async function jmaFetch(url, ttl) {
  const cached = _cacheGet(url, ttl);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`JMA ${res.status}`);
  const data = await res.json();
  _cacheSet(url, data);
  return data;
}

const TTL_LIST = 60 * 1000;
const TTL_DETAIL = 30 * 1000;

function cmaListUrl(year) {
  const t = Date.now();
  return year === new Date().getFullYear()
    ? `${CMA_BASE}/list_default?t=${t}&callback=cma_list`
    : `${CMA_BASE}/list_${year}?callback=cma_list_${year}`;
}
function cmaViewUrl(id) {
  return `${CMA_BASE}/view_${id}?t=${Date.now()}&callback=cma_view_${id}`;
}

// ===== 坐标转换: WGS-84 → GCJ-02 (高德/腾讯瓦片采用 GCJ-02 偏移坐标) =====
// 标准国测局加密算法; 境外坐标原样返回。用于把台风 WGS-84 数据对齐到高德底图。
const GCJ_A = 6378245.0;
const GCJ_EE = 0.00669342162296594323;
function _gcjOutChina(lat, lon) {
  return !(lon > 73.66 && lon < 135.05 && lat > 3.86 && lat < 53.55);
}
function _gcjTlat(x, y) {
  let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  r += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  r += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3;
  r += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y / 30) * Math.PI)) * 2) / 3;
  return r;
}
function _gcjTlon(x, y) {
  let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  r += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  r += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3;
  r += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3;
  return r;
}
function wgs84ToGcj02(lat, lon) {
  if (_gcjOutChina(lat, lon)) return [lat, lon];
  let dLat = _gcjTlat(lon - 105, lat - 35);
  let dLon = _gcjTlon(lon - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - GCJ_EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / ((GCJ_A * (1 - GCJ_EE)) / sqrtMagic * Math.PI);
  dLon = (dLon * 180) / (GCJ_A / sqrtMagic * Math.cos(radLat) * Math.PI);
  return [lat + dLat, lon + dLon];
}
// 将含 {lat, lon} 的点原地转换为 GCJ-02, 返回该点 (便于链式 map)
function toGcj(p) {
  if (!p || p.lat == null || p.lon == null) return p;
  const [la, lo] = wgs84ToGcj02(p.lat, p.lon);
  p.lat = la; p.lon = lo;
  return p;
}

// 归一化函数 (移植自原 Node 代理服务端)
function normalizeList(data) {
  const list = (data && data.typhoonList) || [];
  return list.map((t) => ({
    id: t[0], name_en: t[1], name_cn: t[2], num: t[4], meaning: t[6], state: t[7],
  }));
}
function normalizeTyphoon(data) {
  const ty = data && data.typhoon;
  if (!ty) return null;
  const rawPoints = ty[8] || [];
  const points = rawPoints.map((p) => ({
    pid: p[0], time: p[1], ts: p[2], grade: p[3], lon: p[4], lat: p[5],
    pressure: p[6], wind: p[7], moveDir: p[8], moveSpeed: p[9],
    radii: (p[10] || []).map((r) => ({ knot: r[0], ne: r[1], se: r[2], sw: r[3], nw: r[4] })),
    forecast: p[11] || {},
  })).map(toGcj);
  let latestForecast = {};
  if (points.length) {
    const fc = points[points.length - 1].forecast || {};
    for (const [agency, arr] of Object.entries(fc)) {
      latestForecast[agency] = (arr || []).map((f) => ({
        lead: f[0], time: f[1], lon: f[2], lat: f[3], pressure: f[4], wind: f[5], grade: f[7],
      })).map(toGcj);
    }
  }
  return {
    id: ty[0], name_en: ty[1], name_cn: ty[2], num: ty[4], meaning: ty[6], state: ty[7],
    points, forecast: latestForecast,
  };
}
function normalizeJmaTyphoon(data) {
  if (!Array.isArray(data)) return null;
  const title = data.find((d) => d.part === "title") || {};
  const items = data.filter((d) => d.part && typeof d.part === "object");
  const analysis = items.find((d) => d.advancedHours === 0);
  const trackPts = [];
  if (analysis && analysis.track && analysis.track.typhoon) {
    analysis.track.typhoon.forEach((pt) => trackPts.push({ lat: pt[0], lon: pt[1], type: "past" }));
  }
  if (analysis && analysis.center) trackPts.push({ lat: analysis.center[0], lon: analysis.center[1], type: "current" });
  const forecastPts = [];
  items.filter((d) => d.advancedHours > 0).forEach((d) => {
    if (d.center) forecastPts.push({
      lat: d.center[0], lon: d.center[1], lead: d.advancedHours,
      time: d.validtime && d.validtime.UTC,
      radius: d.probabilityCircle ? d.probabilityCircle.radius : null,
    });
  });
  return {
    source: "JMA", typhoonNumber: title.typhoonNumber,
    name_jp: title.name && title.name.jp, name_en: title.name && title.name.en,
    issue: title.issue && title.issue.UTC,
    track: trackPts.map(toGcj), forecast: forecastPts.map(toGcj),
  };
}

function renderWindCircles(point) {
  if (!point.radii || !point.radii.length) return;
  // 按 tier 从大到小排序绘制 (7级最大在最底, 12级最小在最上)
  const sorted = [...point.radii].sort((a, b) => tierRank(b.knot) - tierRank(a.knot));
  sorted.forEach((r) => {
    const meta = WIND_TIER[r.knot];
    if (!meta) return;
    if (!(r.ne || r.se || r.sw || r.nw)) return;
    const latlngs = windCircleLatLngs(point.lat, point.lon, r.ne, r.se, r.sw, r.nw);
    if (latlngs.length < 3) return;
    L.polygon(latlngs, {
      color: meta.color,
      weight: 1,
      opacity: 0.7,
      fillColor: meta.color,
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(layers.wind);
  });
}
function tierRank(knot) {
  return { "64KTS": 12, "50KTS": 10, "30KTS": 7 }[knot] || 0;
}

function popupHtml(p, ty, isLive) {
  const g = gradeOf(p);
  const info = gradeInfo(g);
  return (
    `<div class="popup-title">${ty.num}${t("typhoonNo")} ${tyName(ty)} ${isLive ? "· " + t("currentPos") : ""}</div>` +
    `<div class="popup-row"><b>${fmtTime(p.time)}</b></div>` +
    `<div class="popup-row">${t("level")}: <b>${info.name} (${g})</b></div>` +
    `<div class="popup-row">${t("position")}: <b>${p.lat.toFixed(1)}°${t("north")}, ${p.lon.toFixed(1)}°${t("east")}</b></div>` +
    `<div class="popup-row">${t("pressure")}: <b>${p.pressure} hPa</b></div>` +
    `<div class="popup-row">${t("wind")}: <b>${p.wind} m/s</b></div>` +
    `<div class="popup-row">${t("moveDir")}: <b>${dirCn(p.moveDir)}</b> · ${t("moveSpeed")}: <b>${p.moveSpeed} km/h</b></div>`
  );
}
function forecastPopupHtml(f, agency, ty) {
  const g = gradeOf(f);
  const info = gradeInfo(g);
  return (
    `<div class="popup-title">${t("forecastBy")} · ${agencyCn(agency)} (${f.lead}${t("hours")})</div>` +
    `<div class="popup-row">${t("baseTime")}: <b>${fmtTime(f.time)}</b></div>` +
    `<div class="popup-row">${t("level")}: <b>${info.name} (${g})</b></div>` +
    `<div class="popup-row">${t("position")}: <b>${f.lat.toFixed(1)}°${t("north")}, ${f.lon.toFixed(1)}°${t("east")}</b></div>` +
    `<div class="popup-row">${t("pressure")}: <b>${f.pressure} hPa</b></div>` +
    `<div class="popup-row">${t("wind")}: <b>${f.wind} m/s</b></div>`
  );
}

// ===== 详情卡 =====
function updateDetailCard(p, ty, isReplay) {
  el.detailCard.hidden = false;
  const g = gradeOf(p);
  const info = gradeInfo(g);
  document.getElementById("dcNum").textContent = `${ty.num}${t("typhoonNo")}`;
  document.getElementById("dcName").textContent = tyName(ty);
  const st = document.getElementById("dcState");
  const live = ty.state === "start";
  if (isReplay) {
    st.textContent = t("replay");
    st.className = "dc-state replay";
  } else {
    st.textContent = live ? t("live") : t("stopped2");
    st.className = `dc-state ${live ? "live" : "done"}`;
  }
  document.getElementById("dcGrade").innerHTML =
    `<span style="color:${info.color}">●</span> ${info.name}`;
  document.getElementById("dcPos").textContent = `${p.lat.toFixed(1)}°${t("north")}, ${p.lon.toFixed(1)}°${t("east")}`;
  document.getElementById("dcPressure").textContent = `${p.pressure} hPa`;
  document.getElementById("dcWind").textContent = `${p.wind} m/s`;
  document.getElementById("dcMoveDir").textContent = dirCn(p.moveDir);
  document.getElementById("dcMoveSpeed").textContent = `${p.moveSpeed} km/h`;
  document.getElementById("dcTime").textContent = (isReplay ? "" : `${t("latestPos")} · `) + fmtTime(p.time);
  // 字段名标签
  document.getElementById("lblGrade").textContent = t("level");
  document.getElementById("lblPos").textContent = t("position");
  document.getElementById("lblPressure").textContent = t("pressure");
  document.getElementById("lblWind").textContent = t("wind");
  document.getElementById("lblMoveDir").textContent = t("moveDir");
  document.getElementById("lblMoveSpeed").textContent = t("moveSpeed");
}

// ===== 预警横幅 =====
function updateWarning(p, ty, live) {
  const g = gradeOf(p);
  if (!live || g === "TD" || g === "TS") {
    el.warningBanner.hidden = true;
    return;
  }
  el.warningBanner.hidden = false;
  el.warningBanner.classList.remove("warn-orange", "warn-yellow");
  let level, cls;
  // 预警等级名按语言
  const levelName = {
    red: { zh: "红色", en: "Red", ja: "紅色" },
    orange: { zh: "橙色", en: "Orange", ja: "橙色" },
    yellow: { zh: "黄色", en: "Yellow", ja: "黄色" },
  };
  const lang = state.lang || "zh";
  if (g === "SuperTY") { level = levelName.red[lang]; cls = ""; }
  else if (g === "STY") { level = levelName.red[lang]; cls = ""; }
  else if (g === "TY") { level = levelName.orange[lang]; cls = "warn-orange"; }
  else { level = levelName.yellow[lang]; cls = "warn-yellow"; } // STS
  if (cls) el.warningBanner.classList.add(cls);
  el.warnText.textContent =
    `${t("warningTitle")} · ${level} ｜ ${ty.num}${t("typhoonNo")} ${tyName(ty)} ${t("warningBody")}${gradeInfo(g).name}，` +
    `${t("warningTail")} ${p.wind} m/s，${t("pressure")} ${p.pressure} hPa，${t("warningTip")}`;
}

// ===== 自动刷新 =====
function startAuto() {
  stopAuto();
  if (!el.autoToggle.checked) return;
  state.autoTimer = setInterval(async () => {
    // 刷新列表 (更新状态) 与所选活跃台风详情
    try {
      const data = await cmaFetch(cmaListUrl(state.year), TTL_LIST);
      state.typhoons = normalizeList(data);
      renderList();
      el.updated.textContent = `${t("updated")} ${new Date().toLocaleTimeString("zh-CN")}`;
    } catch (e) {}
    if (state.currentTyphoon && state.currentTyphoon.state === "start" && state.selectedId) {
      if (state.replay.active) return; // 回放中不打断
      // 静默刷新详情 (不重置视图)
      try {
        const d2 = await cmaFetch(cmaViewUrl(state.selectedId), TTL_DETAIL);
        const ty = normalizeTyphoon(d2);
        if (!ty) throw new Error("empty");
        state.currentTyphoon = ty;
        state.fitOnRender = false;
        renderTyphoon(ty);
        initTimeline(ty); // 同步时间轴上限 (可能有新定位点)
      } catch (e) {}
    }
  }, 30000); // 每 30 秒刷新列表/活跃台风; 详情走 30 秒 TTL 缓存, 官方一发布即上图
}
function stopAuto() {
  if (state.autoTimer) clearInterval(state.autoTimer);
  state.autoTimer = null;
}

// ===== 历史台风回放时间轴 =====
const REPLAY_STEP_MS = 500; // 每帧基准间隔(ms), 受 speed 调整

function initTimeline(ty) {
  const n = (ty && ty.points) ? ty.points.length : 0;
  stopReplay();
  if (n < 2) {
    state.replay.active = false;
    el.timeline.hidden = true;
    return;
  }
  el.timeline.hidden = false;
  state.replay.active = false;
  state.replay.index = n - 1;
  el.tlRange.min = 0;
  el.tlRange.max = n - 1;
  el.tlRange.value = n - 1;
  el.tlTime.textContent = fmtTime(ty.points[n - 1].time);
  el.tlPlay.textContent = "▶";
}

function applyReplayFrame() {
  if (!state.currentTyphoon) return;
  const n = state.currentTyphoon.points.length;
  const idx = Math.min(Math.max(0, state.replay.index | 0), n - 1);
  state.replay.index = idx;
  el.tlRange.value = idx;
  const p = state.currentTyphoon.points[idx];
  el.tlTime.textContent = fmtTime(p.time);
  renderTyphoon(state.currentTyphoon, idx);
}

function startReplay() {
  if (state.replay.playing) return;
  const n = state.currentTyphoon ? state.currentTyphoon.points.length : 0;
  if (n < 2) return;
  if (state.replay.index >= n - 1) state.replay.index = 0; // 从开头重播
  state.replay.active = true;
  state.replay.playing = true;
  el.tlPlay.textContent = "⏸";
  const interval = Math.max(80, REPLAY_STEP_MS / state.replay.speed);
  state.replay.timer = setInterval(() => {
    const nn = state.currentTyphoon.points.length;
    if (state.replay.index >= nn - 1) { stopReplay(); return; }
    state.replay.index++;
    applyReplayFrame();
  }, interval);
}

function stopReplay() {
  state.replay.playing = false;
  if (state.replay.timer) clearInterval(state.replay.timer);
  state.replay.timer = null;
  if (el.tlPlay) el.tlPlay.textContent = "▶";
}

// 时间轴事件
el.tlRange.addEventListener("input", (e) => {
  if (!state.currentTyphoon) return;
  stopReplay();
  const idx = Number(e.target.value);
  const n = state.currentTyphoon.points.length;
  state.replay.index = idx;
  if (idx >= n - 1) {
    state.replay.active = false;
    renderTyphoon(state.currentTyphoon); // 拖到末端 → 回到最新实况
  } else {
    state.replay.active = true;
    applyReplayFrame();
  }
});
el.tlPlay.addEventListener("click", () => {
  if (!state.currentTyphoon) return;
  if (state.replay.playing) stopReplay();
  else startReplay();
});
el.tlSpeed.addEventListener("change", (e) => {
  state.replay.speed = Number(e.target.value) || 1;
  if (state.replay.playing) { stopReplay(); startReplay(); }
});
el.tlLive.addEventListener("click", () => {
  if (!state.currentTyphoon) return;
  stopReplay();
  state.replay.active = false;
  state.replay.index = state.currentTyphoon.points.length - 1;
  el.tlRange.value = state.replay.index;
  const last = state.currentTyphoon.points[state.replay.index];
  el.tlTime.textContent = fmtTime(last.time);
  renderTyphoon(state.currentTyphoon); // 回到最新, 恢复实时估算与对比
});

// ===== 事件绑定 =====
el.yearSelect.addEventListener("change", (e) => loadList(Number(e.target.value)));
el.prevYear.addEventListener("click", () => {
  const y = Number(el.yearSelect.value);
  if (y > 2000) { el.yearSelect.value = y - 1; loadList(y - 1); }
});
el.nextYear.addEventListener("click", () => {
  const y = Number(el.yearSelect.value);
  const cur = new Date().getFullYear();
  if (y < cur) { el.yearSelect.value = y + 1; loadList(y + 1); }
});
el.btnRefresh.addEventListener("click", () => loadList(state.year));
el.autoToggle.addEventListener("change", startAuto);
document.getElementById("btnTheme").addEventListener("click", toggleTheme);
document.getElementById("langSelect").addEventListener("change", (e) => {
  const lang = e.target.value;
  if (!I18N[lang]) return;
  applyLang(lang);
  try { localStorage.setItem(LANG_KEY, lang); } catch (e2) {}
  refreshLangUI();
});

// ===== PWA：Service Worker + 离线 + 安装 =====
let deferredInstall = null;

function showOfflineBanner() {
  el.warningBanner.hidden = false;
  el.warningBanner.classList.remove("warn-orange", "warn-yellow");
  el.warningBanner.classList.add("warn-offline");
  el.warnText.textContent =
    "离线模式 · 显示最近一次缓存的台风数据（网络恢复后自动刷新）";
}
function hideOfflineBanner() {
  el.warningBanner.classList.remove("warn-offline");
}

// 注册 Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(reg => {
    console.log("[PWA] SW registered, scope:", reg.scope);
    // SW 更新时提示用户
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (sw) sw.addEventListener("statechange", () => {
        if (sw.state === "activated") {
          const msg = "新版本已就绪，请刷新页面";
          try { console.log("[PWA]", msg); } catch (_) {}
        }
      });
    });
  }).catch(err => { console.warn("[PWA] SW register failed:", err); });

  // 离线/在线检测
  window.addEventListener("offline", () => {
    state.offline = true;
    showOfflineBanner();
    stopAuto(); // 离线停止自动刷新
  });
  window.addEventListener("online", () => {
    state.offline = false;
    hideOfflineBanner();
    startAuto(); // 恢复后重新加载最新数据
    loadList(state.year);
  });
  // 页面加载时检测初始状态
  if (!navigator.onLine) { state.offline = true; showOfflineBanner(); }
}

// 安装到桌面 / 主屏幕
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstall = e;
  document.getElementById("btnInstall").hidden = false;
});
document.getElementById("btnInstall").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  const result = await deferredInstall.userChoice;
  deferredInstall = null;
  document.getElementById("btnInstall").hidden = true;
  console.log("[PWA] install:", result.outcome);
});

// ===== 启动 =====
initTheme();
initLang();
refreshLangUI();
loadList(new Date().getFullYear());
startAuto();
startLiveTick();
