import { useState, useEffect, useRef } from "react";

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

function useLeaflet(onReady) {
  useEffect(() => {
    if (window.L) { onReady(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = onReady;
    document.head.appendChild(script);
  }, []);
}

function LeafletMap({ businesses, selected, onMarkerClick, filter }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const [ready, setReady] = useState(!!window.L);

  useLeaflet(() => setReady(true));

  useEffect(() => {
    if (!ready || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([37.775, -122.418], 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd", opacity: 0.85
    }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd", opacity: 1
    }).addTo(map);
    leafletMap.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 600);
  }, [ready]);

  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    const visible = filter === "all" ? businesses : businesses.filter(b => b.cat === filter);
    visible.forEach(b => {
      const isSel = selected?.id === b.id;
      const bgColor = isSel ? "#14F195" : "#1a0a2e";
      const borderColor = isSel ? "#fff" : "#9945FF";
      const emoji = CAT_EMOJI[b.cat];
      const size = isSel ? 40 : 34;
      const fontSize = isSel ? 16 : 14;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${bgColor};border:2px solid ${borderColor};border-radius:50%;box-shadow:0 0 ${isSel ? 18 : 10}px ${isSel ? "#14F195" : "#9945FF"};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;transition:all 0.2s;cursor:pointer;">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      });
      markersRef.current[b.id] = L.marker([b.lat, b.lng], { icon })
        .addTo(map)
        .on("click", () => onMarkerClick(b));
    });
  }, [ready, businesses, selected, filter]);

  useEffect(() => {
    if (!ready || !leafletMap.current || !selected) return;
    leafletMap.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 });
  }, [ready, selected]);

  return (
    <div ref={mapRef} style={{ width:"100%", height:"100%", background:"#0D1117" }}>
      {!ready && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.25)", fontSize:13, fontFamily:"monospace", background:"#0D1117" }}>
          Loading map...
        </div>
      )}
    </div>
  );
}

