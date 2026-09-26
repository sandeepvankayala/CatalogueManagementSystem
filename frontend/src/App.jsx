import { useEffect, useState } from "react";
import "./App.css";

// ============================================================
// BACKEND ADDRESS
// ============================================================
// Reads from a build-time environment variable when one is set (this is how
// the Netlify deployment points at your live Render backend - see
// frontend/.env.production), and otherwise falls back to plain localhost for
// everyday browser development, so nothing changes for local work.
//
// In a normal browser on your own PC, "localhost" means "this same
// computer", which works fine when you run `npm run dev` alongside the
// Spring Boot backend.
//
// Once this app runs as an installed Android app (via Capacitor), "localhost"
// means "the phone itself" instead - it can no longer reach your PC. You must
// change VITE_API_URL (in frontend/.env, create it if missing) to your PC's
// actual network address before building the Android app:
//
//   1. On your PC (same WiFi as the phone/emulator), open Command Prompt and run:  ipconfig
//   2. Find "IPv4 Address" under your active adapter, e.g. 192.168.1.42
//   3. In frontend/.env put:  VITE_API_URL=http://192.168.1.42:8080
//   4. Make sure Windows Firewall allows inbound connections on port 8080.
//
// Using the Android EMULATOR instead of a real phone? Use 10.0.2.2 instead of
// your PC's IP: VITE_API_URL=http://10.0.2.2:8080
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ============================================================
   TOAST + CONFIRM SYSTEM
   Replaces every browser alert()/confirm() with in-app UI.
   Implemented as a tiny pub-sub so any component, at any depth,
   can trigger a toast or a confirmation dialog without prop drilling.
   ============================================================ */
let toastListeners = [];
function showToast(message, type = "info") {
  const toast = { id: Math.random().toString(36).slice(2), message, type };
  toastListeners.forEach(fn => fn(toast));
}

let confirmListeners = [];
function showConfirm(message) {
  return new Promise(resolve => {
    confirmListeners.forEach(fn => fn({ message, resolve }));
  });
}

function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (toast) => {
      setToasts(t => [...t, toast]);
      setTimeout(() => {
        setToasts(t => t.map(x => x.id === toast.id ? { ...x, leaving: true } : x));
        setTimeout(() => setToasts(t => t.filter(x => x.id !== toast.id)), 220);
      }, 3200);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);
  if (!toasts.length) return null;
  return <div className="toast-stack">
    {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}${t.leaving ? " toast-leaving" : ""}`}>{t.message}</div>)}
  </div>;
}

function ConfirmHost() {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    const handler = (req) => setRequest(req);
    confirmListeners.push(handler);
    return () => { confirmListeners = confirmListeners.filter(fn => fn !== handler); };
  }, []);
  if (!request) return null;
  function respond(value) { request.resolve(value); setRequest(null); }
  return <div className="modal-overlay">
    <div className="modal-box">
      <p>{request.message}</p>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={() => respond(false)}>Cancel</button>
        <button className="btn-danger" onClick={() => respond(true)}>Confirm</button>
      </div>
    </div>
  </div>;
}

/* ============================================================
   FETCH HELPERS
   publicFetch  - catalogue browsing + placing orders. No login involved at all.
   ownerFetch   - owner/admin dashboard calls. Attaches the JWT and handles
                  an expired/invalid session by logging the owner out cleanly.
   ============================================================ */
function errMsg(d, fallback) {
  if (!d) return fallback;
  if (d.message) return d.message;
  const values = Object.values(d);
  return values.length ? String(values[0]) : fallback;
}

async function publicFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(API + url, options);
  } catch {
    throw new Error("Cannot connect to the server. Please make sure it is running.");
  }
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) throw new Error(errMsg(data, "Request failed"));
  return data;
}

const ownerAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("ownerToken")}` });
let onOwnerSessionExpired = () => {};

async function ownerFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(API + url, { ...options, headers: { ...(options.headers || {}), ...ownerAuthHeader() } });
  } catch {
    throw new Error("Cannot connect to the server. Please make sure it is running.");
  }
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    showToast(errMsg(data, "Your session has expired. Please log in again."), "error");
    onOwnerSessionExpired();
    throw new Error("Session expired");
  }
  if (!response.ok) throw new Error(errMsg(data, "Request failed"));
  return data;
}

/* ============================================================
   SHARED UI PIECES
   ============================================================ */
