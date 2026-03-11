import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

// ─── Supabase config ───────────────────────────────────────────────────────────
const SB_URL = "https://lfjtswxryhsttqaqsfks.supabase.co";
const SB_KEY = "sb_publishable_0pljWxPSO9abq-j1BqsXHQ_z4pcNQRW";

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CAT_EMOJI  = { atm:"🏧", cafe:"☕", restaurant:"🍽", shopping:"🛍", grocery:"🛒", beauty:"💅", apparel:"👕", gas:"⛽" };
const CAT_LABEL  = { all:"All Spots", atm:"ATM / OTC", cafe:"Cafés", restaurant:"Restaurants", shopping:"Shopping", grocery:"Groceries", beauty:"Beauty Salons", apparel:"Apparel", gas:"Gas" };
const CATEGORIES = ["all","atm","cafe","restaurant","shopping","grocery","beauty","apparel","gas"];
const BOTTOM_BAR_H = 68;
const DEFAULT_CENTER = { lat: 40.728, lng: -73.9855 };

// ─── Leaflet map component ─────────────────────────────────────────────────────
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

const LeafletMap = forwardRef(function LeafletMap({ businesses, selected, onMarkerClick, filter, userLocation }, ref) {
  const mapRef        = useRef(null);
  const leafletMap    = useRef(null);
  const markersRef    = useRef({});
  const userMarkerRef = useRef(null);
  const searchPinRef  = useRef(null);
  const [ready, setReady] = useState(!!window.L);

  useLeaflet(() => setReady(true));

  // Expose flyTo and setSearchPin to parent
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 14) => {
      if (leafletMap.current) leafletMap.current.flyTo([lat, lng], zoom, { duration: 1 });
    },
    setSearchPin: (lat, lng, label) => {
      if (!leafletMap.current || !window.L) return;
      const L = window.L;
      if (searchPinRef.current) searchPinRef.current.remove();
      const icon = L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:0;">
          <div style="background:#9945FF;border:2px solid #fff;border-radius:50% 50% 50% 0;width:28px;height:28px;transform:rotate(-45deg);box-shadow:0 0 14px #9945FF;display:flex;align-items:center;justify-content:center;">
            <span style="transform:rotate(45deg);font-size:14px;">📍</span>
          </div>
        </div>`,
        iconSize: [28, 36], iconAnchor: [14, 36],
      });
      searchPinRef.current = L.marker([lat, lng], { icon, zIndexOffset: 900 })
        .addTo(leafletMap.current)
        .bindTooltip(label, { permanent: true, direction: "top", className: "sol-tooltip", offset: [0, -8] })
        .openTooltip();
      leafletMap.current.flyTo([lat, lng], 14, { duration: 1 });
    },
    clearSearchPin: () => {
      if (searchPinRef.current) { searchPinRef.current.remove(); searchPinRef.current = null; }
    },
  }), [ready]);

  useLeaflet(() => setReady(true));

  useEffect(() => {
    if (!ready || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const center = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView(center, 14);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd"
    }).addTo(map);
    leafletMap.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 600);
  }, [ready]);

  // ── User location marker ──
  useEffect(() => {
    if (!ready || !leafletMap.current || !userLocation) return;
    const L   = window.L;
    const map = leafletMap.current;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    const approx = userLocation.approximate;
    const icon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:${approx?56:40}px;height:${approx?56:40}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:100%;height:100%;border-radius:50%;background:rgba(20,241,149,${approx?0.1:0.2});animation:pcPulse 1.8s ease-out infinite;"></div>
        <div style="position:absolute;width:65%;height:65%;border-radius:50%;background:rgba(20,241,149,${approx?0.15:0.3});animation:pcPulse 1.8s ease-out infinite 0.3s;"></div>
        <div style="position:relative;width:${approx?14:16}px;height:${approx?14:16}px;background:${approx?"rgba(20,241,149,0.5)":"#14F195"};border:2.5px solid ${approx?"rgba(255,255,255,0.5)":"#fff"};border-radius:50%;box-shadow:0 0 ${approx?8:14}px #14F195;z-index:2;"></div>
      </div>`,
      iconSize: [approx?56:40, approx?56:40], iconAnchor: [approx?28:20, approx?28:20],
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip(approx ? "Approximate location" : "You are here", { permanent: false, direction: "top", className: "sol-tooltip" });
  }, [ready, userLocation]);

  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L   = window.L;
    const map = leafletMap.current;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    const visible = filter === "all" ? businesses : businesses.filter(b => b.cat === filter);
    visible.forEach(b => {
      const isSel   = selected?.id === b.id;
      const size    = isSel ? 40 : 32;
      const fontSize = isSel ? 16 : 13;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${isSel?"#14F195":"#1a0a2e"};border:2px solid ${isSel?"#fff":"#9945FF"};border-radius:50%;box-shadow:0 0 ${isSel?18:8}px ${isSel?"#14F195":"#9945FF"};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;cursor:pointer;">${CAT_EMOJI[b.cat]}</div>`,
        iconSize: [size, size], iconAnchor: [size/2, size/2],
      });
      markersRef.current[b.id] = L.marker([b.lat, b.lng], { icon })
        .addTo(map).on("click", () => onMarkerClick(b));
    });
  }, [ready, businesses, selected, filter]);

  // ── Fly to user location when it first arrives or upgrades to GPS ──
  const prevLocRef = useRef(null);
  useEffect(() => {
    if (!ready || !leafletMap.current || !userLocation) return;
    const wasApprox = prevLocRef.current?.approximate;
    const isApprox  = userLocation.approximate;
    // Only fly if: first location, or upgrading from approximate to precise
    if (!prevLocRef.current || (wasApprox && !isApprox)) {
      leafletMap.current.flyTo([userLocation.lat, userLocation.lng], isApprox ? 12 : 15, { duration: 1 });
    }
    prevLocRef.current = userLocation;
  }, [ready, userLocation]);

  useEffect(() => {
    if (!ready || !leafletMap.current || !selected) return;
    leafletMap.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 });
  }, [ready, selected]);

  return (
    <div ref={mapRef} style={{ width:"100%", height:"100%", background:"#0D1117" }} />
  );
});

