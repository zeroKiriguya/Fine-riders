const dataKey = window.FINE_SITE_DATA_KEY || "fine-riders-public-data-v2";
const defaultData = window.FINE_DEFAULT_DATA || {
  hero: {
    eyebrow: "Home of the Ruroc Army",
    headlineTop: "F.I.N.E",
    headlineBottom: "Riders",
    taglineLead: "Ride together.",
    taglineAccent: "Rep forever.",
    lede: "Fucked Inside Not Empty. A rider movement for the ones who turn up, stand out, and carry the purple mark.",
  },
  announcement: "Copdock Motorbike Show route update: Sunday 6 September 2026. F.I.N.E meet and leave times TBC.",
  story: {
    eyebrow: "About the brand",
    title: "Fucked Inside Not Empty.",
    body: "F.I.N.E Riders is more than a group. It is a mindset: ride together, rep hard, and stand out everywhere the crew goes.",
  },
  merch: {
    eyebrow: "Merch",
    heading: "Built around the mark.",
    featureEyebrow: "Signature drop",
    featureName: "F.I.N.E Riders Hoodie",
    featureDescription: "Black heavyweight hoodie with purple FR graphics, sleeve branding, relaxed fit, and color options matching the crew identity.",
    featureButton: "Add hoodie",
    hoodiePrice: 35,
    colours: ["Black / Purple", "Purple / White"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    products: [
      {
        id: "bike-flight-tags",
        tag: "Accessories",
        name: "Bike Flight Tags",
        price: 8,
        colour: "Purple FR",
        size: "Tag",
        button: "Add tags",
      },
    ],
  },
  events: [],
  rideout: {
    eyebrow: "Rideouts",
    heading: "Copdock show route info without the group-chat chaos.",
    routeLabel: "Next planned destination",
    name: "Copdock Motorbike Show",
    meet: "6 Sept 2026",
    rollout: "TBC",
    distance: "TBC",
    rulesTitle: "Current plan",
    rules: [
      "Show date is Sunday 6 September 2026; gates open 9am.",
      "Destination is Trinity Park, Ipswich, IP3 8UH.",
      "F.I.N.E meet point and leave time are still to be confirmed.",
      "Route notes will be posted once the group plan is locked in.",
    ],
  },
  join: {
    eyebrow: "Join the signal",
    heading: "Get the next merch and rideout update.",
    body: "Add your name and email to receive launch news, local event changes, meet point updates, and merch drop alerts.",
  },
  footer: {
    social: "@ZERO_KIRIGUYA",
  },
  checkout: {
    shippingPrice: 4.99,
  },
  orders: {
    email: "",
    endpoint: "",
    subjectPrefix: "F.I.N.E Riders merch order",
    confirmationSubject: "Your F.I.N.E Riders order",
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, override) {
  if (!override || typeof override !== "object") {
    return base;
  }

  Object.entries(override).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      base[key] = value;
      return;
    }

    if (value && typeof value === "object") {
      base[key] = deepMerge(base[key] || {}, value);
      return;
    }

    base[key] = value;
  });

  return base;
}

function loadSiteData() {
  return normalizeSiteData(clone(defaultData));
}

function normalizeSiteData(data) {
  const flightTags = {
    id: "bike-flight-tags",
    tag: "Accessories",
    name: "Bike Flight Tags",
    price: 8,
    optionLabel: "",
    options: [],
    colour: "Purple FR",
    size: "Tag",
    button: "Add tags",
  };

  const oldProductIds = ["hoodie-black-purple", "hoodie-purple-white", "sticker-pack"];
  data.merch.products = (data.merch.products || [])
    .filter((product) => !oldProductIds.includes(product.id))
    .map((product) => (product.name === "FR Sticker Pack" ? flightTags : product));

  if (!data.merch.products.some((product) => product.id === "bike-flight-tags")) {
    data.merch.products.push(flightTags);
  }

  data.events = (data.events || []).map((event) => ({
    ...event,
    description: String(event.description || "").replace("sticker run", "flight tag run"),
  }));

  data.orders = {
    email: "",
    endpoint: "",
    subjectPrefix: "F.I.N.E Riders merch order",
    confirmationSubject: "Your F.I.N.E Riders order",
    ...(data.orders || {}),
  };

  return data;
}