function PasswordField({ value, onChange, placeholder, required, minLength, id }) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <input
      id={id}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setVisible(v => !v)}
      aria-label={visible ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {visible ? "🙈" : "👁️"}
    </button>
  </div>;
}

function SkeletonCard() {
  return <div className="card skeleton-card">
    <div className="skeleton-avatar" />
    <div className="skeleton-line" />
  </div>;
}

function CardAvatar({ imageUrl, label }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (imageUrl && imageUrl.trim() && !failed) {
    return <img
      className={`card-avatar-img${loaded ? " loaded" : ""}`}
      src={imageUrl}
      alt={label}
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
    />;
  }
  return <div className="card-avatar">{label}</div>;
}

function TopBar({ title, onBack, onHome, rightLabel, onRight }) {
  return <div className="topbar">
    {onBack ? <button className="topbar-btn" onClick={onBack}>← Back</button> : <span className="topbar-spacer" />}
    <h2 className="topbar-title">{title}</h2>
    {onRight
      ? <button className="topbar-btn" onClick={onRight}>{rightLabel}</button>
      : (onHome ? <button className="topbar-btn" onClick={onHome}>🏠 Home</button> : <span className="topbar-spacer" />)}
  </div>;
}

/* ============================================================
   ROOT - decides which screen is showing
   ============================================================ */
