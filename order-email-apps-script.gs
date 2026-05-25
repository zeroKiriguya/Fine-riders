const ORDER_INBOX = "zero.tipping@gmail.com";
const BRAND_NAME = "F.I.N.E Riders";
const SUBJECT_PREFIX = "F.I.N.E Riders merch order";
const CUSTOMER_SUBJECT = "Your F.I.N.E Riders order";

function doGet() {
  const params = arguments[0] && arguments[0].parameter ? arguments[0].parameter : {};

  if (params.test === "1") {
    MailApp.sendEmail({
      to: ORDER_INBOX,
      subject: `${BRAND_NAME} order endpoint test`,
      body: `Test email sent at ${new Date().toLocaleString("en-GB")}. If you received this, the endpoint can send mail.`,
      name: BRAND_NAME,
    });

    return jsonResponse({
      ok: true,
      message: "Test email sent to ORDER_INBOX.",
    });
  }

  return jsonResponse({
    ok: true,
    message: "F.I.N.E Riders order endpoint is live.",
  });
}

function doPost(event) {
  try {
    const payload = parsePayload(event);
    const order = payload.order || payload;
    validateOrder(order);

    const orderBody = buildOrderBody(order);

    MailApp.sendEmail({
      to: ORDER_INBOX,
      replyTo: order.customerEmail,
      cc: order.customerEmail,
      subject: `${SUBJECT_PREFIX} ${order.id}`,
      body: orderBody,
      name: BRAND_NAME,
    });

    MailApp.sendEmail({
      to: order.customerEmail,
      subject: `${CUSTOMER_SUBJECT} ${order.id}`,
      body: [
        "Thanks for ordering from F.I.N.E Riders.",
        "",
        "This is your confirmation copy. We will be in touch with payment/collection details.",
        "",
        orderBody,
      ].join("\n"),
      name: BRAND_NAME,
    });

    return jsonResponse({ ok: true, orderId: order.id });
  } catch (error) {
    MailApp.sendEmail({
      to: ORDER_INBOX,
      subject: `${BRAND_NAME} order endpoint error`,
      body: String(error && error.stack ? error.stack : error),
      name: BRAND_NAME,
    });

    return jsonResponse({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function parsePayload(event) {
  const parameterPayload = event && event.parameter && event.parameter.payload;

  if (parameterPayload) {
    return JSON.parse(parameterPayload);
  }

  const postData = event && event.postData ? event.postData : {};
  const rawBody = postData.contents || "{}";
  const contentType = String(postData.type || "").toLowerCase();

  if (contentType.indexOf("application/x-www-form-urlencoded") !== -1 || rawBody.indexOf("payload=") === 0) {
    const formFields = parseFormBody(rawBody);
    return JSON.parse(formFields.payload || "{}");
  }

  return JSON.parse(rawBody);
}

function parseFormBody(rawBody) {
  return String(rawBody || "")
    .split("&")
    .reduce(function (fields, pair) {
      if (!pair) {
        return fields;
      }

      const parts = pair.split("=");
      const key = decodeFormValue(parts.shift() || "");
      const value = decodeFormValue(parts.join("="));
      fields[key] = value;
      return fields;
    }, {});
}

function decodeFormValue(value) {
  return decodeURIComponent(String(value || "").replace(/\+/g, " "));
}

function validateOrder(order) {
  if (!order || typeof order !== "object") {
    throw new Error("Missing order payload.");
  }

  ["id", "customerName", "customerEmail", "customerPhone"].forEach(function (field) {
    if (!order[field]) {
      throw new Error(`Missing order field: ${field}`);
    }
  });

  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order has no items.");
  }
}

function buildOrderBody(order) {
  const items = order.items
    .map(function (item) {
      return `- ${item.quantity} x ${item.name} (${item.colour} / ${item.size}) at ${money(item.price)} each = ${money(item.price * item.quantity)}`;
    })
    .join("\n");

  const deliveryDetails =
    order.delivery === "uk-delivery"
      ? [
          `Address: ${order.address || ""}`,
          `Town / City: ${order.city || ""}`,
          `Postcode: ${order.postcode || ""}`,
        ].join("\n")
      : "Collection: collect at meet";

  return [
    `Order ${order.id}`,
    `Placed: ${new Date(order.createdAt).toLocaleString("en-GB")}`,
    "",
    "Customer",
    `Name: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    "",
    "Items",
    items,
    "",
    "Delivery",
    `Method: ${order.delivery === "uk-delivery" ? "UK delivery" : "Collect at meet"}`,
    deliveryDetails,
    "",
    "Payment",
    `Method: ${String(order.payment || "").replace(/-/g, " ")}`,
    "",
    "Totals",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${money(order.shipping)}`,
    `Total: ${money(order.total)}`,
    "",
    "Notes",
    order.notes || "No notes.",
  ].join("\n");
}

function money(value) {
  return "£" + Number(value || 0).toFixed(2);
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
