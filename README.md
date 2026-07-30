<p align="center">
  <img src="https://raw.githubusercontent.com/yuyuyu-a/typhoon-app/main/vendor/leaflet/images/marker-icon.png" width="64" alt="台风图标" />
</p>

<h1 align="center">🌀 台风实况 · 实时追踪</h1>

<p align="center">
  <b>纯静态前端 · 实时台风路径 / 预报 / 风圈 / 历史 · 多源数据对比</b>
</p>

<p align="center">
  <a href="https://github.com/yuyuyu-a/typhoon-app/actions/workflows/pages.yml"><img src="https://github.com/yuyuyu-a/typhoon-app/actions/workflows/pages.yml/badge.svg" alt="Deploy to GitHub Pages" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/data-CMA%20%7C%20JMA%20%7C%20QWeather-orange.svg" alt="Data Source" />
  <img src="https://img.shields.io/badge/frontend-HTML%2FJS%20%2F%20Leaflet-2ea44f.svg" alt="Frontend" />
  <img src="https://img.shields.io/badge/i18n-中文%20%7C%20English%20%7C%20日本語-9cf.svg" alt="i18n" />
</p>

---

一个 **零后端、零构建、纯前端** 的实时台风追踪应用。数据由用户浏览器**直接**请求中国中央气象台（CMA）与日本气象厅（JMA）的官方接口，无需任何服务器中转，部署到任意静态托管即可永久访问。

## ✨ 在线演示

| 环境 | 地址 | 国内可达 |
|------|------|:--------:|
| **GitHub Pages** | https://yuyuyu-a.github.io/typhoon-app/ | 需梯子 |
| **CloudStudio（国内直连）** | https://e6f844d833a340e699296dff94d0ce83.sh2.agentos-app.net | ✅ 免梯子 |

<p align="center">
  <img src="screenshot.png" alt="台风实况运行截图 — 展示 2613 白海豚实时路径、风圈、多源对比（CMA vs JMA）" width="100%" />
</p>

## 🌟 功能特性

- **🛰️ 实时路径追踪**：展示台风当前位置、移动方向、移动速度，以及完整历史路径。
- **⚡ 实时估算位置**：官方数据源通常每 3 小时才发布一次新定位点；本应用在两次官方播报之间，基于最新定位 + 航向/移速**持续外推当前位置**，台风标记每 3 秒平滑移动，并标出与官方定位的连线（明确标注「估算，仅供参考」）。官方一发布新定位点（轮询 30 秒）即自动刷新。
- **🔮 官方预报路径**：叠加各预报机构（如 BABJ）的未来路径预测点。
- **💨 风圈可视化**：按 30 / 50 / 64 kt 等级绘制七级、十级、十二级风圈（四象限半径插值生成多边形）。
- **🌓 白天 / 夜晚模式**：一键切换明暗主题，地图与界面同步变色。
- **🌐 三语界面 + 三语地图地名**：中 / 英 / 日 自由切换，**不仅是按钮文案，连地图上的海域、国家、城市标注也会随之切换语言**。
- **⚖️ 可插拔多源对比**：采用**数据源注册表**架构，同一台风可同时叠加多个官方机构路径并在对比面板显示各源当前位置偏差（km）。内置 **CMA（中央气象台，主路径）** 与 **JMA（日本气象厅）** 两个免 key 源；另支持接入 **QWeather 和风天气**（国内公司、含 JTWC 级强度，需在对比面板粘贴免费 API Key 启用）。后续可一行代码扩展更多源。
- **📱 响应式布局**：适配桌面与移动端，手机也能看。
- **🚀 完全自包含**：地图库 Leaflet 已本地化，**不依赖任何国外 CDN**，国内网络下稳定加载。

## 🏗️ 技术架构

```
┌─────────────┐      HTTPS + CORS       ┌──────────────────┐
│  浏览器前端   │ ─────────────────────▶ │  CMA 中央气象台   │
│ (纯静态页面)  │                        │  typhoon.nmc.cn   │
│             │ ─────────────────────▶ │  JMA 日本气象厅    │
│             │                        │  jma.go.jp        │
│             │ ──(可选, 带API Key)──▶ │  QWeather 和风天气 │
└─────────────┘      HTTPS + CORS       │  api.qweather.com  │
      │
      │ 本地解析 JSONP / JSON + 数据源注册表归一化
      ▼
  Leaflet 渲染地图 + 路径 + 风圈 + 多源对比
```

- **无后端**：彻底抛弃 Node 代理，浏览器直连官方接口，关掉本机进程也不影响线上访问。
- **无构建**：原生 HTML / CSS / JS，双击 `index.html` 即可运行，也可直接丢上任意静态托管。
- **可插拔数据源注册表**：`app.js` 中的 `COMPARE_SOURCES` 数组统一管理各机构路径的获取与归一化（CMA 剥离 JSONP、JMA 解析 JSON、QWeather 解析 storm-list/track/forecast），新增数据源只需往数组里加一项，渲染与对比面板自动适配。

