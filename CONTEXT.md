# PersonalWeb 專案脈絡

## 專案目的與內容

這是 George Li 的個人網站，與履歷資料庫 `CV_Editing` 分開。網站以英文介紹 George 在護理、軟體與個人經歷之間的連結，提供作品集、教育／工作經歷、社群連結與電子郵件聯絡方式。

- 個人定位：「A life between code & care.」
- 中文名：子璽；溫州背景，曾在台灣生活，目前居住於澳洲黃金海岸。
- 教育與工作經歷來自 LinkedIn／履歷，包含護理碩士、電腦科學碩士、經濟學學士、Mable 支援工作及 Touch of Pawfection 寵物美容。
- 精選專案：Blotz Task App、RenoPilot、Global Youth SDGs Summit、AI Health Management。
- 聯絡方式：`geoseanlee@gmail.com`；不公開住址、電話或推薦人聯絡資料。

## 技術架構

- `frontend/`：React 19、TypeScript、Vite 單頁前端。內容以元件組成，保留 `home`、`about`、`work`、`journey`、`contact` 頁內錨點。
- `backend/`：FastAPI、SQLAlchemy async、Pydantic；提供只讀 `GET /api/v1/projects` 和資料庫健康檢查 `GET /api/v1/health`。
- PostgreSQL 16：本機開發使用 Homebrew PostgreSQL 服務。資料庫連線字串僅放在 `backend/.env`，不可傳到瀏覽器。
- `backend/alembic/`：資料庫 migration；`db/seed.sql`：四筆公開作品資料。
- 未設定前端 API URL 時，專案作品由 `frontend/src/test/fixtures/projects.ts` 提供；設定 `VITE_API_BASE_URL` 後透過本機 API 讀取資料。
- 正式網站由 Mac mini 自架：Cloudflare DNS + 命名 Cloudflare Tunnel 對外提供 HTTPS；根域名服務前端靜態建置，`api.` 子域名服務 FastAPI。
- PostgreSQL 16、FastAPI、靜態檔案伺服器及 Cloudflare Tunnel 分別在 Mac mini 上執行；資料庫和兩個來源服務只綁定 loopback，只有 Tunnel 建立出站連線。
- Mac mini 的正式部署及更新流程見 `SERVER_DEPLOYMENT.md`。Cloudflare Pages 和舊 Quick Tunnel 不再是目前正式架構。

## 設計與互動慣例

- 保留深紫與白色的視覺方向、Manrope 字體與 Apple-register 精準感。
- 支援手機、平板與桌面；使用語意化 HTML、跳至內容連結、可見鍵盤焦點、`aria-expanded` 行動導覽和減少動態效果設定。
- 首頁導覽列固定顯示個人頭像；預設保持原色但稍微調暗、尺寸不高於導覽列。桌面指標停留約 300ms 後頭像變亮並向右放大到約 4 倍；放大後互動命中區域同步擴大，外框維持 2px，避免游標移動時反覆收合。
- 首頁右側使用 `frontend/public/images/hero-photo.jpg`（原圖 `frontend/src/assets/photos/lay-bck.jpg`），水平鏡像、四周漸層羽化，包在亮邊 Apple 玻璃卡片中。滑鼠可輕微傾斜卡片，按下有回饋；載入失敗顯示 `#282c34` 占位色。
- 頭像為 `frontend/public/images/profile-photo.jpg`。未上線的另一張照片在 `frontend/src/assets/photos/earphone-me-xtnd.jpeg`。圖片是靜態前端資產，不放入資料庫或 API。
- 瀏覽器圖示使用 `frontend/public/favicon.svg`、`favicon-32.png` 與 `apple-touch-icon.png`。
- 頁面主要區塊在 API 或資料庫不可用時仍可使用；作品 API 錯誤不可偽裝成空清單。
- LinkedIn、Instagram、GitHub 外連使用新分頁及 `rel="noopener noreferrer"`。

## 本機啟動

請依根目錄 `README.md` 操作。只預覽前端不需要資料庫；完整前後端需先啟動本機 PostgreSQL、設定 `backend/.env`、執行 Alembic migration 並載入 `db/seed.sql`，然後分別啟動 FastAPI 和 Vite。

## Mac mini 正式服務概況

- 網站：`https://pluckyravengeorgeli.eu.cc`
- 唯讀 API：`https://api.pluckyravengeorgeli.eu.cc/api/v1/health`、`/api/v1/projects`
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist`：FastAPI，`127.0.0.1:5050`
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-site.plist`：`frontend/dist` 靜態檔案，`127.0.0.1:4173`
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-tunnel.plist`：命名 Cloudflare Tunnel；`~/.cloudflared/config.yml` 將 API 和網站 hostname 路由至上述 loopback 服務。
- PostgreSQL 16 經 Homebrew 服務啟動，只監聽 `127.0.0.1` 和 `::1`。不要建立 PostgreSQL 公網 DNS 路由或 Tunnel ingress。
- API 的 Swagger `/docs` 與 ReDoc 已停用；資料庫 URL 和 Cloudflare Tunnel 憑據不可提交 Git，也不可寫入前端環境變數。
- macOS 公共 DNS 傳播可能不一致；遇到根域名無法解析時，先用 `8.8.8.8`、`8.8.4.4` 查 DNS，並確認 API hostname、Tunnel 與來源服務，不要因為 DNS 暫存而重建隧道。
