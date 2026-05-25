const ORDER_INBOX = "zero.tipping@gmail.com";
const BRAND_NAME = "F.I.N.E Riders";
const SUBJECT_PREFIX = "F.I.N.E Riders merch order";
const CUSTOMER_SUBJECT = "Your F.I.N.E Riders order";
const SITE_URL = "https://raw.githubusercontent.com/zeroKiriguya/Fine-riders/main";
const EMAIL_HERO_IMAGE_URL = `${SITE_URL}/fine-riders-hero.png`;
const EMAIL_LOGO_IMAGE_URL = `${SITE_URL}/fr-drip-mark-transparent.png`;

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
      htmlBody: buildOrderEmailHtml(order, {
        title: "New merch order",
        intro: "A new F.I.N.E Riders order has landed.",
        badge: "Order received",
        showCustomerNote: false,
      }),
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
      htmlBody: buildOrderEmailHtml(order, {
        title: "Thanks for ordering",
        intro: "Your order is in. We will be in touch with payment and collection details.",
        badge: "Confirmation",
        showCustomerNote: true,
      }),
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

function buildOrderEmailHtml(order, options) {
  const deliveryLabel = order.delivery === "uk-delivery" ? "UK delivery" : "Collect at meet";
  const deliveryDetails =
    order.delivery === "uk-delivery"
      ? [
          labelValue("Address", order.address || ""),
          labelValue("Town / City", order.city || ""),
          labelValue("Postcode", order.postcode || ""),
        ].join("")
      : labelValue("Collection", "Collect at meet");

  const customerNote = options.showCustomerNote
    ? `<p style="margin:0 0 18px;color:#d7c8ec;font-size:15px;line-height:1.6;">This is your confirmation copy. Keep it handy, and we will follow up with the next steps.</p>`
    : "";

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#050008;font-family:Arial,Helvetica,sans-serif;color:#f7f1ff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050008;margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#0b0610;border:1px solid #37105c;border-radius:18px;overflow:hidden;box-shadow:0 0 38px rgba(145,28,255,.24);">
            <tr>
              <td style="padding:0;background:#08020c;">
                <img src="${escapeHtml(EMAIL_HERO_IMAGE_URL)}" alt="${escapeHtml(BRAND_NAME)}" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 12px;background:#0b0610;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="${escapeHtml(EMAIL_LOGO_IMAGE_URL)}" alt="FR" width="70" style="display:block;width:70px;height:auto;border:0;">
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;border:1px solid #9a22ff;color:#f0d8ff;background:#1b082b;padding:8px 12px;border-radius:999px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">${escapeHtml(options.badge)}</span>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:22px 0 8px;color:#ffffff;font-size:30px;line-height:1.1;letter-spacing:0;">${escapeHtml(options.title)}</h1>
                <p style="margin:0;color:#d7c8ec;font-size:16px;line-height:1.6;">${escapeHtml(options.intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                ${customerNote}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12071d;border:1px solid #311048;border-radius:14px;margin-bottom:18px;">
                  <tr>
                    <td style="padding:18px;">
                      ${labelValue("Order", order.id)}
                      ${labelValue("Placed", new Date(order.createdAt).toLocaleString("en-GB"))}
                      ${labelValue("Customer", order.customerName)}
                      ${labelValue("Email", order.customerEmail)}
                      ${labelValue("Phone", order.customerPhone)}
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#09030f;border:1px solid #311048;border-radius:14px;overflow:hidden;margin-bottom:18px;">
                  <tr>
                    <th align="left" style="padding:12px 14px;color:#b05cff;background:#160922;border-bottom:1px solid #311048;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Item</th>
                    <th align="center" style="padding:12px 14px;color:#b05cff;background:#160922;border-bottom:1px solid #311048;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                    <th align="right" style="padding:12px 14px;color:#b05cff;background:#160922;border-bottom:1px solid #311048;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total</th>
                  </tr>
                  ${buildItemRows(order)}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12071d;border:1px solid #311048;border-radius:14px;margin-bottom:18px;">
                  <tr>
                    <td style="padding:18px;">
                      ${labelValue("Delivery", deliveryLabel)}
                      ${deliveryDetails}
                      ${labelValue("Payment", String(order.payment || "").replace(/-/g, " "))}
                      ${labelValue("Notes", order.notes || "No notes.")}
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a0828;border:1px solid #7b21bd;border-radius:14px;">
                  <tr>
                    <td style="padding:18px;color:#d7c8ec;font-size:14px;line-height:1.8;">
                      Subtotal<br>
                      Delivery<br>
                      <strong style="color:#ffffff;font-size:18px;">Total</strong>
                    </td>
                    <td align="right" style="padding:18px;color:#ffffff;font-size:14px;line-height:1.8;">
                      ${money(order.subtotal)}<br>
                      ${money(order.shipping)}<br>
                      <strong style="color:#ffffff;font-size:22px;">${money(order.total)}</strong>
                    </td>
                  </tr>
                </table>

                <p style="margin:22px 0 0;color:#9e88b6;font-size:12px;line-height:1.6;text-align:center;">Ride together. Rep forever.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildItemRows(order) {
  return order.items
    .map(function (item) {
      const itemDetails = `${escapeHtml(item.name)} <span style="color:#9e88b6;">(${escapeHtml(item.colour)} / ${escapeHtml(item.size)})</span>`;
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

      return `
        <tr>
          <td style="padding:14px;border-bottom:1px solid #22102f;color:#ffffff;font-size:14px;line-height:1.5;">${itemDetails}</td>
          <td align="center" style="padding:14px;border-bottom:1px solid #22102f;color:#d7c8ec;font-size:14px;">${escapeHtml(item.quantity)}</td>
          <td align="right" style="padding:14px;border-bottom:1px solid #22102f;color:#ffffff;font-size:14px;">${money(lineTotal)}</td>
        </tr>`;
    })
    .join("");
}

function labelValue(label, value) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:4px 0;color:#9e88b6;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:4px 0;color:#ffffff;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>
    </table>`;
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(value) {
  return "£" + Number(value || 0).toFixed(2);
}

function money(value) {
  return "\u00A3" + Number(value || 0).toFixed(2);
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