## 📡 数据源说明

| 来源 | 机构 | 接口 | 跨域 | Key | 说明 |
|------|------|------|:----:|:---:|------|
| CMA | 中国中央气象台 | `https://typhoon.nmc.cn/weatherservice/typhoon/jsons/` | ✅ CORS `*` | 无需 | 列表 `list_default`，详情 `view_{长ID}`（主路径） |
| JMA | 日本气象厅 | `https://www.jma.go.jp/bosai/typhoon/data/` | ✅ CORS `*` | 无需 | 列表 `targetTc.json`，详情 `data/TCxxxx/forecast.json` |
| QWeather | 和风天气（中国） | `https://api.qweather.com/v7/tropical/` | ✅ CORS `*` | 免费 Key | `storm-list` + `storm-track` + `storm-forecast`；含 JTWC 级强度 |

- CMA / JMA 两个接口**免 key、HTTPS + 开放 CORS**，国内浏览器可免梯子直连。
- **QWeather 为可选源**：在应用右下角「多源对比」面板的输入框粘贴免费 API Key（仅存于本机浏览器 `localStorage`）即可启用，对比面板会增加一条青绿色路径与偏差。Key 从 [dev.qweather.com](https://dev.qweather.com/) 控制台创建项目获取（免费版有调用次数限制）。
- 关于"为什么只有这几个源"：在**纯静态、无后端、国内直连**的约束下，只有 CMA/JMA 是免 key 且开放 CORS 的官方源；JTWC（美国）、NRL、Zoom Earth 等 or 因国内网络不可达、或缺失 CORS 头，无法在浏览器直连使用。QWeather 作为国内权威源补齐了第三方对比。
- CMA 详情接口的 ID 为**长编号**（列表项 `t[0]`），非短编号 `t[4]`，已处理。
- CMA 与 JMA 的台风通过 `typhoonNumber` 字段关联匹配（短编号可能存在 1~2 的差异，故不直接用短号匹配）；QWeather 通过 `basin=NP` + 编号/英文名匹配。

## 📂 目录结构

```
typhoon-app/
├── index.html              # 入口页
├── app.js                  # 核心逻辑：数据层 / 渲染 / i18n / 主题 / 对比
├── places.js               # 三语地名标注数据层（海域 / 国家 / 城市）
├── styles.css              # 主题变量、布局、地图标签、对比面板样式
├── server.js               # 早期 Node 代理版（已弃用，仅留作本地调试参考）
├── README.md
└── vendor/
    └── leaflet/            # 本地化 Leaflet 1.9.4（JS / CSS / 图片）
```

## 💻 本地运行

任意静态服务器即可，例如：

```bash
# 方式一：Python
python -m http.server 8080
# 浏览器打开 http://localhost:8080

# 方式二：Node
npx serve .
```

> 直接双击 `index.html` 也能开，但部分浏览器对 `file://` 下的 `fetch` 有限制，建议用上面的静态服务器方式。

## 🚀 部署

### 部署到 GitHub Pages

1. 在 GitHub 新建仓库 `typhoon-app`（空仓库即可，勿勾选 README）。
2. 推送代码（`git` 已配置 SSH 走 22 端口，国内可达）：
   ```bash
   git push -u origin main
   ```
3. 仓库 **Settings → Pages → Source** 选 **Deploy from a branch**（或 GitHub Actions），分支 `main` / 根目录。
4. 等待构建完成后访问 `https://<用户名>.github.io/typhoon-app/`。
   - ⚠️ GitHub Pages 在国内需梯子；国内免梯子请使用下方的 CloudStudio 链接。

### 部署到 CloudStudio（国内免梯子）

将本目录作为静态站点上传到 CloudStudio 静态托管即可，已验证国内直连正常：
https://e6f844d833a340e699296dff94d0ce83.sh2.agentos-app.net

## ❓ 常见问题

- **地图地名不显示？** 检查右上角语言切换是否已选择，地名标注层会随语言刷新。
- **数据加载失败？** 确认网络可访问 `typhoon.nmc.cn` 与 `jma.go.jp`；公司网络若封锁外网可能受影响。
- **QWeather 显示「暂无该台风数据 / 获取失败」？** 免费 Key 可能未开通台风接口权限，或当日调用次数用尽；检查 Key 是否正确，或到 QWeather 控制台确认套餐包含热带气旋 API。
- **为什么不用 GitHub Pages 做国内主站？** GitHub Pages 在国内需梯子，故国内主站用 CloudStudio，GitHub 主要做代码托管与海外访问。

## 🗺️ 后续计划

- [ ] PWA 离线缓存（弱网 / 地铁里也能看）
- [ ] 多台风同屏对比
- [ ] 历史台风回放时间轴
- [ ] 绑定自定义域名

## 📄 许可证

本项目以 [MIT 许可证](LICENSE) 开源 —— 可自由使用、修改、分发，只需保留版权声明与许可声明。

---

<p align="center">Made with 🌀 for tracking typhoons in real time.</p>
