/* ============================================================
   รายรับรายจ่าย — app.js
   Vanilla JS SPA. Works fully offline with local demo data,
   and syncs to Google Sheets once an Apps Script Web App URL
   is set in ตั้งค่า (Settings).
   ============================================================ */

/* ---------------- Reference data ---------------- */

const WALLETS = [
  { id: "CASH",   name: "เงินสด",   emoji: "💵", cls: "ic-cash"   },
  { id: "BANK",   name: "ธนาคาร",   emoji: "🏦", cls: "ic-bank"   },
  { id: "DCA",    name: "DCA",      emoji: "📊", cls: "ic-dca"    },
  { id: "INVEST", name: "ลงทุน",    emoji: "📈", cls: "ic-invest" },
];

const EXPENSE_CATS = [
  { id: "FOOD",     name: "อาหาร",                     emoji: "🍜" },
  { id: "TRAVEL",   name: "เดินทาง",                   emoji: "🚗" },
  { id: "HOME",     name: "ที่พัก",                     emoji: "🏠" },
  { id: "BILL",     name: "ค่าน้ำค่าไฟ",                emoji: "💡" },
  { id: "PHONE",    name: "ค่าโทรศัพท์/อินเทอร์เน็ต",   emoji: "📱" },
  { id: "SHOPPING", name: "ซื้อของ",                    emoji: "🛒" },
  { id: "HEALTH",   name: "สุขภาพ",                     emoji: "🏥" },
  { id: "EDU",      name: "การศึกษา",                   emoji: "🎓" },
  { id: "FUN",      name: "ความบันเทิง",                emoji: "🎮" },
  { id: "PET",      name: "สัตว์เลี้ยง",                emoji: "🐶" },
  { id: "SHOP2",    name: "ช้อปปิ้ง",                   emoji: "🛍️" },
  { id: "OTHEREXP", name: "รายจ่ายอื่น ๆ",              emoji: "📝" },
];

const INCOME_CATS = [
  { id: "SALARY",   name: "เงินเดือน",     emoji: "💰" },
  { id: "BONUS",    name: "โบนัส",         emoji: "🎁" },
  { id: "SIDE",     name: "รายได้เสริม",   emoji: "💼" },
  { id: "SELL",     name: "ขายของ",        emoji: "📦" },
  { id: "REFUND",   name: "เงินคืน",       emoji: "🔁" },
  { id: "OTHERINC", name: "รายรับอื่น ๆ",  emoji: "📝" },
];

const DEBT_TYPES = [
  { id: "CREDIT",    name: "บัตรเครดิต",       emoji: "💳" },
  { id: "LOAN",      name: "สินเชื่อธนาคาร",   emoji: "🏦" },
  { id: "FRIEND",    name: "ยืมเพื่อน",        emoji: "🤝" },
  { id: "FAMILY",    name: "ยืมครอบครัว",      emoji: "👨‍👩‍👧" },
  { id: "OTHERDEBT", name: "หนี้อื่น ๆ",       emoji: "📄" },
];

const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

/* ---------------- Storage / demo seed data ---------------- */

const STORE_KEY = "raiap_raijai_data_v1";
const CFG_KEY = "raiap_raijai_config_v1";

function seedData() {
  const today = new Date();
  const d = (offsetDays, h, m) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - offsetDays);
    dt.setHours(h, m, 0, 0);
    return dt.toISOString();
  };
  return {
    openingBalances: { CASH: 3256, BANK: 6044, DCA: 7000, INVEST: 5000 },
    transactions: [
      { id: "t1", type: "income",  catId: "SALARY",   walletId: "BANK", amount: 25000, note: "เงินเดือนประจำเดือน", slip: null, ts: d(16, 10, 30) },
      { id: "t2", type: "expense", catId: "SHOPPING", walletId: "BANK", amount: 1250,  note: "Shopee",              slip: null, ts: d(1, 9, 15) },
      { id: "t3", type: "expense", catId: "BILL",     walletId: "BANK", amount: 345,   note: "การไฟฟ้านครหลวง",     slip: null, ts: d(2, 18, 45) },
      { id: "t4", type: "expense", catId: "FOOD",     walletId: "CASH", amount: 680,   note: "ร้านอาหารตามสั่ง",    slip: null, ts: d(2, 12, 30) },
      { id: "t5", type: "expense", catId: "TRAVEL",   walletId: "CASH", amount: 320,   note: "ค่ามอเตอร์ไซค์รับจ้าง", slip: null, ts: d(3, 8, 5) },
      { id: "t6", type: "expense", catId: "SHOP2",    walletId: "BANK", amount: 2500,  note: "เสื้อผ้า",            slip: null, ts: d(6, 20, 0) },
      { id: "t7", type: "expense", catId: "PHONE",    walletId: "BANK", amount: 599,   note: "ค่าเน็ตรายเดือน",     slip: null, ts: d(11, 7, 0) },
      { id: "t8", type: "expense", catId: "FUN",      walletId: "CASH", amount: 756,   note: "ดูหนัง",              slip: null, ts: d(8, 19, 30) },
      { id: "t9", type: "expense", catId: "EDU",      walletId: "BANK", amount: 2000,  note: "คอร์สออนไลน์",        slip: null, ts: d(16, 13, 0) },
    ],
    transfers: [
      { id: "tr1", fromId: "BANK", toId: "CASH", amount: 1000, fee: 0, note: "ถอนเงินสด", slip: null, ts: d(2, 17, 0) },
      { id: "tr2", fromId: "BANK", toId: "DCA",  amount: 3000, fee: 0, note: "โอนเข้า DCA", slip: null, ts: d(21, 9, 0) },
    ],
    debts: [
      { id: "db1", typeId: "CREDIT", name: "บัตรเครดิต", initial: 10000, due: dueDate(9), status: "active" },
      { id: "db2", typeId: "FRIEND", name: "ยืมเพื่อน",   initial: 3000,  due: "", status: "active" },
    ],
    debtPayments: [
      { id: "dp1", debtId: "db1", walletId: "BANK", amount: 2000, slip: null, ts: d(14, 11, 0) },
    ],
  };

  function dueDate(daysAhead) {
    const dt = new Date();
    dt.setDate(dt.getDate() + daysAhead);
    return dt.toISOString();
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const fresh = seedData();
  saveData(fresh);
  return fresh;
}
function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}
function loadConfig() {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { apiUrl: "" };
}
function saveConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}

