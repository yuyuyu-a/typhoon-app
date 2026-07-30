# 台风实况 · 实时追踪

纯静态前端，实时展示台风路径 / 预报 / 风圈 / 历史，并支持 **CMA（中央气象台）vs JMA（日本气象厅）多源对比**。

## 特点
- **数据浏览器直连，无需后端**：CMA 与 JMA 均提供 HTTPS 接口且开放 CORS，国内浏览器免梯子即可实时访问。
- 实时路径、预报、风圈、历史路径。
- 白天 / 夜晚模式。
- 中 / 英 / 日 三语界面，且**地图地名**也可随语言切换。
- 多源对比面板：显示 CMA 与 JMA 当前位置偏差（km）。

## 在线访问（国内可达，无需梯子）
https://e6f844d833a340e699296dff94d0ce83.sh2.agentos-app.net

## 部署到 GitHub Pages
1. 在 GitHub 新建仓库 `typhoon-app`（空仓库即可，请勿勾选 README）。
2. 推送代码：`git push -u origin main`（已配置 SSH 走 22 端口，国内可达）。
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
4. 推送后 Actions 自动构建部署，地址为 `https://<用户名>.github.io/typhoon-app/`。
   - 注：GitHub Pages 在国内需梯子访问；国内免梯子请继续用上面的 CloudStudio 链接。

## 本地预览
用任意静态服务器打开本目录即可，例如：
```bash
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 说明
- `app.js` / `index.html` / `styles.css` / `places.js`：前端。
- `vendor/leaflet/`：本地化的 Leaflet 地图库（不依赖外网 CDN）。
- `server.js`：早期 Node 代理版本，现已不再用于生产（静态版数据改由浏览器直连），仅留作本地调试参考。