const siteData = loadSiteData();

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

function renderSelectOptions(select, values) {
  select.textContent = "";
  values.forEach((value) => select.append(createOption(value)));
}

function moneyValue(value) {
  return Number(value || 0);
}

function renderProductForm(product) {
  const form = document.createElement("form");
  form.className = "product-form compact";
  form.dataset.productForm = "";
  form.dataset.productId = product.id;
  form.dataset.productName = product.name;
  form.dataset.productPrice = String(moneyValue(product.price));

  const controls = document.createElement("div");
  controls.className = "product-controls";

  const optionName = product.optionName || (product.colour ? "size" : "colour");
  const hasOptions = Array.isArray(product.options) && product.options.length > 0;

  if (hasOptions) {
    const optionLabel = document.createElement("label");
    const optionText = document.createElement("span");
    optionText.textContent = product.optionLabel || "Option";
    const optionSelect = document.createElement("select");
    optionSelect.name = optionName;
    renderSelectOptions(optionSelect, product.options);
    optionLabel.append(optionText, optionSelect);
    controls.append(optionLabel);
  }

  const quantityLabel = document.createElement("label");
  const quantityText = document.createElement("span");
  quantityText.textContent = "Qty";
  const quantityInput = document.createElement("input");
  quantityInput.name = "quantity";
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.max = "10";
  quantityInput.value = "1";
  quantityLabel.append(quantityText, quantityInput);

  controls.append(quantityLabel);

  const hiddenFields = [];
  if (optionName !== "colour") {
    hiddenFields.push(["colour", product.colour || "Standard"]);
  }
  if (optionName !== "size") {
    hiddenFields.push(["size", product.size || "One size"]);
  }

  const button = document.createElement("button");
  button.className = "button product-button";
  button.type = "submit";
  button.textContent = product.button || "Add to cart";

  hiddenFields.forEach(([name, value]) => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = name;
    hidden.value = value;
    form.append(hidden);
  });

  form.append(controls, button);
  return form;
}

function renderProductTile(product) {
  const article = document.createElement("article");
  article.className = `product-tile${product.id === "bike-flight-tags" ? " flight-tag-tile" : ""}`;

  const tag = document.createElement("p");
  tag.textContent = product.tag;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = formatMoney(moneyValue(product.price));

  article.append(tag, title, price, renderProductForm(product));
  return article;
}

