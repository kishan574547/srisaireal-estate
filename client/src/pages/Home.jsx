import { useState, useEffect } from 'react';
import { getProperties } from '../services/api';
import { useNavigate } from "react-router-dom";
/* ── helpers ────────────────────────────────────────────────── */
function formatPrice(p) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p / 100000).toFixed(2)} L`;
  return `₹${p?.toLocaleString('en-IN')}`;
}

/* ── Property Card ──────────────────────────────────────────── */
function PropertyCard({ p }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  return (
    <div style={C.card}>
      <div style={C.imgBox}>
        {p.images?.length > 0
          ? <img src={p.images[idx]?.url} alt={p.title} style={C.img} />
          : <div style={C.imgPH}>🏠</div>}
        {p.images?.length > 1 && (
          <div style={C.dots}>
            {p.images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ ...C.dot, ...(i === idx ? C.dotOn : {}) }} />
            ))}
          </div>
        )}
        <div style={C.badges}>
          <span style={{ ...C.badge,
            background: p.status === 'For Rent' ? 'rgba(46,204,113,.9)'
              : p.status === 'Sold' ? 'rgba(231,76,60,.9)' : 'rgba(201,168,76,.9)' }}>
            {p.status}
          </span>
          {p.featured && <span style={C.feat}>⭐ Featured</span>}
        </div>
      </div>
      <div style={C.body}>
        <div style={C.typeRow}>
          <span style={C.type}>{p.propertyType}</span>
          <span style={C.cityTag}>📍 {p.city}</span>
        </div>
        <h3 style={C.title}>{p.title}</h3>
        <p style={C.loc}>{p.location}</p>
        <div style={C.priceRow}>
          <span style={C.price}>{formatPrice(p.price)}</span>
          <span style={C.area}>{p.area?.toLocaleString()} sq.ft</span>
        </div>
        <div style={C.chips}>
          {p.bedrooms  > 0 && <span style={C.chip}>🛏 {p.bedrooms} Bed</span>}
          {p.bathrooms > 0 && <span style={C.chip}>🚿 {p.bathrooms} Bath</span>}
          {p.amenities?.slice(0,2).map(a => <span key={a} style={C.chip}>{a}</span>)}
        </div>
<button
  style={C.enqBtn}
  onClick={() => navigate(`/property/${p._id}`)}
>
  Enquire Now →
</button>      </div>
    </div>
  );
}

const C = {
  card:   { background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,.08)', border:'1px solid rgba(0,0,0,.05)' },
  imgBox: { position:'relative', height:220, overflow:'hidden' },
  img:    { width:'100%', height:'100%', objectFit:'cover' },
  imgPH:  { width:'100%', height:'100%', background:'#F0EDE8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64 },
  dots:   { position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 },
  dot:    { width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,.5)', border:'none', cursor:'pointer', padding:0 },
  dotOn:  { background:'#fff', transform:'scale(1.3)' },
  badges: { position:'absolute', top:14, left:14, right:14, display:'flex', justifyContent:'space-between' },
  badge:  { padding:'5px 12px', borderRadius:100, fontSize:11, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', color:'#fff' },
  feat:   { background:'rgba(13,27,42,.8)', color:'#E8C97A', padding:'5px 12px', borderRadius:100, fontSize:11, fontWeight:700 },
  body:   { padding:'20px' },
  typeRow:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  type:   { fontSize:11, fontWeight:700, color:'#C9A84C', textTransform:'uppercase', letterSpacing:.5 },
  cityTag:{ fontSize:12, color:'#718096' },
  title:  { fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#0D1B2A', marginBottom:4, lineHeight:1.3 },
  loc:    { fontSize:13, color:'#718096', marginBottom:12 },
  priceRow:{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 },
  price:  { fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#0D1B2A' },
  area:   { fontSize:13, color:'#718096' },
  chips:  { display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 },
  chip:   { background:'#F0EDE8', padding:'4px 10px', borderRadius:6, fontSize:12, color:'#4A5568', fontWeight:500 },
  enqBtn: { width:'100%', padding:11, borderRadius:10, border:'2px solid #C9A84C', background:'transparent', color:'#A07830', fontSize:14, fontWeight:700, cursor:'pointer' },
};

/* ── Main Page ──────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,     setFilter]     = useState({ type:'', status:'' });
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filter.type)   params.type   = filter.type;
        if (filter.status) params.status = filter.status;
        const res = await getProperties(params);
        setProperties(res.data.properties || []);
      } catch { setProperties([]); }
      finally  { setLoading(false); }
    };
    fetchData();
  }, [filter]);

  const featured = properties.filter(p => p.featured);
  const stats = [
    { num:`${properties.length}+`, label:'Properties Listed' },
    { num:'500+', label:'Happy Clients' },
    { num:'15+',  label:'Years Experience' },
    { num:'10+',  label:'Cities Covered' },
  ];

  return (
    <div style={H.page}>

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav style={{ ...H.nav, ...(scrolled ? H.navOn : {}) }}>
        <div style={H.navW}>
          <div style={H.navCenter}>
            <a href="/" style={H.logoLink}>
              <span style={H.logoEmoji}>🏛️</span>
              <div>
                <div style={H.logoName}>Sri Sai Real Estate</div>
                <div style={H.logoSub}>Premium Properties · Andhra Pradesh</div>
              </div>
            </a>
          </div>
          <div style={H.navRight}>
            <a href="#properties" style={H.nl}>Properties</a>
            <a href="#about"      style={H.nl}>About</a>
            <a href="#contact"    style={H.nl}>Contact</a>
            <a href="/login"      style={H.adminBtn}>Admin ↗</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={H.hero}>
        <div style={H.heroGlow} />
        <div style={H.heroC}>
          <div style={H.pill}>Andhra Pradesh's Trusted Real Estate</div>
          <h1 style={H.heroH}>
            Find Your Dream<br />
            <em style={{ color:'#C9A84C', fontStyle:'normal' }}>Property</em> Today
          </h1>
          <p style={H.heroP}>
            Premium apartments, villas, plots &amp; commercial spaces across Andhra Pradesh
          </p>
          <div style={H.statsRow}>
            {stats.map(s => (
              <div key={s.label} style={H.stat}>
                <div style={H.statN}>{s.num}</div>
                <div style={H.statL}>{s.label}</div>
              </div>
            ))}
          </div>
          <a href="#properties" style={H.heroBtn}>Browse Properties ↓</a>
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={H.sec}>
          <div style={H.wrap}>
            <div style={H.secHead}>
              <span style={H.tag}>⭐ Handpicked</span>
              <h2 style={H.secTitle}>Featured Properties</h2>
              <p style={H.secSub}>Our most sought-after listings curated just for you</p>
            </div>
            <div style={H.grid3}>
              {featured.slice(0,3).map(p => <PropertyCard key={p._id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL PROPERTIES ───────────────────────────────────── */}
      <section style={{ ...H.sec, background:'#F8F4EE' }} id="properties">
        <div style={H.wrap}>
          <div style={H.secHead}>
            <span style={H.tag}>🏘️ Browse</span>
            <h2 style={H.secTitle}>All Properties</h2>
            <p style={H.secSub}>Explore our complete collection</p>
          </div>
          <div style={H.filterBar}>
            <select value={filter.type}
              onChange={e => setFilter({ ...filter, type: e.target.value })} style={H.sel}>
              <option value="">All Types</option>
              {['Apartment','Villa','Plot','House','Commercial','Penthouse'].map(t =>
                <option key={t}>{t}</option>)}
            </select>
            <select value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })} style={H.sel}>
              <option value="">All Status</option>
              {['For Sale','For Rent','Sold','Rented'].map(s => <option key={s}>{s}</option>)}
            </select>
            {(filter.type || filter.status) && (
              <button onClick={() => setFilter({ type:'', status:'' })} style={H.clearBtn}>
                ✕ Clear
              </button>
            )}
            <span style={{ marginLeft:'auto', fontSize:13, color:'#718096' }}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
          {loading
            ? <div className="spinner" />
            : properties.length === 0
              ? <div style={H.empty}>
                  <div style={{ fontSize:64 }}>🏗️</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", marginTop:16 }}>No properties yet</h3>
                  <p style={{ color:'#718096', marginTop:8 }}>Check back soon or adjust filters</p>
                </div>
              : <div style={H.grid}>
                  {properties.map(p => <PropertyCard key={p._id} p={p} />)}
                </div>
          }
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section style={{ ...H.sec, background:'#0D1B2A' }} id="about">
        <div style={H.wrap}>
          <div style={H.aboutGrid}>
            <div>
              <span style={H.tag}>About Us</span>
              <h2 style={{ ...H.secTitle, color:'#fff', textAlign:'left', marginTop:14 }}>
                Building Trust,<br />
                <span style={{ color:'#C9A84C' }}>Delivering Dreams</span>
              </h2>
              <p style={H.aboutP}>
                Sri Sai Real Estate has been serving Andhra Pradesh's real estate market with
                dedication and integrity. We specialise in residential and commercial properties,
                helping families find their perfect home and investors grow their portfolio.
              </p>
              <div style={H.feats}>
                {['✅ Verified Properties','✅ Expert Guidance','✅ Best Market Deals','✅ After-Sale Support'].map(f =>
                  <div key={f} style={H.feat}>{f}</div>)}
              </div>
            </div>
            <div style={H.aboutCards}>
              {[
                { icon:'🏆', t:'Award Winning',   d:'Recognised as top real estate agency in AP' },
                { icon:'🤝', t:'Trusted Partners', d:'500+ satisfied clients and counting' },
                { icon:'💎', t:'Premium Quality',  d:'Only verified, quality properties listed' },
                { icon:'📱', t:'Always Available', d:'24/7 support for all your queries' },
              ].map(x => (
                <div key={x.t} style={H.aboutCard}>
                  <span style={{ fontSize:26 }}>{x.icon}</span>
                  <div>
                    <h4 style={{ color:'#E8C97A', fontFamily:"'Playfair Display',serif", marginBottom:4 }}>{x.t}</h4>
                    <p style={{ color:'rgba(255,255,255,.6)', fontSize:13 }}>{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section style={H.sec} id="contact">
        <div style={H.wrap}>
          <div style={H.secHead}>
            <span style={H.tag}>📞 Contact</span>
            <h2 style={H.secTitle}>Get In Touch</h2>
            <p style={H.secSub}>We're here to help you find the perfect property</p>
          </div>

          {/* 3 quick-contact cards */}
          <div style={H.contactGrid}>
            {[
              { icon:'📞', label:'Call Us',  val:'+91 94411 32354',         sub:'Mon – Sat, 9AM – 7PM' },
              { icon:'✉️', label:'Email Us', val:'ntarunreddy80@gmail.com', sub:'We reply within 24 hours' },
              { icon:'📍', label:'Visit Us', val:'Nellore, Andhra Pradesh', sub:'AP – 524001' },
            ].map(c => (
              <div key={c.label} style={H.cCard}>
                <div style={{ fontSize:36, marginBottom:14 }}>{c.icon}</div>
                <h4 style={H.cLabel}>{c.label}</h4>
                <p style={H.cVal}>{c.val}</p>
                <p style={H.cSub}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Owner profile card */}
          <div style={H.ownerBox}>
            <div style={H.ownerLeft}>
              <div style={H.ownerBadge}>🏠 Property Owner</div>
              <div style={H.ownerAvatar}>T</div>
              <h3 style={H.ownerName}>N. Tarun Kumar Reddy</h3>
              <p style={H.ownerTagline}>Owner &amp; Director, Sri Sai Real Estate</p>
            </div>
            <div style={H.ownerRight}>
              <div style={H.ownerRow}>
                <span style={H.oIcon}>📞</span>
                <div>
                  <div style={H.oLabel}>Phone</div>
                  <a href="tel:9441132354" style={H.oVal}>+91 94411 32354</a>
                </div>
              </div>
              <div style={H.ownerRow}>
                <span style={H.oIcon}>✉️</span>
                <div>
                  <div style={H.oLabel}>Email</div>
                  <a href="mailto:ntarunreddy80@gmail.com" style={H.oVal}>ntarunreddy80@gmail.com</a>
                </div>
              </div>
              <div style={H.ownerRow}>
                <span style={H.oIcon}>🏢</span>
                <div>
                  <div style={H.oLabel}>Office</div>
                  <div style={H.oVal}>Nellore, Andhra Pradesh – 524001</div>
                </div>
              </div>
              <a href="tel:9441132354" style={H.callBtn}>📞 Call Now</a>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={H.footer}>
        <div style={H.wrap}>
          <div style={H.footerGrid}>

            {/* Col 1 – Brand */}
            <div>
              <div style={H.fBrand}>
                <span style={{ fontSize:34 }}>🏛️</span>
                <div>
                  <div style={H.fBrandName}>Sri Sai Real Estate</div>
                  <div style={H.fBrandSub}>Your Trusted Property Partner</div>
                </div>
              </div>
              <p style={H.fDesc}>
                Serving Andhra Pradesh with verified, premium real estate listings.
                Quality properties. Honest service. Your dream home awaits.
              </p>
              <div style={H.fLinks}>
                <a href="#properties" style={H.fLink}>Properties</a>
                <a href="#about"      style={H.fLink}>About</a>
                <a href="#contact"    style={H.fLink}>Contact</a>
                <a href="/login"      style={H.fLink}>Admin</a>
              </div>
            </div>

            {/* Col 2 – Owner quick info */}
            <div>
              <h4 style={H.fColTitle}>Owner Details</h4>
              <div style={H.ownerMini}>
                <div style={H.ownerMiniAvatar}>T</div>
                <div>
                  <div style={H.ownerMiniName}>N. Tarun Kumar Reddy</div>
                  <div style={H.ownerMiniRole}>Owner &amp; Director</div>
                </div>
              </div>
              {[
                { icon:'📞', text:'+91 94411 32354' },
                { icon:'✉️', text:'ntarunreddy80@gmail.com' },
                { icon:'📍', text:'Nellore, AP – 524001' },
                { icon:'🕐', text:'Mon – Sat: 9AM – 7PM' },
              ].map(r => (
                <div key={r.text} style={H.fRow}>
                  <span style={{ fontSize:14 }}>{r.icon}</span>
                  <span style={H.fRowText}>{r.text}</span>
                </div>
              ))}
            </div>

            {/* Col 3 – Developer */}
            <div>
              <h4 style={H.fColTitle}>Website Developer</h4>
              <div style={H.devCard}>
                <div style={H.devAvatar}>K</div>
                <div>
                  <div style={H.devName}>N. Kishan Reddy</div>
                  <div style={H.devRole}>Web Developer</div>
                </div>
              </div>
              <div style={H.fRow}>
                <span style={{ fontSize:14 }}>✉️</span>
                <a href="mailto:nelaballikishanreddy@gmail.com" style={{ ...H.fRowText, color:'rgba(201,168,76,.8)' }}>
                  nelaballikishanreddy@gmail.com
                </a>
              </div>
            </div>

          </div>

          <div style={H.footerDiv} />
          <div style={H.footerBot}>
            <span style={H.fCopy}>© 2024 Sri Sai Real Estate. All rights reserved.</span>
            <span style={H.fCopy}>Designed &amp; Developed by N. Kishan Reddy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const H = {
  page: { minHeight:'100vh', background:'#fff' },

  /* Navbar */
  nav:       { position:'fixed', top:0, left:0, right:0, zIndex:200, transition:'all .3s', padding:'14px 0' },
  navOn:     { background:'rgba(13,27,42,.97)', backdropFilter:'blur(12px)', boxShadow:'0 4px 20px rgba(0,0,0,.3)', padding:'10px 0' },
  navW:      { maxWidth:1280, margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'flex-end', position:'relative' },
  navCenter: { position:'absolute', left:'50%', transform:'translateX(-50%)' },
  logoLink:  { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  logoEmoji: { fontSize:28 },
  logoName:  { fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:'#fff', whiteSpace:'nowrap' },
  logoSub:   { fontSize:10, color:'#C9A84C', letterSpacing:.8, fontWeight:600 },
  navRight:  { display:'flex', alignItems:'center', gap:28 },
  nl:        { color:'rgba(255,255,255,.82)', fontSize:14, fontWeight:500, textDecoration:'none' },
  adminBtn:  { padding:'8px 20px', borderRadius:8, background:'#C9A84C', color:'#0D1B2A', fontWeight:700, fontSize:14, textDecoration:'none' },

  /* Hero */
  hero:     { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0D1B2A 0%,#1A2E42 45%,#243B55 100%)', position:'relative', padding:'120px 24px 60px', textAlign:'center' },
  heroGlow: { position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 55%,rgba(201,168,76,.09) 0%,transparent 60%)', pointerEvents:'none' },
  heroC:    { maxWidth:760, position:'relative', zIndex:1, margin:'0 auto' },
  pill:     { display:'inline-block', background:'rgba(201,168,76,.14)', border:'1px solid rgba(201,168,76,.3)', color:'#C9A84C', padding:'8px 22px', borderRadius:100, fontSize:13, fontWeight:600, letterSpacing:.5, marginBottom:24 },
  heroH:    { fontFamily:"'Playfair Display',serif", fontSize:'clamp(38px,6vw,72px)', fontWeight:700, color:'#fff', marginBottom:20, lineHeight:1.15 },
  heroP:    { color:'rgba(255,255,255,.68)', fontSize:17, maxWidth:540, margin:'0 auto 40px', lineHeight:1.75 },
  statsRow: { display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap', marginBottom:40 },
  stat:     { textAlign:'center' },
  statN:    { fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:'#C9A84C' },
  statL:    { color:'rgba(255,255,255,.45)', fontSize:12, marginTop:3 },
  heroBtn:  { display:'inline-block', padding:'14px 36px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#A07830)', color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', letterSpacing:.4 },

  /* Sections */
  sec:      { padding:'80px 0' },
  wrap:     { maxWidth:1280, margin:'0 auto', padding:'0 24px' },
  secHead:  { textAlign:'center', marginBottom:48 },
  tag:      { display:'inline-block', background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.25)', color:'#A07830', padding:'6px 16px', borderRadius:100, fontSize:12, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', marginBottom:14 },
  secTitle: { fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,4vw,40px)', color:'#0D1B2A', marginBottom:12, textAlign:'center' },
  secSub:   { color:'#718096', fontSize:15, maxWidth:500, margin:'0 auto' },
  grid3:    { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 },
  grid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:24 },
  empty:    { textAlign:'center', padding:'80px 0' },

  /* Filter */
  filterBar: { display:'flex', gap:12, marginBottom:28, flexWrap:'wrap', alignItems:'center' },
  sel:       { padding:'11px 16px', border:'2px solid #E2D5C3', borderRadius:10, fontSize:14, color:'#4A5568', background:'#fff', cursor:'pointer', minWidth:150 },
  clearBtn:  { padding:'11px 20px', borderRadius:10, border:'2px solid #E74C3C', background:'transparent', color:'#E74C3C', fontSize:14, fontWeight:600, cursor:'pointer' },

  /* About */
aboutGrid: {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
  gap:64,
  alignItems:'center'
},  feats:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  feat:       { color:'rgba(255,255,255,.8)', fontSize:14, fontWeight:500 },
  aboutCards: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  aboutCard:  { background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:10 },

  /* Contact */
contactGrid: {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
  gap:24,
  marginBottom:48
},  cCard:   { background:'#F8F4EE', borderRadius:16, padding:'32px 24px', textAlign:'center', border:'1px solid #EDE5D8' },
  cLabel:  { fontFamily:"'Playfair Display',serif", fontSize:18, color:'#0D1B2A', marginBottom:8 },
  cVal:    { color:'#C9A84C', fontWeight:600, fontSize:15, marginBottom:4 },
  cSub:    { color:'#718096', fontSize:13 },

  /* Owner box */
ownerBox: {
  background:'linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%)',
  borderRadius:20,
  overflow:'hidden',
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
  boxShadow:'0 20px 60px rgba(13,27,42,.25)'
},  ownerLeft:    { background:'linear-gradient(180deg,rgba(201,168,76,.18),rgba(201,168,76,.06))', padding:'40px 32px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', borderRight:'1px solid rgba(201,168,76,.2)' },
  ownerBadge:   { fontSize:11, fontWeight:700, color:'#C9A84C', letterSpacing:1, textTransform:'uppercase', marginBottom:20 },
  ownerAvatar:  { width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#A07830)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, color:'#fff', fontFamily:"'Playfair Display',serif", marginBottom:16, boxShadow:'0 8px 24px rgba(201,168,76,.4)' },
  ownerName:    { fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 },
  ownerTagline: { fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.5 },
  ownerRight:   { padding:'40px 48px', display:'flex', flexDirection:'column', gap:22, justifyContent:'center' },
  ownerRow:     { display:'flex', alignItems:'flex-start', gap:16 },
  oIcon:        { fontSize:22, marginTop:2, width:28, flexShrink:0 },
  oLabel:       { fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:3 },
  oVal:         { fontSize:15, color:'#fff', fontWeight:500, textDecoration:'none' },
  callBtn:      { marginTop:8, display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#A07830)', color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none', alignSelf:'flex-start', letterSpacing:.4 },

  /* Footer */
  footer:       { background:'#0D1B2A', padding:'60px 0 28px' },
footerGrid: {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
  gap:56,
  marginBottom:48
},  fBrand:       { display:'flex', alignItems:'center', gap:14, marginBottom:16 },
  fBrandName:   { fontFamily:"'Playfair Display',serif", fontSize:21, color:'#E8C97A', fontWeight:700 },
  fBrandSub:    { fontSize:11, color:'rgba(255,255,255,.3)', marginTop:2 },
  fDesc:        { color:'rgba(255,255,255,.45)', fontSize:13, lineHeight:1.8, marginBottom:20 },
  fLinks:       { display:'flex', flexWrap:'wrap', gap:'8px 20px' },
  fLink:        { color:'rgba(255,255,255,.45)', fontSize:13, textDecoration:'none' },
  fColTitle:    { fontFamily:"'Playfair Display',serif", color:'#E8C97A', fontSize:16, fontWeight:600, marginBottom:18 },
  fRow:         { display:'flex', alignItems:'center', gap:10, marginBottom:10 },
  fRowText:     { color:'rgba(255,255,255,.5)', fontSize:13 },

  /* Owner mini in footer */
  ownerMini:       { display:'flex', alignItems:'center', gap:12, marginBottom:16 },
  ownerMiniAvatar: { width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#A07830)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16, flexShrink:0 },
  ownerMiniName:   { color:'#fff', fontWeight:600, fontSize:14, marginBottom:2 },
  ownerMiniRole:   { color:'rgba(255,255,255,.4)', fontSize:12 },

  /* Developer in footer */
  devCard:   { display:'flex', alignItems:'center', gap:12, marginBottom:14 },
  devAvatar: { width:44, height:44, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#243B55,#1A2E42)', border:'2px solid rgba(201,168,76,.4)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C', fontWeight:800, fontSize:18 },
  devName:   { color:'#fff', fontWeight:600, fontSize:15, marginBottom:2 },
  devRole:   { color:'rgba(255,255,255,.4)', fontSize:12 },

  footerDiv: { height:1, background:'rgba(255,255,255,.07)', marginBottom:24 },
  footerBot: { display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 },
  fCopy:     { color:'rgba(255,255,255,.28)', fontSize:12 },
};