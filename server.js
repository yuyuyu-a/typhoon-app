// 台风实况 - Node 标准库服务器 (零依赖)
// 提供：静态文件服务 + CMA 中央气象台台风数据代理 (清洗 JSONP, 解决跨域)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 7321;
const PUBLIC_DIR = path.join(__dirname, "public");
const CMA_BASE = "http://typhoon.nmc.cn/weatherservice/typhoon/jsons";
const JMA_BASE = "https://www.jma.go.jp/bosai/typhoon";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// 简易内存缓存：detail 2分钟, list 5分钟
const cache = new Map();
const TTL_DETAIL = 2 * 60 * 1000;
const TTL_LIST = 5 * 60 * 1000;

function stripJsonp(text) {
  const s = String(text).trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return JSON.parse(s.slice(first, last + 1));
}

async function cmaFetch(suffix, ttl) {
  const url = `${CMA_BASE}/${suffix}`;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "http://typhoon.nmc.cn/" },
  });
  if (!res.ok) throw new Error(`CMA ${res.status}`);
  const data = stripJsonp(await res.text());
  cache.set(url, { data, ts: Date.now() });
  return data;
}

// 把 CMA 列表项数组归一化
function normalizeList(data) {
  const list = (data && data.typhoonList) || [];
  return list.map((t) => ({
    id: t[0],
    name_en: t[1],
    name_cn: t[2],
    num: t[4],
    meaning: t[6],
    state: t[7], // "start" 活跃 / "stop" 已停
  }));
}

// 把 CMA 台风详情归一化
function normalizeTyphoon(data) {
  const ty = data && data.typhoon;
  if (!ty) return null;
  const rawPoints = ty[8] || [];
  const points = rawPoints.map((p) => ({
    pid: p[0],
    time: p[1], // "YYYYMMDDHHMM"
    ts: p[2],
    grade: p[3],
    lon: p[4],
    lat: p[5],
    pressure: p[6],
    wind: p[7], // m/s
    moveDir: p[8],
    moveSpeed: p[9], // km/h
    radii: (p[10] || []).map((r) => ({
      knot: r[0], // "30KTS" / "50KTS" / "64KTS"
      ne: r[1], se: r[2], sw: r[3], nw: r[4],
    })),
    forecast: p[11] || {}, // {BABJ:[[lead,time,lon,lat,pressure,wind,agency,grade],...]}
  }));

  // 最新预报 (取最后一个路径点携带的预报对象)
  let latestForecast = {};
  if (points.length) {
    const fc = points[points.length - 1].forecast || {};
    for (const [agency, arr] of Object.entries(fc)) {
      latestForecast[agency] = (arr || []).map((f) => ({
        lead: f[0], // 小时
        time: f[1],
        lon: f[2],
        lat: f[3],
        pressure: f[4],
        wind: f[5],
        grade: f[7],
      }));
    }
  }

  return {
    id: ty[0],
    name_en: ty[1],
    name_cn: ty[2],
    num: ty[4],
    meaning: ty[6],
    state: ty[7],
    points,
    forecast: latestForecast,
  };
}

// ===== JMA (日本气象厅) 台风数据 =====
// JMA 端点: targetTc.json (当前目标台风列表) + data/{TC编号}/forecast.json (单台风路径+预报)
async function jmaFetch(suffix, ttl) {
  const url = `${JMA_BASE}/${suffix}`;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`JMA ${res.status}`);
  const data = await res.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
}

// JMA forecast.json 归一化: 提取实况路径 + 预报点
function normalizeJmaTyphoon(data) {
  if (!Array.isArray(data)) return null;
  const title = data.find((d) => d.part === "title") || {};
  const items = data.filter((d) => d.part && typeof d.part === "object");
  // 实况 (Analysis): 含 track.typhoon 历史路径 + center 当前位置
  const analysis = items.find((d) => d.advancedHours === 0);
  const trackPts = [];
  if (analysis && analysis.track && analysis.track.typhoon) {
    analysis.track.typhoon.forEach((pt) => {
      // JMA 格式 [lat, lon]
      trackPts.push({ lat: pt[0], lon: pt[1], type: "past" });
    });
  }
  if (analysis && analysis.center) {
    trackPts.push({ lat: analysis.center[0], lon: analysis.center[1], type: "current" });
  }
  // 预报点 (Forecast): center = 预报位置
  const forecastPts = [];
  items.filter((d) => d.advancedHours > 0).forEach((d) => {
    if (d.center) {
      forecastPts.push({
        lat: d.center[0],
        lon: d.center[1],
        lead: d.advancedHours,
        time: d.validtime && d.validtime.UTC,
        radius: d.probabilityCircle ? d.probabilityCircle.radius : null, // 概率圆半径(米)
      });
    }
  });
  return {
    source: "JMA",
    typhoonNumber: title.typhoonNumber,
    name_jp: title.name && title.name.jp,
    name_en: title.name && title.name.en,
    issue: title.issue && title.issue.UTC,
    track: trackPts,
    forecast: forecastPts,
  };
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404");
      return;
    }
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  try {
    // API 路由
    if (p === "/api/list") {
      const data = await cmaFetch(`list_default?t=${Date.now()}&callback=typhoon_jsons_list_default`, TTL_LIST);
      return sendJson(res, 200, { typhoons: normalizeList(data), year: new Date().getFullYear() });
    }
    const yearMatch = p.match(/^\/api\/list\/(\d{4})$/);
    if (yearMatch) {
      const y = yearMatch[1];
      const data = await cmaFetch(`list_${y}?callback=typhoon_jsons_list_${y}`, TTL_LIST);
      return sendJson(res, 200, { typhoons: normalizeList(data), year: y });
    }
    const tyMatch = p.match(/^\/api\/typhoon\/(\d+)$/);
    if (tyMatch) {
      const id = tyMatch[1];
      const data = await cmaFetch(`view_${id}?t=${Date.now()}&callback=typhoon_jsons_view_${id}`, TTL_DETAIL);
      return sendJson(res, 200, normalizeTyphoon(data));
    }

    // JMA 台风列表 (当前目标台风)
    if (p === "/api/jma/list") {
      const data = await jmaFetch("data/targetTc.json", TTL_LIST);
      return sendJson(res, 200, { typhoons: data || [] });
    }
    // JMA 单台风详情 (forecast.json)
    const jmaMatch = p.match(/^\/api\/jma\/typhoon\/(TC\d+)$/);
    if (jmaMatch) {
      const tc = jmaMatch[1];
      const data = await jmaFetch(`data/${tc}/forecast.json`, TTL_DETAIL);
      return sendJson(res, 200, normalizeJmaTyphoon(data));
    }

    // 静态文件
    let filePath = path.join(PUBLIC_DIR, p === "/" ? "index.html" : p);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      return sendJson(res, 403, { error: "forbidden" });
    }
    return sendStatic(res, filePath);
  } catch (e) {
    console.error("[err]", e.message);
    return sendJson(res, 502, { error: "upstream", detail: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`台风实况服务已启动: http://localhost:${PORT}`);
});
