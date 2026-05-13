/**
 * 依目前網址組裝 InsiderQueue（須在 ins.js 之前載入）。
 * - User：登入完成頁為完整 loggedInUser；其餘為匿名 user（含 birthday 等精靈常見必填欄位）。
 * - Product 頁：product → currency(USD) → init（user 仍先送）。
 * - 訂單完成頁：purchase（範本含完整 items）→ currency(USD) → init（user 仍先送）。
 * - 分類／列表頁：user → currency(TWD) → category（breadcrumb）→ init。
 * - 其他頁：user → currency(TWD) → 頁型 → init。
 */
(function () {
  var q = window.InsiderQueue;
  if (!Array.isArray(q)) return;

  var path = (window.location.pathname || "").toLowerCase();
  var page = "home";
  if (path.indexOf("login-complete.html") !== -1) page = "login_complete";
  else if (path.indexOf("product.html") !== -1) page = "product";
  else if (path.indexOf("cart.html") !== -1) page = "cart";
  else if (path.indexOf("category.html") !== -1) page = "category";
  else if (path.indexOf("confirmation.html") !== -1) page = "purchase";

  /** Product／purchase items 共用欄位範本 */
  var productPageValue = {
    id: "12345",
    name: "How to become a great product manager",
    taxonomy: ["Courses", "Product Management", "Advanced Courses"],
    unit_price: 100,
    unit_sale_price: 95.2,
    url: "https://www.mywebsite.com/en-us/product-management/advanced-courses/12345/",
    in_stock: true,
    stock: 100,
    product_image_url: "https://www.mywebsite.com/course-images/12345.png/",
    locale: "en_US",
    groupcode: "Group name",
    sku: "SKU1234",
    description: "Product description",
    brand: "My Brand",
    rating: 5,
    product_type: "Box",
    gender: "Male",
    omnibus_price: 35.12,
    omnibus_discount: 4.75,
    tags: ["Tag 1", "Tag 2", "Tag 3"],
    item_update_date: "21.03.1993",
    item_start_date: "21.03.1993",
    item_end_date: "21.03.1993",
  };

  var anonymousUser = {
    uuid: "websdk-anonymous-visitor",
    birthday: "21.03.1993",
    language: "zh_TW",
    gdpr_optin: true,
  };

  /** 登入完成頁 user 範本 */
  var loggedInUser = {
    uuid: "7bacpk03nc",
    gender: "M",
    birthday: "21.03.1993",
    has_transacted: true,
    transaction_count: 2,
    gdpr_optin: true,
    name: "John",
    surname: "Doe",
    username: "jdoe",
    email: "jdoe@mailservice.com",
    email_optin: false,
    phone_number: "+1234567890",
    sms_optin: true,
    whatsapp_optin: true,
    language: "en_us",
    returning: true,
    static_segment_id: [1, 3, 5],
    age: 34,
  };

  /** 購物車 line item（精簡；與商品 id／價格一致） */
  var lineItem = {
    id: productPageValue.id,
    name: productPageValue.name,
    taxonomy: productPageValue.taxonomy,
    unit_price: productPageValue.unit_price,
    unit_sale_price: productPageValue.unit_sale_price,
    quantity: 1,
    url: productPageValue.url,
    product_image_url: productPageValue.product_image_url,
  };

  /** Confirmation：purchase items 為完整 product 欄位 + quantity */
  var purchaseLineItem = Object.assign({ quantity: 1 }, productPageValue);

  var purchasePageValue = {
    order_id: "xyz123456",
    total: 95.2,
    items: [purchaseLineItem],
  };

  if (page === "login_complete") {
    q.push({ type: "user", value: loggedInUser });
  } else {
    q.push({ type: "user", value: anonymousUser });
  }

  if (page === "product") {
    q.push({ type: "product", value: productPageValue });
    q.push({ type: "currency", value: "USD" });
  } else if (page === "purchase") {
    q.push({ type: "purchase", value: purchasePageValue });
    q.push({ type: "currency", value: "USD" });
  } else {
    q.push({ type: "currency", value: "TWD" });
    switch (page) {
      case "login_complete":
        q.push({
          type: "other",
          value: {
            name: "模擬登入完成",
            custom: { post_login_demo: true },
          },
        });
        break;
      case "home":
        q.push({
          type: "home",
          value: {
            custom: { demo_page: "home" },
          },
        });
        break;
      case "cart":
        q.push({
          type: "cart",
          value: {
            total: 95.2,
            shipping_cost: 0,
            items: [lineItem],
          },
        });
        break;
      case "category":
        q.push({
          type: "category",
          value: {
            breadcrumb: ["Dresses", "Night Dresses"],
          },
        });
        break;
      default:
        q.push({ type: "home", value: { custom: { demo_page: "fallback" } } });
    }
  }

  q.push({ type: "init" });
})();