// ─── Main app ──────────────────────────────────────────────────────────────────
export default function SolSpots() {
  const [filter,      setFilter]   = useState("all");
  const [search,      setSearch]   = useState("");
  const [selected,    setSelected] = useState(null);
  const [drawerOpen,  setDrawer]   = useState(false);
  const [modalOpen,   setModal]    = useState(false);
  const [businesses,  setBiz]      = useState([]);
  const [loading,     setLoading]  = useState(true);
  const [submitting,  setSubmitting] = useState(false);
  const [toast,       setToast]    = useState({ msg:"", vis:false });
  const [isMobile,    setMobile]   = useState(window.innerWidth < 768);
  const [form,         setForm]        = useState({ name:"", addr:"", cat:"cafe", lat:"", lng:"", website:"", phone:"", wallet:"" });
  const [userLocation, setUserLocation] = useState(null);
  const [gpsError,    setGpsError]     = useState(false);
  const [addrSearch,  setAddrSearch]   = useState("");
  const [addrLoading, setAddrLoading]  = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Geolocation ──
  // Desktop: IP lookup (city-level, no permission) → auto-upgrade to GPS
  // Mobile: iOS/Brave require a user gesture to trigger GPS — show a button instead
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isBrave = !!navigator.brave || navigator.userAgent.includes("Brave");

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError(true); return; }
    setGpsError(false);
    // Use high accuracy + explicit timeout so Brave doesn't silently hang
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, approximate: false });
        setGpsError(false);
      },
      (err) => {
        console.warn("GPS error:", err.code, err.message);
        setGpsError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (isMobileDevice) return; // mobile uses the tap button below
    const tryIpLookup = async () => {
      const services = [
        async () => {
          const r = await fetch("https://ip-api.com/json/?fields=lat,lon,status");
          const d = await r.json();
          if (d.status === "success" && d.lat) return { lat: d.lat, lng: d.lon };
          throw new Error("no coords");
        },
        async () => {
          const r = await fetch("https://freeipapi.com/api/json");
          const d = await r.json();
          if (d.latitude && d.longitude) return { lat: d.latitude, lng: d.longitude };
          throw new Error("no coords");
        },
        async () => {
          const r = await fetch("https://ipapi.co/json/");
          const d = await r.json();
          if (d.latitude && d.longitude) return { lat: d.latitude, lng: d.longitude };
          throw new Error("no coords");
        },
      ];
      for (const svc of services) {
        try {
          const loc = await svc();
          if (loc) { setUserLocation({ ...loc, approximate: true }); return; }
        } catch (_) {}
      }
    };
    tryIpLookup();
    requestGPS();
  }, []);

  // ── Load approved businesses from Supabase ──
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sbFetch("businesses?approved=eq.true&order=name.asc&select=*");
      setBiz(data || []);
    } catch (e) {
      showToast("⚠ Could not load businesses");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBusinesses(); }, [loadBusinesses]);

  const showToast = (msg) => {
    setToast({ msg, vis:true });
    setTimeout(() => setToast(t => ({...t, vis:false})), 3500);
  };

  const filtered = businesses.filter(b => {
    const matchCat = filter === "all" || b.cat === filter;
    const q = search.toLowerCase();
    return matchCat && (!q || b.name.toLowerCase().includes(q) || b.addr.toLowerCase().includes(q));
  });

  const selectBiz = (b, close) => {
    setSelected(b);
    if (close) setTimeout(() => setDrawer(false), 200);
  };

  const setMobileFilter = (f) => {
    if (filter === f && drawerOpen) { setDrawer(false); return; }
    setFilter(f); setDrawer(true);
  };

  // ── Submit new business to Supabase (pending approval) ──
  const submitBiz = async () => {
    if (!form.name.trim() || !form.addr.trim()) {
      showToast("⚠ Name and address are required");
      return;
    }
    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);
    if (form.lat && form.lng && (isNaN(latNum) || isNaN(lngNum))) {
      showToast("⚠ Coordinates must be valid numbers");
      return;
    }
    setSubmitting(true);
    try {
      await sbFetch("businesses", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify({
          name:     form.name.trim(),
          addr:     form.addr.trim(),
          cat:      form.cat,
          lat:      form.lat ? latNum : null,
          lng:      form.lng ? lngNum : null,
          website:  form.website.trim() || null,
          phone:    form.phone.trim() || null,
          wallet:   form.wallet.trim() || null,
          approved: false,
          rating:   null,
        }),
      });
      setModal(false);
      setForm({ name:"", addr:"", cat:"cafe", lat:"", lng:"", website:"", phone:"", wallet:"" });
      showToast("✓ Submitted! Pending review before appearing on the map.");
    } catch (e) {
      console.error(e);
      showToast("⚠ Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Geocode address search (Nominatim) ──
  const geocodeSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setAddrLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (!data || data.length === 0) {
        showToast("⚠ Location not found. Try a different search.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const shortLabel = display_name.split(",").slice(0, 2).join(",");
      mapRef.current?.setSearchPin(parseFloat(lat), parseFloat(lon), shortLabel);
    } catch (e) {
      showToast("⚠ Search failed. Check your connection.");
    } finally {
      setAddrLoading(false);
    }
  }, []);

  // ─── Colors ───────────────────────────────────────────────────────────────────
  const C = {
    bg:"#07090E", surface:"#0E1420", surface2:"#141A26",
    border:"rgba(153,69,255,0.18)", borderHi:"rgba(153,69,255,0.45)",
    purple:"#9945FF", green:"#14F195",
    text:"#F0F4FF", textSub:"#8A95B0", textDim:"#4A5568", gold:"#FFB800",
  };
  const inp = { width:"100%", background:C.surface2, border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:10, fontFamily:"inherit", fontSize:13, outline:"none" };
  const lbl = { display:"block", fontSize:11, fontWeight:600, color:C.textSub, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5, fontFamily:"monospace" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(153,69,255,0.3);border-radius:3px;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pcPulse{0%{transform:scale(0.8);opacity:0.9;}100%{transform:scale(2.4);opacity:0;}}
        .sol-tooltip{background:rgba(14,20,32,0.95)!important;border:1px solid rgba(20,241,149,0.4)!important;color:#14F195!important;font-family:monospace!important;font-size:11px!important;font-weight:600!important;border-radius:6px!important;padding:3px 8px!important;box-shadow:none!important;}
        .sol-tooltip::before{display:none!important;}
        .biz-card:hover{background:rgba(153,69,255,0.06)!important;border-color:rgba(153,69,255,0.25)!important;}
        .drawer-card:hover{background:rgba(153,69,255,0.06)!important;}
        input,select{color-scheme:dark;}
        .leaflet-container{background:#0D1117!important;}
      `}</style>

      <div style={{ position:"fixed", inset:0, fontFamily:"'Syne','Segoe UI',sans-serif", background:C.bg, color:C.text, display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:52, background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0, zIndex:10, gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, fontSize:18, letterSpacing:-0.5, flexShrink:0 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#9945FF,#14F195)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>◎</div>
            SOL <span style={{ color:C.green }}>Spots</span>
          </div>

          {/* Address search — shown in header on mobile, hidden on desktop (desktop has sidebar) */}
          {isMobile && (
            <div style={{ flex:1, display:"flex", gap:6, alignItems:"center" }}>
              <div style={{ flex:1, position:"relative" }}>
                <input
                  value={addrSearch}
                  onChange={e => setAddrSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && geocodeSearch(addrSearch)}
                  placeholder="Search any address or city…"
                  style={{ ...inp, padding:"7px 36px 7px 12px", fontSize:12, borderRadius:100 }}
                />
                {addrLoading
                  ? <div style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", width:13, height:13, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                  : <span onClick={() => geocodeSearch(addrSearch)} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", fontSize:14, cursor:"pointer", color:C.textSub }}>⌕</span>
                }
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
            {!isMobile && (
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(20,241,149,0.07)", border:"1px solid rgba(20,241,149,0.2)", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.green, whiteSpace:"nowrap" }}>
                {loading
                  ? <><div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 1s infinite" }}/> Loading…</>
                  : <><div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite" }}/> {filtered.length} locations</>
                }
              </div>
            )}
          </div>
        </header>

        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

          {/* Desktop sidebar */}
          {!isMobile && (
            <div style={{ width:320, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:12, borderBottom:`1px solid ${C.border}` }}>
                {/* Address / city geocode search */}
                <div style={{ position:"relative", marginBottom:8 }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.purple, fontSize:14 }}>🌐</span>
                  <input
                    value={addrSearch}
                    onChange={e => setAddrSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && geocodeSearch(addrSearch)}
                    placeholder="Go to any city or address…"
                    style={{ ...inp, padding:"8px 36px 8px 30px" }}
                  />
                  {addrLoading
                    ? <div style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", width:13, height:13, border:`2px solid ${C.border}`, borderTop:`2px solid ${C.green}`, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                    : <span onClick={() => geocodeSearch(addrSearch)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:15, cursor:"pointer", color:C.textSub }}>⌕</span>
                  }
                </div>
                {/* Business name filter search */}
                <div style={{ position:"relative", marginBottom:10 }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textDim, fontSize:15 }}>⌕</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter businesses..." style={{ ...inp, padding:"8px 12px 8px 32px" }}/>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {CATEGORIES.map(c => (
                    <div key={c} onClick={() => setFilter(c)} style={{ display:"flex", alignItems:"center", gap:5, background: filter===c ? "rgba(20,241,149,0.1)" : C.surface2, border:`1px solid ${filter===c ? C.green : C.border}`, color: filter===c ? C.green : C.textSub, padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>
                      {c==="all" ? "All" : `${CAT_EMOJI[c]} ${CAT_LABEL[c]}`}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:8 }}>
                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:200, gap:12, color:C.textSub }}>
                    <div style={{ width:28, height:28, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.green}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <span style={{ fontSize:13 }}>Loading spots…</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:C.textSub, fontSize:13 }}>
                    {businesses.length === 0 ? "No businesses yet. Be the first to add one! ↗" : "No results for this filter."}
                  </div>
                ) : filtered.map(b => (
                  <div key={b.id} className="biz-card" onClick={() => selectBiz(b)} style={{ background: selected?.id===b.id ? "rgba(153,69,255,0.08)" : C.surface2, border:`1px solid ${selected?.id===b.id ? C.purple : "transparent"}`, borderRadius:12, padding:12, marginBottom:7, cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{b.name}</div>
                      <div style={{ fontSize:10, background:"rgba(153,69,255,0.12)", color:C.purple, padding:"1px 7px", borderRadius:100, fontFamily:"monospace", marginLeft:6, flexShrink:0 }}>{CAT_EMOJI[b.cat]} {CAT_LABEL[b.cat]}</div>
                    </div>
                    <div style={{ fontSize:11, color:C.textSub, marginBottom:7 }}>📍 {b.addr}</div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ Accepts SOL</span>
                      {b.rating && <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {b.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div style={{ flex:1, position:"relative", overflow:"hidden", marginBottom: isMobile ? BOTTOM_BAR_H : 0 }}>
            <LeafletMap ref={mapRef} businesses={businesses} selected={selected} filter={filter}
              onMarkerClick={b => selectBiz(b, isMobile)}
              userLocation={userLocation}
            />

            {/* Mobile locations badge */}
            {isMobile && (
              <div style={{ position:"absolute", top:10, right:10, zIndex:400, display:"flex", alignItems:"center", gap:5, background:"rgba(7,9,14,0.88)", backdropFilter:"blur(10px)", border:"1px solid rgba(20,241,149,0.25)", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.green, whiteSpace:"nowrap" }}>
                <div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite" }}/>
                {loading ? "Loading…" : `${filtered.length} locations`}
              </div>
            )}



            {/* Business popup */}
            {selected && (
              <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(14,20,32,0.97)", backdropFilter:"blur(16px)", border:`1px solid ${C.borderHi}`, borderRadius:14, padding:"11px 16px", minWidth:230, maxWidth:"80vw", zIndex:500, animation:"slideUp 0.2s ease" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>{selected.name}</div>
                    <div style={{ fontSize:11, color:C.purple, fontFamily:"monospace", marginBottom:4 }}>{CAT_EMOJI[selected.cat]} {CAT_LABEL[selected.cat]}</div>
                    <div style={{ fontSize:11, color:C.textSub }}>📍 {selected.addr}</div>
                    {selected.phone && <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>📞 {selected.phone}</div>}
                    {selected.website && <div style={{ fontSize:11, marginTop:2 }}><a href={selected.website} target="_blank" rel="noreferrer" style={{ color:C.green, textDecoration:"none" }}>🌐 Website ↗</a></div>}
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.textDim, cursor:"pointer", fontSize:20, marginLeft:12, lineHeight:1 }}>×</button>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:9, paddingTop:9, borderTop:"1px solid rgba(153,69,255,0.15)" }}>
                  <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ Accepts Solana Pay</span>
                  {selected.rating && <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {selected.rating}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Mobile bottom bar + drawer */}
          {isMobile && (
            <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:50, display:"flex", flexDirection:"column" }}>
              {drawerOpen && (
                <div style={{ background:"#07090E", borderTop:`1px solid ${C.border}`, maxHeight:"52vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
                  <div style={{ width:32, height:4, background:"rgba(255,255,255,0.12)", borderRadius:2, margin:"8px auto 0", flexShrink:0 }}/>
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
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inp, padding:"7px 12px 7px 28px", fontSize:12 }}/>
                    </div>
                  </div>
                  <div style={{ overflowY:"auto", padding:8, flex:1 }}>
                    {loading ? (
                      <div style={{ textAlign:"center", padding:20, color:C.textSub, fontSize:13 }}>Loading…</div>
                    ) : filtered.map(b => (
                      <div key={b.id} className="drawer-card" onClick={() => selectBiz(b, true)} style={{ display:"flex", alignItems:"center", gap:10, background: selected?.id===b.id ? "rgba(153,69,255,0.08)" : C.surface2, border:`1px solid ${selected?.id===b.id ? C.purple : "transparent"}`, borderRadius:12, padding:"10px 12px", marginBottom:6, cursor:"pointer", transition:"all 0.15s" }}>
                        <div style={{ width:38, height:38, flexShrink:0, background:"linear-gradient(135deg,rgba(153,69,255,0.15),rgba(20,241,149,0.08))", border:`1px solid ${C.border}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{CAT_EMOJI[b.cat]}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.name}</div>
                          <div style={{ fontSize:10, color:C.textSub, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>📍 {b.addr}</div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                          {b.rating && <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {b.rating}</span>}
                          <span style={{ fontSize:10, color:C.green, fontFamily:"monospace" }}>◎ SOL</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ height:BOTTOM_BAR_H, background:"#0E1420", borderTop:`1px solid ${C.border}`, padding:"0 12px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", alignItems:"center", flexShrink:0 }}>
                {CATEGORIES.map(c => (
                  <div key={c} onClick={() => setMobileFilter(c)} style={{ display:"flex", alignItems:"center", gap:5, background: filter===c ? "rgba(20,241,149,0.1)" : C.surface2, border:`1px solid ${filter===c ? C.green : C.border}`, color: filter===c ? C.green : C.textSub, padding:"7px 13px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s" }}>
                    {c==="all" ? "📍 All" : `${CAT_EMOJI[c]} ${CAT_LABEL[c]}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile location nudge — fixed above bottom bar, z-index above everything */}
      {isMobileDevice && !userLocation && (
        <button
          onClick={requestGPS}
          style={{ position:"fixed", bottom: BOTTOM_BAR_H + 16, left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", alignItems:"center", gap:8, background: gpsError ? "rgba(20,0,0,0.97)" : "rgba(7,9,14,0.95)", backdropFilter:"blur(16px)", border:`1px solid ${gpsError ? "rgba(255,80,80,0.6)" : "rgba(20,241,149,0.5)"}`, padding:"11px 20px", borderRadius:100, fontSize:13, fontFamily:"monospace", color: gpsError ? "#ff5050" : "#14F195", whiteSpace:"nowrap", cursor:"pointer", boxShadow:`0 4px 20px ${gpsError ? "rgba(255,80,80,0.2)" : "rgba(20,241,149,0.2)"}`, WebkitTapHighlightColor:"transparent" }}>
          {gpsError
            ? <><span style={{marginRight:4}}>⚠</span>Location blocked — check browser settings</>
            : <><div style={{ width:8, height:8, background:"#14F195", borderRadius:"50%", animation:"pulse 1.5s infinite" }}/>📍 Show my location</>
          }
        </button>
      )}

      {/* FAB */}
      <button onClick={() => setModal(true)} style={{ position:"fixed", bottom: isMobile ? BOTTOM_BAR_H + 16 : 20, right:16, zIndex:9998, width:52, height:52, background:"linear-gradient(135deg,#9945FF,#14F195)", border:"none", borderRadius:"50%", fontSize:26, color:"#fff", cursor:"pointer", boxShadow:"0 6px 24px rgba(153,69,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>

      {/* Submit modal */}
      {modalOpen && (
        <div onClick={e => e.target===e.currentTarget && setModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(10px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:420, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>Add a Business</div>
            <div style={{ fontSize:13, color:C.textSub, marginBottom:18 }}>Submissions are reviewed before appearing on the map.</div>

            {/* Required fields */}
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Business Name <span style={{ color:"#FF6B6B" }}>*</span></label>
              <input style={inp} placeholder="e.g. Blue Bottle Coffee" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Address <span style={{ color:"#FF6B6B" }}>*</span></label>
              <input style={inp} placeholder="123 Main St, New York, NY" value={form.addr} onChange={e => setForm(f => ({...f, addr:e.target.value}))}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Category</label>
              <select style={inp} value={form.cat} onChange={e => setForm(f => ({...f, cat:e.target.value}))}>
                <option value="atm">🏧 ATM / OTC</option>
                <option value="cafe">☕ Café</option>
                <option value="restaurant">🍽 Restaurant</option>
                <option value="shopping">🛍 Shopping</option>
                <option value="grocery">🛒 Grocery</option>
                <option value="beauty">💅 Beauty Salon</option>
                <option value="apparel">👕 Apparel</option>
                <option value="gas">⛽ Gas Station</option>
              </select>
            </div>

            {/* Optional fields */}
            <div style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.textDim, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10, fontFamily:"monospace" }}>Optional details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div>
                  <label style={lbl}>Latitude</label>
                  <input style={inp} placeholder="40.7128" value={form.lat} onChange={e => setForm(f => ({...f, lat:e.target.value}))}/>
                </div>
                <div>
                  <label style={lbl}>Longitude</label>
                  <input style={inp} placeholder="-74.0060" value={form.lng} onChange={e => setForm(f => ({...f, lng:e.target.value}))}/>
                </div>
              </div>
              <div style={{ fontSize:11, color:C.textDim, marginBottom:10 }}>💡 Tip: right-click on Google Maps → "What's here?" to get coordinates</div>
              <div style={{ marginBottom:10 }}>
                <label style={lbl}>Phone</label>
                <input style={inp} placeholder="+1 212 555 0100" value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={lbl}>Website</label>
                <input style={inp} placeholder="https://example.com" value={form.website} onChange={e => setForm(f => ({...f, website:e.target.value}))}/>
              </div>
              <div>
                <label style={lbl}>Solana Pay Address</label>
                <input style={inp} placeholder="Wallet or Pay address" value={form.wallet} onChange={e => setForm(f => ({...f, wallet:e.target.value}))}/>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, background:C.surface2, border:`1px solid ${C.border}`, color:C.textSub, padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={submitBiz} disabled={submitting} style={{ flex:2, background: submitting ? "rgba(153,69,255,0.3)" : "linear-gradient(135deg,#9945FF,#14F195)", border:"none", color:"#fff", padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:700, fontSize:14, cursor: submitting ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {submitting
                  ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Submitting…</>
                  : "◎ Submit Listing"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position:"fixed", bottom:BOTTOM_BAR_H + 8, right:16, background:C.surface, border:"1px solid rgba(20,241,149,0.3)", color:"#14F195", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"monospace", zIndex:9997, pointerEvents:"none", transform: toast.vis ? "translateY(0)" : "translateY(20px)", opacity: toast.vis ? 1 : 0, transition:"all 0.3s" }}>
        {toast.msg}
      </div>
    </>
  );
}