function Root() {
  const [mode, setMode] = useState("home"); // home | customer | ownerLogin | owner
  const [ownerUser, setOwnerUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ownerUser") || "null"); } catch { return null; }
  });

  useEffect(() => {
    if (ownerUser) setMode("owner");
    onOwnerSessionExpired = () => { setOwnerUser(null); setMode("ownerLogin"); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function ownerLogout() {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    setOwnerUser(null);
    setMode("home");
  }

  if (mode === "customer") return <CustomerFlow onHome={() => setMode("home")} />;
  if (mode === "owner" && ownerUser) return <OwnerDashboard user={ownerUser} logout={ownerLogout} />;
  if (mode === "ownerLogin") return <OwnerLogin onBack={() => setMode("home")} onLoggedIn={(u) => { setOwnerUser(u); setMode("owner"); }} />;
  return <HomeScreen onCustomer={() => setMode("customer")} onOwner={() => setMode("ownerLogin")} />;
}

// Small ripple-on-press effect for the two big home buttons - purely a
// tactile touch for the first thing anyone sees, not applied app-wide.
function spawnRipple(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function HomeScreen({ onCustomer, onOwner }) {
  return <div className="center-screen">
    <div className="hero-card">
      <h1 className="gradient-text">Anuradha Agencies</h1>
      <p className="tagline">Wholesale catalogue &amp; ordering</p>
      <div className="hero-buttons">
        <button className="btn-primary btn-large" onMouseDown={spawnRipple} onClick={onCustomer}>🛒 I'm a Customer</button>
        <button className="btn-outline btn-large" onMouseDown={spawnRipple} onClick={onOwner}>🔐 Owner / Admin Login</button>
      </div>
    </div>
  </div>;
}

function OwnerLogin({ onBack, onLoggedIn }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const d = await publicFetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      localStorage.setItem("ownerToken", d.token);
      const u = { userId: d.userId, name: d.name, shopName: d.shopName, role: d.role };
      localStorage.setItem("ownerUser", JSON.stringify(u));
      onLoggedIn(u);
    } catch (x) {
      showToast(x.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return <div className="center-screen">
    <div className="auth-card">
      <button className="link-back" onClick={onBack}>← Back</button>
      <h1>Owner Login</h1>
      <form onSubmit={login}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <PasswordField placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn-primary" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
      </form>
    </div>
  </div>;
}

/* ============================================================
   CUSTOMER FLOW - no login. Agency -> Product -> Variant -> Cart -> Checkout
   ============================================================ */
function CustomerFlow({ onHome }) {
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [allProductsLoading, setAllProductsLoading] = useState(true);
  const [browseMode, setBrowseMode] = useState("products"); // "products" | "agencies"
  const [agency, setAgency] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selection, setSelection] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const isSearchActive = searchQuery.trim().length >= 2;

  useEffect(() => {
    publicFetch("/api/catalogue/agencies").then(setAgencies).catch(x => showToast(x.message, "error")).finally(() => setAgenciesLoading(false));
    publicFetch("/api/catalogue/products").then(setAllProducts).catch(x => showToast(x.message, "error")).finally(() => setAllProductsLoading(false));
  }, []);

  // Debounced product search across every agency at once, so a customer
  // doesn't have to open each agency one by one to find something.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const timeout = setTimeout(() => {
      publicFetch(`/api/catalogue/search?q=${encodeURIComponent(query)}`)
        .then(setSearchResults)
        .catch(x => showToast(x.message, "error"))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  async function openAgency(a) {
    setAgency(a); setProduct(null); setVariants([]);
    setProductsLoading(true);
    try { setProducts(await publicFetch(`/api/catalogue/agencies/${a.id}/products`)); }
    catch (x) { showToast(x.message, "error"); }
    finally { setProductsLoading(false); }
  }
  async function openProduct(p) {
    setProduct(p);
    setSelectedVariantId("");
    setQuantity(1);
    setVariantsLoading(true);
    try { setVariants(await publicFetch(`/api/catalogue/products/${p.id}/variants`)); }
    catch (x) { showToast(x.message, "error"); }
    finally { setVariantsLoading(false); }
  }
  function backToAgencies() { setAgency(null); setProduct(null); setProducts([]); setVariants([]); setSelectedVariantId(""); setQuantity(1); }
  function backToProducts() { setProduct(null); setVariants([]); setSelectedVariantId(""); setQuantity(1); }

  // Jumping into a search result reconstructs the normal agency -> product
  // navigation state (not just the variant view), so Back still works
  // correctly afterwards exactly as if the customer had drilled down manually.
  async function selectSearchResult(p) {
    await openAgency({ id: p.agencyId, name: p.agencyName });
    await openProduct(p);
    setSearchQuery("");
  }

  function add(v) {
    if (!v) { showToast("Please select a size first", "error"); return; }
    const q = quantity;
    if (!Number.isFinite(q) || q < 1) { showToast("Enter a valid whole number quantity", "error"); return; }
    setSelection(s => {
      const existing = s.find(i => i.variantId === v.id);
      if (existing) return s.map(i => i.variantId === v.id ? { ...i, quantity: i.quantity + q } : i);
      return [...s, { variantId: v.id, productName: product.name, size: v.size, unit: v.unit, quantity: q }];
    });
    showToast(`Added ${product.name} (${v.size}) to cart`, "success");
    setQuantity(1);
  }

  async function placeOrder(shopName, phone, sendToWhatsapp) {
    try {
      const d = await publicFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, phone, items: selection.map(i => ({ variantId: i.variantId, quantity: i.quantity })) })
      });
      setSelection([]);
      setCheckoutOpen(false);
      // The order is always saved either way - sendToWhatsapp only controls
      // whether we also redirect to WhatsApp with a pre-filled message.
      if (sendToWhatsapp && d.whatsappUrl) {
        showToast("Order placed! Opening WhatsApp…", "success");
        // window.open() here would fire after an `await`, disconnected from the
        // original click - many mobile browsers/WebViews block that as a popup.
        // A plain navigation always works, in a browser tab, a PWA, or the
        // Capacitor app alike.
        window.location.href = d.whatsappUrl;
      } else {
        showToast("Order placed successfully!", "success");
      }
    } catch (x) {
      showToast(x.message, "error");
    }
  }

  const selectedVariant = variants.find(v => String(v.id) === String(selectedVariantId)) || null;
  const title = isSearchActive ? "Search Results" : (product ? product.name : (agency ? agency.name : (browseMode === "agencies" ? "Select Agency" : "All Products")));
  const onBack = isSearchActive ? (() => setSearchQuery("")) : (product ? backToProducts : (agency ? backToAgencies : null));

  return <div className="page">
    <TopBar title={title} onBack={onBack} onHome={onHome} />

    <div className="search-bar">
      <input
        type="text"
        placeholder="🔍 Search products across all agencies…"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      {searchQuery && <button className="btn-secondary btn-small" onClick={() => setSearchQuery("")}>Clear</button>}
    </div>

    {isSearchActive ? (
      <div className="grid-cards">
        {searching ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          searchResults.length ? searchResults.map((p, i) => <div className="card fade-in-card" style={{ animationDelay: `${i * 35}ms` }} key={p.id} onClick={() => selectSearchResult(p)}>
            <CardAvatar imageUrl={p.imageUrl} label={p.name[0]} /><h3>{p.name}</h3>
            <p className="muted">{p.agencyName}</p>
          </div>) : <p className="empty-state">🔍 No products match "{searchQuery}"</p>
        )}
      </div>
    ) : <>
      {!agency && <div className="tabs">
        <button className={`tab-btn ${browseMode === "products" ? "tab-active" : ""}`} onClick={() => setBrowseMode("products")}>All Products</button>
        <button className={`tab-btn ${browseMode === "agencies" ? "tab-active" : ""}`} onClick={() => setBrowseMode("agencies")}>Browse by Agency</button>
      </div>}

      {!agency && browseMode === "products" && <div className="grid-cards">
        {allProductsLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : (
          allProducts.length ? allProducts.map((p, i) => <div className="card fade-in-card" style={{ animationDelay: `${i * 35}ms` }} key={p.id} onClick={() => selectSearchResult(p)}>
            <CardAvatar imageUrl={p.imageUrl} label={p.name[0]} /><h3>{p.name}</h3>
            <p className="muted">{p.agencyName}</p>
          </div>) : <p className="empty-state">📦 No products available yet.</p>
        )}
      </div>}

      {!agency && browseMode === "agencies" && <div className="grid-cards">
        {agenciesLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : (
          agencies.length ? agencies.map((a, i) => <div className="card fade-in-card" style={{ animationDelay: `${i * 35}ms` }} key={a.id} onClick={() => openAgency(a)}>
            <CardAvatar imageUrl={a.logoUrl} label={a.name[0]} /><h3>{a.name}</h3>
          </div>) : <p className="empty-state">🏬 No agencies available yet.</p>
        )}
      </div>}

      {agency && !product && <div className="grid-cards">
        {productsLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : (
          products.length ? products.map((p, i) => <div className="card fade-in-card" style={{ animationDelay: `${i * 35}ms` }} key={p.id} onClick={() => openProduct(p)}>
            <CardAvatar imageUrl={p.imageUrl} label={p.name[0]} /><h3>{p.name}</h3>
          </div>) : <p className="empty-state">📦 No products available.</p>
        )}
      </div>}

      {product && <div className="variant-selector">
        {variantsLoading ? <>
          <div className="skeleton-line" style={{ width: "40%", height: "13px", margin: "0 0 8px 0" }} />
          <div className="skeleton-line" style={{ width: "100%", height: "38px", margin: "0 0 10px 0" }} />
          <div className="skeleton-line" style={{ width: "60%", height: "34px", margin: "0" }} />
        </> : variants.length ? <>
          <label>Select Size</label>
          <select value={selectedVariantId} onChange={e => setSelectedVariantId(e.target.value)}>
            <option value="">Choose a size…</option>
            {variants.map(v => <option key={v.id} value={v.id}>{v.size} — ₹{v.mrp} / {v.unit}</option>)}
          </select>
          {selectedVariant && <p className="muted">MRP ₹{selectedVariant.mrp} / {selectedVariant.unit}</p>}
          <div className="qty-row">
            <div className="qty-stepper">
              <button type="button" className="stepper-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span className="stepper-value">{quantity}</span>
              <button type="button" className="stepper-btn" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn-primary" onClick={() => add(selectedVariant)} disabled={!selectedVariant}>Add to Cart</button>
          </div>
        </> : <p className="empty-state">🧾 No variants available.</p>}
      </div>}
    </>}

    {selection.length > 0 && <div className="cart-bar">
      <span key={selection.reduce((n, i) => n + i.quantity, 0)} className="cart-count-bump">{selection.reduce((n, i) => n + i.quantity, 0)} item(s) in cart</span>
      <button className="btn-primary" onClick={() => setCheckoutOpen(true)}>View Cart &amp; Checkout</button>
    </div>}

    {checkoutOpen && <CheckoutModal selection={selection} setSelection={setSelection} onClose={() => setCheckoutOpen(false)} onSubmit={placeOrder} />}
  </div>;
}