let DATA = loadData();
let CFG = loadConfig();

/* ---------------- Helpers ---------------- */

function fmtBaht(n, withSign) {
  const sign = n < 0 ? "-" : (withSign ? "+" : "");
  const v = Math.abs(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}฿${v}`;
}
function fmtDateShort(iso) {
  const dt = new Date(iso);
  return `${dt.getDate()} ${THAI_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543}`;
}
function fmtTime(iso) {
  const dt = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.setHours(0,0,0,0) - new Date(dt).setHours(0,0,0,0)) / 86400000);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  if (diffDays === 0) return `วันที่ ${hh}:${mm}`;
  if (diffDays === 1) return `เมื่อวาน ${hh}:${mm}`;
  if (diffDays > 1) return `${diffDays} วันที่แล้ว`;
  return `${hh}:${mm}`;
}
function wallet(id) { return WALLETS.find(w => w.id === id) || WALLETS[0]; }
function expCat(id) { return EXPENSE_CATS.find(c => c.id === id) || EXPENSE_CATS[EXPENSE_CATS.length-1]; }
function incCat(id) { return INCOME_CATS.find(c => c.id === id) || INCOME_CATS[INCOME_CATS.length-1]; }
function debtType(id) { return DEBT_TYPES.find(t => t.id === id) || DEBT_TYPES[DEBT_TYPES.length-1]; }
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function currentMonthKey(d) { d = d || new Date(); return `${d.getFullYear()}-${d.getMonth()}`; }
function isThisMonth(iso) { return currentMonthKey(new Date(iso)) === currentMonthKey(); }

/* ---------------- Derived data ---------------- */

function walletBalance(id) {
  let bal = DATA.openingBalances[id] || 0;
  DATA.transactions.forEach(t => {
    if (t.walletId !== id) return;
    bal += t.type === "income" ? t.amount : -t.amount;
  });
  DATA.transfers.forEach(tr => {
    if (tr.fromId === id) bal -= (tr.amount + (tr.fee || 0));
    if (tr.toId === id) bal += tr.amount;
  });
  DATA.debtPayments.forEach(p => {
    if (p.walletId === id) bal -= p.amount;
  });
  return bal;
}
function totalBalance() { return WALLETS.reduce((s, w) => s + walletBalance(w.id), 0); }
function liquidBalance() { return walletBalance("CASH") + walletBalance("BANK"); }

function debtPaid(debtId) {
  return DATA.debtPayments.filter(p => p.debtId === debtId).reduce((s, p) => s + p.amount, 0);
}
function debtRemaining(debt) { return Math.max(0, debt.initial - debtPaid(debt.id)); }
function totalDebtRemaining() { return DATA.debts.reduce((s, d) => s + debtRemaining(d), 0); }

function monthIncome(monthDate) {
  return DATA.transactions.filter(t => t.type === "income" && currentMonthKey(new Date(t.ts)) === currentMonthKey(monthDate))
    .reduce((s, t) => s + t.amount, 0);
}
function monthExpense(monthDate) {
  return DATA.transactions.filter(t => t.type === "expense" && currentMonthKey(new Date(t.ts)) === currentMonthKey(monthDate))
    .reduce((s, t) => s + t.amount, 0);
}
function monthDebtPaid(monthDate) {
  return DATA.debtPayments.filter(p => currentMonthKey(new Date(p.ts)) === currentMonthKey(monthDate))
    .reduce((s, p) => s + p.amount, 0);
}
function monthInvested(monthDate) {
  return DATA.transfers.filter(tr => tr.toId === "DCA" || tr.toId === "INVEST")
    .filter(tr => currentMonthKey(new Date(tr.ts)) === currentMonthKey(monthDate))
    .reduce((s, tr) => s + tr.amount, 0);
}

/* ---------------- Unified activity feed ---------------- */

function allActivity() {
  const items = [];
  DATA.transactions.forEach(t => items.push({ kind: "tx", ts: t.ts, data: t }));
  DATA.transfers.forEach(tr => items.push({ kind: "transfer", ts: tr.ts, data: tr }));
  DATA.debtPayments.forEach(p => items.push({ kind: "debtpay", ts: p.ts, data: p }));
  items.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  return items;
}

function activityRowHtml(item) {
  if (item.kind === "tx") {
    const t = item.data;
    const cat = t.type === "income" ? incCat(t.catId) : expCat(t.catId);
    const w = wallet(t.walletId);
    return `
      <button class="tx-row" data-open="tx" data-id="${t.id}">
        <span class="ic ${t.type === 'income' ? 'ic-income' : 'ic-expense'}">${cat.emoji}</span>
        <span class="mid">
          <div class="nm">${escapeHtml(cat.name)}</div>
          <div class="sub">${w.emoji} ${w.name}${t.note ? " · " + escapeHtml(t.note) : ""}</div>
        </span>
        <span class="right">
          <div class="amt ${t.type === 'income' ? 'amt-pos' : 'amt-neg'}">${fmtBaht(t.type === 'income' ? t.amount : -t.amount, true)}</div>
          <div class="time">${fmtTime(t.ts)}</div>
        </span>
      </button>`;
  }
  if (item.kind === "transfer") {
    const tr = item.data;
    const f = wallet(tr.fromId), to = wallet(tr.toId);
    return `
      <button class="tx-row" data-open="transfer" data-id="${tr.id}">
        <span class="ic ic-transfer">🔄</span>
        <span class="mid">
          <div class="nm">โอนเงิน${tr.note ? " · " + escapeHtml(tr.note) : ""}</div>
          <div class="sub">${f.emoji} ${f.name} → ${to.emoji} ${to.name}</div>
        </span>
        <span class="right">
          <div class="amt amt-neu">${fmtBaht(tr.amount)}</div>
          <div class="time">${fmtTime(tr.ts)}</div>
        </span>
      </button>`;
  }
  const p = item.data;
  const debt = DATA.debts.find(d => d.id === p.debtId);
  const dt = debtType(debt ? debt.typeId : "OTHERDEBT");
  const w = wallet(p.walletId);
  return `
    <button class="tx-row" data-open="debtpay" data-id="${p.id}">
      <span class="ic ic-debt">${dt.emoji}</span>
      <span class="mid">
        <div class="nm">ชำระ${debt ? escapeHtml(debt.name) : "หนี้"}</div>
        <div class="sub">${w.emoji} ${w.name}</div>
      </span>
      <span class="right">
        <div class="amt amt-neg">${fmtBaht(-p.amount)}</div>
        <div class="time">${fmtTime(p.ts)}</div>
      </span>
    </button>`;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

/* ---------------- Toast ---------------- */

let toastTimer = null;
function showToast(msg, isErr) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show" + (isErr ? " err" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = "toast"; }, 2400);
}

/* ---------------- Apps Script sync layer ----------------
   If ตั้งค่า > URL ของ Apps Script Web App is set, every write
   also POSTs to the backend so Google Sheets stays in sync.
   Reads always use the local copy (fast, works offline); the
   backend is treated as the durable source of truth for backup. */

async function syncToSheet(action, payload) {
  if (!CFG.apiUrl) return { ok: true, offline: true };
  try {
    const res = await fetch(CFG.apiUrl, {
      method: "POST",
      // text/plain avoids a CORS preflight against Apps Script.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload }),
    });
    const json = await res.json();
    return json;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* ============================================================
   Router
   ============================================================ */

const ROUTES = {};
let currentRoute = "dashboard";
let currentParams = {};

function go(route, params) {
  currentRoute = route;
  currentParams = params || {};
  render();
  document.getElementById("views").scrollTop = 0;
  window.scrollTo(0, 0);
}

function render() {
  const container = document.getElementById("views");
  const fn = ROUTES[currentRoute] || ROUTES.dashboard;
  container.innerHTML = fn(currentParams);
  updateNav();
  bindDynamicHandlers();
}

function updateNav() {
  const navMap = { dashboard: "dashboard", transactions: "transactions", monthly: "monthly", settings: "settings" };
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", navMap[currentRoute] === btn.dataset.nav);
  });
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => go(btn.dataset.nav));
});

/* ---------------- shared partials ---------------- */

function topHeader() {
  return `
    <div class="topbar">
      <div class="title">💰 รายรับรายจ่าย</div>
      <button class="icon-btn" data-nav="settings">🔔</button>
    </div>
    <div class="subbar">
      <span class="greet">สวัสดี 👋</span>
      <span class="month-pill">📅 ${THAI_MONTHS[new Date().getMonth()]} ${new Date().getFullYear() + 543} ⌄</span>
    </div>`;
}

function backHeader(title) {
  return `
    <div class="backbar">
      <button data-back="1">←</button>
      <h2>${title}</h2>
    </div>`;
}

function quickActionsHtml() {
  return `
    <div class="quick-grid">
      <button class="quick-btn" data-nav="addIncome"><span class="ic ic-income">📥</span>รายรับ</button>
      <button class="quick-btn" data-nav="addExpense"><span class="ic ic-expense">📤</span>รายจ่าย</button>
      <button class="quick-btn" data-nav="transfer"><span class="ic ic-transfer">🔄</span>โอนเงิน</button>
      <button class="quick-btn" data-nav="debts"><span class="ic ic-debt">💳</span>ชำระหนี้</button>
    </div>`;
}

/* ============================================================
   Dashboard
   ============================================================ */

ROUTES.dashboard = function () {
  const total = totalBalance();
  const liquid = liquidBalance();
  const inc = monthIncome(), exp = monthExpense(), dp = monthDebtPaid();
  const netMonth = inc - exp - dp;
  const recent = allActivity().slice(0, 5);

  return `
    ${topHeader()}
    <div class="hero">
      <div class="label">💼 เงินทั้งหมด</div>
      <div class="amount">${fmtBaht(total)}</div>
      <span class="delta">↑ พร้อมใช้ ${fmtBaht(liquid)}</span>
      <div class="piggy">🐷</div>
    </div>

    <div class="wallet-grid">
      ${WALLETS.map(w => walletCardHtml(w)).join("")}
    </div>

    <div class="section">
      <div class="section-head"><h3>📊 สรุปเดือนนี้</h3><a data-nav="monthly">ดูทั้งหมด ›</a></div>
      <div class="summary3">
        <div class="stat-card stat-income">
          <div class="top-ic ic-income">📥</div>
          <div class="lbl">รายรับ</div>
          <div class="val" style="color:var(--green-dark)">${fmtBaht(inc, true)}</div>
        </div>
        <div class="stat-card stat-expense">
          <div class="top-ic ic-expense">📤</div>
          <div class="lbl">รายจ่าย</div>
          <div class="val" style="color:var(--blue-dark)">${fmtBaht(-exp)}</div>
        </div>
        <div class="stat-card stat-debt">
          <div class="top-ic ic-debt">💳</div>
          <div class="lbl">คงเหลือหนี้</div>
          <div class="val" style="color:var(--orange)">${fmtBaht(totalDebtRemaining())}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h3>⚡ การทำงานด่วน</h3></div>
      ${quickActionsHtml()}
    </div>

    <div class="section">
      <div class="section-head"><h3>🧾 รายการล่าสุด</h3><a data-nav="transactions">ดูทั้งหมด ›</a></div>
      ${recent.length ? `<div class="tx-list">${recent.map(activityRowHtml).join("")}</div>` : emptyState("ยังไม่มีรายการ", "🧾")}
    </div>
  `;
};

function walletCardHtml(w) {
  const bal = walletBalance(w.id);
  const max = Math.max(...WALLETS.map(x => walletBalance(x.id)), 1);
  const pct = Math.max(6, Math.round((bal / max) * 100));
  return `
    <button class="wallet-card" data-nav="walletDetail" data-id="${w.id}">
      <span class="row">
        <span class="ic ${w.cls}">${w.emoji}</span>
        <span class="name">${w.name}</span>
      </span>
      <span class="amt">${fmtBaht(bal)}</span>
      <span class="bar"><span style="width:${pct}%;background:currentColor;color:var(--blue)"></span></span>
    </button>`;
}

function emptyState(text, emoji) {
  return `<div class="empty-state"><div class="em">${emoji || "📭"}</div><p>${text}</p></div>`;
}

/* ============================================================
   Add Income
   ============================================================ */

ROUTES.addIncome = function () {
  return `
    ${backHeader("📥 เพิ่มรายรับ")}
    <form class="form-wrap" id="incomeForm">
      ${amountFieldHtml()}
      ${categoryFieldHtml("incomeCat", INCOME_CATS, INCOME_CATS[0].id)}
      ${walletFieldHtml("incomeWallet", "เข้ากระเป๋า", "BANK")}
      ${dateFieldHtml("incomeDate")}
      ${noteFieldHtml("เช่น เงินเดือนประจำเดือน")}
      ${slipFieldHtml("incomeSlip")}
      <button type="submit" class="submit-btn btn-green">✅ บันทึกรายรับ</button>
    </form>
  `;
};

/* ============================================================
   Add Expense
   ============================================================ */

ROUTES.addExpense = function () {
  return `
    ${backHeader("📤 เพิ่มรายจ่าย")}
    <form class="form-wrap" id="expenseForm">
      ${amountFieldHtml()}
      ${categoryFieldHtml("expenseCat", EXPENSE_CATS, EXPENSE_CATS[0].id)}
      ${walletFieldHtml("expenseWallet", "จ่ายจาก", "CASH")}
      ${dateFieldHtml("expenseDate")}
      ${noteFieldHtml("เช่น ข้าวกลางวัน")}
      ${slipFieldHtml("expenseSlip")}
      <button type="submit" class="submit-btn btn-blue">✅ บันทึกรายจ่าย</button>
    </form>
  `;
};

/* ---------------- shared form fields ---------------- */

function amountFieldHtml() {
  return `
    <div class="field">
      <label>💵 จำนวนเงิน</label>
      <div class="amount-input">
        <span class="thb">฿</span>
        <input type="number" inputmode="decimal" step="0.01" min="0" id="f_amount" placeholder="0.00" required>
      </div>
    </div>`;
}
function categoryFieldHtml(id, cats, selected) {
  return `
    <div class="field">
      <label>🗂️ หมวดหมู่</label>
      <div class="chip-row" id="${id}" data-selected="${selected}">
        ${cats.map(c => `<button type="button" class="chip${c.id === selected ? ' sel' : ''}" data-val="${c.id}">${c.emoji} ${c.name}</button>`).join("")}
      </div>
    </div>`;
}
function walletFieldHtml(id, label, selected) {
  return `
    <div class="field">
      <label>👛 ${label}</label>
      <div class="chip-row" id="${id}" data-selected="${selected}">
        ${WALLETS.map(w => `<button type="button" class="chip${w.id === selected ? ' sel' : ''}" data-val="${w.id}">${w.emoji} ${w.name}</button>`).join("")}
      </div>
    </div>`;
}
function dateFieldHtml(id) {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="field">
      <label>📅 วันที่</label>
      <input type="date" id="${id}" value="${today}">
    </div>`;
}
function noteFieldHtml(placeholder) {
  return `
    <div class="field">
      <label>🧾 รายละเอียด</label>
      <input type="text" id="f_note" placeholder="${placeholder}">
    </div>`;
}
function slipFieldHtml(id) {
  return `
    <div class="field">
      <label>📎 แนบสลิป</label>
      <div class="attach-row">
        <label class="attach-btn">📷 ถ่ายรูป<input type="file" accept="image/*" capture="environment" id="${id}_cam" style="display:none"></label>
        <label class="attach-btn">🖼️ เลือกรูป<input type="file" accept="image/*" id="${id}_lib" style="display:none"></label>
      </div>
      <div id="${id}_preview"></div>
    </div>`;
}

function bindChipRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  row.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach(c => c.classList.remove("sel"));
      chip.classList.add("sel");
      row.dataset.selected = chip.dataset.val;
    });
  });
}
function bindSlipField(id) {
  let dataUrl = null;
  const preview = document.getElementById(id + "_preview");
  const handle = (input) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        dataUrl = reader.result;
        preview.innerHTML = `<div class="attach-preview"><img src="${dataUrl}"><button type="button" class="rm">✕</button></div>`;
        preview.querySelector(".rm").addEventListener("click", () => { dataUrl = null; preview.innerHTML = ""; });
      };
      reader.readAsDataURL(file);
    });
  };
  const cam = document.getElementById(id + "_cam");
  const lib = document.getElementById(id + "_lib");
  if (cam) handle(cam);
  if (lib) handle(lib);
  return { get: () => dataUrl };
}

/* ============================================================
   Transfer
   ============================================================ */

ROUTES.transfer = function () {
  return `
    ${backHeader("🔄 โอนเงิน")}
    <form class="form-wrap" id="transferForm">
      <div class="field">
        <label>👛 จากกระเป๋า</label>
        <select id="tr_from">
          ${WALLETS.map(w => `<option value="${w.id}" ${w.id === "BANK" ? "selected" : ""}>${w.emoji} ${w.name} · ${fmtBaht(walletBalance(w.id))}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>👛 ไปยังกระเป๋า</label>
        <select id="tr_to">
          ${WALLETS.map(w => `<option value="${w.id}" ${w.id === "CASH" ? "selected" : ""}>${w.emoji} ${w.name}</option>`).join("")}
        </select>
      </div>
      ${amountFieldHtml()}
      <div class="field">
        <label>💸 ค่าธรรมเนียม</label>
        <div class="amount-input"><span class="thb">฿</span><input type="number" step="0.01" min="0" id="tr_fee" value="0"></div>
      </div>
      ${dateFieldHtml("tr_date")}
      ${noteFieldHtml("เช่น ถอนเงินสด")}
      ${slipFieldHtml("trSlip")}
      <button type="submit" class="submit-btn btn-blue">✅ ยืนยันการโอน</button>
    </form>
  `;
};

/* ============================================================
   Wallets overview
   ============================================================ */

ROUTES.wallets = function () {
  return `
    ${backHeader("👛 กระเป๋าเงิน")}
    <div class="form-wrap">
      <div class="tx-list" style="margin-bottom:18px">
        ${WALLETS.map(w => {
          const count = DATA.transactions.filter(t => t.walletId === w.id).length
            + DATA.transfers.filter(tr => tr.fromId === w.id || tr.toId === w.id).length;
          return `
          <button class="tx-row" data-nav="walletDetail" data-id="${w.id}">
            <span class="ic ${w.cls}">${w.emoji}</span>
            <span class="mid">
              <div class="nm">${w.name}</div>
              <div class="sub">${count} รายการ</div>
            </span>
            <span class="right"><div class="amt amt-neu">${fmtBaht(walletBalance(w.id))}</div></span>
          </button>`;
        }).join("")}
      </div>
    </div>
  `;
};

ROUTES.walletDetail = function (params) {
  const w = wallet(params.id);
  const items = allActivity().filter(a => {
    if (a.kind === "tx") return a.data.walletId === w.id;
    if (a.kind === "transfer") return a.data.fromId === w.id || a.data.toId === w.id;
    if (a.kind === "debtpay") return a.data.walletId === w.id;
    return false;
  });
  return `
    ${backHeader(`${w.emoji} ${w.name}`)}
    <div class="hero" style="background:linear-gradient(135deg,var(--blue),var(--teal))">
      <div class="label">${w.emoji} ยอดคงเหลือ</div>
      <div class="amount">${fmtBaht(walletBalance(w.id))}</div>
      <span class="delta">${items.length} รายการ</span>
    </div>
    <div class="section">
      <div class="section-head"><h3>🧾 รายการทั้งหมด</h3></div>
      ${items.length ? `<div class="tx-list">${items.map(activityRowHtml).join("")}</div>` : emptyState("ยังไม่มีรายการในกระเป๋านี้")}
    </div>
  `;
};

/* ============================================================
   Debts
   ============================================================ */

ROUTES.debts = function () {
  return `
    ${backHeader("💳 หนี้สิน")}
    <div class="form-wrap">
      ${DATA.debts.map(debtCardHtml).join("")}
      <button class="add-debt-btn" data-nav="addDebt">➕ เพิ่มหนี้</button>
    </div>
  `;
};

function debtCardHtml(debt) {
  const remain = debtRemaining(debt);
  const pct = Math.min(100, Math.round((debtPaid(debt.id) / debt.initial) * 100));
  const dt = debtType(debt.typeId);
  return `
    <button class="debt-card" data-nav="debtDetail" data-id="${debt.id}">
      <div class="row1">
        <span class="nm">${dt.emoji} ${escapeHtml(debt.name)}</span>
      </div>
      <div class="remain">คงเหลือ <b>${fmtBaht(remain)}</b></div>
      <div class="pct">ชำระแล้ว ${pct}%</div>
      <div class="debt-bar"><span style="width:${pct}%"></span></div>
    </button>`;
}

ROUTES.addDebt = function () {
  return `
    ${backHeader("➕ เพิ่มหนี้")}
    <form class="form-wrap" id="debtForm">
      <div class="field">
        <label>🏷️ ประเภทหนี้</label>
        <div class="chip-row" id="debtType" data-selected="${DEBT_TYPES[0].id}">
          ${DEBT_TYPES.map(t => `<button type="button" class="chip${t.id === DEBT_TYPES[0].id ? ' sel' : ''}" data-val="${t.id}">${t.emoji} ${t.name}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>🧾 ชื่อรายการหนี้</label>
        <input type="text" id="debt_name" placeholder="เช่น บัตรเครดิต KTC" required>
      </div>
      <div class="field">
        <label>💰 ยอดตั้งต้น</label>
        <div class="amount-input"><span class="thb">฿</span><input type="number" step="0.01" min="0" id="debt_amount" placeholder="0.00" required></div>
      </div>
      <div class="field">
        <label>📅 ครบกำหนด (ถ้ามี)</label>
        <input type="date" id="debt_due">
      </div>
      <button type="submit" class="submit-btn btn-orange">✅ บันทึกหนี้</button>
    </form>
  `;
};

ROUTES.debtDetail = function (params) {
  const debt = DATA.debts.find(d => d.id === params.id);
  if (!debt) return emptyState("ไม่พบข้อมูลหนี้");
  const dt = debtType(debt.typeId);
  const paid = debtPaid(debt.id);
  const remain = debtRemaining(debt);
  const history = DATA.debtPayments.filter(p => p.debtId === debt.id).sort((a,b) => new Date(b.ts)-new Date(a.ts));
  return `
    ${backHeader(`${dt.emoji} ${escapeHtml(debt.name)}`)}
    <div class="debt-detail-card">
      <div class="dd-row"><span class="l">💰 ยอดเริ่มต้น</span><span class="v">${fmtBaht(debt.initial)}</span></div>
      <div class="dd-row"><span class="l">✅ ชำระแล้ว</span><span class="v" style="color:var(--green-dark)">${fmtBaht(paid)}</span></div>
      <div class="dd-row"><span class="l">⚠️ คงเหลือ</span><span class="v" style="color:var(--red)">${fmtBaht(remain)}</span></div>
      <div class="dd-row"><span class="l">📅 ครบกำหนด</span><span class="v">${debt.due ? fmtDateShort(debt.due) : "—"}</span></div>
      <div class="dd-actions">
        <button class="btn-orange" style="color:#fff" data-nav="payDebt" data-id="${debt.id}" ${remain <= 0 ? "disabled" : ""}>💸 ชำระหนี้</button>
        <button class="btn-outline" style="margin-top:0" data-scroll="hist">📜 ประวัติ</button>
      </div>
    </div>
    <div class="section" id="hist">
      <div class="section-head"><h3>📜 ประวัติการชำระ</h3></div>
      ${history.length ? `<div class="tx-list">${history.map(p => {
        const w = wallet(p.walletId);
        return `<div class="tx-row"><span class="ic ic-debt">💸</span><span class="mid"><div class="nm">ชำระ${fmtBaht(p.amount)}</div><div class="sub">${w.emoji} ${w.name}</div></span><span class="right"><div class="time">${fmtDateShort(p.ts)}</div></span></div>`;
      }).join("")}</div>` : emptyState("ยังไม่มีการชำระ")}
    </div>
  `;
};

ROUTES.payDebt = function (params) {
  const debt = DATA.debts.find(d => d.id === params.id) || DATA.debts[0];
  return `
    ${backHeader("💸 ชำระหนี้")}
    <form class="form-wrap" id="payDebtForm" data-debt="${debt ? debt.id : ''}">
      <div class="field">
        <label>💳 หนี้</label>
        <select id="pd_debt">
          ${DATA.debts.map(d => `<option value="${d.id}" ${d.id === debt.id ? "selected" : ""}>${debtType(d.typeId).emoji} ${escapeHtml(d.name)} · คงเหลือ ${fmtBaht(debtRemaining(d))}</option>`).join("")}
        </select>
      </div>
      ${amountFieldHtml()}
      ${walletFieldHtml("pd_wallet", "จ่ายจาก", "BANK")}
      ${dateFieldHtml("pd_date")}
      ${slipFieldHtml("pdSlip")}
      <button type="submit" class="submit-btn btn-orange">✅ บันทึกการชำระ</button>
    </form>
  `;
};

/* ============================================================
   Monthly summary
   ============================================================ */

ROUTES.monthly = function () {
  const now = new Date();
  const inc = monthIncome(now), exp = monthExpense(now), dp = monthDebtPaid(now), inv = monthInvested(now);
  // opening = total balance minus this month's net movement (approximation using ledger)
  const openTotal = WALLETS.reduce((s, w) => s + (DATA.openingBalances[w.id] || 0), 0);
  const closeTotal = totalBalance();
  return `
    ${backHeader("📅 สรุปรายเดือน")}
    <div class="section" style="padding-top:0">
      <span class="month-pill">📅 ${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543} ⌄</span>
    </div>
    <div class="ms-card">
      <div class="ms-row"><span class="l">⏮️ ยอดยกมา</span><span class="v">${fmtBaht(openTotal)}</span></div>
      <div class="ms-row"><span class="l">📥 รายรับ</span><span class="v" style="color:var(--green-dark)">${fmtBaht(inc, true)}</span></div>
      <div class="ms-row"><span class="l">📤 รายจ่าย</span><span class="v" style="color:var(--red)">${fmtBaht(-exp)}</span></div>
      <div class="ms-row"><span class="l">🔄 โอนเงิน</span><span class="v" style="color:var(--text-faint);font-weight:600;font-size:13px">ไม่กระทบยอดรวม</span></div>
      <div class="ms-row"><span class="l">📊 เข้าลงทุน (DCA/ลงทุน)</span><span class="v" style="color:var(--purple)">${fmtBaht(-inv)}</span></div>
      <div class="ms-row"><span class="l">💳 ชำระหนี้</span><span class="v" style="color:var(--orange)">${fmtBaht(-dp)}</span></div>
      <div class="ms-row ms-final"><span class="l">🏁 ยอดปลายเดือน</span><span class="v">${fmtBaht(closeTotal)}</span></div>
    </div>

    <div class="section">
      <div class="section-head"><h3>⏭️ ยอดยกไปเดือนหน้า</h3></div>
      <div class="wallet-grid">${WALLETS.map(walletCardHtml).join("")}</div>
    </div>

    <div class="section">
      <div class="section-head"><h3>💳 หนี้คงเหลือ</h3><a data-nav="debts">ดูทั้งหมด ›</a></div>
      ${DATA.debts.length ? DATA.debts.map(debtCardHtml).join("") : emptyState("ไม่มีหนี้ 🎉")}
    </div>
  `;
};

/* ============================================================
   Transactions (all)
   ============================================================ */

let txFilter = "all";

ROUTES.transactions = function () {
  const items = allActivity().filter(a => {
    if (txFilter === "all") return true;
    if (txFilter === "income") return a.kind === "tx" && a.data.type === "income";
    if (txFilter === "expense") return a.kind === "tx" && a.data.type === "expense";
    if (txFilter === "transfer") return a.kind === "transfer";
    if (txFilter === "debt") return a.kind === "debtpay";
    return true;
  });

  // group by month
  const groups = {};
  items.forEach(it => {
    const dt = new Date(it.ts);
    const key = `${THAI_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543}`;
    (groups[key] = groups[key] || []).push(it);
  });

  const filters = [
    ["all", "ทั้งหมด"], ["income", "📥 รายรับ"], ["expense", "📤 รายจ่าย"],
    ["transfer", "🔄 โอน"], ["debt", "💳 ชำระหนี้"],
  ];

  return `
    <div class="backbar">
      <button data-back="1" data-fallback="dashboard">←</button>
      <h2>🧾 รายการทั้งหมด</h2>
    </div>
    <div class="section" style="padding-top:0">
      <div class="chip-row">
        ${filters.map(([k, l]) => `<button type="button" class="chip${txFilter === k ? ' sel' : ''}" data-filter="${k}">${l}</button>`).join("")}
      </div>
    </div>
    <div class="section">
      <div class="wallet-grid">${WALLETS.map(walletCardHtml).join("")}</div>
    </div>
    ${Object.keys(groups).length ? Object.entries(groups).map(([month, list]) => `
      <div class="section">
        <div class="month-divider">📅 ${month}</div>
        <div class="tx-list">${list.map(activityRowHtml).join("")}</div>
      </div>
    `).join("") : `<div class="section">${emptyState("ไม่พบรายการ")}</div>`}
  `;
};

/* ============================================================
   Settings
   ============================================================ */

ROUTES.settings = function () {
  return `
    ${backHeader("⚙️ ตั้งค่า")}
    <div class="form-wrap">
      <div class="settings-group">
        <button class="settings-item" data-nav="wallets">
          <span class="ic ic-bank">👛</span>
          <span class="txt">กระเป๋าเงิน<div class="d">ดูยอดและรายการแต่ละกระเป๋า</div></span>
          <span class="chev">›</span>
        </button>
        <button class="settings-item" data-nav="debts">
          <span class="ic ic-debt">💳</span>
          <span class="txt">หนี้สิน<div class="d">จัดการหนี้และการชำระ</div></span>
          <span class="chev">›</span>
        </button>
      </div>

      <div class="settings-group">
        <div style="padding:16px 16px 4px">
          <label style="font-size:13.5px;font-weight:600;color:var(--text-soft);display:flex;gap:6px;align-items:center;margin-bottom:8px">
            🔗 Apps Script Web App URL
          </label>
          <input type="text" id="apiUrlInput" placeholder="https://script.google.com/macros/s/xxxx/exec"
            value="${escapeHtml(CFG.apiUrl || "")}"
            style="width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid var(--border);font-size:13.5px;margin-bottom:6px">
          <p style="font-size:12px;color:var(--text-faint);margin:0 0 14px">
            วางลิงก์ที่ได้จากการ Deploy Google Apps Script เป็น Web App เพื่อ sync ข้อมูลกับ Google Sheets
            ถ้าปล่อยว่างไว้ แอปจะทำงานแบบออฟไลน์ (เก็บข้อมูลในเครื่องนี้เท่านั้น)
          </p>
          <button class="btn-outline" id="saveApiUrl" style="margin-top:0">💾 บันทึก URL</button>
        </div>
      </div>

      <div class="settings-group">
        <button class="settings-item" id="resetDemo">
          <span class="ic ic-gray">🔄</span>
          <span class="txt">รีเซ็ตข้อมูลตัวอย่าง<div class="d">ล้างข้อมูลในเครื่องและเริ่มใหม่</div></span>
        </button>
        <button class="settings-item" id="installHint">
          <span class="ic ic-gray">📲</span>
          <span class="txt">ติดตั้งเป็นแอป<div class="d">เพิ่มไอคอนไว้ที่หน้าจอโฮม</div></span>
        </button>
      </div>

      <p style="text-align:center;font-size:12px;color:var(--text-faint);margin-top:24px">
        รายรับรายจ่าย · เก็บข้อมูลในเครื่อง + Google Sheets
      </p>
    </div>
  `;
};

/* ============================================================
   Event binding for dynamic content
   ============================================================ */

function bindDynamicHandlers() {
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", () => go(el.dataset.nav, { id: el.dataset.id }));
  });
  document.querySelectorAll("[data-back]").forEach(el => {
    el.addEventListener("click", () => go(el.dataset.fallback || "dashboard"));
  });
  document.querySelectorAll("[data-scroll]").forEach(el => {
    el.addEventListener("click", () => {
      const target = document.getElementById(el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  if (currentRoute === "addIncome") {
    bindChipRow("incomeCat"); bindChipRow("incomeWallet");
    const slip = bindSlipField("incomeSlip");
    document.getElementById("incomeForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitIncome(slip.get());
    });
  }
  if (currentRoute === "addExpense") {
    bindChipRow("expenseCat"); bindChipRow("expenseWallet");
    const slip = bindSlipField("expenseSlip");
    document.getElementById("expenseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitExpense(slip.get());
    });
  }
  if (currentRoute === "transfer") {
    const slip = bindSlipField("trSlip");
    document.getElementById("transferForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitTransfer(slip.get());
    });
  }
  if (currentRoute === "addDebt") {
    bindChipRow("debtType");
    document.getElementById("debtForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitDebt();
    });
  }
  if (currentRoute === "payDebt") {
    bindChipRow("pd_wallet");
    const slip = bindSlipField("pdSlip");
    document.getElementById("payDebtForm").addEventListener("submit", (e) => {
      e.preventDefault();
      submitDebtPayment(slip.get());
    });
  }
  if (currentRoute === "transactions") {
    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => { txFilter = btn.dataset.filter; render(); });
    });
  }
  if (currentRoute === "settings") {
    document.getElementById("saveApiUrl").addEventListener("click", () => {
      CFG.apiUrl = document.getElementById("apiUrlInput").value.trim();
      saveConfig(CFG);
      showToast("บันทึก URL แล้ว ✅");
    });
    document.getElementById("resetDemo").addEventListener("click", () => {
      if (confirm("ล้างข้อมูลทั้งหมดในเครื่องและเริ่มใหม่ด้วยข้อมูลตัวอย่าง?")) {
        DATA = seedData();
        saveData(DATA);
        showToast("รีเซ็ตข้อมูลแล้ว");
        go("dashboard");
      }
    });
    document.getElementById("installHint").addEventListener("click", () => {
      showToast("เปิดเมนูเบราว์เซอร์ แล้วเลือก \u201cติดตั้งแอป\u201d หรือ \u201cเพิ่มลงหน้าจอโฮม\u201d");
    });
  }
}

