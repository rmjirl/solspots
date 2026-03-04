import { useState, useEffect, useRef } from "react";

const BUSINESSES = [
  { id:  1, name:"Solana ATM - Midtown", cat:"atm", addr:"206 Broadway, Lower East Side, NYC", lat:40.7148, lng:-73.9901, rating:"4.9" },
  { id:  2, name:"SOL OTC Desk - FiDi", cat:"atm", addr:"114 5th Ave, SoHo, NYC", lat:40.7251, lng:-73.9973, rating:"4.4" },
  { id:  3, name:"Crypto ATM - Union Sq", cat:"atm", addr:"993 Madison Ave, Tribeca, NYC", lat:40.7146, lng:-74.0019, rating:"4.6" },
  { id:  4, name:"SOL ATM - Williamsburg", cat:"atm", addr:"985 Lexington Ave, West Village, NYC", lat:40.7297, lng:-74.0036, rating:"4.8" },
  { id:  5, name:"OTC Exchange - Astoria", cat:"atm", addr:"388 Park Ave, Chelsea, NYC", lat:40.7517, lng:-73.998, rating:"4.4" },
  { id:  6, name:"Solana Kiosk - Harlem", cat:"atm", addr:"299 Amsterdam Ave, Flatiron, NYC", lat:40.7362, lng:-73.9937, rating:"4.8" },
  { id:  7, name:"SOL ATM - Park Slope", cat:"atm", addr:"550 Columbus Ave, Gramercy, NYC", lat:40.7406, lng:-73.9754, rating:"4.5" },
  { id:  8, name:"Crypto OTC - LES", cat:"atm", addr:"455 Atlantic Ave, Midtown, NYC", lat:40.7586, lng:-73.9852, rating:"4.7" },
  { id:  9, name:"SOL ATM - Bushwick", cat:"atm", addr:"939 Bedford Ave, Hell's Kitchen, NYC", lat:40.7621, lng:-73.9862, rating:"4.2" },
  { id: 10, name:"OTC Desk - Long Island City", cat:"atm", addr:"275 Fulton St, Upper West Side, NYC", lat:40.7864, lng:-73.9776, rating:"5.0" },
  { id: 11, name:"Solana ATM - Chelsea", cat:"atm", addr:"437 Canal St, Upper East Side, NYC", lat:40.7796, lng:-73.9629, rating:"4.3" },
  { id: 12, name:"SOL Kiosk - DUMBO", cat:"atm", addr:"500 Houston St, Harlem, NYC", lat:40.8131, lng:-73.9465, rating:"4.8" },
  { id: 13, name:"Crypto ATM - Flushing", cat:"atm", addr:"111 Grand St, Washington Heights, NYC", lat:40.8436, lng:-73.9369, rating:"4.9" },
  { id: 14, name:"Cosmic Grounds", cat:"cafe", addr:"968 Delancey St, Financial District, NYC", lat:40.71, lng:-74.0141, rating:"4.9" },
  { id: 15, name:"Stake & Sip", cat:"cafe", addr:"326 Myrtle Ave, Chinatown, NYC", lat:40.7102, lng:-74.0029, rating:"4.4" },
  { id: 16, name:"Block Roast", cat:"cafe", addr:"360 Flatbush Ave, Williamsburg, NYC", lat:40.7083, lng:-73.9587, rating:"4.6" },
  { id: 17, name:"Node Brew", cat:"cafe", addr:"384 Kings Hwy, DUMBO, NYC", lat:40.7068, lng:-73.9878, rating:"4.3" },
  { id: 18, name:"Ledger Latte", cat:"cafe", addr:"906 Nostrand Ave, Park Slope, NYC", lat:40.6708, lng:-73.9804, rating:"4.9" },
  { id: 19, name:"Validator Cafe", cat:"cafe", addr:"739 Jamaica Ave, Bushwick, NYC", lat:40.6952, lng:-73.9253, rating:"4.1" },
  { id: 20, name:"Hash Rate Coffee", cat:"cafe", addr:"115 Northern Blvd, Crown Heights, NYC", lat:40.6731, lng:-73.9413, rating:"4.3" },
  { id: 21, name:"Lamport's Cafe", cat:"cafe", addr:"373 Steinway St, Greenpoint, NYC", lat:40.7269, lng:-73.9564, rating:"4.3" },
  { id: 22, name:"Epoch Espresso", cat:"cafe", addr:"422 31st Ave, Red Hook, NYC", lat:40.6796, lng:-73.9996, rating:"4.4" },
  { id: 23, name:"Finality Roasters", cat:"cafe", addr:"403 Broadway, Bed-Stuy, NYC", lat:40.6869, lng:-73.9356, rating:"4.8" },
  { id: 24, name:"Gossip Protocol Coffee", cat:"cafe", addr:"448 5th Ave, Astoria, NYC", lat:40.7784, lng:-73.9253, rating:"4.7" },
  { id: 25, name:"Devnet Coffee", cat:"cafe", addr:"90 Madison Ave, Long Island City, NYC", lat:40.7433, lng:-73.9518, rating:"4.5" },
  { id: 26, name:"Proof of Brew", cat:"cafe", addr:"428 Lexington Ave, South Bronx, NYC", lat:40.8056, lng:-73.9254, rating:"4.6" },
  { id: 27, name:"Block Ramen", cat:"restaurant", addr:"61 Park Ave, Lower East Side, NYC", lat:40.7174, lng:-73.9839, rating:"4.7" },
  { id: 28, name:"The Hash House", cat:"restaurant", addr:"57 Amsterdam Ave, SoHo, NYC", lat:40.7212, lng:-74.0059, rating:"4.9" },
  { id: 29, name:"Staked Tacos", cat:"restaurant", addr:"646 Columbus Ave, Tribeca, NYC", lat:40.7174, lng:-74.0084, rating:"4.4" },
  { id: 30, name:"Node Noodles", cat:"restaurant", addr:"21 Atlantic Ave, West Village, NYC", lat:40.729, lng:-74.0058, rating:"4.6" },
  { id: 31, name:"Ledger Bites", cat:"restaurant", addr:"681 Bedford Ave, Chelsea, NYC", lat:40.7463, lng:-73.9958, rating:"4.9" },
  { id: 32, name:"Keypair Kitchen", cat:"restaurant", addr:"363 Fulton St, Flatiron, NYC", lat:40.7396, lng:-73.9873, rating:"4.5" },
  { id: 33, name:"Proof of Pho", cat:"restaurant", addr:"465 Canal St, Gramercy, NYC", lat:40.7387, lng:-73.9805, rating:"4.8" },
  { id: 34, name:"Fork & Chain", cat:"restaurant", addr:"249 Houston St, Midtown, NYC", lat:40.7591, lng:-73.9816, rating:"4.8" },
  { id: 35, name:"Pixel Pizza", cat:"restaurant", addr:"567 Grand St, Hell's Kitchen, NYC", lat:40.7657, lng:-73.9875, rating:"4.8" },
  { id: 36, name:"Consensus Burgers", cat:"restaurant", addr:"985 Delancey St, Upper West Side, NYC", lat:40.7914, lng:-73.9716, rating:"4.5" },
  { id: 37, name:"Cosmic Curry", cat:"restaurant", addr:"898 Myrtle Ave, Upper East Side, NYC", lat:40.7731, lng:-73.9572, rating:"4.6" },
  { id: 38, name:"Burnt Epoch BBQ", cat:"restaurant", addr:"401 Flatbush Ave, Harlem, NYC", lat:40.8105, lng:-73.9479, rating:"4.6" },
  { id: 39, name:"Shard Shawarma", cat:"restaurant", addr:"621 Kings Hwy, Washington Heights, NYC", lat:40.8498, lng:-73.9379, rating:"4.5" },
  { id: 40, name:"Chain Mall", cat:"shopping", addr:"470 Nostrand Ave, Financial District, NYC", lat:40.706, lng:-74.0171, rating:"4.4" },
  { id: 41, name:"Block Bazaar", cat:"shopping", addr:"199 Jamaica Ave, Chinatown, NYC", lat:40.7088, lng:-73.9938, rating:"5.0" },
  { id: 42, name:"Validator Market", cat:"shopping", addr:"907 Northern Blvd, Williamsburg, NYC", lat:40.7136, lng:-73.9635, rating:"4.5" },
  { id: 43, name:"Node Goods", cat:"shopping", addr:"502 Steinway St, DUMBO, NYC", lat:40.7028, lng:-73.9867, rating:"4.8" },
  { id: 44, name:"Epoch Emporium", cat:"shopping", addr:"503 31st Ave, Park Slope, NYC", lat:40.6672, lng:-73.9815, rating:"4.8" },
  { id: 45, name:"Shard Shop", cat:"shopping", addr:"462 Broadway, Bushwick, NYC", lat:40.698, lng:-73.9211, rating:"4.5" },
  { id: 46, name:"Fork & Find", cat:"shopping", addr:"776 5th Ave, Crown Heights, NYC", lat:40.6757, lng:-73.9467, rating:"4.9" },
  { id: 47, name:"Ledger Mart", cat:"shopping", addr:"593 Madison Ave, Greenpoint, NYC", lat:40.7256, lng:-73.9484, rating:"4.2" },
  { id: 48, name:"Mint Market", cat:"shopping", addr:"370 Lexington Ave, Red Hook, NYC", lat:40.6799, lng:-74.0124, rating:"4.5" },
  { id: 49, name:"Proof of Purchase", cat:"shopping", addr:"27 Park Ave, Bed-Stuy, NYC", lat:40.6873, lng:-73.9474, rating:"4.1" },
  { id: 50, name:"Genesis Goods", cat:"shopping", addr:"780 Amsterdam Ave, Astoria, NYC", lat:40.7718, lng:-73.9234, rating:"4.2" },
  { id: 51, name:"Devnet Depot", cat:"shopping", addr:"3 Columbus Ave, Long Island City, NYC", lat:40.7413, lng:-73.9518, rating:"4.9" },
  { id: 52, name:"Solana Fresh Market", cat:"grocery", addr:"736 Atlantic Ave, South Bronx, NYC", lat:40.8081, lng:-73.9138, rating:"4.5" },
  { id: 53, name:"Block & Barrel Grocery", cat:"grocery", addr:"145 Bedford Ave, Lower East Side, NYC", lat:40.7153, lng:-73.989, rating:"4.4" },
  { id: 54, name:"Node Natural Foods", cat:"grocery", addr:"322 Fulton St, SoHo, NYC", lat:40.7219, lng:-74.0038, rating:"4.9" },
  { id: 55, name:"Validator Vittles", cat:"grocery", addr:"674 Canal St, Tribeca, NYC", lat:40.7213, lng:-74.0137, rating:"4.4" },
  { id: 56, name:"Chain Grocery Co", cat:"grocery", addr:"658 Houston St, West Village, NYC", lat:40.7286, lng:-74.0116, rating:"4.4" },
  { id: 57, name:"Hash Harvest Market", cat:"grocery", addr:"887 Grand St, Chelsea, NYC", lat:40.7491, lng:-74.0079, rating:"4.6" },
  { id: 58, name:"Epoch Eats Market", cat:"grocery", addr:"301 Delancey St, Flatiron, NYC", lat:40.7383, lng:-73.9851, rating:"4.9" },
  { id: 59, name:"Proof Provisions", cat:"grocery", addr:"785 Myrtle Ave, Gramercy, NYC", lat:40.7392, lng:-73.983, rating:"4.8" },
  { id: 60, name:"Ledger Larder", cat:"grocery", addr:"850 Flatbush Ave, Midtown, NYC", lat:40.7578, lng:-73.9816, rating:"4.9" },
  { id: 61, name:"Mint Grocery", cat:"grocery", addr:"919 Kings Hwy, Hell's Kitchen, NYC", lat:40.7695, lng:-73.998, rating:"4.0" },
  { id: 62, name:"Fork & Fork Market", cat:"grocery", addr:"485 Nostrand Ave, Upper West Side, NYC", lat:40.7847, lng:-73.9727, rating:"5.0" },
  { id: 63, name:"Shard Supermarket", cat:"grocery", addr:"293 Jamaica Ave, Upper East Side, NYC", lat:40.7775, lng:-73.9626, rating:"4.4" },
  { id: 64, name:"Genesis Greens", cat:"grocery", addr:"272 Northern Blvd, Harlem, NYC", lat:40.8172, lng:-73.9495, rating:"4.3" },
  { id: 65, name:"Hash Cuts", cat:"beauty", addr:"334 Steinway St, Washington Heights, NYC", lat:40.838, lng:-73.9324, rating:"4.4" },
  { id: 66, name:"Keypair Barbers", cat:"beauty", addr:"236 31st Ave, Financial District, NYC", lat:40.711, lng:-74.0114, rating:"4.4" },
  { id: 67, name:"Node Nails", cat:"beauty", addr:"34 Broadway, Chinatown, NYC", lat:40.7151, lng:-74.0028, rating:"4.7" },
  { id: 68, name:"Stake & Style Salon", cat:"beauty", addr:"349 5th Ave, Williamsburg, NYC", lat:40.7144, lng:-73.9547, rating:"4.3" },
  { id: 69, name:"Validator Vibe Spa", cat:"beauty", addr:"485 Madison Ave, DUMBO, NYC", lat:40.6988, lng:-73.9913, rating:"4.8" },
  { id: 70, name:"Block Beauty Bar", cat:"beauty", addr:"307 Lexington Ave, Park Slope, NYC", lat:40.6707, lng:-73.9834, rating:"4.4" },
  { id: 71, name:"Ledger Looks Salon", cat:"beauty", addr:"722 Park Ave, Bushwick, NYC", lat:40.697, lng:-73.9272, rating:"4.8" },
  { id: 72, name:"Shard Spa", cat:"beauty", addr:"668 Amsterdam Ave, Crown Heights, NYC", lat:40.6754, lng:-73.9414, rating:"4.3" },
  { id: 73, name:"Proof Polish", cat:"beauty", addr:"875 Columbus Ave, Greenpoint, NYC", lat:40.7192, lng:-73.9557, rating:"4.6" },
  { id: 74, name:"Epoch Beauty", cat:"beauty", addr:"326 Atlantic Ave, Red Hook, NYC", lat:40.6707, lng:-74.0071, rating:"4.9" },
  { id: 75, name:"Chain Glow Studio", cat:"beauty", addr:"44 Bedford Ave, Bed-Stuy, NYC", lat:40.6851, lng:-73.9385, rating:"4.2" },
  { id: 76, name:"Mint Beauty Lounge", cat:"beauty", addr:"597 Fulton St, Astoria, NYC", lat:40.7722, lng:-73.9298, rating:"4.8" },
  { id: 77, name:"Chain Threads", cat:"apparel", addr:"778 Canal St, Long Island City, NYC", lat:40.7445, lng:-73.9429, rating:"4.7" },
  { id: 78, name:"Validator Vintage", cat:"apparel", addr:"502 Houston St, South Bronx, NYC", lat:40.8113, lng:-73.918, rating:"4.6" },
  { id: 79, name:"Block Merch", cat:"apparel", addr:"327 Grand St, Lower East Side, NYC", lat:40.7175, lng:-73.992, rating:"4.7" },
  { id: 80, name:"Node Fits", cat:"apparel", addr:"332 Delancey St, SoHo, NYC", lat:40.7176, lng:-73.9989, rating:"4.3" },
  { id: 81, name:"Proof Apparel", cat:"apparel", addr:"302 Myrtle Ave, Tribeca, NYC", lat:40.7108, lng:-74.005, rating:"4.4" },
  { id: 82, name:"Epoch Outfitters", cat:"apparel", addr:"943 Flatbush Ave, West Village, NYC", lat:40.7288, lng:-74.0062, rating:"4.8" },
  { id: 83, name:"Ledger Looks Boutique", cat:"apparel", addr:"889 Kings Hwy, Chelsea, NYC", lat:40.7426, lng:-73.9988, rating:"4.4" },
  { id: 84, name:"Fork Fashion", cat:"apparel", addr:"317 Nostrand Ave, Flatiron, NYC", lat:40.7412, lng:-73.9966, rating:"4.6" },
  { id: 85, name:"Mint Apparel", cat:"apparel", addr:"924 Jamaica Ave, Gramercy, NYC", lat:40.7323, lng:-73.9773, rating:"4.6" },
  { id: 86, name:"Shard Streetwear", cat:"apparel", addr:"661 Northern Blvd, Midtown, NYC", lat:40.7582, lng:-73.989, rating:"4.1" },
  { id: 87, name:"Genesis Garments", cat:"apparel", addr:"246 Steinway St, Hell's Kitchen, NYC", lat:40.7606, lng:-73.9914, rating:"4.4" },
  { id: 88, name:"Devnet Drip", cat:"apparel", addr:"896 31st Ave, Upper West Side, NYC", lat:40.7859, lng:-73.9785, rating:"4.3" },
  { id: 89, name:"Solana Gas & Go", cat:"gas", addr:"669 Broadway, Upper East Side, NYC", lat:40.7673, lng:-73.9605, rating:"4.3" },
  { id: 90, name:"Block Fill Station", cat:"gas", addr:"266 5th Ave, Harlem, NYC", lat:40.8059, lng:-73.9466, rating:"4.3" },
  { id: 91, name:"Node Fuel Stop", cat:"gas", addr:"690 Madison Ave, Washington Heights, NYC", lat:40.8506, lng:-73.9411, rating:"4.9" },
  { id: 92, name:"Chain Gas Mart", cat:"gas", addr:"469 Lexington Ave, Financial District, NYC", lat:40.7035, lng:-74.0045, rating:"4.7" },
  { id: 93, name:"Validator Petro", cat:"gas", addr:"890 Park Ave, Chinatown, NYC", lat:40.7221, lng:-73.9901, rating:"4.7" },
  { id: 94, name:"Hash Rate Gas", cat:"gas", addr:"819 Amsterdam Ave, Williamsburg, NYC", lat:40.7086, lng:-73.9566, rating:"4.4" },
  { id: 95, name:"Epoch Energy Stop", cat:"gas", addr:"989 Columbus Ave, DUMBO, NYC", lat:40.6994, lng:-73.9881, rating:"4.2" },
  { id: 96, name:"Proof of Gas", cat:"gas", addr:"316 Atlantic Ave, Park Slope, NYC", lat:40.6671, lng:-73.9754, rating:"4.2" },
  { id: 97, name:"Ledger Fuel", cat:"gas", addr:"126 Bedford Ave, Bushwick, NYC", lat:40.693, lng:-73.9163, rating:"4.8" },
  { id: 98, name:"Mint Gas Station", cat:"gas", addr:"616 Fulton St, Crown Heights, NYC", lat:40.6641, lng:-73.9428, rating:"4.3" },
  { id: 99, name:"Fork Fuels", cat:"gas", addr:"975 Canal St, Greenpoint, NYC", lat:40.7223, lng:-73.9508, rating:"4.9" },
  { id:100, name:"Consensus Gas Co", cat:"gas", addr:"743 Houston St, Red Hook, NYC", lat:40.6806, lng:-74.0043, rating:"4.5" },
];