function CheckoutModal({ selection, setSelection, onClose, onSubmit }) {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [sendToWhatsapp, setSendToWhatsapp] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!selection.length) { showToast("Your cart is empty", "error"); return; }
    setSubmitting(true);
    await onSubmit(shopName.trim(), phone.trim(), sendToWhatsapp);
    setSubmitting(false);
  }

  return <div className="modal-overlay">
    <div className="modal-box modal-wide">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {selection.map((i, n) => <div className="cart-line" key={i.variantId}>
          <span>{n + 1}. {i.productName} ({i.size}) — {i.quantity} {i.unit}</span>
          <button className="link-danger" onClick={() => setSelection(s => s.filter(x => x.variantId !== i.variantId))}>Remove</button>
        </div>)}
      </div>
      <form onSubmit={submit} className="checkout-form">
        <label>Shop Name</label>
        <input value={shopName} onChange={e => setShopName(e.target.value)} required placeholder="Your shop name" />
        <label>Phone Number</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required minLength={10} maxLength={20} placeholder="10-digit phone number" />
        <label className="checkbox-row">
          <input type="checkbox" checked={sendToWhatsapp} onChange={e => setSendToWhatsapp(e.target.checked)} />
          Also send this order via WhatsApp
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={submitting}>{submitting ? "Placing order…" : "Place Order"}</button>
        </div>
      </form>
    </div>
  </div>;
}