export default function SolSpots() {
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawer] = useState(false);
  const [modalOpen, setModal]   = useState(false);
  const [businesses, setBiz]    = useState(BUSINESSES);
  const [toast, setToast]       = useState({ msg:"", vis:false });
  const [isMobile, setMobile]   = useState(window.innerWidth < 768);
  const [wallet, setWallet]     = useState(null);
  const [form, setForm]         = useState({ name:"", addr:"", cat:"food", wallet:"" });

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const showToast = (msg) => {
    setToast({ msg, vis:true });
    setTimeout(() => setToast(t => ({...t, vis:false})), 3000);
  };

  const filtered = businesses.filter(b => {
    const matchCat = filter === "all" || b.cat === filter;
    const q = search.toLowerCase();
    return matchCat && (!q || b.name.toLowerCase().includes(q) || b.addr.toLowerCase().includes(q));
  });

  const selectBiz = (b, closeDrawer) => {
    setSelected(b);
    if (closeDrawer) setTimeout(() => setDrawer(false), 200);
  };

  const setMobileFilter = (f) => {
    if (filter === f && drawerOpen) { setDrawer(false); return; }
    setFilter(f); setDrawer(true);
  };

  const submitBiz = () => {
    if (!form.name || !form.addr) { showToast("⚠ Fill in name and address"); return; }
    const nb = { id:Date.now(), name:form.name, cat:form.cat, addr:form.addr, lat:37.7749+(Math.random()-0.5)*0.05, lng:-122.4194+(Math.random()-0.5)*0.05, rating:(4+Math.random()).toFixed(1) };
    setBiz(prev => [...prev, nb]);
    setModal(false);
    setForm({ name:"", addr:"", cat:"food", wallet:"" });
    setTimeout(() => { setSelected(nb); showToast("✓ Business listed!"); }, 200);
  };

  const C = {
    bg:"#07090E", surface:"#0E1420", surface2:"#141A26",
    border:"rgba(153,69,255,0.18)", borderHi:"rgba(153,69,255,0.45)",
    purple:"#9945FF", green:"#14F195",
    text:"#F0F4FF", textSub:"#8A95B0", textDim:"#4A5568",
    gold:"#FFB800",
  };

  const chipStyle = (active) => ({
    display:"flex", alignItems:"center", gap:5,
    background: active ? "rgba(20,241,149,0.1)" : C.surface2,
    border:`1px solid ${active ? C.green : C.border}`,
    color: active ? C.green : C.textSub,
    padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700,
    cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s",
  });

  const cardStyle = (sel) => ({
    background: sel ? "rgba(153,69,255,0.08)" : C.surface2,
    border:`1px solid ${sel ? C.purple : "transparent"}`,
    borderRadius:12, padding:12, marginBottom:7, cursor:"pointer", transition:"all 0.15s",
  });

  const inputStyle = { width:"100%", background:C.surface2, border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:10, fontFamily:"inherit", fontSize:13, outline:"none" };
  const labelStyle = { display:"block", fontSize:11, fontWeight:600, color:C.textSub, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5, fontFamily:"monospace" };

  return (
    <div style={{ fontFamily:"'Syne','Segoe UI',sans-serif", background:C.bg, color:C.text, height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(153,69,255,0.3);border-radius:3px;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .biz-card:hover{background:rgba(153,69,255,0.06)!important;border-color:rgba(153,69,255,0.25)!important;}
        .drawer-card:hover{background:rgba(153,69,255,0.06)!important;}
        input,select{color-scheme:dark;}
        .leaflet-container{background:#0D1117!important;}
      `}</style>

      {/* Header */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:56, background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0, zIndex:10, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, fontSize:18, letterSpacing:-0.5, flexShrink:0 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#9945FF,#14F195)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>◎</div>
          SOL <span style={{ color:C.green }}>Spots</span>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(20,241,149,0.07)", border:"1px solid rgba(20,241,149,0.2)", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.green, whiteSpace:"nowrap" }}>
            <div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite", flexShrink:0 }}/>
            {filtered.length} locations
          </div>
          <button onClick={() => { setWallet(w => w ? null : "7xKp…3mWq"); showToast(wallet ? "Disconnected" : "✓ Connected (demo)"); }} style={{ display:"flex", alignItems:"center", gap:5, background: wallet ? "rgba(20,241,149,0.08)" : "rgba(153,69,255,0.1)", border:`1px solid ${wallet ? "rgba(20,241,149,0.35)" : C.borderHi}`, color: wallet ? C.green : "#C084FC", padding:"5px 10px", borderRadius:8, fontFamily:"monospace", fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
            ◈ {wallet ? wallet : "Connect Solflare"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

        {!isMobile && (
          <div style={{ width:320, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:12, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ position:"relative", marginBottom:10 }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textDim, fontSize:15 }}>⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses..." style={{ ...inputStyle, padding:"8px 12px 8px 32px" }}/>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {CATEGORIES.map(c => (
                  <div key={c} style={chipStyle(filter===c)} onClick={() => setFilter(c)}>
                    {c==="all" ? "All" : `${CAT_EMOJI[c]} ${c[0].toUpperCase()+c.slice(1)}`}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8 }}>
              {filtered.map(b => (
                <div key={b.id} className="biz-card" style={cardStyle(selected?.id===b.id)} onClick={() => selectBiz(b)}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{b.name}</div>
                    <div style={{ fontSize:10, background:"rgba(153,69,255,0.12)", color:C.purple, padding:"1px 7px", borderRadius:100, fontFamily:"monospace", marginLeft:6, flexShrink:0 }}>{CAT_EMOJI[b.cat]} {b.cat}</div>
                  </div>
                  <div style={{ fontSize:11, color:C.textSub, marginBottom:7 }}>📍 {b.addr}</div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ Accepts SOL</span>
                    <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {b.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <LeafletMap businesses={businesses} selected={selected} filter={filter} onMarkerClick={b => selectBiz(b, isMobile)} />

          {selected && (
            <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(14,20,32,0.97)", backdropFilter:"blur(16px)", border:`1px solid ${C.borderHi}`, borderRadius:14, padding:"11px 16px", minWidth:230, maxWidth:"85vw", zIndex:500, animation:"slideUp 0.2s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>{selected.name}</div>
                  <div style={{ fontSize:11, color:C.purple, fontFamily:"monospace", marginBottom:4 }}>{CAT_EMOJI[selected.cat]} {selected.cat.toUpperCase()}</div>
                  <div style={{ fontSize:11, color:C.textSub }}>📍 {selected.addr}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.textDim, cursor:"pointer", fontSize:20, marginLeft:12, lineHeight:1 }}>×</button>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:9, paddingTop:9, borderTop:"1px solid rgba(153,69,255,0.15)" }}>
                <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ Accepts Solana Pay</span>
                <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {selected.rating}</span>
              </div>
            </div>
          )}

          <button onClick={() => setModal(true)} style={{ position:"absolute", bottom: isMobile ? 96 : 20, right:16, zIndex:5, width:48, height:48, background:"linear-gradient(135deg,#9945FF,#14F195)", border:"none", borderRadius:"50%", fontSize:24, color:"#fff", cursor:"pointer", boxShadow:"0 6px 24px rgba(153,69,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        </div>

        {isMobile && (
          <div style={{ position:"absolute", left:0, right:0, bottom:0, zIndex:20, display:"flex", flexDirection:"column", pointerEvents:"none" }}>
            <div style={{ background:"rgba(7,9,14,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, maxHeight: drawerOpen ? "52vh" : 0, overflow:"hidden", transition:"max-height 0.35s cubic-bezier(0.4,0,0.2,1)", pointerEvents:"all", display:"flex", flexDirection:"column" }}>
              <div style={{ width:32, height:4, background:"rgba(255,255,255,0.12)", borderRadius:2, margin:"8px auto 0" }}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:"1px solid rgba(153,69,255,0.12)", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:C.text }}>
                  <span>{filter==="all" ? "📍" : CAT_EMOJI[filter]}</span>
                  <span>{CAT_LABEL[filter]}</span>
                  <span style={{ fontSize:10, color:C.green, background:"rgba(20,241,149,0.08)", border:"1px solid rgba(20,241,149,0.2)", padding:"1px 7px", borderRadius:100, fontFamily:"monospace" }}>{filtered.length}</span>
                </div>
                <button onClick={() => setDrawer(false)} style={{ background:"none", border:"none", color:C.textDim, fontSize:20, cursor:"pointer" }}>×</button>
              </div>
              <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(153,69,255,0.1)", flexShrink:0 }}>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:C.textDim, fontSize:13 }}>⌕</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, padding:"7px 12px 7px 28px", fontSize:12 }}/>
                </div>
              </div>
              <div style={{ overflowY:"auto", padding:8, flex:1 }}>
                {filtered.map(b => (
                  <div key={b.id} className="drawer-card" style={{ display:"flex", alignItems:"center", gap:10, background: selected?.id===b.id ? "rgba(153,69,255,0.08)" : C.surface2, border:`1px solid ${selected?.id===b.id ? C.purple : "transparent"}`, borderRadius:12, padding:"10px 12px", marginBottom:6, cursor:"pointer", transition:"all 0.15s" }} onClick={() => selectBiz(b, true)}>
                    <div style={{ width:38, height:38, flexShrink:0, background:"linear-gradient(135deg,rgba(153,69,255,0.15),rgba(20,241,149,0.08))", border:`1px solid ${C.border}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{CAT_EMOJI[b.cat]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.name}</div>
                      <div style={{ fontSize:10, color:C.textSub, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>📍 {b.addr}</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                      <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {b.rating}</span>
                      <span style={{ fontSize:10, color:C.green, fontFamily:"monospace" }}>◎ SOL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category pills - FIXED: square-ish corners, proper spacing */}
            <div style={{ pointerEvents:"all", background:"rgba(7,9,14,0.97)", backdropFilter:"blur(16px)", borderTop:`1px solid ${C.border}`, padding:"8px 12px 20px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", alignItems:"center" }}>
              {CATEGORIES.map(c => (
                <div key={c} style={{ display:"flex", alignItems:"center", gap:5, background: filter===c ? "rgba(20,241,149,0.1)" : C.surface2, border:`1px solid ${filter===c ? C.green : C.border}`, color: filter===c ? C.green : C.textSub, padding:"7px 13px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s" }} onClick={() => setMobileFilter(c)}>
                  {c==="all" ? "📍 All" : `${CAT_EMOJI[c]} ${c[0].toUpperCase()+c.slice(1)}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:400, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>Add a Business</div>
            <div style={{ fontSize:13, color:C.textSub, marginBottom:18 }}>List a business that accepts Solana payments</div>
            {[["name","Business Name","e.g. Blue Bottle Coffee"],["addr","Address","123 Main St, City, State"],["wallet","Solana Pay Address","Your SOL wallet address"]].map(([k,lbl,ph]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <label style={labelStyle}>{lbl}</label>
                <input style={inputStyle} placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.cat} onChange={e => setForm(f => ({...f,cat:e.target.value}))}>
                <option value="food">🍜 Food & Dining</option>
                <option value="coffee">☕ Coffee & Drinks</option>
                <option value="retail">🛍 Retail</option>
                <option value="services">⚡ Services</option>
                <option value="crypto">◎ Crypto / Web3</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, background:C.surface2, border:`1px solid ${C.border}`, color:C.textSub, padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={submitBiz} style={{ flex:2, background:"linear-gradient(135deg,#9945FF,#14F195)", border:"none", color:"#fff", padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:700, fontSize:14, cursor:"pointer" }}>◎ Submit Listing</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position:"fixed", bottom:100, right:16, background:C.surface, border:"1px solid rgba(20,241,149,0.3)", color:C.green, padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"monospace", zIndex:200, pointerEvents:"none", transform: toast.vis ? "translateY(0)" : "translateY(20px)", opacity: toast.vis ? 1 : 0, transition:"all 0.3s" }}>
        {toast.msg}
      </div>
    </div>
  );
}
