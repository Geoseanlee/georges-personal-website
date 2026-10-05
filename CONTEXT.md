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
- 本機開發階段前端與 API 都在開發者電腦運行。Mac mini + Cloudflare Tunnel 與 Cloudflare Pages 是之後可選的部署方案。

## 設計與互動慣例

- 保留深紫與白色的視覺方向、Manrope 字體與 Apple-register 精準感。
- 支援手機、平板與桌面；使用語意化 HTML、跳至內容連結、可見鍵盤焦點、`aria-expanded` 行動導覽和減少動態效果設定。
- 頁面主要區塊在 API 或資料庫不可用時仍可使用；作品 API 錯誤不可偽裝成空清單。
- LinkedIn、Instagram、GitHub 外連使用新分頁及 `rel="noopener noreferrer"`。

## 本機啟動

請依根目錄 `README.md` 操作。只預覽前端不需要資料庫；完整前後端需先啟動本機 PostgreSQL、設定 `backend/.env`、執行 Alembic migration 並載入 `db/seed.sql`，然後分別啟動 FastAPI 和 Vite。
