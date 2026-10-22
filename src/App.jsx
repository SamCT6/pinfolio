import { useMemo, useState } from "react";
import {
  LayoutDashboard, GalleryVerticalEnd, Repeat2, Heart, MoreHorizontal,
  Search, Bell, Plus, ChevronRight, ArrowUpRight, LockKeyhole,
  SlidersHorizontal, Sparkles, ShieldCheck, Menu, X, CircleHelp,
  Settings, Layers3, ChartNoAxesCombined, ImagePlus, EyeOff, Clock3,
  CheckCircle2, Handshake, ArrowRightLeft
} from "lucide-react";
import { demoPins, demoFriends, demoWishlist } from "./data/demoPins.js";
import { isDemoMode } from "./lib/supabase.js";

const navItems = [
  { id: "Dashboard", icon: LayoutDashboard },
  { id: "Collection", icon: GalleryVerticalEnd },
  { id: "Traders", icon: Repeat2 },
  { id: "Wishlist", icon: Heart },
  { id: "More", icon: MoreHorizontal }
];

function PinArt({ pin, small = false }) {
  return (
    <div className={`pin-art ${pin.color || "navy"} ${small ? "pin-art-small" : ""}`} aria-label={`${pin.name} illustrative pin artwork`}>
      <div className="pin-art-ring"><span>{pin.symbol || "✦"}</span></div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle, action, onAction }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <button className="button button-secondary desktop-action" onClick={onAction}>{action}</button>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, tone = "" }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

function PinCard({ pin, onClick }) {
  return (
    <article className="pin-card">
      <button className="pin-image-button" onClick={onClick} aria-label={`View ${pin.name}`}>
        <PinArt pin={pin} />
        {pin.visibility === "Private" && <span className="privacy-dot" title="Private"><LockKeyhole size={13} /></span>}
      </button>
      <div className="pin-card-body">
        <div className="pin-card-title">{pin.name}</div>
        <div className="pin-card-subtitle">{pin.set}</div>
        <div className="pin-card-footer">
          <span className="quantity">Owned ×{pin.owned}</span>
          {pin.tradeable > 0 ? <span className="tradeable-label">{pin.tradeable} tradeable</span> : <span className="kept-label">Keeping</span>}
        </div>
      </div>
    </article>
  );
}

function Dashboard({ setPage }) {
  const owned = demoPins.reduce((sum, p) => sum + p.owned, 0);
  const tradeable = demoPins.reduce((sum, p) => sum + p.tradeable, 0);
  return (
    <>
      {isDemoMode && <div className="demo-banner"><Sparkles size={15} /> Preview mode · sample pins only · nothing is saved yet</div>}
      <div className="welcome-panel">
        <div className="welcome-copy">
          <div className="eyebrow light">YOUR COLLECTION, IN ONE PLACE</div>
          <h1>A little magic,<br /><em>well organized.</em></h1>
          <p>Keep track of your pins, find your next favorite, and make trading with friends easier.</p>
          <button className="button button-gold" onClick={() => setPage("Collection")}><Plus size={17} /> Explore collection</button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="hero-star">✦</div><div className="hero-moon">☾</div><div className="hero-spark">✧</div>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard icon={GalleryVerticalEnd} label="Pins owned" value={owned} note="Across 6 designs" tone="tone-blue" />
        <StatCard icon={ChartNoAxesCombined} label="Collection value" value="—" note="Add valuations to begin" tone="tone-gold" />
        <StatCard icon={Layers3} label="Set progress" value="—" note="No sets completed yet" tone="tone-purple" />
        <StatCard icon={Repeat2} label="Tradeable copies" value={tradeable} note="Available to offer" tone="tone-green" />
      </div>
      <div className="content-grid dashboard-grid">
        <section className="panel">
          <div className="panel-heading"><div><h2>Recently added</h2><p>Your latest collection finds</p></div><button className="text-link" onClick={() => setPage("Collection")}>View collection <ChevronRight size={15} /></button></div>
          <div className="recent-list">
            {demoPins.slice(0, 3).map(pin => <div className="recent-row" key={pin.id}><PinArt pin={pin} small /><div className="recent-copy"><strong>{pin.name}</strong><span>{pin.set}</span></div><span className="quantity">×{pin.owned}</span></div>)}
          </div>
        </section>
        <section className="panel wishlist-panel">
          <div className="panel-heading"><div><h2>Wishlist matches</h2><p>Friends may have what you're looking for</p></div><Heart size={19} className="muted-icon" /></div>
          {demoWishlist.filter(w => w.match.startsWith("Available")).map(w => <div className="match-row" key={w.id}><div className="match-check"><Sparkles size={15} /></div><div className="match-copy"><strong>{w.name}</strong><span>{w.match}</span></div><ChevronRight size={16} className="muted-icon" /></div>)}
          <button className="button button-secondary button-wide" onClick={() => setPage("Traders")}>Explore friends' traders <ArrowUpRight size={16} /></button>
        </section>
      </div>
    </>
  );
}

