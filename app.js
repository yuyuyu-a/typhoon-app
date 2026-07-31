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
    dataSource: "数据：中央气象台 CMA · 日本气象厅 JMA · NASA EONET（公开免费）",
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
    chipFc: "预报",
    chipWind: "风圈",
  },
  en: {
    _label: "English",
    title: "Typhoon Live",
    subtitle: "Track · Forecast · Wind Circle · History",
    dataSource: "Source: CMA · JMA · NASA EONET (free, public)",
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
    cmpNetErr: "Unreachable",
    chipFc: "Fcst",
    chipWind: "Wind",
  },
  ja: {
    _label: "日本語",
    title: "台風実況",
    subtitle: "進路・予報・風域・履歴",
    dataSource: "データ元：CMA · JMA · NASA EONET（無料公開）",
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

function renderTyphoon(ty) {
  clearLayers();
  if (!ty || !ty.points || !ty.points.length) {
    el.loader.hidden = true;
    return;
  }
  const pts = ty.points;
  const last = pts[pts.length - 1];
  const lastGrade = gradeOf(last);
  const live = ty.state === "start";

  // --- 历史路径: 分段按强度着色 ---
  for (let i = 0; i < pts.length - 1; i++) {
    const g = gradeOf(pts[i]);
    const color = gradeInfo(g).color;
    L.polyline(
      [[pts[i].lat, pts[i].lon], [pts[i + 1].lat, pts[i + 1].lon]],
      { color, weight: 3.5, opacity: 0.95 }
    ).addTo(layers.track);
  }

  // --- 路径点标记 + 弹窗 ---
  pts.forEach((p, i) => {
    const g = gradeOf(p);
    const isLast = i === pts.length - 1;
    const color = gradeInfo(g).color;
    if (live && isLast) {
      // 官方最新定位点 (静态白色高亮), 实时估算点由 updateLiveEstimate 绘制
      L.circleMarker([p.lat, p.lon], {
        radius: 6, color: "#ffffff", weight: 2,
        fillColor: color, fillOpacity: 1,
      }).addTo(layers.marker).bindPopup(popupHtml(p, ty, true));
    } else {
      L.circleMarker([p.lat, p.lon], {
        radius: isLast ? 5 : 3.5,
        color: bgStrokeColor(),
        weight: 1,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(layers.marker).bindPopup(popupHtml(p, ty, false));
    }
  });

  // --- 预报路径 (虚线, 按预报强度着色) ---
  const agencies = Object.keys(ty.forecast || {});
  agencies.forEach((ag) => {
    const fc = ty.forecast[ag];
    if (!fc || !fc.length) return;
    const pathPts = [{ lat: last.lat, lon: last.lon, grade: lastGrade, wind: last.wind, time: last.time, lead: 0 }];
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

  // --- 风圈 (当前位置的四象限) ---
  renderWindCircles(last);

  // --- 详情卡 + 预警 ---
  updateDetailCard(last, ty);
  updateWarning(last, ty, live);

  // --- 视图适配 ---
  if (state.fitOnRender) {
    const all = [[last.lat, last.lon]];
    pts.forEach((p) => all.push([p.lat, p.lon]));
    agencies.forEach((ag) => (ty.forecast[ag] || []).forEach((f) => all.push([f.lat, f.lon])));
    map.fitBounds(L.latLngBounds(all), { padding: [40, 40], maxZoom: 7 });
  }

  // --- 多源对比: 异步加载 JMA / NASA EONET 等同台风路径 ---
  loadCompareSources(ty);
  // --- 实时估算位置 (两报之间持续外推) ---
  updateLiveEstimate(ty);

  el.loader.hidden = true;
}

// ===== 多源对比注册表 (可插拔) =====
// 每个源: id, 名称(多语), 颜色, 虚线样式, 是否需要 key, 是否启用,
//   load(cmaTy, key) → { name, track:[{lat,lon,time?,grade?,isNow?}], forecast:[{lat,lon,lead?,time?}] } | null
// 新增数据源只需往此数组里加一项, 渲染与对比面板会自动适配。
const COMPARE_SOURCES = [
  {
    id: "jma",
    name: { zh: "日本气象厅 JMA", en: "JMA (Japan)", ja: "気象庁 JMA" },
    color: "#9b59b6", dash: "8 4", needKey: false, enabled: true,
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
    color: "#e67e22", dash: "2 6", needKey: false, enabled: true,
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
      if (!data || !data.track || !data.track.length) { results.push({ src, status: "empty" }); continue; }
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
      const last = r.data.track[r.data.track.length - 1];
      const dist = haversine(cmaLast.lat, cmaLast.lon, last.lat, last.lon);
      rows += `<div class="cmp-source-row">
        <div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}${r.data.name ? " · " + r.data.name : ""}</div>
        <div class="cmp-pos">${last.lat.toFixed(1)}°, ${last.lon.toFixed(1)}°</div>
        <div class="cmp-dev">${T("cmpDev")} ${dist.toFixed(0)} km</div>
      </div>`;
    } else if (r.status === "empty") {
      rows += `<div class="cmp-source-row"><div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}</div><div class="cmp-na">${T("cmpNoData")}</div></div>`;
    } else if (r.status === "neterr") {
      rows += `<div class="cmp-source-row"><div class="cmp-src-name"><span class="dot" style="background:${r.src.color}"></span>${r.src.name[lang] || r.src.name.zh}</div><div class="cmp-na">${T("cmpNetErr") || "源不可达"}</div></div>`;
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
// CMA 中央气象台: HTTPS + 开放 CORS, 返回 JSONP 包裹(需剥离外壳)
// JMA 日本气象厅: HTTPS + 开放 CORS, 返回纯 JSON
// NASA EONET: HTTPS + 开放 CORS, 公开免费、免 Key, 提供全球热带气旋逐点轨迹
// 三者均可在国内浏览器直接访问, 因此整个站点可纯静态部署、永久可达、无需梯子
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
function updateDetailCard(p, ty) {
  el.detailCard.hidden = false;
  const g = gradeOf(p);
  const info = gradeInfo(g);
  document.getElementById("dcNum").textContent = `${ty.num}${t("typhoonNo")}`;
  document.getElementById("dcName").textContent = tyName(ty);
  const st = document.getElementById("dcState");
  const live = ty.state === "start";
  st.textContent = live ? t("live") : t("stopped2");
  st.className = `dc-state ${live ? "live" : "done"}`;
  document.getElementById("dcGrade").innerHTML =
    `<span style="color:${info.color}">●</span> ${info.name}`;
  document.getElementById("dcPos").textContent = `${p.lat.toFixed(1)}°${t("north")}, ${p.lon.toFixed(1)}°${t("east")}`;
  document.getElementById("dcPressure").textContent = `${p.pressure} hPa`;
  document.getElementById("dcWind").textContent = `${p.wind} m/s`;
  document.getElementById("dcMoveDir").textContent = dirCn(p.moveDir);
  document.getElementById("dcMoveSpeed").textContent = `${p.moveSpeed} km/h`;
  document.getElementById("dcTime").textContent = `${t("latestPos")} · ${fmtTime(p.time)}`;
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
      // 静默刷新详情 (不重置视图)
      try {
        const d2 = await cmaFetch(cmaViewUrl(state.selectedId), TTL_DETAIL);
        const ty = normalizeTyphoon(d2);
        if (!ty) throw new Error("empty");
        state.currentTyphoon = ty;
        state.fitOnRender = false;
        renderTyphoon(ty);
      } catch (e) {}
    }
  }, 30000); // 每 30 秒刷新列表/活跃台风; 详情走 30 秒 TTL 缓存, 官方一发布即上图
}
function stopAuto() {
  if (state.autoTimer) clearInterval(state.autoTimer);
  state.autoTimer = null;
}

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

// ===== 启动 =====
initTheme();
initLang();
refreshLangUI();
loadList(new Date().getFullYear());
startAuto();
startLiveTick();