function renderSiteContent() {
  setText(".hero-copy .eyebrow", siteData.hero.eyebrow);
  setText("h1 span:first-child", siteData.hero.headlineTop);
  setText("h1 span:last-child", siteData.hero.headlineBottom);
  const tagline = document.querySelector(".hero-tagline");
  if (tagline) {
    tagline.textContent = `${siteData.hero.taglineLead} `;
    const accent = document.createElement("span");
    accent.textContent = siteData.hero.taglineAccent;
    tagline.append(accent);
  }
  setText(".hero-lede", siteData.hero.lede);
  setText(".ticker p", siteData.announcement);

  setText(".brand-story .eyebrow", siteData.story.eyebrow);
  setText(".brand-story h2", siteData.story.title);
  setText(".brand-story p:not(.eyebrow)", siteData.story.body);

  setText("#shop .section-heading .eyebrow", siteData.merch.eyebrow);
  setText("#shop .section-heading h2", siteData.merch.heading);
  setText(".merch-copy .eyebrow", siteData.merch.featureEyebrow);
  setText(".merch-copy h3", siteData.merch.featureName);
  setText(".merch-copy p:not(.eyebrow)", siteData.merch.featureDescription);
  setText(".merch-copy .price", formatMoney(moneyValue(siteData.merch.hoodiePrice)));

  const sizeRow = document.querySelector(".size-row");
  if (sizeRow) {
    sizeRow.textContent = "";
    siteData.merch.sizes.forEach((size) => {
      const span = document.createElement("span");
      span.textContent = size;
      sizeRow.append(span);
    });
  }

  const featureForm = document.querySelector(".merch-copy [data-product-form]");
  if (featureForm) {
    featureForm.dataset.productName = siteData.merch.featureName;
    featureForm.dataset.productPrice = String(moneyValue(siteData.merch.hoodiePrice));
    renderSelectOptions(featureForm.querySelector("select[name='colour']"), siteData.merch.colours);
    renderSelectOptions(featureForm.querySelector("select[name='size']"), siteData.merch.sizes);
    featureForm.querySelector(".product-button").textContent = siteData.merch.featureButton;
  }

  const merchGrid = document.querySelector(".merch-grid");
  if (merchGrid) {
    merchGrid.textContent = "";
    siteData.merch.products.forEach((product) => merchGrid.append(renderProductTile(product)));
  }

  const eventList = document.querySelector(".event-list");
  if (eventList) {
    eventList.textContent = "";
    siteData.events.forEach((event) => {
      const article = document.createElement("article");
      const time = document.createElement("time");
      time.dateTime = event.date;
      time.textContent = event.displayDate;
      const wrapper = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = event.title;
      const description = document.createElement("p");
      description.textContent = event.description;
      const label = document.createElement("span");
      label.textContent = event.label;
      wrapper.append(title, description);
      article.append(time, wrapper, label);
      eventList.append(article);
    });
  }

  setText("#rideouts .section-heading .eyebrow", siteData.rideout.eyebrow);
  setText("#rideouts .section-heading h2", siteData.rideout.heading);
  setText(".route-label", siteData.rideout.routeLabel);
  setText(".route-card h3", siteData.rideout.name);
  setText(".route-card dd:nth-of-type(1)", siteData.rideout.meet);

  const routeValues = document.querySelectorAll(".route-card dd");
  if (routeValues.length >= 3) {
    routeValues[0].textContent = siteData.rideout.meet;
    routeValues[1].textContent = siteData.rideout.rollout;
    routeValues[2].textContent = siteData.rideout.distance;
  }

  setText(".rideout-rules h3", siteData.rideout.rulesTitle);
  const rules = document.querySelector(".rideout-rules ul");
  if (rules) {
    rules.textContent = "";
    siteData.rideout.rules.forEach((rule) => {
      const li = document.createElement("li");
      li.textContent = rule;
      rules.append(li);
    });
  }

  setText(".join-copy .eyebrow", siteData.join.eyebrow);
  setText(".join-copy h2", siteData.join.heading);
  setText(".join-copy p:not(.eyebrow)", siteData.join.body);

  const footerSocial = document.querySelector(".site-footer p:nth-of-type(2)");
  if (footerSocial) {
    footerSocial.textContent = siteData.footer.social;
  }

  const shippingInput = document.querySelector("input[value='uk-delivery']");
  const shippingLabel = shippingInput?.closest("label")?.querySelector("strong");
  if (shippingInput && shippingLabel) {
    shippingInput.dataset.shipping = String(moneyValue(siteData.checkout.shippingPrice));
    shippingLabel.textContent = formatMoney(moneyValue(siteData.checkout.shippingPrice));
  }
}

renderSiteContent();

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function initHeroNeonField() {
  const canvas = document.querySelector("#hero-neon-field");
  const context = canvas?.getContext("2d", { alpha: true });

  if (!canvas || !context || reduceMotionQuery.matches) {
    return;
  }

  const colours = ["166, 24, 255", "211, 76, 255", "255, 123, 22", "76, 247, 255"];
  let width = 0;
  let height = 0;
  let traces = [];
  let frameId = 0;

  function resetTrace(trace = {}) {
    const vertical = Math.random() > 0.34;
    trace.vertical = vertical;
    trace.x = Math.random() * width;
    trace.y = Math.random() * height;
    trace.length = vertical ? 70 + Math.random() * 190 : 110 + Math.random() * 260;
    trace.speed = vertical ? 0.7 + Math.random() * 2.2 : 0.55 + Math.random() * 1.6;
    trace.alpha = 0.18 + Math.random() * 0.45;
    trace.lineWidth = 1 + Math.random() * 1.4;
    trace.colour = colours[Math.floor(Math.random() * colours.length)];
    return trace;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const traceCount = Math.min(92, Math.max(34, Math.round((width * height) / 18000)));
    traces = Array.from({ length: traceCount }, () => resetTrace());
  }

  function drawTrace(trace) {
    const endX = trace.vertical ? trace.x : trace.x + trace.length;
    const endY = trace.vertical ? trace.y + trace.length : trace.y;
    const gradient = context.createLinearGradient(trace.x, trace.y, endX, endY);
    gradient.addColorStop(0, `rgba(${trace.colour}, 0)`);
    gradient.addColorStop(0.5, `rgba(${trace.colour}, ${trace.alpha})`);
    gradient.addColorStop(1, `rgba(${trace.colour}, 0)`);

    context.strokeStyle = gradient;
    context.lineWidth = trace.lineWidth;
    context.beginPath();
    context.moveTo(trace.x, trace.y);
    context.lineTo(endX, endY);
    context.stroke();

    if (trace.vertical) {
      trace.y += trace.speed;
      if (trace.y - trace.length > height) {
        trace.y = -trace.length;
        trace.x = Math.random() * width;
      }
      return;
    }

    trace.x += trace.speed;
    if (trace.x - trace.length > width) {
      trace.x = -trace.length;
      trace.y = Math.random() * height;
    }
  }

  function drawFrame() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    traces.forEach(drawTrace);
    context.globalCompositeOperation = "source-over";
    frameId = requestAnimationFrame(drawFrame);
  }

  resizeCanvas();
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }
  frameId = requestAnimationFrame(drawFrame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      return;
    }

    frameId = requestAnimationFrame(drawFrame);
  });
}