/* ============================================================
   Form submit handlers
   ============================================================ */

function withTime(dateStr) {
  const now = new Date();
  const d = dateStr ? new Date(dateStr) : now;
  d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  return d.toISOString();
}

async function submitIncome(slip) {
  const amount = parseFloat(document.getElementById("f_amount").value);
  if (!amount || amount <= 0) return showToast("กรุณาใส่จำนวนเงิน", true);
  const catId = document.getElementById("incomeCat").dataset.selected;
  const walletId = document.getElementById("incomeWallet").dataset.selected;
  const note = document.getElementById("f_note").value.trim();
  const ts = withTime(document.getElementById("incomeDate").value);
  const tx = { id: uid("t"), type: "income", catId, walletId, amount, note, slip: slip || null, ts };
  DATA.transactions.push(tx);
  saveData(DATA);
  showToast("✅ บันทึกรายรับสำเร็จ");
  syncToSheet("addIncome", tx);
  go("dashboard");
}

async function submitExpense(slip) {
  const amount = parseFloat(document.getElementById("f_amount").value);
  if (!amount || amount <= 0) return showToast("กรุณาใส่จำนวนเงิน", true);
  const catId = document.getElementById("expenseCat").dataset.selected;
  const walletId = document.getElementById("expenseWallet").dataset.selected;
  const note = document.getElementById("f_note").value.trim();
  const ts = withTime(document.getElementById("expenseDate").value);
  const tx = { id: uid("t"), type: "expense", catId, walletId, amount, note, slip: slip || null, ts };
  DATA.transactions.push(tx);
  saveData(DATA);
  showToast("✅ บันทึกรายจ่ายสำเร็จ");
  syncToSheet("addExpense", tx);
  go("dashboard");
}

