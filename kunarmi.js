const dataKey = window.FINE_SITE_DATA_KEY;
const defaultData = window.FINE_DEFAULT_DATA;

let siteData = loadData();

const statusMessage = document.querySelector("#admin-status");
const productEditor = document.querySelector("#product-editor");
const eventEditor = document.querySelector("#event-editor");
const adminPasscodeHash = "42c4a55b0b0d4c94dedb4b5adcbf97b4fc67fbe5175becf28a16efe6e30eebe0";
const adminUnlockKey = "fine-riders-editor-unlocked";
const adminLock = document.querySelector("#admin-lock");
const adminApp = document.querySelector("#admin-app");
const unlockForm = document.querySelector("#admin-unlock-form");
const passcodeInput = document.querySelector("#admin-passcode");
const lockStatus = document.querySelector("#admin-lock-status");
const lockEditorButton = document.querySelector("#lock-editor");

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

function loadData() {
  try {
    return normalizeData(deepMerge(clone(defaultData), JSON.parse(localStorage.getItem(dataKey))));
  } catch {
    return normalizeData(clone(defaultData));
  }
}

function normalizeData(data) {
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

  return data;
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function setLockStatus(message) {
  lockStatus.textContent = message;
}

async function hashText(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setEditorUnlocked(isUnlocked) {
  adminLock.hidden = isUnlocked;
  adminApp.hidden = !isUnlocked;
  lockEditorButton.hidden = !isUnlocked;

  if (isUnlocked) {
    sessionStorage.setItem(adminUnlockKey, "true");
    passcodeInput.value = "";
  } else {
    sessionStorage.removeItem(adminUnlockKey);
  }
}

function setValue(id, value) {
  document.querySelector(`#${id}`).value = value ?? "";
}

function getValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function getNumber(id) {
  return Number(document.querySelector(`#${id}`).value || 0);
}

function toLines(values) {
  return (values || []).join("\n");
}

function fromLines(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function productTemplate(product, index) {
  return `
    <article class="editor-card" data-product-row>
      <div class="editor-card-header">
        <h3>Product ${index + 1}</h3>
        <button class="button secondary" type="button" data-remove-product="${index}">Remove</button>
      </div>
      <div class="field-grid two">
        <label>
          <span>Card tag</span>
          <input data-product-field="tag" type="text" value="${escapeAttribute(product.tag)}">
        </label>
        <label>
          <span>Name</span>
          <input data-product-field="name" type="text" value="${escapeAttribute(product.name)}">
        </label>
        <label>
          <span>Price</span>
          <input data-product-field="price" type="number" min="0" step="0.01" value="${product.price}">
        </label>
        <label>
          <span>Button text</span>
          <input data-product-field="button" type="text" value="${escapeAttribute(product.button)}">
        </label>
        <label>
          <span>Fixed colour, blank if options are finishes</span>
          <input data-product-field="colour" type="text" value="${escapeAttribute(product.colour || "")}">
        </label>
        <label>
          <span>Fixed size, blank if options are sizes</span>
          <input data-product-field="size" type="text" value="${escapeAttribute(product.size || "")}">
        </label>
      </div>
      <label>
        <span>Option label</span>
        <input data-product-field="optionLabel" type="text" value="${escapeAttribute(product.optionLabel)}">
      </label>
      <label>
        <span>Options, one per line</span>
        <textarea data-product-field="options" rows="4">${escapeHtml(toLines(product.options))}</textarea>
      </label>
    </article>
  `;
}

function eventTemplate(event, index) {
  return `
    <article class="editor-card" data-event-row>
      <div class="editor-card-header">
        <h3>Event ${index + 1}</h3>
        <button class="button secondary" type="button" data-remove-event="${index}">Remove</button>
      </div>
      <div class="field-grid two">
        <label>
          <span>Date</span>
          <input data-event-field="date" type="date" value="${escapeAttribute(event.date)}">
        </label>
        <label>
          <span>Display date</span>
          <input data-event-field="displayDate" type="text" value="${escapeAttribute(event.displayDate)}">
        </label>
        <label>
          <span>Title</span>
          <input data-event-field="title" type="text" value="${escapeAttribute(event.title)}">
        </label>
        <label>
          <span>Label</span>
          <input data-event-field="label" type="text" value="${escapeAttribute(event.label)}">
        </label>
      </div>
      <label>
        <span>Description</span>
        <textarea data-event-field="description" rows="3">${escapeHtml(event.description)}</textarea>
      </label>
    </article>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function fillForm() {
  setValue("hero-eyebrow", siteData.hero.eyebrow);
  setValue("announcement", siteData.announcement);
  setValue("hero-headline-top", siteData.hero.headlineTop);
  setValue("hero-headline-bottom", siteData.hero.headlineBottom);
  setValue("hero-tagline-lead", siteData.hero.taglineLead);
  setValue("hero-tagline-accent", siteData.hero.taglineAccent);
  setValue("hero-lede", siteData.hero.lede);
  setValue("story-title", siteData.story.title);
  setValue("story-body", siteData.story.body);
  setValue("footer-social", siteData.footer.social);

  setValue("merch-heading", siteData.merch.heading);
  setValue("merch-hoodie-price", siteData.merch.hoodiePrice);
  setValue("merch-feature-name", siteData.merch.featureName);
  setValue("merch-feature-button", siteData.merch.featureButton);
  setValue("merch-feature-description", siteData.merch.featureDescription);
  setValue("merch-colours", toLines(siteData.merch.colours));
  setValue("merch-sizes", toLines(siteData.merch.sizes));

  setValue("rideout-heading", siteData.rideout.heading);
  setValue("rideout-name", siteData.rideout.name);
  setValue("rideout-meet", siteData.rideout.meet);
  setValue("rideout-rollout", siteData.rideout.rollout);
  setValue("rideout-distance", siteData.rideout.distance);
  setValue("rideout-rules", toLines(siteData.rideout.rules));
  setValue("shipping-price", siteData.checkout.shippingPrice);

  renderProducts();
  renderEvents();
}

function renderProducts() {
  productEditor.innerHTML = siteData.merch.products.map(productTemplate).join("");
}

function renderEvents() {
  eventEditor.innerHTML = siteData.events.map(eventTemplate).join("");
}

function collectProducts() {
  return [...document.querySelectorAll("[data-product-row]")].map((row) => {
    const getField = (field) => row.querySelector(`[data-product-field="${field}"]`).value.trim();
    const name = getField("name");
    return {
      id: slugify(name) || `product-${Date.now()}`,
      tag: getField("tag"),
      name,
      price: Number(getField("price") || 0),
      optionLabel: getField("optionLabel"),
      options: fromLines(getField("options")),
      colour: getField("colour"),
      size: getField("size"),
      button: getField("button"),
    };
  });
}

function collectEvents() {
  return [...document.querySelectorAll("[data-event-row]")].map((row) => {
    const getField = (field) => row.querySelector(`[data-event-field="${field}"]`).value.trim();
    return {
      date: getField("date"),
      displayDate: getField("displayDate"),
      title: getField("title"),
      description: getField("description"),
      label: getField("label"),
    };
  });
}

function collectForm() {
  siteData.hero.eyebrow = getValue("hero-eyebrow");
  siteData.announcement = getValue("announcement");
  siteData.hero.headlineTop = getValue("hero-headline-top");
  siteData.hero.headlineBottom = getValue("hero-headline-bottom");
  siteData.hero.taglineLead = getValue("hero-tagline-lead");
  siteData.hero.taglineAccent = getValue("hero-tagline-accent");
  siteData.hero.lede = getValue("hero-lede");
  siteData.story.title = getValue("story-title");
  siteData.story.body = getValue("story-body");
  siteData.footer.social = getValue("footer-social");

  siteData.merch.heading = getValue("merch-heading");
  siteData.merch.hoodiePrice = getNumber("merch-hoodie-price");
  siteData.merch.featureName = getValue("merch-feature-name");
  siteData.merch.featureButton = getValue("merch-feature-button");
  siteData.merch.featureDescription = getValue("merch-feature-description");
  siteData.merch.colours = fromLines(getValue("merch-colours"));
  siteData.merch.sizes = fromLines(getValue("merch-sizes"));
  siteData.merch.products = collectProducts();

  siteData.events = collectEvents();
  siteData.rideout.heading = getValue("rideout-heading");
  siteData.rideout.name = getValue("rideout-name");
  siteData.rideout.meet = getValue("rideout-meet");
  siteData.rideout.rollout = getValue("rideout-rollout");
  siteData.rideout.distance = getValue("rideout-distance");
  siteData.rideout.rules = fromLines(getValue("rideout-rules"));
  siteData.checkout.shippingPrice = getNumber("shipping-price");
}

function saveData() {
  collectForm();
  localStorage.setItem(dataKey, JSON.stringify(siteData));
  setStatus("Preview saved in this browser. Publish site data when you want it live.");
}

function buildSiteDataSource(data) {
  return `window.FINE_SITE_DATA_KEY = ${JSON.stringify(dataKey)};\n\nwindow.FINE_DEFAULT_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

function downloadSiteData(source) {
  const blob = new Blob([source], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "site-data.js";
  link.click();
  URL.revokeObjectURL(url);
}

async function publishData() {
  collectForm();
  localStorage.setItem(dataKey, JSON.stringify(siteData));
  const source = buildSiteDataSource(siteData);

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "site-data.js",
        types: [
          {
            description: "JavaScript data file",
            accept: { "text/javascript": [".js"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(source);
      await writable.close();
      setStatus("Published site-data.js. Refresh the public site to see the live content.");
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        setStatus("Publish cancelled.");
        return;
      }
    }
  }

  downloadSiteData(source);
  setStatus("site-data.js was generated. Use that file as the site's live data file.");
}

unlockForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (await hashText(passcodeInput.value.trim().toUpperCase()) === adminPasscodeHash) {
    setEditorUnlocked(true);
    setStatus("Editor unlocked.");
    setLockStatus("");
    return;
  }

  setLockStatus("That passcode is not right.");
  passcodeInput.select();
});

lockEditorButton.addEventListener("click", () => {
  setEditorUnlocked(false);
  setLockStatus("Editor locked.");
});

document.querySelector("#save-data").addEventListener("click", saveData);
document.querySelector("#publish-data").addEventListener("click", publishData);

document.querySelector("#reset-data").addEventListener("click", () => {
  if (!confirm("Reset all editable site content to the default version?")) {
    return;
  }

  localStorage.removeItem(dataKey);
  siteData = normalizeData(clone(defaultData));
  fillForm();
  setStatus("Reset to the default content.");
});

document.querySelector("#export-data").addEventListener("click", () => {
  collectForm();
  document.querySelector("#backup-data").value = JSON.stringify(siteData, null, 2);
  setStatus("Backup data is ready in the box below.");
});

document.querySelector("#import-data").addEventListener("click", () => {
  try {
    siteData = normalizeData(deepMerge(clone(defaultData), JSON.parse(document.querySelector("#backup-data").value)));
    fillForm();
    localStorage.setItem(dataKey, JSON.stringify(siteData));
    setStatus("Backup imported and saved.");
  } catch {
    setStatus("That backup could not be read. Check the text and try again.");
  }
});

document.querySelector("#add-product").addEventListener("click", () => {
  collectForm();
  siteData.merch.products.push({
    id: `product-${Date.now()}`,
    tag: "New",
    name: "New product",
    price: 0,
    optionLabel: "Option",
    options: ["Standard"],
    colour: "",
    size: "One size",
    button: "Add to cart",
  });
  renderProducts();
});

document.querySelector("#add-event").addEventListener("click", () => {
  collectForm();
  siteData.events.push({
    date: "",
    displayDate: "Date",
    title: "New event",
    description: "Event details",
    label: "Update",
  });
  renderEvents();
});

document.addEventListener("click", (event) => {
  const productIndex = event.target.dataset.removeProduct;
  if (productIndex !== undefined) {
    collectForm();
    siteData.merch.products.splice(Number(productIndex), 1);
    renderProducts();
  }

  const eventIndex = event.target.dataset.removeEvent;
  if (eventIndex !== undefined) {
    collectForm();
    siteData.events.splice(Number(eventIndex), 1);
    renderEvents();
  }
});

fillForm();
setEditorUnlocked(sessionStorage.getItem(adminUnlockKey) === "true");