function initHeroParallax() {
  const hero = document.querySelector(".hero");

  if (!hero || reduceMotionQuery.matches) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.setProperty("--hero-shift-x", (-x * 18).toFixed(2));
    hero.style.setProperty("--hero-shift-y", (-y * 14).toFixed(2));
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-shift-x", "0");
    hero.style.setProperty("--hero-shift-y", "0");
  });
}

function initScrollReveal() {
  const revealItems = document.querySelectorAll(
    [
      ".section-heading",
      ".story-mark",
      ".brand-story > div:last-child",
      ".merch-feature",
      ".product-tile",
      ".prep-live-card",
      ".prep-metrics article",
      ".prep-traffic-card",
      ".prep-checklist",
      ".event-list article",
      ".route-card",
      ".rideout-rules",
      ".join-copy",
      ".join-form",
    ].join(",")
  );

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  document.body.classList.add("motion-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.transitionDelay = `${Math.min((index % 5) * 70, 280)}ms`;
    observer.observe(item);
  });
}

function pulseOrderControls(form) {
  const button = form.querySelector(".product-button");
  const animatedItems = [...cartOpenButtons, button].filter(Boolean);

  animatedItems.forEach((item) => {
    item.classList.remove("is-confirming");
    void item.offsetWidth;
    item.classList.add("is-confirming");
    window.setTimeout(() => item.classList.remove("is-confirming"), 700);
  });
}

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const joinForm = document.querySelector("#join-form");
const statusMessage = document.querySelector("#form-status");
const cartStatus = document.querySelector("#cart-status");
const cartOpenButtons = document.querySelectorAll("[data-cart-open]");
const cartCloseButtons = document.querySelectorAll("[data-cart-close]");
const cartDrawer = document.querySelector("#cart-drawer");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const checkoutStart = document.querySelector("#checkout-start");
const checkoutForm = document.querySelector("#checkout-form");
const shippingFields = document.querySelector("#shipping-fields");
const orderSuccess = document.querySelector("#order-success");
const orderMessage = document.querySelector("#order-message");
const orderSend = document.querySelector("#order-send");
const orderCustomerCopy = document.querySelector("#order-customer-copy");
const orderCopy = document.querySelector("#order-copy");
const orderCopyStatus = document.querySelector("#order-copy-status");
const orderReset = document.querySelector("#order-reset");
const stepButtons = document.querySelectorAll("[data-cart-step]");
const stepPanels = document.querySelectorAll("[data-cart-panel]");
const moneyOutputs = {
  cartSubtotal: document.querySelector("#cart-subtotal"),
  cartShipping: document.querySelector("#cart-shipping"),
  cartTotal: document.querySelector("#cart-total"),
  checkoutSubtotal: document.querySelector("#checkout-subtotal"),
  checkoutShipping: document.querySelector("#checkout-shipping"),
  checkoutTotal: document.querySelector("#checkout-total"),
};
const ridePrepButton = document.querySelector("#ride-prep-location");
const ridePrepStatus = document.querySelector("#prep-status");
const ridePrepFields = {
  condition: document.querySelector("#prep-condition"),
  location: document.querySelector("#prep-location-label"),
  temp: document.querySelector("#prep-temp"),
  feels: document.querySelector("#prep-feels"),
  wind: document.querySelector("#prep-wind"),
  gusts: document.querySelector("#prep-gusts"),
  rain: document.querySelector("#prep-rain"),
  precip: document.querySelector("#prep-precip"),
  visibility: document.querySelector("#prep-visibility"),
  updated: document.querySelector("#prep-updated"),
};
const defaultRidePrepLocation = {
  label: "Colchester, UK",
  latitude: 51.8959,
  longitude: 0.8919,
};

