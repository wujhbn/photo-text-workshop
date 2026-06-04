# 專案交接總結 (Project Handover Summary)

本專案是一個用來產生「長輩圖 / 祝福語圖片」的 Web 應用程式，允許使用者客製化背景、字體、排版與文字色彩，並能下載或直接分享圖片。

## 1. 核心功能與架構 (Core Features & Architecture)

目前專案的結構劃分如下：

*   **`src/components/Editor.tsx` (主編輯器 UI)**
    *   負責主要的介面呈現與互動邏輯。
    *   包含主題切換（早安、午安、晚安、日常）、字體與排版設定（直書/橫書、靠左/置中/靠右、文字垂直位置）、字級大小及粗細控制。
    *   支援「儲存目前設定」（寫入 `localStorage` 記憶使用者的偏好）。
    *   具備實作將畫布 (Canvas) 匯出為圖片，並呼叫原生 Web Share API 進行分享或下載的功能。
*   **`src/lib/canvas.ts` (畫布渲染引擎)**
    *   負責將背景、文字（主標題、內文如祝福語、日期及署名）繪製到 Canvas。
    *   包含處理直書與橫書排版的計算邏輯，並已修復主標題（早安、午安等）伴隨內文設定（靠左/置中/靠右）時的排版對齊計算。
*   **`src/lib/templates.ts` (背景模板與繪製)**
    *   根據不同的時段（`morning`, `afternoon`, `evening`, `daily`）提供對應的主色系與模板 (`TEMPLATES` 定義)。
    *   `generateSampleBackground`: 以 Canvas API 動態繪製背景（如太陽、月亮、花朵、雲朵及漸層）。在「日常 (daily)」時段有特定的雲朵及花朵位置配置。
*   **`src/lib/copy.ts` (文案生成邏輯)**
    *   負責根據所選的時段產生建議的預設祝福語。

## 2. 採用技術棧 (Tech Stack)

*   **前端框架**: React 18+ (使用 Vite 建置)
*   **樣式與排版**: Tailwind CSS
*   **圖示庫**: Lucide React
*   **開發語言**: TypeScript
*   **開發環境特性**: Client-Side SPA 架構，沒有後端資料庫，目前依靠 `localStorage` 進行偏好設定（字體、顏色、排版等狀態）的資料持久化。

## 3. 目前最新進度與待辦事項 (Current Status & Next Steps)

*   **最近完成的功能**:
    1.  新增了「日常 (daily)」時段的背景模板，調整了該狀態下的雲朵 (較低位置) 和花朵 (位於地面而非飄浮)。
    2.  加入了「儲存」(Save) 按鈕，可將當前的字體、大小、粗細、對直/橫書和顏色等排版狀態，作為預設偏好存入 `localStorage`，並有綠色的「已儲存」成功提示。
    3.  修復了「文字對齊 (靠左/置中/靠右)」邏輯中，標題位置無法跟著正確貼齊邊緣或置中的問題。
*   **尚未完成 / 接下來可以繼續的步驟 (視使用需求)**:
    *   若有需要，可以繼續增加別的模板或自訂底圖上傳功能。
    *   觀察 Canvas 渲染在某些螢幕比例的縮放與裁切效果是否符合預期，可隨時優化。

## 4. 給新對話 AI 的關鍵規則與邏輯 (Key Rules for AI)

*   **無後端約束**: 這是一個純前端的專案，產生圖像全程都在瀏覽器端透過 HTMLCanvasElement 一筆一筆畫出來 (`drawImage`, `fillText`)，不依賴後端 API 算圖。
*   **開發規範**: 請使用 Tailwind classes 開發 UI 組件，不要新增單獨的 `.css` 檔案。所有的圖示 (Icons) 接從 `lucide-react` 引入。
*   **Local Storage 狀態**: 組件初始化的 `useState` 有大量狀態是讀取 `localStorage` (例如 `pref_textAlign`, `pref_fontFamily`)，修改與重構時請務必保留或同步這些偏好設定鍵值。
*   **排版算圖邏輯**: 編輯 `lib/canvas.ts` 的坐標系統時需特別小心並維持 `safeWidth` / `safeHeight` 以及各種邊距 (margin) 的設計，以免文字被裁切。