/* ============================================================
   OWNER DASHBOARD - sidebar navigation instead of one long scrolling page
   ============================================================ */
const SIDEBAR_ITEMS = [
  { key: "orders", label: "Orders", icon: "🧺" },
  { key: "agencies", label: "Agencies", icon: "🏬" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "variants", label: "Variants", icon: "🧾" },
  { key: "account", label: "Account", icon: "👤" },
];

function OwnerDashboard({ user, logout }) {
  const [tab, setTab] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [agencies, setAgencies] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [orders, setOrders] = useState([]);

  async function loadCatalogue() {
    try {
      const agencyList = await ownerFetch("/api/catalogue/agencies");
      setAgencies(Array.isArray(agencyList) ? agencyList : []);

      let allProducts = [], allVariants = [];
      for (const ag of (Array.isArray(agencyList) ? agencyList : [])) {
        const productList = await ownerFetch(`/api/catalogue/agencies/${ag.id}/products`);
        for (const p of (Array.isArray(productList) ? productList : [])) {
          allProducts.push({ ...p, agencyId: ag.id, agencyName: ag.name });
          const variantList = await ownerFetch(`/api/catalogue/products/${p.id}/variants`);
          if (Array.isArray(variantList)) {
            allVariants.push(...variantList.map(v => ({ ...v, productId: p.id, productName: p.name, agencyName: ag.name })));
          }
        }
      }
      setProducts(allProducts);
      setVariants(allVariants);
    } catch (x) { showToast(x.message, "error"); }
  }
  async function loadOrders() {
    try { const d = await ownerFetch("/api/owner/orders"); setOrders(Array.isArray(d) ? d : []); }
    catch (x) { showToast(x.message, "error"); }
  }
  useEffect(() => { Promise.all([loadCatalogue(), loadOrders()]).finally(() => setInitialLoading(false)); }, []);

  async function addAgency(payload) {
    try {
      await ownerFetch("/api/owner/agencies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      showToast("Agency added successfully", "success");
      loadCatalogue();
    } catch (x) { showToast(x.message, "error"); }
  }
  async function addProduct(payload) {
    try {
      await ownerFetch("/api/owner/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      showToast("Product added successfully", "success");
      loadCatalogue();
    } catch (x) { showToast(x.message, "error"); }
  }
  async function addVariant(productId, payload) {
    try {
      await ownerFetch(`/api/owner/products/${productId}/variants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      showToast("Variant added successfully", "success");
      loadCatalogue();
    } catch (x) { showToast(x.message, "error"); }
  }
  async function deactivate(kind, id) {
    const ok = await showConfirm(`Deactivate this ${kind}? It will be hidden from customers.`);
    if (!ok) return;
    const path = kind === "agency" ? "agencies" : kind === "product" ? "products" : "variants";
    try {
      await ownerFetch(`/api/owner/${path}/${id}`, { method: "DELETE" });
      showToast(`${kind[0].toUpperCase()}${kind.slice(1)} deactivated`, "success");
      loadCatalogue();
    } catch (x) { showToast(x.message, "error"); }
  }
  async function setOrderStatus(id, newStatus) {
    try { await ownerFetch(`/api/owner/orders/${id}/status?status=${newStatus}`, { method: "PUT" }); loadOrders(); }
    catch (x) { showToast(x.message, "error"); }
  }

  return <div className="dashboard-shell">
    {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">🏪 {user.shopName || user.name}</div>
      <nav className="sidebar-nav">
        {SIDEBAR_ITEMS.map(item => (
          <button key={item.key} className={`sidebar-link ${tab === item.key ? "sidebar-active" : ""}`} onClick={() => { setTab(item.key); setSidebarOpen(false); }}>
            <span className="sidebar-icon">{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>
      <button className="sidebar-link sidebar-logout" onClick={logout}>
        <span className="sidebar-icon">🚪</span> Logout
      </button>
    </aside>

    <main className="dashboard-main">
      <div className="mobile-topbar">
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)}>☰ Menu</button>
        <h2 className="topbar-title">{SIDEBAR_ITEMS.find(i => i.key === tab)?.label}</h2>
      </div>
      <div className="dashboard-header">
        <h2>{SIDEBAR_ITEMS.find(i => i.key === tab)?.label}</h2>
        <p className="muted">Welcome, {user.name}</p>
      </div>

      <div className="tab-panel" key={tab}>
        {initialLoading ? <div className="grid-cards">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div> : <>
          {tab === "orders" && <OrdersTab orders={orders} setOrderStatus={setOrderStatus} />}
          {tab === "agencies" && <AgenciesTab agencies={agencies} addAgency={addAgency} deactivate={deactivate} />}
          {tab === "products" && <ProductsTab agencies={agencies} products={products} addProduct={addProduct} deactivate={deactivate} />}
          {tab === "variants" && <VariantsTab products={products} variants={variants} addVariant={addVariant} deactivate={deactivate} />}
          {tab === "account" && <AccountTab />}
        </>}
      </div>
    </main>
  </div>;
}

function OrdersTab({ orders, setOrderStatus }) {
  return <>
    <h2 className="tab-heading">Orders</h2>
    {orders.length ? <div className="grid-cards grid-cards-wide">{orders.map((o, i) => <div className={`detail-card fade-in-card accent-order-${o.status.toLowerCase()}`} style={{ animationDelay: `${i * 35}ms` }} key={o.id}>
      <h3>Order #{o.id}</h3>
      <p>Shop: {o.shopName}</p>
      <p>Phone: {o.phone}</p>
      <p>Status: <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></p>
      <div className="order-items">
        {o.items?.map((i, n) => <p key={i.id || n} className="muted">{n + 1}. {i.productName}{i.size ? ` (${i.size})` : ""} — {i.quantity} {i.unit}</p>)}
      </div>
      <div className="detail-actions">
        {o.status === "NEW" && <><button className="btn-primary btn-small" onClick={() => setOrderStatus(o.id, "ACCEPTED")}>Accept</button> <button className="btn-danger btn-small" onClick={() => setOrderStatus(o.id, "REJECTED")}>Reject</button></>}
        {o.status === "ACCEPTED" && <button className="btn-primary btn-small" onClick={() => setOrderStatus(o.id, "COMPLETED")}>Complete</button>}
      </div>
    </div>)}</div> : <p className="empty-state">🧺 No orders yet.</p>}
  </>;
}

function AgenciesTab({ agencies, addAgency, deactivate }) {
  const [name, setName] = useState(""), [logoUrl, setLogoUrl] = useState(""), [description, setDescription] = useState(""), [displayOrder, setDisplayOrder] = useState("");
  function submit(e) {
    e.preventDefault();
    addAgency({ name: name.trim(), logoUrl: logoUrl.trim(), description: description.trim(), displayOrder: Math.trunc(Number(displayOrder || 0)), active: true });
    setName(""); setLogoUrl(""); setDescription(""); setDisplayOrder("");
  }
  return <>
    <h2 className="tab-heading">Add Agency</h2>
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Agency name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Logo URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" step="1" placeholder="Display order" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} />
      <button className="btn-primary">Add Agency</button>
    </form>
    <h2 className="tab-heading">Existing Agencies</h2>
    {agencies.length ? <div className="grid-cards">{agencies.map((a, i) => <div className="detail-card fade-in-card accent-agency" style={{ animationDelay: `${i * 35}ms` }} key={a.id}>
      <CardAvatar imageUrl={a.logoUrl} label={a.name[0]} />
      <h3>{a.name}</h3><p className="muted">ID: {a.id}</p>
      <button className="btn-danger btn-small" onClick={() => deactivate("agency", a.id)}>Deactivate</button>
    </div>)}</div> : <p className="empty-state">🏬 No agencies yet.</p>}
  </>;
}

function ProductsTab({ agencies, products, addProduct, deactivate }) {
  const [name, setName] = useState(""), [description, setDescription] = useState(""), [imageUrl, setImageUrl] = useState(""), [agencyId, setAgencyId] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!agencyId) { showToast("Please select an agency", "error"); return; }
    addProduct({ agencyId: Number(agencyId), name: name.trim(), description: description.trim(), imageUrl: imageUrl.trim(), active: true });
    setName(""); setDescription(""); setImageUrl(""); setAgencyId("");
  }
  return <>
    <h2 className="tab-heading">Add Product</h2>
    <form className="inline-form" onSubmit={submit}>
      <select value={agencyId} onChange={e => setAgencyId(e.target.value)} required>
        <option value="">Select Agency</option>
        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <input placeholder="Product name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input placeholder="Product image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <button className="btn-primary">Add Product</button>
    </form>
    <h2 className="tab-heading">Existing Products</h2>
    {products.length ? <div className="grid-cards">{products.map((p, i) => <div className="detail-card fade-in-card accent-product" style={{ animationDelay: `${i * 35}ms` }} key={p.id}>
      <CardAvatar imageUrl={p.imageUrl} label={p.name[0]} />
      <h3>{p.name}</h3><p className="muted">{p.agencyName}</p>
      <button className="btn-danger btn-small" onClick={() => deactivate("product", p.id)}>Deactivate</button>
    </div>)}</div> : <p className="empty-state">📦 No products yet.</p>}
  </>;
}

function VariantsTab({ products, variants, addVariant, deactivate }) {
  const [productId, setProductId] = useState(""), [size, setSize] = useState(""), [unit, setUnit] = useState("Dozen"), [mrp, setMrp] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!productId) { showToast("Please select a product", "error"); return; }
    const mrpNum = Number(mrp);
    if (!Number.isFinite(mrpNum) || mrpNum < 0) { showToast("Enter a valid MRP", "error"); return; }
    addVariant(productId, { size: size.trim(), unit, mrp: mrpNum, active: true });
    setProductId(""); setSize(""); setMrp("");
  }
  return <>
    <h2 className="tab-heading">Add Product Variant</h2>
    <form className="inline-form" onSubmit={submit}>
      <select value={productId} onChange={e => setProductId(e.target.value)} required>
        <option value="">Select Product</option>
        {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.agencyName}</option>)}
      </select>
      <input placeholder="Size e.g. 50g" value={size} onChange={e => setSize(e.target.value)} required />
      <select value={unit} onChange={e => setUnit(e.target.value)}>
        <option>Dozen</option><option>Pieces</option><option>Box</option><option>Pack</option>
      </select>
      <input type="number" placeholder="MRP" value={mrp} onChange={e => setMrp(e.target.value)} required min="0" step="0.01" />
      <button className="btn-primary">Add Variant</button>
    </form>
    <h2 className="tab-heading">Existing Variants</h2>
    {variants.length ? <div className="grid-cards">{variants.map((v, i) => <div className="detail-card fade-in-card accent-variant" style={{ animationDelay: `${i * 35}ms` }} key={v.id}>
      <h3>{v.productName} — {v.size}</h3>
      <p className="muted">{v.agencyName}</p>
      <p className="muted">₹{v.mrp} / {v.unit}</p>
      <button className="btn-danger btn-small" onClick={() => deactivate("variant", v.id)}>Deactivate</button>
    </div>)}</div> : <p className="empty-state">🧾 No variants yet.</p>}
  </>;
}

function AccountTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast("New passwords don't match", "error"); return; }
    setSubmitting(true);
    try {
      await ownerFetch("/api/owner/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      showToast("Password updated successfully", "success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (x) {
      showToast(x.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <h2 className="tab-heading">Change Password</h2>
    <form className="inline-form" onSubmit={submit}>
      <PasswordField placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
      <PasswordField placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
      <PasswordField placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
      <button className="btn-primary" disabled={submitting}>{submitting ? "Updating…" : "Update Password"}</button>
    </form>
  </>;
}

function App() {
  return <>
    <ToastHost />
    <ConfirmHost />
    <Root />
  </>;
}

export default App;
