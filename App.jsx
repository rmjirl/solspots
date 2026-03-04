import { useState, useEffect, useRef, useCallback } from "react";

const BUSINESSES = [
  { id:1,  name:"Cosmic Grounds Coffee",  cat:"coffee",   addr:"415 Valencia St, SF",    lat:37.7631, lng:-122.4213, rating:"4.8" },
  { id:2,  name:"Block Ramen",            cat:"food",     addr:"220 Market St, SF",      lat:37.7935, lng:-122.3964, rating:"4.6" },
  { id:3,  name:"Pixel Kicks Sneakers",   cat:"retail",   addr:"88 Haight St, SF",       lat:37.7700, lng:-122.4308, rating:"4.7" },
  { id:4,  name:"Chain & Sprocket Bikes", cat:"services", addr:"900 Fell St, SF",        lat:37.7735, lng:-122.4357, rating:"4.9" },
  { id:5,  name:"Node Collective",        cat:"crypto",   addr:"1 Market Plaza, SF",     lat:37.7942, lng:-122.3949, rating:"5.0" },
  { id:6,  name:"The Hash House",         cat:"food",     addr:"531 Divisadero St, SF",  lat:37.7750, lng:-122.4382, rating:"4.4" },
  { id:7,  name:"Ledger Laundry",         cat:"services", addr:"2400 Mission St, SF",    lat:37.7526, lng:-122.4186, rating:"4.2" },
  { id:8,  name:"Mint Leaf Dispensary",   cat:"retail",   addr:"1111 Folsom St, SF",     lat:37.7738, lng:-122.4097, rating:"4.8" },
  { id:9,  name:"Solana Print Shop",      cat:"services", addr:"77 5th St, SF",          lat:37.7805, lng:-122.4043, rating:"4.5" },
  { id:10, name:"Staked Tacos",           cat:"food",     addr:"640 Broadway, SF",       lat:37.7985, lng:-122.4068, rating:"4.7" },
  { id:11, name:"Keypair Barbers",        cat:"services", addr:"330 Clement St, SF",     lat:37.7827, lng:-122.4638, rating:"4.6" },
  { id:12, name:"Genesis Vinyl",          cat:"retail",   addr:"3251 16th St, SF",       lat:37.7649, lng:-122.4215, rating:"4.9" },
];

const CAT_EMOJI  = { food:"🍜", coffee:"☕", retail:"🛍", services:"⚡", crypto:"◎" };
const CAT_LABEL  = { all:"All Spots", food:"Food & Dining", coffee:"Coffee & Drinks", retail:"Retail", services:"Services", crypto:"Crypto / Web3" };
const CATEGORIES = ["all","food","coffee","retail","services","crypto"];