const CART_KEY = "fine-riders-cart";
const ORDER_KEY = "fine-riders-last-order";
const currentPrices = {
  "hoodie-signature": moneyValue(siteData.merch.hoodiePrice),
  ...Object.fromEntries(siteData.merch.products.map((product) => [product.id, moneyValue(product.price)])),
};

let cart = loadCart();

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return savedCart.map((item) => {
      if (item.id === "sticker-pack") {
        return {
          ...item,
          id: "bike-flight-tags",
          name: "Bike Flight Tags",
          colour: "Purple FR",
          size: "Tag",
          price: currentPrices["bike-flight-tags"] || 8,
        };
      }

      return {
        ...item,
        price: currentPrices[item.id] || item.price,
      };
    });
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function setMenuOpen(isOpen) {
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function setCartOpen(isOpen) {
  document.body.classList.toggle("cart-open", isOpen);
  cartBackdrop.hidden = !isOpen;
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartOpenButtons.forEach((button) => {
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

function showCartStep(step) {
  if (step === "checkout" && cart.length === 0) {
    showCartStep("cart");
    return;
  }

  orderSuccess.hidden = true;
  orderSuccess.classList.remove("is-active");

  stepButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.cartStep === step);
  });

  stepPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.cartPanel === step);
  });
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getShipping() {
  if (cart.length === 0) {
    return 0;
  }

  const selected = checkoutForm.querySelector("input[name='delivery']:checked");
  return Number(selected?.dataset.shipping || 0);
}

function getTotal() {
  return getSubtotal() + getShipping();
}

function getItemKey(item) {
  return [item.id, item.colour, item.size].join("|");
}

function setCartMessage(message) {
  if (cartStatus) {
    cartStatus.textContent = message;
  }
}

function updateShippingFields() {
  const selected = checkoutForm.querySelector("input[name='delivery']:checked");
  const needsShipping = selected?.value === "uk-delivery";
  shippingFields.hidden = !needsShipping;

  shippingFields.querySelectorAll("input").forEach((input) => {
    input.required = needsShipping;
  });

  renderCart();
}

function renderTotals() {
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;

  moneyOutputs.cartSubtotal.textContent = formatMoney(subtotal);
  moneyOutputs.cartShipping.textContent = formatMoney(shipping);
  moneyOutputs.cartTotal.textContent = formatMoney(total);
  moneyOutputs.checkoutSubtotal.textContent = formatMoney(subtotal);
  moneyOutputs.checkoutShipping.textContent = formatMoney(shipping);
  moneyOutputs.checkoutTotal.textContent = formatMoney(total);
}

function renderCartItem(item, index) {
  const article = document.createElement("article");
  article.className = "cart-item";

  const detail = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.name;
  const meta = document.createElement("p");
  meta.textContent = `${item.colour} / ${item.size}`;
  const unit = document.createElement("p");
  unit.textContent = `${formatMoney(item.price)} each`;

  const controls = document.createElement("div");
  controls.className = "quantity-controls";
  controls.setAttribute("aria-label", `${item.name} quantity`);

  const decrease = document.createElement("button");
  decrease.type = "button";
  decrease.textContent = "-";
  decrease.dataset.cartAction = "decrease";
  decrease.dataset.index = String(index);

  const quantity = document.createElement("span");
  quantity.textContent = String(item.quantity);

  const increase = document.createElement("button");
  increase.type = "button";
  increase.textContent = "+";
  increase.dataset.cartAction = "increase";
  increase.dataset.index = String(index);

  controls.append(decrease, quantity, increase);

  const remove = document.createElement("button");
  remove.className = "remove-item";
  remove.type = "button";
  remove.textContent = "Remove";
  remove.dataset.cartAction = "remove";
  remove.dataset.index = String(index);

  detail.append(title, meta, unit, controls, remove);

  const total = document.createElement("strong");
  total.className = "cart-item-total";
  total.textContent = formatMoney(item.price * item.quantity);

  article.append(detail, total);
  return article;
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(itemCount);
  cartItems.textContent = "";
  cartEmpty.hidden = cart.length > 0;
  checkoutStart.disabled = cart.length === 0;

  cart.forEach((item, index) => {
    cartItems.append(renderCartItem(item, index));
  });

  renderTotals();
  saveCart();
}

