# PersonalWeb 專案脈絡

> 維護慣例：每次修改專案後，在本文件最上方新增一筆日期記錄；保留舊記錄，不覆寫歷史。

## 修改記錄

### 2026-10-06 — 個人經歷、多語言與日夜主題

- About/Journey 加入溫州、台北、悉尼與南十字星大學護理學習經歷，時間採用已確認的年月；公開提及基督徒身份、悉尼 Evangelical Union 與 Mandarin Bible Study 參與，以及騎行興趣。
- 新增可替換的台北與騎行插畫占位，並建立三語（英文、簡體、繁體）整站文案切換；已知作品依 slug 在前端翻譯，不更動 API/資料庫契約。
- 新增深紫夜間與暖米白日間主題；夜間為預設，使用者所選主題存於瀏覽器 `localStorage`。白天主色為 `#1990FF`，正文採較深藍以維持可讀性。
- 私人人生經歷筆記保存在 Copilot session 私有檔案區，不屬於網站倉庫或公開內容。
- 已通過前端單元測試、lint、production build 與 Playwright E2E；涵蓋中英切換、主題切換/記憶、已確認時間軸及行動版導航。
- 前端此批修改尚未提交或部署；更新及檢查狀態以本次工作記錄和 Git 工作樹為準。

### 2026-10-06 — 推送與自動部署恢復

- 已將 Docker Compose 正式遷移及圖示路徑修正推送至 GitHub `main`；部署提交為 `1fbf9a2`，包含先前獨立提交的檢查點 `49e0cbf`。
- 依部署安全流程執行 `scripts/deploy-macmini.sh --accept-reviewed-changes`，前端 unit/lint/E2E/build 與後端 9 項測試均通過；部署狀態檔已更新至 `1fbf9a2375a7a0753cca73c1f27019e076987bb1`。
- 再次確認 Compose API/資料庫健康，公開 API 回傳 4 筆作品，網站首頁 HTTP 200；Git 工作樹乾淨並與 `origin/main` 同步。
- GitHub `main` 自動更新已恢復；後續 migration/依賴清單變更仍遵循人工審閱及確認流程。Docker Desktop 登入啟動設定仍需在桌面設定中確認。

### 2026-10-06 — Compose 正式服務遷移

- 正式 API 與 PostgreSQL 16 已在目前這台 Mac 由 `personalweb-prod` Compose 專案執行；API 綁定 `127.0.0.1:5050` 供既有 Cloudflare Tunnel 轉送，PostgreSQL 僅在 Compose 內網可用，資料卷為 `personalweb-production-postgres-data`。
- 將既有正式資料備份至 `~/Library/Application Support/PersonalWeb/backups/personalweb-pre-docker-20261005T221131Z.dump`，完成 `pg_restore --list` 檢查，並在隔離 PostgreSQL 16 容器驗證可還原、`projects` 四筆資料與 Alembic `0001` 版本；切換前在正式 Compose 卷再次還原並檢查 API/公開 API。
- 舊 API LaunchAgent 已卸載但 plist 保留作回滾；Homebrew PostgreSQL 服務與原資料目錄刻意保留且仍在執行，不刪除、不與 Compose 資料卷共用。
- 靜態網站 LaunchAgent、Cloudflare Tunnel、前端託管方式及 n8n/Hermes AI 未遷移；Compose 使用共用 `compose.yaml` 加 `compose.dev.yaml` / `compose.prod.yaml` 環境覆蓋。
- API 映像已移除測試依賴；將 `psycopg[binary]` 移至正式依賴，供容器內 Alembic migration 使用。自動部署腳本已改為測試後建置並更新 Compose API。
- 原生本機 API、開發 Compose API、正式 Compose API 分別使用 `5052`、`5051`、`5050`，避免互相衝突。
- 將前一個檢查點中不存在的 `/icon.svg` 修正為實際存在的 `/favicon.svg`，避免推送後破圖示。
- Compose 機密存於被 Git 忽略的 `backend/.env.compose-api` 與 `backend/.secrets/postgres-admin-password`；Docker Desktop「登入時啟動」設定尚未核實。遷移時工作樹未提交曾使 Git 同步器安全拒絕更新，後續已推送並恢復，詳見上一筆記錄。

### 2026-10-06