async function submitTransfer(slip) {
  const amount = parseFloat(document.getElementById("f_amount").value);
  const fromId = document.getElementById("tr_from").value;
  const toId = document.getElementById("tr_to").value;
  if (fromId === toId) return showToast("กระเป๋าต้นทางและปลายทางต้องไม่เหมือนกัน", true);
  if (!amount || amount <= 0) return showToast("กรุณาใส่จำนวนเงิน", true);
  const fee = parseFloat(document.getElementById("tr_fee").value) || 0;
  const note = document.getElementById("f_note").value.trim();
  const ts = withTime(document.getElementById("tr_date").value);
  const tr = { id: uid("tr"), fromId, toId, amount, fee, note, slip: slip || null, ts };
  DATA.transfers.push(tr);
  saveData(DATA);
  showToast("✅ โอนเงินสำเร็จ");
  syncToSheet("addTransfer", tr);
  go("dashboard");
}

async function submitDebt() {
  const name = document.getElementById("debt_name").value.trim();
  const amount = parseFloat(document.getElementById("debt_amount").value);
  if (!name) return showToast("กรุณาใส่ชื่อรายการหนี้", true);
  if (!amount || amount <= 0) return showToast("กรุณาใส่ยอดตั้งต้น", true);
  const typeId = document.getElementById("debtType").dataset.selected;
  const dueRaw = document.getElementById("debt_due").value;
  const debt = { id: uid("db"), typeId, name, initial: amount, due: dueRaw ? new Date(dueRaw).toISOString() : "", status: "active" };
  DATA.debts.push(debt);
  saveData(DATA);
  showToast("✅ เพิ่มหนี้สำเร็จ");
  syncToSheet("addDebt", debt);
  go("debts");
}

async function submitDebtPayment(slip) {
  const amount = parseFloat(document.getElementById("f_amount").value);
  if (!amount || amount <= 0) return showToast("กรุณาใส่จำนวนเงิน", true);
  const debtId = document.getElementById("pd_debt").value;
  const walletId = document.getElementById("pd_wallet").dataset.selected;
  const ts = withTime(document.getElementById("pd_date").value);
  const debt = DATA.debts.find(d => d.id === debtId);
  if (debt && amount > debtRemaining(debt)) {
    if (!confirm("จำนวนเงินมากกว่ายอดคงเหลือของหนี้นี้ ต้องการบันทึกต่อหรือไม่?")) return;
  }
  const p = { id: uid("dp"), debtId, walletId, amount, slip: slip || null, ts };
  DATA.debtPayments.push(p);
  saveData(DATA);
  showToast("✅ บันทึกการชำระหนี้สำเร็จ");
  syncToSheet("payDebt", p);
  go("debtDetail", { id: debtId });
}

/* ============================================================
   PWA install + service worker registration
   ============================================================ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

/* ---------------- boot ---------------- */
go("dashboard");