function addItem(form) {
  const formData = new FormData(form);
  const quantity = Math.min(10, Math.max(1, Number(formData.get("quantity")) || 1));
  const item = {
    id: form.dataset.productId,
    name: form.dataset.productName,
    price: Number(form.dataset.productPrice),
    colour: String(formData.get("colour") || "Standard"),
    size: String(formData.get("size") || "One size"),
    quantity,
  };

  const existing = cart.find((cartItem) => getItemKey(cartItem) === getItemKey(item));
  if (existing) {
    existing.quantity = Math.min(10, existing.quantity + quantity);
  } else {
    cart.push(item);
  }

  renderCart();
  pulseOrderControls(form);
  setCartMessage(`${item.name} added. ${cartCount.textContent} item${cartCount.textContent === "1" ? "" : "s"} in the merch cart.`);
  showCartStep("cart");
  setCartOpen(true);
}

function updateCartItem(index, action) {
  const item = cart[index];
  if (!item) {
    return;
  }

  if (action === "increase") {
    item.quantity = Math.min(10, item.quantity + 1);
  }

  if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }
  }

  if (action === "remove") {
    cart.splice(index, 1);
  }

  renderCart();
  if (cart.length === 0) {
    showCartStep("cart");
  }
}

function getDeliveryLabel(value) {
  return value === "uk-delivery" ? "UK delivery" : "Collect at meet";
}

function getPaymentLabel(value) {
  return value.replaceAll("-", " ");
}

