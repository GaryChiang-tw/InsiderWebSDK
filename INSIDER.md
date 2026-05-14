# Insider Web SDK 串接說明

本文件描述此靜態測試站如何載入 Insider、如何依網址組裝 `InsiderQueue`，以及與 **Integration Wizard** 測試步驟的對照。實作以 `assets/js/insider-head.js` 與 `assets/js/insider-page-queue.js` 為準；若程式與文件不一致，以程式為準。

---

## 1. 標籤載入順序（各頁 `<head>`）

建議順序（與目前 HTML 一致）：

1. `assets/js/insider-head.js` — 初始化 `InsiderQueue`、`insiderFlow`
2. `assets/js/insider-page-queue.js` — 依目前網址 `push` 各事件（須在 **`ins.js` 之前**執行）
3. **非同步**載入 `ins.js`（本專案範例）  
   `https://k9booksuat.api.useinsider.com/ins.js?id=10014687`  
   正式環境請改為後台提供的標籤網址與 `id`。

精靈驗測時，請勿在 `init` 之後才用腳本補送主要頁面資料，否則可能與精靈檢查時機不同步。

---

## 2. `insider-head.js`

| 項目 | 說明 |
|------|------|
| `window.InsiderQueue` | 若不存在則設為空陣列 `[]`，供後續 `push` |
| `window.insiderFlow` | 設為 `3`（與後台／精靈預期一致；首頁偵測區會對照此值） |

---

## 3. `insider-page-queue.js` 總覽

- 以 `location.pathname` 判斷目前頁面（檔名比對，不分大小寫）。
- **結帳頁**為特例：僅送 `other` → `init`，**不送** `user`、`currency`，且執行完即 `return`，不進入後續共用邏輯。
- 其餘頁面：一律先送 `user`（登入完成頁為完整使用者，其餘為匿名），再依頁型送 `product` / `purchase` / `currency` / `home` / `cart` / `category` / `other` 等，最後送 **`init`**（全站每頁一次）。

---

## 4. 各頁 `InsiderQueue` 順序與重點

### 4.1 結帳頁 `checkout.html`（例外）

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `other` | `value.custom`：`page_name: "checkout"`、`checkout_step: "payment"`、`cart_total: 1280` |
| 2 | `init` | — |

無 `user`、無 `currency`。

### 4.2 首頁 `index.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 匿名：`uuid`、`birthday`（ISO 8601 Datetime 字串）、`language`、`gdpr_optin` |
| 2 | `currency` | `TWD` |
| 3 | `home` | `custom.demo_page: "home"` |
| 4 | `init` | — |

### 4.3 分類頁 `category.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 匿名（同上） |
| 2 | `currency` | `TWD` |
| 3 | `category` | `breadcrumb: ["Dresses", "Night Dresses"]`（與官方範例一致） |
| 4 | `init` | — |

### 4.4 商品頁 `product.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 匿名 |
| 2 | `product` | 完整課程範本欄位（見程式內 `productPageValue`） |
| 3 | `currency` | `USD` |
| 4 | `init` | — |

### 4.5 購物車 `cart.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 匿名 |
| 2 | `currency` | `TWD` |
| 3 | `cart` | `total`、`shipping_cost`、`items[]`（精簡 `lineItem`） |
| 4 | `init` | — |

### 4.6 訂單完成頁 `confirmation.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 匿名 |
| 2 | `purchase` | `order_id`、`total`、`items[]`（單筆為完整商品欄位 + `quantity`） |
| 3 | `currency` | `USD` |
| 4 | `init` | — |

### 4.7 模擬登入完成 `login-complete.html`

| 順序 | `type` | 說明 |
|------|--------|------|
| 1 | `user` | 完整 `loggedInUser`（John Doe 範本，含 `birthday` ISO Datetime 等） |
| 2 | `currency` | `TWD` |
| 3 | `other` | `name: "模擬登入完成"`、`custom.post_login_demo: true` |
| 4 | `init` | — |

---

## 5. 使用者欄位（`user`）

- **匿名**（多數頁）：`uuid`、`birthday`（`1993-03-21T00:00:00Z` 格式，對應文件 Datetime 範例型態）、`language`、`gdpr_optin`。
- **登入完成頁**：完整範本（`uuid`、`gender`、`birthday`、`name`、`surname`、`email`、`phone_number`、各 opt-in、`static_segment_id`、`age` 等），詳見 `insider-page-queue.js` 內 `loggedInUser`。

商品上的日期欄位（`item_*_date`）仍為展示用字串 `21.03.1993`，與 `user.birthday` 無關。

---

## 6. 與精靈測試步驟對照（1 → 10）

全站左側選單與首頁表格與下列順序對齊，測試時請開啟對應 **測試頁面** URL：

| 步驟 | 精靈項目（英文） | 測試頁面 |
|------|------------------|----------|
| 1 | Test Home Page Integration | `index.html` |
| 2 | Test Category Page Integration | `category.html` |
| 3 | Test Product Page Integration | `product.html` |
| 4 | Test Cart Page Integration | `cart.html` |
| 5 | Test Checkout Page Integration | `checkout.html` |
| 6 | Test Confirmation Page | `confirmation.html` |
| 7 | Test User Events | `login-complete.html` |
| 8 | Test Product Events | `product.html`（與步驟 3 同頁／同佇列） |
| 9 | Test Cart Events | `cart.html`（與步驟 4 同頁／同佇列） |
| 10 | Test Confirmation Events | `confirmation.html`（與步驟 6 同頁／同佇列） |

---

## 7. 首頁偵測（可選）

`index.html` 另載入 `assets/js/insider-diagnostics.js`，用於檢查 `InsiderQueue`、`insiderFlow`、`ins.js` 是否載入、`window.Insider` 是否出現等。僅首頁啟用。

---

## 8. 精靈與環境注意事項

- 精靈 **Test Integration** 可能帶 `webSdkWizard`、`insObjectName` 等 query；首頁有條件顯示的說明橫幅（`wizard-banner`）。
- 若精靈狀態未更新，請確認第三方 Cookie／追蹤保護，以及後台允許的網域是否包含此站實際網址（例如 GitHub Pages）。
- 上線前請將 `ins.js` 的 `id` 與網域改為正式帳號提供的標籤。

---

## 9. 相關檔案一覽

| 檔案 | 用途 |
|------|------|
| `assets/js/insider-head.js` | 初始化佇列與 `insiderFlow` |
| `assets/js/insider-page-queue.js` | 依網址組裝 `InsiderQueue` |
| `assets/js/insider-diagnostics.js` | 首頁整合偵測 |
| `assets/js/site.js` | 站內版本顯示等 |
| `*.html` | 各測試情境頁面 |

---

*文件產生自專案目前狀態；修改佇列邏輯時請同步更新本檔。*