function Collection({ search, setSearch, setSelectedPin }) {
  const [filter, setFilter] = useState("All pins");
  const filtered = useMemo(() => demoPins.filter(p => {
    const matchesSearch = `${p.name} ${p.character} ${p.set}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All pins" || (filter === "Tradeable" && p.tradeable > 0) || (filter === "Private" && p.visibility === "Private");
    return matchesSearch && matchesFilter;
  }), [search, filter]);
  return (
    <>
      <SectionTitle eyebrow="YOUR PERSONAL ARCHIVE" title="My Collection" subtitle="Every pin has a place. Keep your collection organized your way." action="+ Add pin" onAction={() => alert("Pin entry will be connected when we build the add-pin workflow.")} />
      <div className="toolbar">
        <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pins, characters, sets..." /></div>
        <button className="button button-secondary filter-button"><SlidersHorizontal size={16} /> Filters</button>
      </div>
      <div className="filter-chips">{["All pins", "Tradeable", "Private"].map(f => <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <div className="pin-grid">{filtered.map(pin => <PinCard key={pin.id} pin={pin} onClick={() => setSelectedPin(pin)} />)}</div>
      <p className="demo-footnote"><LockKeyhole size={14} /> Pins marked private are visible only in your own collection. This is a visual demo; real privacy rules require account setup.</p>
    </>
  );
}

function Traders() {
  return (
    <>
      <SectionTitle eyebrow="TRADE WITH YOUR CIRCLE" title="Friends' Traders" subtitle="Browse the pins friends have chosen to share with you." />
      <div className="privacy-note"><ShieldCheck size={18} /><span><strong>Only shared pins appear here.</strong> Friends can keep individual pins or entire sections private.</span></div>
      <div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search shared pins or friends..." /></div><button className="button button-secondary filter-button"><SlidersHorizontal size={16} /> Filters</button></div>
      <div className="friend-strip">{demoFriends.map(friend => <div className="friend-chip" key={friend.id}><div className="avatar">{friend.initials}</div><div><strong>{friend.name}</strong><span>{friend.status}</span></div></div>)}</div>
      <div className="trader-heading"><h2>Available to trade</h2><span className="subtle-count">3 example listings</span></div>
      <div className="pin-grid">{demoPins.filter(p => p.tradeable > 0).slice(0, 3).map((pin, i) => <article className="pin-card trader-card" key={pin.id}><div className="pin-image-button"><PinArt pin={pin} /><span className="trade-badge">Tradeable ×{i === 1 ? 1 : 2}</span></div><div className="pin-card-body"><div className="pin-card-title">{pin.name}</div><div className="pin-card-subtitle">{pin.set}</div><div className="owner-row"><div className="avatar avatar-small">{demoFriends[i].initials}</div><span>Shared by {demoFriends[i].name.split(" ")[0]}</span></div>{i === 0 && <span className="wishlist-match"><Sparkles size={13} /> On your wishlist</span>}<button className="button button-secondary button-wide" onClick={() => alert("Trade proposals will be connected after accounts and inventory are implemented.")}>Propose trade <ArrowRightLeft size={15} /></button></div></article>)}</div>
    </>
  );
}

function Wishlist() {
  return (
    <>
      <SectionTitle eyebrow="YOUR NEXT FINDS" title="My Wishlist" subtitle="Keep track of the pins you're hoping to find." action="+ Add to wishlist" onAction={() => alert("Wishlist editing will be added in the next build step.")} />
      <div className="wishlist-summary"><div><span className="eyebrow">PINS ON YOUR LIST</span><strong>3</strong></div><div><span className="eyebrow">FRIEND MATCHES</span><strong>2</strong></div><div><span className="eyebrow">HIGH PRIORITY</span><strong>1</strong></div></div>
      <div className="wishlist-list">{demoWishlist.map((pin, i) => <div className="wishlist-item" key={pin.id}><PinArt pin={demoPins[i]} small /><div className="wishlist-item-main"><strong>{pin.name}</strong><span>{pin.set}</span><span className={`priority priority-${pin.priority.toLowerCase()}`}>{pin.priority} priority</span></div><div className="wishlist-item-match">{pin.match.startsWith("Available") ? <><Sparkles size={15} /><span>{pin.match}</span></> : <><Clock3 size={15} /><span>No match yet</span></>}</div><button className="icon-button" aria-label="Wishlist item options"><MoreHorizontal size={19} /></button></div>)}</div>
    </>
  );
}

function MorePage({ setPage }) {
  const options = [
    { icon: Layers3, title: "Pin Sets & Checklists", desc: "Track progress through sets and releases", label: "Coming next" },
    { icon: ImagePlus, title: "Authenticity Reviews", desc: "Keep notes and reference photos together", label: "Planned" },
    { icon: ChartNoAxesCombined, title: "Value Reports", desc: "Compare purchase cost and estimated value", label: "Planned" },
    { icon: Settings, title: "Privacy & Settings", desc: "Control what each friend can see", label: "Planned" },
    { icon: CircleHelp, title: "Help & About", desc: "Learn how Pinfolio works", label: "Planned" }
  ];
  return <>
    <SectionTitle eyebrow="MORE TO EXPLORE" title="More" subtitle="Tools to help your collection grow." />
    <div className="more-list">{options.map(item => <button className="more-row" key={item.title} onClick={() => item.title.includes("Privacy") ? alert("Friend-specific privacy controls will be implemented with account permissions.") : undefined}><div className="more-icon"><item.icon size={19} /></div><div className="more-copy"><strong>{item.title}</strong><span>{item.desc}</span></div><span className="planned-label">{item.label}</span><ChevronRight size={17} className="muted-icon" /></button>)}</div>
    <div className="security-card"><LockKeyhole size={20} /><div><strong>Private by design</strong><p>Your collection should stay yours. Sharing will be opt-in and controlled per section and per friend.</p></div></div>
  </>;
}

function PinDetail({ pin, onClose }) {
  if (!pin) return null;
  return <div className="modal-backdrop" onClick={onClose}><div className="pin-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={20} /></button><PinArt pin={pin} /><div className="eyebrow">PIN DETAILS · DEMO</div><h2>{pin.name}</h2><p>{pin.set} · {pin.character}</p><div className="detail-stats"><div><span>Owned</span><strong>{pin.owned}</strong></div><div><span>Tradeable</span><strong>{pin.tradeable}</strong></div><div><span>Visibility</span><strong>{pin.visibility}</strong></div></div><p className="modal-note">In the working version, this screen will include photos, condition, authenticity notes, purchase cost, valuation history, and edit controls.</p></div></div>;
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (id) => { setPage(id); setMobileMenuOpen(false); };
  const currentIcon = navItems.find(n => n.id === page)?.icon || MoreHorizontal;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark">✦</div><div><span>Pinfolio</span><small>YOUR PIN COLLECTION</small></div><button className="mobile-close" onClick={() => setMobileMenuOpen(false)}><X size={20} /></button></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">{navItems.map(item => <button key={item.id} className={`nav-item ${page === item.id ? "selected" : ""}`} onClick={() => navigate(item.id)}><item.icon size={19} /><span>{item.id}</span>{item.id === "Traders" && <span className="nav-count">3</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={17} /><strong>A little pin magic</strong><p>Your next favorite might be in a friend's trader list.</p><button onClick={() => navigate("Traders")}>Find a match <ArrowUpRight size={14} /></button></div><div className="profile-row"><div className="avatar profile-avatar">SC</div><div><strong>My account</strong><span>Preview profile</span></div><MoreHorizontal size={18} className="muted-icon" /></div></div>
      </aside>
      {mobileMenuOpen && <button className="mobile-scrim" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar"><button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><div className="breadcrumb"><span>Pinfolio</span><ChevronRight size={15} /><strong>{page}</strong></div><div className="topbar-actions"><span className="sync-status"><span className="status-dot"></span>{isDemoMode ? "Preview mode" : "Connected"}</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /></button><div className="avatar top-avatar">SC</div></div></header>
        <div className="page-content">
          {page === "Dashboard" && <Dashboard setPage={navigate} />}
          {page === "Collection" && <Collection search={search} setSearch={setSearch} setSelectedPin={setSelectedPin} />}
          {page === "Traders" && <Traders />}
          {page === "Wishlist" && <Wishlist />}
          {page === "More" && <MorePage setPage={navigate} />}
          <footer className="footer"><span>Pinfolio · Personal pin collection tracker</span><span><LockKeyhole size={13} /> Private by default</span></footer>
        </div>
        <nav className="mobile-bottom-nav">{navItems.map(item => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => navigate(item.id)}><item.icon size={20} /><span>{item.id}</span></button>)}</nav>
      </main>
      <PinDetail pin={selectedPin} onClose={() => setSelectedPin(null)} />
    </div>
  );
}