function buildOrderEmailBody(order) {
  const itemLines = order.items.map(
    (item) =>
      `- ${item.quantity} x ${item.name} (${item.colour} / ${item.size}) at ${formatMoney(item.price)} each = ${formatMoney(item.price * item.quantity)}`
  );
  const deliveryLines =
    order.delivery === "uk-delivery"
      ? [
          `Address: ${order.address}`,
          `Town / City: ${order.city}`,
          `Postcode: ${order.postcode}`,
        ]
      : ["Collection: collect at meet"];

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
    ...itemLines,
    "",
    "Delivery",
    `Method: ${getDeliveryLabel(order.delivery)}`,
    ...deliveryLines,
    "",
    "Payment",
    `Method: ${getPaymentLabel(order.payment)}`,
    "",
    "Totals",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Delivery: ${formatMoney(order.shipping)}`,
    `Total: ${formatMoney(order.total)}`,
    "",
    "Notes",
    order.notes || "No notes.",
  ].join("\n");
}

function buildCustomerCopyBody(order) {
  return [
    "Thanks for ordering from F.I.N.E Riders.",
    "",
    "Keep this as your order copy. Your order is not fully with the group until the order email has been sent.",
    "",
    buildOrderEmailBody(order),
  ].join("\n");
}

function buildMailLink({ to = "", cc = "", subject, body }) {
  const params = new URLSearchParams({
    subject,
    body,
  });

  if (cc) {
    params.set("cc", cc);
  }

  return `mailto:${to.trim()}?${params.toString()}`;
}

function setOrderLinkState(link, href, isEnabled) {
  if (!link) {
    return;
  }

  if (isEnabled) {
    link.href = href;
    link.removeAttribute("aria-disabled");
    return;
  }

  link.removeAttribute("href");
  link.setAttribute("aria-disabled", "true");
}

function updateOrderActions(order, deliveryResult = { mode: "manual" }) {
  const orderEmail = String(siteData.orders?.email || "").trim();
  const orderSubject = `${siteData.orders?.subjectPrefix || "F.I.N.E Riders merch order"} ${order.id}`;
  const orderBody = buildOrderEmailBody(order);
  const customerSubject = `${siteData.orders?.confirmationSubject || "Your F.I.N.E Riders order"} ${order.id}`;
  const customerBody = buildCustomerCopyBody(order);

  setOrderLinkState(
    orderSend,
    buildMailLink({
      to: orderEmail,
      cc: order.customerEmail,
      subject: orderSubject,
      body: orderBody,
    }),
    Boolean(orderEmail)
  );

  if (orderSend) {
    orderSend.textContent = deliveryResult.mode === "automatic" ? "Send backup order email" : "Send order email";
  }

  setOrderLinkState(
    orderCustomerCopy,
    buildMailLink({
      to: order.customerEmail,
      subject: customerSubject,
      body: customerBody,
    }),
    Boolean(order.customerEmail)
  );

  if (orderCopy) {
    orderCopy.dataset.orderDetails = orderBody;
  }

  if (orderCopyStatus) {
    if (deliveryResult.mode === "automatic" && deliveryResult.ok) {
      orderCopyStatus.textContent = "Order email has been submitted automatically. The buttons below are backups.";
      return;
    }

    if (deliveryResult.mode === "automatic" && !deliveryResult.ok) {
      orderCopyStatus.textContent = "Automatic order email could not be sent. Use the backup email button or copy the order details.";
      return;
    }

    orderCopyStatus.textContent = orderEmail
      ? "Tap send order email so the group receives it. Your email is copied in."
      : "Order inbox is not set yet. Add an inbox email or automatic endpoint in site-data.js.";
  }
}

async function sendOrderAutomatically(order) {
  const endpoint = String(siteData.orders?.endpoint || "").trim();

  if (!endpoint) {
    return { mode: "manual" };
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        order,
        source: "fine-riders-site",
        sentAt: new Date().toISOString(),
      }),
    });

    return { mode: "automatic", ok: true };
  } catch (error) {
    return { mode: "automatic", ok: false, error: error.message };
  }
}

async function placeOrder(form) {
  if (cart.length === 0) {
    showCartStep("cart");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;

  const formData = new FormData(form);
  const order = {
    id: `FINE-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    customerName: String(formData.get("customerName") || "").trim(),
    customerEmail: String(formData.get("customerEmail") || "").trim(),
    customerPhone: String(formData.get("customerPhone") || "").trim(),
    delivery: String(formData.get("delivery") || "collection"),
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    postcode: String(formData.get("postcode") || "").trim(),
    payment: String(formData.get("payment") || "bank-transfer"),
    notes: String(formData.get("notes") || "").trim(),
    items: cart.map((item) => ({ ...item })),
    subtotal: getSubtotal(),
    shipping: getShipping(),
    total: getTotal(),
  };

  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  orderMessage.textContent = `${order.id} is ready for ${order.customerName}. Total ${formatMoney(order.total)}. Payment is set to ${getPaymentLabel(order.payment)}.`;

  const deliveryResult = await sendOrderAutomatically(order);
  updateOrderActions(order, deliveryResult);

  cart = [];
  form.reset();
  submitButton.disabled = false;
  updateShippingFields();
  renderCart();

  stepButtons.forEach((button) => button.classList.remove("is-active"));
  stepPanels.forEach((panel) => panel.classList.remove("is-active"));
  orderSuccess.hidden = false;
  orderSuccess.classList.add("is-active");
}

function getWeatherLabel(code) {
  const labels = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };

  return labels[code] || "Conditions loaded";
}

function formatVisibility(metres) {
  if (!Number.isFinite(metres)) {
    return "--";
  }

  const miles = metres / 1609.344;
  return miles >= 10 ? "10+ mi" : `${miles.toFixed(1)} mi`;
}

function setRidePrepStatus(message) {
  if (ridePrepStatus) {
    ridePrepStatus.textContent = message;
  }
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 600000,
      timeout: 12000,
    });
  });
}