- 新增根目錄 Docker Compose 本機開發配置：FastAPI + 獨立 PostgreSQL 16，API 使用 `127.0.0.1:5051`、資料庫使用 `127.0.0.1:5433`，資料存於專屬命名卷。
- 此次僅加入配置與操作文件；確認本機沒有 PersonalWeb Compose 容器、PersonalWeb 映像或 `5051` API 監聽。尚未以 Docker 建置或啟動網站，也未遷移 Mac mini 正式服務。
- 公開網站目前仍依既有靜態前端與 Mac mini/Cloudflare 部署流程提供；Docker 本機開發環境與生產環境彼此獨立。
- 更新 `README.md` 與 `SERVER_DEPLOYMENT.md`，說明 Compose 啟動、migration、seed、驗證、停止方式及資料卷風險。
- 將修改記錄日期慣例定為每次專案修改後於此檔頂部新增記錄，保留既有歷史。

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
- PostgreSQL 16：正式 API 使用 Docker Compose 內的 PostgreSQL；本機開發/舊資料回滾仍保留 Homebrew PostgreSQL。生產資料卷與開發卷分離，資料庫 URL 只存放在忽略的後端環境檔，不可傳到瀏覽器。
- Compose 設定：根目錄 `compose.yaml` 共用定義、`compose.dev.yaml` 開發覆蓋、`compose.prod.yaml` 正式覆蓋。正式專案 `personalweb-prod` 的 API 只映射到 `127.0.0.1:5050`；PostgreSQL 不發布主機連接埠。
- `backend/alembic/`：資料庫 migration；`db/seed.sql`：四筆公開作品資料。
- 未設定前端 API URL 時，專案作品由 `frontend/src/test/fixtures/projects.ts` 提供；設定 `VITE_API_BASE_URL` 後透過本機 API 讀取資料。原生 Uvicorn 使用 `5052`、開發 Compose 使用 `5051`、正式 Compose 使用 `5050`。
- 目前正式網站由本機靜態站點服務提供；FastAPI 與 PostgreSQL 16 由 Docker Compose 執行。Cloudflare DNS + 命名 Cloudflare Tunnel 對外提供 HTTPS；網站根域名仍路由至 `127.0.0.1:4173`，`api.` 路由至 `127.0.0.1:5050`。
- 原生 Homebrew PostgreSQL 和資料目錄保留作回滾/本機用途；正式 Compose PostgreSQL 僅在 Docker 網路中監聽，不將 5432 暴露到主機或 Tunnel。
- 已選擇將靜態前端遷移至 Cloudflare Pages，讓 GitHub `main` push 自動部署；Pages 專案建立與根域名切換尚待 Cloudflare Dashboard 完成。`api.` 子域名與 PostgreSQL 繼續在 Mac mini。
- Mac mini 自動同步腳本與完整部署/更新流程見 `SERVER_DEPLOYMENT.md`。

## 設計與互動慣例

- 保留深紫夜間主題，並支援暖米白背景與亮藍強調色的日間主題；使用 Manrope 字體與 Apple-register 精準感。
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
- `personalweb-prod` Docker Compose 專案：FastAPI 容器映射 `127.0.0.1:5050`、PostgreSQL 16 使用 `personalweb-production-postgres-data` 命名卷。
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist`：舊原生 FastAPI LaunchAgent，已卸載但保留供回滾。
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-site.plist`：`frontend/dist` 靜態檔案，`127.0.0.1:4173`
- `~/Library/LaunchAgents/com.geoseanlee.personalweb-tunnel.plist`：命名 Cloudflare Tunnel；`~/.cloudflared/config.yml` 將 API 和網站 hostname 路由至上述 loopback 服務。
- `scripts/deploy-macmini.sh` + `com.geoseanlee.personalweb-git-sync` LaunchAgent：設計為每 5 分鐘安全檢查 GitHub `main`，後端測試後建置/更新 Compose API；migration 與依賴變更需人工處理。部署改動尚未提交/推送前，髒工作樹檢查會拒絕自動同步。
- Homebrew PostgreSQL 16 仍透過 brew service 啟動並監聽 loopback；正式網站 API 不再使用它。不要建立 PostgreSQL 公網 DNS 路由或 Tunnel ingress。
- API 的 Swagger `/docs` 與 ReDoc 已停用；資料庫 URL 和 Cloudflare Tunnel 憑據不可提交 Git，也不可寫入前端環境變數。
- macOS 公共 DNS 傳播可能不一致；遇到根域名無法解析時，先用 `8.8.8.8`、`8.8.4.4` 查 DNS，並確認 API hostname、Tunnel 與來源服務，不要因為 DNS 暫存而重建隧道。