// Build OpenStreetMap embed URL with markers
function buildMapUrl(businesses, selected) {
  const center = selected
    ? `${selected.lat},${selected.lng}`
    : "37.775,-122.418";
  const zoom = selected ? 16 : 13;

  // Use OSM iframe embed — works in all sandboxes, no JS library needed
  const markers = businesses.map(b =>
    `marker=${b.lat},${b.lng}`
  ).join("&");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${
    (selected?.lng ?? -122.478) - 0.02
  }%2C${
    (selected?.lat ?? 37.755) - 0.015
  }%2C${
    (selected?.lng ?? -122.358) + 0.02
  }%2C${
    (selected?.lat ?? 37.795) + 0.015
  }&layer=mapnik&${markers}`;
}

const styles = {
  root: {
    fontFamily: "'Syne', 'Segoe UI', sans-serif",
    background: "#080B10",
    color: "#E8EDF5",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    height: 52,
    background: "#0D1117",
    borderBottom: "1px solid rgba(153,69,255,0.2)",
    flexShrink: 0,
    zIndex: 10,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 8,
    fontWeight: 800, fontSize: 18, letterSpacing: -0.5,
  },
  logoIcon: {
    width: 28, height: 28,
    background: "linear-gradient(135deg,#9945FF,#14F195)",
    borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14,
  },
  pill: {
    display: "flex", alignItems: "center", gap: 5,
    background: "rgba(20,241,149,0.08)",
    border: "1px solid rgba(20,241,149,0.2)",
    padding: "4px 12px", borderRadius: 100,
    fontSize: 12, fontFamily: "monospace", color: "#14F195",
  },
  dot: {
    width: 6, height: 6, background: "#14F195", borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  walletBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(153,69,255,0.12)",
    border: "1px solid rgba(153,69,255,0.4)",
    color: "#C084FC", padding: "6px 14px", borderRadius: 100,
    fontFamily: "monospace", fontSize: 12, cursor: "pointer",
  },
  body: { flex: 1, display: "flex", overflow: "hidden", position: "relative" },

  // Desktop sidebar
  sidebar: {
    width: 320, flexShrink: 0,
    background: "#0D1117",
    borderRight: "1px solid rgba(153,69,255,0.2)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  sidebarTop: { padding: 12, borderBottom: "1px solid rgba(153,69,255,0.2)" },
  searchWrap: { position: "relative", marginBottom: 10 },
  searchInput: {
    width: "100%", background: "#161B24",
    border: "1px solid rgba(153,69,255,0.2)",
    color: "#E8EDF5", padding: "8px 12px 8px 32px",
    borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none",
  },
  searchIcon: {
    position: "absolute", left: 10, top: "50%",
    transform: "translateY(-50%)", color: "#5A6478", fontSize: 14,
  },
  filterRow: { display: "flex", gap: 5, flexWrap: "wrap" },
  chip: (active) => ({
    background: active ? "rgba(20,241,149,0.08)" : "#161B24",
    border: `1px solid ${active ? "#14F195" : "rgba(153,69,255,0.2)"}`,
    color: active ? "#14F195" : "#5A6478",
    padding: "4px 10px", borderRadius: 100,
    fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  }),
  bizList: { flex: 1, overflowY: "auto", padding: 8 },
  bizCard: (selected) => ({
    background: selected ? "rgba(153,69,255,0.08)" : "#161B24",
    border: `1px solid ${selected ? "#9945FF" : "transparent"}`,
    borderRadius: 12, padding: 12, marginBottom: 7, cursor: "pointer",
    transition: "all 0.2s",
  }),
  bizName: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  bizAddr: { fontSize: 11, color: "#5A6478", marginBottom: 7 },
  bizFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  solBadge: { fontSize: 11, color: "#14F195", fontFamily: "monospace" },
  rating: { fontSize: 11, color: "#FFB800", fontFamily: "monospace" },
  catBadge: {
    fontSize: 10, background: "rgba(153,69,255,0.15)",
    color: "#9945FF", padding: "1px 7px", borderRadius: 100,
    fontFamily: "monospace", marginLeft: 6, flexShrink: 0,
  },

  // Map
  mapWrap: { flex: 1, position: "relative", overflow: "hidden" },
  mapIframe: { width: "100%", height: "100%", border: "none", filter: "invert(90%) hue-rotate(180deg)" },
  fab: {
    position: "absolute", bottom: 20, right: 16, zIndex: 5,
    width: 48, height: 48,
    background: "linear-gradient(135deg,#9945FF,#14F195)",
    border: "none", borderRadius: "50%",
    fontSize: 24, color: "#fff", cursor: "pointer",
    boxShadow: "0 6px 24px rgba(153,69,255,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Mobile bottom sheet
  bottomSheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 20,
    display: "flex", flexDirection: "column", pointerEvents: "none",
  },
  drawer: (open) => ({
    background: "rgba(8,11,16,0.97)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(153,69,255,0.2)",
    maxHeight: open ? "52vh" : 0,
    overflow: "hidden",
    transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
    pointerEvents: "all",
    display: "flex", flexDirection: "column",
  }),
  drawerHandle: {
    width: 32, height: 4, background: "rgba(255,255,255,0.15)",
    borderRadius: 2, margin: "8px auto 0",
  },
  drawerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", borderBottom: "1px solid rgba(153,69,255,0.15)",
    flexShrink: 0,
  },
  drawerTitle: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 },
  drawerCount: {
    fontSize: 10, color: "#14F195",
    background: "rgba(20,241,149,0.1)", border: "1px solid rgba(20,241,149,0.2)",
    padding: "1px 7px", borderRadius: 100, fontFamily: "monospace",
  },
  drawerClose: {
    background: "none", border: "none", color: "#5A6478",
    fontSize: 20, cursor: "pointer", lineHeight: 1,
  },
  drawerSearch: {
    padding: "8px 12px", borderBottom: "1px solid rgba(153,69,255,0.12)", flexShrink: 0,
  },
  drawerSearchInner: { position: "relative" },
  drawerSearchInput: {
    width: "100%", background: "#161B24",
    border: "1px solid rgba(153,69,255,0.2)",
    color: "#E8EDF5", padding: "7px 12px 7px 30px",
    borderRadius: 10, fontFamily: "inherit", fontSize: 12, outline: "none",
  },
  drawerList: { overflowY: "auto", padding: 8, flex: 1 },
  drawerCard: (selected) => ({
    display: "flex", alignItems: "center", gap: 10,
    background: selected ? "rgba(153,69,255,0.08)" : "#161B24",
    border: `1px solid ${selected ? "#9945FF" : "transparent"}`,
    borderRadius: 12, padding: "10px 12px", marginBottom: 6,
    cursor: "pointer", transition: "all 0.15s",
  }),
  drawerIcon: {
    width: 38, height: 38, flexShrink: 0,
    background: "linear-gradient(135deg,rgba(153,69,255,0.2),rgba(20,241,149,0.1))",
    border: "1px solid rgba(153,69,255,0.2)",
    borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  drawerInfo: { flex: 1, minWidth: 0 },
  drawerName: { fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  drawerAddr: { fontSize: 10, color: "#5A6478", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 },
  drawerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 },

  pillsBar: {
    pointerEvents: "all",
    background: "rgba(8,11,16,0.94)",
    backdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(153,69,255,0.2)",
    padding: "10px 14px 18px",
    display: "flex", gap: 7, overflowX: "auto",
    scrollbarWidth: "none",
  },
  sheetPill: (active) => ({
    display: "flex", alignItems: "center", gap: 5,
    background: active ? "rgba(20,241,149,0.1)" : "#161B24",
    border: `1px solid ${active ? "#14F195" : "rgba(153,69,255,0.2)"}`,
    color: active ? "#14F195" : "#5A6478",
    padding: "7px 14px", borderRadius: 100,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
  }),

  // Modal
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)", zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  },
  modal: {
    background: "#0D1117", border: "1px solid rgba(153,69,255,0.2)",
    borderRadius: 20, padding: 24, width: "100%", maxWidth: 400,
    maxHeight: "85vh", overflowY: "auto",
  },
  modalTitle: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#5A6478", marginBottom: 18 },
  formGroup: { marginBottom: 14 },
  label: {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "#5A6478", textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 5, fontFamily: "monospace",
  },
  input: {
    width: "100%", background: "#161B24",
    border: "1px solid rgba(153,69,255,0.2)",
    color: "#E8EDF5", padding: "9px 12px",
    borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none",
  },
  modalActions: { display: "flex", gap: 10, marginTop: 18 },
  btnCancel: {
    flex: 1, background: "#161B24",
    border: "1px solid rgba(153,69,255,0.2)",
    color: "#5A6478", padding: 10, borderRadius: 10,
    fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
  },
  btnSubmit: {
    flex: 2, background: "linear-gradient(135deg,#9945FF,#14F195)",
    border: "none", color: "#fff", padding: 10, borderRadius: 10,
    fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
  toast: (show) => ({
    position: "fixed", bottom: 90, right: 16,
    background: "#161B24", border: "1px solid rgba(20,241,149,0.3)",
    color: "#14F195", padding: "10px 18px", borderRadius: 12,
    fontSize: 13, fontWeight: 600, fontFamily: "monospace",
    zIndex: 200, pointerEvents: "none",
    transform: show ? "translateY(0)" : "translateY(20px)",
    opacity: show ? 1 : 0, transition: "all 0.3s",
  }),
};

export default function SolSpots() {
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [drawerOpen, setDrawer]   = useState(false);
  const [modalOpen, setModal]     = useState(false);
  const [businesses, setBusinesses] = useState(BUSINESSES);
  const [toast, setToast]         = useState("");
  const [toastVis, setToastVis]   = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const [wallet, setWallet]       = useState(null);
  const [form, setForm]           = useState({ name:"", addr:"", cat:"food", wallet:"" });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showToast = (msg) => {
    setToast(msg); setToastVis(true);
    setTimeout(() => setToastVis(false), 3000);
  };

  const filtered = businesses.filter(b => {
    const matchCat = filter === "all" || b.cat === filter;
    const q = search.toLowerCase();
    const matchQ = !q || b.name.toLowerCase().includes(q) || b.addr.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const selectBiz = (b, fromDrawer) => {
    setSelected(b);
    if (fromDrawer) setTimeout(() => setDrawer(false), 250);
  };

  const setMobileFilter = (f) => {
    const wasActive = filter === f && drawerOpen;
    setFilter(f);
    if (wasActive) setDrawer(false);
    else setDrawer(true);
  };

  const submitBiz = () => {
    if (!form.name || !form.addr) { showToast("⚠ Fill in name and address"); return; }
    const newB = {
      id: Date.now(), name: form.name, cat: form.cat, addr: form.addr,
      lat: 37.7749 + (Math.random()-0.5)*0.05,
      lng: -122.4194 + (Math.random()-0.5)*0.05,
      rating: (4+Math.random()).toFixed(1),
    };
    setBusinesses(prev => [...prev, newB]);
    setModal(false);
    setForm({ name:"", addr:"", cat:"food", wallet:"" });
    setTimeout(() => { setSelected(newB); showToast("✓ Business listed!"); }, 200);
  };

  // Build map iframe src — centered on selected or SF
  const mapSrc = (() => {
    const b = selected;
    const lat = b?.lat ?? 37.775;
    const lng = b?.lng ?? -122.418;
    const pad = b ? 0.018 : 0.07;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-pad}%2C${lat-pad*0.7}%2C${lng+pad}%2C${lat+pad*0.7}&layer=mapnik`;
  })();

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(153,69,255,0.3); border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>◎</div>
          SOL <span style={{color:"#14F195"}}>Spots</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={styles.pill}>
            <div style={styles.dot}/>
            {filtered.length} locations
          </div>
          <button
            style={{...styles.walletBtn, ...(wallet ? {background:"rgba(20,241,149,0.1)",borderColor:"rgba(20,241,149,0.4)",color:"#14F195"} : {})}}
            onClick={() => { setWallet(wallet ? null : "7xKp…3mWq"); showToast(wallet ? "Disconnected" : "✓ Connected (demo)"); }}
          >
            ◈ {wallet ?? "Connect Solflare"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={styles.body}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarTop}>
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>⌕</span>
                <input
                  style={styles.searchInput}
                  placeholder="Search businesses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div style={styles.filterRow}>
                {CATEGORIES.map(c => (
                  <div key={c} style={styles.chip(filter===c)} onClick={() => setFilter(c)}>
                    {c === "all" ? "All" : `${CAT_EMOJI[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.bizList}>
              {filtered.map((b,i) => (
                <div key={b.id} style={{...styles.bizCard(selected?.id===b.id), animationDelay:`${i*0.04}s`}} onClick={() => selectBiz(b)}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                    <div style={styles.bizName}>{b.name}</div>
                    <div style={styles.catBadge}>{CAT_EMOJI[b.cat]} {b.cat}</div>
                  </div>
                  <div style={styles.bizAddr}>📍 {b.addr}</div>
                  <div style={styles.bizFooter}>
                    <div style={styles.solBadge}>◎ Accepts SOL</div>
                    <div style={styles.rating}>★ {b.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div style={styles.mapWrap}>
          <iframe
            key={mapSrc}
            src={mapSrc}
            style={styles.mapIframe}
            title="map"
            loading="lazy"
          />

          {/* Selected popup overlay */}
          {selected && (
            <div style={{
              position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
              background:"rgba(13,17,23,0.95)", backdropFilter:"blur(12px)",
              border:"1px solid rgba(153,69,255,0.3)", borderRadius:14,
              padding:"10px 16px", minWidth:220, zIndex:5,
              animation:"slideUp 0.25s ease",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>{selected.name}</div>
                  <div style={{fontSize:11,color:"#9945FF",fontFamily:"monospace",marginBottom:4}}>{CAT_EMOJI[selected.cat]} {selected.cat.toUpperCase()}</div>
                  <div style={{fontSize:11,color:"#5A6478"}}>📍 {selected.addr}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{background:"none",border:"none",color:"#5A6478",cursor:"pointer",fontSize:18,marginLeft:12}}>×</button>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"1px solid rgba(153,69,255,0.15)"}}>
                <span style={{fontSize:11,color:"#14F195",fontFamily:"monospace"}}>◎ Accepts Solana Pay</span>
                <span style={{fontSize:11,color:"#FFB800",fontFamily:"monospace"}}>★ {selected.rating}</span>
              </div>
            </div>
          )}

          {/* FAB */}
          <button style={{...styles.fab, bottom: isMobile ? 90 : 20}} onClick={() => setModal(true)}>+</button>
        </div>

        {/* Mobile bottom sheet */}
        {isMobile && (
          <div style={styles.bottomSheet}>
            <div style={styles.drawer(drawerOpen)}>
              <div style={styles.drawerHandle}/>
              <div style={styles.drawerHeader}>
                <div style={styles.drawerTitle}>
                  <span>{filter === "all" ? "📍" : CAT_EMOJI[filter]}</span>
                  <span>{CAT_LABEL[filter]}</span>
                  <span style={styles.drawerCount}>{filtered.length}</span>
                </div>
                <button style={styles.drawerClose} onClick={() => setDrawer(false)}>×</button>
              </div>
              <div style={styles.drawerSearch}>
                <div style={styles.drawerSearchInner}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#5A6478",fontSize:13}}>⌕</span>
                  <input
                    style={styles.drawerSearchInput}
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.drawerList}>
                {filtered.map((b,i) => (
                  <div key={b.id} style={{...styles.drawerCard(selected?.id===b.id), animationDelay:`${i*0.03}s`}} onClick={() => selectBiz(b, true)}>
                    <div style={styles.drawerIcon}>{CAT_EMOJI[b.cat]}</div>
                    <div style={styles.drawerInfo}>
                      <div style={styles.drawerName}>{b.name}</div>
                      <div style={styles.drawerAddr}>📍 {b.addr}</div>
                    </div>
                    <div style={styles.drawerRight}>
                      <span style={{fontSize:11,color:"#FFB800",fontFamily:"monospace"}}>★ {b.rating}</span>
                      <span style={{fontSize:10,color:"#14F195",fontFamily:"monospace"}}>◎ SOL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pills bar */}
            <div style={styles.pillsBar}>
              {CATEGORIES.map(c => (
                <div key={c} style={styles.sheetPill(filter===c)} onClick={() => setMobileFilter(c)}>
                  {c === "all" ? "📍 All" : `${CAT_EMOJI[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add biz modal */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>Add a Business</div>
            <div style={styles.modalSub}>List a business that accepts Solana payments</div>
            {[["name","Business Name","e.g. Blue Bottle Coffee"],["addr","Address","123 Main St, City, State"],["wallet","Solana Pay Address","Your SOL wallet address"]].map(([key,lbl,ph]) => (
              <div key={key} style={styles.formGroup}>
                <label style={styles.label}>{lbl}</label>
                <input style={styles.input} placeholder={ph} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}/>
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={form.cat} onChange={e => setForm(f=>({...f,cat:e.target.value}))}>
                <option value="food">🍜 Food & Dining</option>
                <option value="coffee">☕ Coffee & Drinks</option>
                <option value="retail">🛍 Retail</option>
                <option value="services">⚡ Services</option>
                <option value="crypto">◎ Crypto / Web3</option>
              </select>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>Cancel</button>
              <button style={styles.btnSubmit} onClick={submitBiz}>◎ Submit Listing</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.toast(toastVis)}>{toast}</div>
    </div>
  );
}