async function loadRidePrepWeather({ latitude, longitude, label }) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly: "precipitation_probability,visibility",
    forecast_days: "1",
    timezone: "auto",
    wind_speed_unit: "mph",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Weather service did not respond.");
  }

  const data = await response.json();
  const current = data.current || {};
  const rainChance = data.hourly?.precipitation_probability?.[0];
  const visibility = data.hourly?.visibility?.[0];
  const updated = current.time ? new Date(current.time) : new Date();
  const weatherLabel = getWeatherLabel(current.weather_code);

  ridePrepFields.condition.textContent = weatherLabel;
  ridePrepFields.location.textContent = `Live conditions for ${label}.`;
  ridePrepFields.temp.textContent = `${Math.round(current.temperature_2m)}°C`;
  ridePrepFields.feels.textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
  ridePrepFields.wind.textContent = `${Math.round(current.wind_speed_10m)} mph`;
  ridePrepFields.gusts.textContent = `Gusts ${Math.round(current.wind_gusts_10m || 0)} mph`;
  ridePrepFields.rain.textContent = `${rainChance ?? "--"}%`;
  ridePrepFields.precip.textContent = `Now ${current.precipitation ?? 0} mm`;
  ridePrepFields.visibility.textContent = formatVisibility(visibility);
  ridePrepFields.updated.textContent = `Updated ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function loadDefaultRidePrep() {
  if (!ridePrepButton) {
    return;
  }

  try {
    setRidePrepStatus("Loading Colchester weather and wind...");
    await loadRidePrepWeather(defaultRidePrepLocation);
    setRidePrepStatus("Colchester ride prep loaded. Check traffic separately before rollout.");
  } catch (error) {
    setRidePrepStatus(`${error.message} Default location is Colchester, UK; use the traffic links and checklist if live weather is unavailable.`);
  }
}

async function updateRidePrep() {
  try {
    ridePrepButton.disabled = true;
    setRidePrepStatus("Getting your location...");

    const position = await getPosition();
    const { latitude, longitude } = position.coords;

    setRidePrepStatus("Loading weather and wind...");
    await loadRidePrepWeather({
      label: `your current location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      latitude,
      longitude,
    });

    setRidePrepStatus("Live ride prep loaded. Check traffic separately before rollout.");
  } catch (error) {
    setRidePrepStatus(`${error.message} You can still use the traffic links and checklist.`);
  } finally {
    ridePrepButton.disabled = false;
  }
}

menuButton.addEventListener("click", () => {
  setMenuOpen(!document.body.classList.contains("menu-open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (document.body.classList.contains("cart-open")) {
    setCartOpen(false);
  } else {
    setMenuOpen(false);
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-product-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  addItem(form);
});

cartOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCartStep("cart");
    setCartOpen(true);
  });
});

cartCloseButtons.forEach((button) => {
  button.addEventListener("click", () => setCartOpen(false));
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => showCartStep(button.dataset.cartStep));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) {
    return;
  }

  updateCartItem(Number(button.dataset.index), button.dataset.cartAction);
});

checkoutStart.addEventListener("click", () => showCartStep("checkout"));

checkoutForm.querySelectorAll("input[name='delivery']").forEach((input) => {
  input.addEventListener("change", updateShippingFields);
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await placeOrder(checkoutForm);
});

[orderSend, orderCustomerCopy].forEach((link) => {
  link?.addEventListener("click", (event) => {
    if (link.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });
});

orderCopy?.addEventListener("click", async () => {
  const details = orderCopy.dataset.orderDetails || "";

  if (!details) {
    return;
  }

  try {
    await navigator.clipboard.writeText(details);
    orderCopyStatus.textContent = "Order details copied.";
  } catch {
    orderCopyStatus.textContent = details;
  }
});

orderReset.addEventListener("click", () => {
  checkoutForm.reset();
  if (orderCopyStatus) {
    orderCopyStatus.textContent = "";
  }
  updateShippingFields();
  showCartStep("cart");
});

if (ridePrepButton) {
  ridePrepButton.addEventListener("click", updateRidePrep);
  loadDefaultRidePrep();
}

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(joinForm);
  const name = String(formData.get("name") || "").trim();

  statusMessage.textContent = name
    ? `Nice one, ${name}. You are on the F.I.N.E Riders signal.`
    : "Nice one. You are on the F.I.N.E Riders signal.";
  joinForm.reset();
  nav.focus?.();
});

updateShippingFields();
renderCart();
initHeroNeonField();
initHeroParallax();
initScrollReveal();