const PETER_COOPER = { lat: 40.7318, lng: -73.9775 };

const CAT_EMOJI  = { atm:"🏧", cafe:"☕", restaurant:"🍽", shopping:"🛍", grocery:"🛒", beauty:"💅", apparel:"👕", gas:"⛽" };
const CAT_LABEL  = { all:"All Spots", atm:"ATM / OTC", cafe:"Cafés", restaurant:"Restaurants", shopping:"Shopping", grocery:"Groceries", beauty:"Beauty Salons", apparel:"Apparel", gas:"Gas" };
const CATEGORIES = ["all","atm","cafe","restaurant","shopping","grocery","beauty","apparel","gas"];

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

function LeafletMap({ businesses, selected, onMarkerClick, filter, onPeterCooperClick }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const pcMarkerRef = useRef(null);
  const [ready, setReady] = useState(!!window.L);

  useLeaflet(() => setReady(true));

  useEffect(() => {
    if (!ready || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([40.728, -73.9855], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd"
    }).addTo(map);
    leafletMap.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 600);
  }, [ready]);

  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;
    if (pcMarkerRef.current) pcMarkerRef.current.remove();
    const icon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(20,241,149,0.25);animation:pcPulse 1.8s ease-out infinite;"></div>
          <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(20,241,149,0.35);animation:pcPulse 1.8s ease-out infinite 0.3s;"></div>
          <div style="position:relative;width:18px;height:18px;background:#14F195;border:2px solid #fff;border-radius:50%;box-shadow:0 0 12px #14F195;cursor:pointer;z-index:2;"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    pcMarkerRef.current = L.marker([PETER_COOPER.lat, PETER_COOPER.lng], { icon, zIndexOffset: 1000 })
      .addTo(map)
      .on("click", onPeterCooperClick);
  }, [ready, onPeterCooperClick]);

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
      const size = isSel ? 40 : 32;
      const fontSize = isSel ? 16 : 13;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;background:${bgColor};border:2px solid ${borderColor};border-radius:50%;box-shadow:0 0 ${isSel?18:8}px ${isSel?"#14F195":"#9945FF"};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;cursor:pointer;">${emoji}</div>`,
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
    <>
      <style>{`
        @keyframes pcPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      <div ref={mapRef} style={{ width:"100%", height:"100%", background:"#0D1117" }}>
        {!ready && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.25)", fontSize:13, fontFamily:"monospace", background:"#0D1117" }}>
            Loading map...
          </div>
        )}
      </div>
    </>
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
  const [form, setForm]         = useState({ name:"", addr:"", cat:"cafe", wallet:"" });
  const [pcPopup, setPcPopup]   = useState(false);

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
    setPcPopup(false);
    if (closeDrawer) setTimeout(() => setDrawer(false), 200);
  };

  const setMobileFilter = (f) => {
    if (filter === f && drawerOpen) { setDrawer(false); return; }
    setFilter(f); setDrawer(true);
  };

  const submitBiz = () => {
    if (!form.name || !form.addr) { showToast("⚠ Fill in name and address"); return; }
    const nb = { id:Date.now(), name:form.name, cat:form.cat, addr:form.addr, lat:40.728+(Math.random()-0.5)*0.05, lng:-73.9855+(Math.random()-0.5)*0.05, rating:(4+Math.random()).toFixed(1) };
    setBiz(prev => [...prev, nb]);
    setModal(false);
    setForm({ name:"", addr:"", cat:"cafe", wallet:"" });
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
  const BOTTOM_BAR_H = 68;

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
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:52, background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0, zIndex:10, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, fontSize:18, letterSpacing:-0.5, flexShrink:0 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#9945FF,#14F195)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>◎</div>
          SOL <span style={{ color:C.green }}>Spots</span>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {!isMobile && (
            <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(20,241,149,0.07)", border:"1px solid rgba(20,241,149,0.2)", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.green, whiteSpace:"nowrap" }}>
              <div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite" }}/>
              {filtered.length} locations
            </div>
          )}
          <button onClick={() => { setWallet(w => w ? null : "7xKp…3mWq"); showToast(wallet ? "Disconnected" : "✓ Connected (demo)"); }} style={{ display:"flex", alignItems:"center", gap:5, background: wallet ? "rgba(20,241,149,0.08)" : "rgba(153,69,255,0.1)", border:`1px solid ${wallet ? "rgba(20,241,149,0.35)" : C.borderHi}`, color: wallet ? C.green : "#C084FC", padding:"5px 10px", borderRadius:8, fontFamily:"monospace", fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
            ◈ {wallet ? wallet : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

        {/* Desktop sidebar */}
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
                    {c==="all" ? "All" : `${CAT_EMOJI[c]} ${CAT_LABEL[c]}`}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8 }}>
              {filtered.map(b => (
                <div key={b.id} className="biz-card" style={cardStyle(selected?.id===b.id)} onClick={() => selectBiz(b)}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{b.name}</div>
                    <div style={{ fontSize:10, background:"rgba(153,69,255,0.12)", color:C.purple, padding:"1px 7px", borderRadius:100, fontFamily:"monospace", marginLeft:6, flexShrink:0 }}>{CAT_EMOJI[b.cat]} {CAT_LABEL[b.cat]}</div>
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

        {/* Map */}
        <div style={{ flex:1, position:"relative", overflow:"hidden", marginBottom: isMobile ? BOTTOM_BAR_H : 0 }}>
          <LeafletMap
            businesses={businesses}
            selected={selected}
            filter={filter}
            onMarkerClick={b => selectBiz(b, isMobile)}
            onPeterCooperClick={() => { setSelected(null); setPcPopup(p => !p); }}
          />

          {/* Mobile locations badge */}
          {isMobile && (
            <div style={{ position:"absolute", top:10, right:10, zIndex:400, display:"flex", alignItems:"center", gap:5, background:"rgba(7,9,14,0.88)", backdropFilter:"blur(10px)", border:"1px solid rgba(20,241,149,0.25)", padding:"5px 10px", borderRadius:8, fontSize:12, fontFamily:"monospace", color:C.green, whiteSpace:"nowrap" }}>
              <div style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite" }}/>
              {filtered.length} locations
            </div>
          )}

          {/* Peter Cooper popup */}
          {pcPopup && (
            <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(14,20,32,0.97)", backdropFilter:"blur(16px)", border:"1px solid rgba(20,241,149,0.45)", borderRadius:14, padding:"11px 16px", minWidth:230, maxWidth:"80vw", zIndex:500, animation:"slideUp 0.2s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:2 }}>2 Peter Cooper Village</div>
                  <div style={{ fontSize:11, color:C.green, fontFamily:"monospace", marginBottom:4 }}>📍 Peter Cooper Village, Manhattan</div>
                  <div style={{ fontSize:11, color:C.textSub }}>HQ · New York, NY 10010</div>
                </div>
                <button onClick={() => setPcPopup(false)} style={{ background:"none", border:"none", color:C.textDim, cursor:"pointer", fontSize:20, marginLeft:12, lineHeight:1 }}>×</button>
              </div>
              <div style={{ marginTop:9, paddingTop:9, borderTop:"1px solid rgba(20,241,149,0.2)" }}>
                <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ SOL Spots Headquarters</span>
              </div>
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
                </div>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.textDim, cursor:"pointer", fontSize:20, marginLeft:12, lineHeight:1 }}>×</button>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:9, paddingTop:9, borderTop:"1px solid rgba(153,69,255,0.15)" }}>
                <span style={{ fontSize:11, color:C.green, fontFamily:"monospace" }}>◎ Accepts Solana Pay</span>
                <span style={{ fontSize:11, color:C.gold, fontFamily:"monospace" }}>★ {selected.rating}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom drawer + pills */}
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
            )}
            <div style={{ height:BOTTOM_BAR_H, background:"#0E1420", borderTop:`1px solid ${C.border}`, padding:"0 12px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", alignItems:"center", flexShrink:0 }}>
              {CATEGORIES.map(c => (
                <div key={c} style={{ display:"flex", alignItems:"center", gap:5, background: filter===c ? "rgba(20,241,149,0.1)" : C.surface2, border:`1px solid ${filter===c ? C.green : C.border}`, color: filter===c ? C.green : C.textSub, padding:"7px 13px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s" }} onClick={() => setMobileFilter(c)}>
                  {c==="all" ? "📍 All" : `${CAT_EMOJI[c]} ${CAT_LABEL[c]}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB — fixed at root level, always on top */}
      <button
        onClick={() => setModal(true)}
        style={{ position:"fixed", bottom: isMobile ? BOTTOM_BAR_H + 16 : 20, right:16, zIndex:150, width:52, height:52, background:"linear-gradient(135deg,#9945FF,#14F195)", border:"none", borderRadius:"50%", fontSize:26, color:"#fff", cursor:"pointer", boxShadow:"0 6px 24px rgba(153,69,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}
      >+</button>

      {/* Add Business Modal */}
      {modalOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:400, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>Add a Business</div>
            <div style={{ fontSize:13, color:C.textSub, marginBottom:18 }}>List a business that accepts Solana payments</div>
            {[["name","Business Name","e.g. Blue Bottle Coffee"],["addr","Address","123 Main St, NYC"],["wallet","Solana Pay Address","Your SOL wallet address"]].map(([k,lbl,ph]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <label style={labelStyle}>{lbl}</label>
                <input style={inputStyle} placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.cat} onChange={e => setForm(f => ({...f,cat:e.target.value}))}>
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
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, background:C.surface2, border:`1px solid ${C.border}`, color:C.textSub, padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={submitBiz} style={{ flex:2, background:"linear-gradient(135deg,#9945FF,#14F195)", border:"none", color:"#fff", padding:10, borderRadius:10, fontFamily:"inherit", fontWeight:700, fontSize:14, cursor:"pointer" }}>◎ Submit Listing</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position:"fixed", bottom:80, right:16, background:C.surface, border:"1px solid rgba(20,241,149,0.3)", color:C.green, padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"monospace", zIndex:300, pointerEvents:"none", transform: toast.vis ? "translateY(0)" : "translateY(20px)", opacity: toast.vis ? 1 : 0, transition:"all 0.3s" }}>
        {toast.msg}
      </div>
    </div>
  );
}
