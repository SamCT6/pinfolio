import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, GalleryVerticalEnd, Repeat2, Heart, MoreHorizontal,
  Search, Bell, Plus, ChevronRight, ArrowUpRight, LockKeyhole,
  SlidersHorizontal, Sparkles, ShieldCheck, Menu, X, CircleHelp,
  Settings, Layers3, ChartNoAxesCombined, ImagePlus, EyeOff, Clock3,
  CheckCircle2, Handshake, ArrowRightLeft
} from "lucide-react";
import { demoPins, demoFriends, demoWishlist } from "./data/demoPins.js";
import { supabase, isDemoMode } from "./lib/supabase";

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

function Collection({
  search,
  setSearch,
  setSelectedPin,
  pins,
  loading,
  onAddPin,
}) {
  const [filter, setFilter] = useState("All pins");
  const filtered = useMemo(() => pins.filter(p => {
    const matchesSearch = `${p.name} ${p.character} ${p.set}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All pins" || (filter === "Tradeable" && p.tradeable > 0) || (filter === "Private" && p.visibility === "Private");
    return matchesSearch && matchesFilter;
  }), [pins, search, filter]);
  return (
    <>
      <SectionTitle
        eyebrow="YOUR PERSONAL ARCHIVE"
        title="My Collection"
        subtitle="Every pin has a place. Keep your collection organized your way."
        action="+ Add pin"
        onAction={onAddPin}
/>
      <div className="toolbar">
        <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pins, characters, sets..." /></div>
        <button className="button button-secondary filter-button"><SlidersHorizontal size={16} /> Filters</button>
      </div>
      <div className="filter-chips">{["All pins", "Tradeable", "Private"].map(f => <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      {loading ? (
  <p>Loading your collection...</p>
      ) : filtered.length === 0 ? (
        <p>Your collection is empty. Add your first pin next!</p>
      ) : (
        <div className="pin-grid">
          {filtered.map(pin => (
            <PinCard
              key={pin.collectionItemId}
              pin={pin}
              onClick={() => setSelectedPin(pin)}
            />
          ))}
        </div>
      )}
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


function Wishlist({ wishlistItems = [], loading = false, error = "", onAdd }) {
  return (
    <>
      <SectionTitle
        eyebrow="YOUR NEXT FINDS"
        title="My Wishlist"
        subtitle="Keep track of the pins you're hoping to find."
        action="+ Add to wishlist"
        onAction={onAdd}
      />

      <div className="wishlist-summary">
        <div>
          <span className="eyebrow">PINS ON YOUR LIST</span>
          <strong>{wishlistItems.length}</strong>
        </div>
        <div>
          <span className="eyebrow">FRIEND MATCHES</span>
          <strong>0</strong>
        </div>
        <div>
          <span className="eyebrow">HIGH PRIORITY</span>
          <strong>
            {wishlistItems.filter(
              (item) => item.priority?.toLowerCase() === "high"
            ).length}
          </strong>
        </div>
      </div>

      {loading ? (
        <p>Loading your wishlist...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : wishlistItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>Add pins you're hoping to find, and they'll appear here.</p>
        </div>
      ) : (
        <div className="wishlist-list">
          {wishlistItems.map((item) => (
            <div className="wishlist-item" key={item.id}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="pin-image"
                />
              ) : (
                <div className="pin-image pin-image-placeholder">
                  ✦
                </div>
              )}

              <div className="wishlist-item-main">
                <strong>{item.name}</strong>
                <span>{item.set || "Uncategorized"}</span>
                <span
                  className={`priority priority-${(
                    item.priority || "medium"
                  ).toLowerCase()}`}
                >
                  {item.priority || "Medium"} priority
                </span>

                {item.targetPrice != null && (
                  <span>Target price: ${Number(item.targetPrice).toFixed(2)}</span>
                )}

                {item.notes && <span>{item.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
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


function PinDetail({ pin, onClose, onEdit, onRemove }) {
  if (!pin) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="pin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close pin details"
        >
          <X size={20} />
        </button>

        <PinArt pin={pin} />

        <div className="eyebrow">MY COLLECTION</div>
        <h2 id="pin-detail-title">{pin.name}</h2>
        <p>{pin.set} · {pin.character}</p>

        <div className="detail-stats">
          <div>
            <span>Owned</span>
            <strong>{pin.owned}</strong>
          </div>
          <div>
            <span>Tradeable</span>
            <strong>{pin.tradeable}</strong>
          </div>
          <div>
            <span>Visibility</span>
            <strong>{pin.visibility}</strong>
          </div>
        </div>

        {pin.purchaseCost != null && (
          <p>
            <strong>Purchase cost:</strong>{" "}
            ${Number(pin.purchaseCost).toFixed(2)}
          </p>
        )}

        {pin.notes && (
          <p>
            <strong>Notes:</strong> {pin.notes}
          </p>
        )}

        {pin.authenticityStatus && (
          <p>
            <strong>Authenticity:</strong>{" "}
            {pin.authenticityStatus.replaceAll("_", " ")}
          </p>
        )}

        <div className="add-pin-fields">
          <button
            className="button button-gold button-wide"
            type="button"
            onClick={() => onEdit(pin)}
          >
            Edit pin
          </button>

          <button
            className="button button-secondary button-wide"
            type="button"
            onClick={() => onRemove(pin)}
          >
            Remove from collection
          </button>
        </div>
      </div>
    </div>
  );
}



function AddPinForm({ onClose, onSaved, userId }) {
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("");
  const [franchise, setFranchise] = useState("");
  const [park, setPark] = useState("");
  const [year, setYear] = useState("");
  const [owned, setOwned] = useState("1");
  const [tradeable, setTradeable] = useState("0");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function searchCatalog() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    const { data, error } = await supabase
      .from("pins")
      .select("id, name, character_name, franchise, park, release_year")
      .ilike("name", `%${query.trim()}%`)
      .order("name")
      .limit(20);

    if (error) {
      setMessage(error.message);
    } else {
      setResults(data ?? []);
      if (!data?.length) setMessage("No matching pins found. You can create a new entry.");
    }
    setBusy(false);
  }

  async function savePin(e) {
    e.preventDefault();
    setMessage("");

    const ownedCount = Number(owned);
    const tradeableCount = Number(tradeable);
    const purchaseCost = cost.trim() === "" ? null : Number(cost);

    if (!Number.isInteger(ownedCount) || ownedCount < 1) {
      setMessage("Quantity owned must be at least 1.");
      return;
    }
    if (!Number.isInteger(tradeableCount) || tradeableCount < 0 || tradeableCount > ownedCount) {
      setMessage("Tradeable quantity must be between 0 and quantity owned.");
      return;
    }
    if (purchaseCost !== null && (!Number.isFinite(purchaseCost) || purchaseCost < 0)) {
      setMessage("Enter a valid purchase cost.");
      return;
    }

    setBusy(true);

    try {
      let pinId = selectedPin?.id;

      if (mode === "create") {
        if (!name.trim()) throw new Error("Pin name is required.");

        const { data: newPin, error: pinError } = await supabase
          .from("pins")
          .insert({
            name: name.trim(),
            character_name: character.trim() || null,
            franchise: franchise.trim() || null,
            park: park.trim() || null,
            release_year: year ? Number(year) : null,
            created_by: userId,
          })
          .select("id")
          .single();

        if (pinError) throw pinError;
        pinId = newPin.id;
      }

      if (!pinId) throw new Error("Choose a catalog pin or create a new one.");

      const { error: itemError } = await supabase
        .from("collection_items")
        .insert({
          user_id: userId,
          pin_id: pinId,
          owned_quantity: ownedCount,
          tradeable_quantity: tradeableCount,
          purchase_cost: purchaseCost,
          authenticity_status: "unknown",
        });

      if (itemError) {
        if (itemError.code === "23505") {
          throw new Error("This pin is already in your collection. You can edit its quantity in a later step.");
        }
        throw itemError;
      }

      onSaved();
    } catch (error) {
      setMessage(error.message || "Could not save this pin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pin-modal" role="dialog" aria-modal="true" aria-labelledby="add-pin-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}><X size={20} /></button>
        <div className="eyebrow">GROW YOUR COLLECTION</div>
        <h2 id="add-pin-title">Add a pin</h2>

        <div className="filter-chips">
          <button type="button" className={`chip ${mode === "search" ? "active" : ""}`} onClick={() => { setMode("search"); setSelectedPin(null); setMessage(""); }}>Find existing</button>
          <button type="button" className={`chip ${mode === "create" ? "active" : ""}`} onClick={() => { setMode("create"); setSelectedPin(null); setMessage(""); }}>Create new</button>
        </div>

        {mode === "search" ? (
          <div>
            <label>Search catalog
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter a pin name..." />
            </label>
            <button className="button button-secondary button-wide" type="button" onClick={searchCatalog} disabled={busy || !query.trim()}>
              {busy ? "Searching..." : "Search pins"}
            </button>
            <div className="wishlist-list">
              {results.map((pin) => (
                <button type="button" key={pin.id} className="wishlist-item" onClick={() => setSelectedPin(pin)} style={{ width: "100%", textAlign: "left", cursor: "pointer", border: selectedPin?.id === pin.id ? "2px solid #e7c779" : undefined }}>
                  <div className="wishlist-item-main">
                    <strong>{pin.name}</strong>
                    <span>{[pin.character_name, pin.franchise, pin.park, pin.release_year].filter(Boolean).join(" · ")}</span>
                  </div>
                  {selectedPin?.id === pin.id && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
            {selectedPin && <p>Selected: <strong>{selectedPin.name}</strong></p>}
          </div>
        ) : (
          <div className="add-pin-fields">
            <label>Pin name *
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Mickey Mouse castle pin" />
            </label>
            <label>Character
              <input value={character} onChange={(e) => setCharacter(e.target.value)} />
            </label>
            <label>Franchise or set
              <input value={franchise} onChange={(e) => setFranchise(e.target.value)} />
            </label>
            <label>Disney park
              <input value={park} onChange={(e) => setPark(e.target.value)} />
            </label>
            <label>Release year
              <input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} />
            </label>
          </div>
        )}

        <form onSubmit={savePin}>
          <div className="add-pin-fields">
            <label>Quantity owned
              <input type="number" min="1" step="1" value={owned} onChange={(e) => setOwned(e.target.value)} required />
            </label>
            <label>Quantity tradeable
              <input type="number" min="0" step="1" value={tradeable} onChange={(e) => setTradeable(e.target.value)} required />
            </label>
            <label>Purchase cost (optional)
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
            </label>
          </div>

          {message && <p role="alert">{message}</p>}

          <button className="button button-gold button-wide" type="submit" disabled={busy || (mode === "search" && !selectedPin)}>
            {busy ? "Saving..." : "Save to my collection"}
          </button>
        </form>
      </div>
    </div>
  );
}


function EditPinForm({ pin, onClose, onSaved, onRemove }) {
  const [owned, setOwned] = useState(String(pin.owned));
  const [tradeable, setTradeable] = useState(String(pin.tradeable));
  const [cost, setCost] = useState(
    pin.purchaseCost == null ? "" : String(pin.purchaseCost)
  );
  const [notes, setNotes] = useState(pin.notes || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function saveChanges(e) {
    e.preventDefault();
    setMessage("");

    const ownedCount = Number(owned);
    const tradeableCount = Number(tradeable);
    const purchaseCost = cost.trim() === "" ? null : Number(cost);

    if (!Number.isInteger(ownedCount) || ownedCount < 1) {
      setMessage("Quantity owned must be at least 1.");
      return;
    }

    if (
      !Number.isInteger(tradeableCount) ||
      tradeableCount < 0 ||
      tradeableCount > ownedCount
    ) {
      setMessage("Tradeable quantity must be between 0 and quantity owned.");
      return;
    }

    if (
      purchaseCost !== null &&
      (!Number.isFinite(purchaseCost) || purchaseCost < 0)
    ) {
      setMessage("Enter a valid purchase cost.");
      return;
    }

    if (!supabase || !pin.collectionItemId) {
      setMessage("Cannot update this pin right now.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase
        .from("collection_items")
        .update({
          owned_quantity: ownedCount,
          tradeable_quantity: tradeableCount,
          purchase_cost: purchaseCost,
          notes: notes.trim() || null,
        })
        .eq("id", pin.collectionItemId)
        .eq("user_id", (await supabase.auth.getUser()).data.user.id);

      if (error) throw error;

      onSaved();
    } catch (error) {
      setMessage(error.message || "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function removePin() {
    const confirmed = window.confirm(
      `Remove "${pin.name}" from your collection? This will not delete the catalog entry.`
    );

    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;
      if (!userData.user) throw new Error("Please sign in again.");

      const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("id", pin.collectionItemId)
        .eq("user_id", userData.user.id);

      if (error) throw error;

      onRemove();
    } catch (error) {
      setMessage(error.message || "Could not remove this pin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="pin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-pin-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close edit form"
        >
          <X size={20} />
        </button>

        <div className="eyebrow">MY COLLECTION</div>
        <h2 id="edit-pin-title">Edit pin</h2>
        <p>{pin.name}</p>

        <form onSubmit={saveChanges}>
          <div className="add-pin-fields">
            <label>
              Quantity owned
              <input
                type="number"
                min="1"
                step="1"
                value={owned}
                onChange={(e) => setOwned(e.target.value)}
                required
              />
            </label>

            <label>
              Quantity tradeable
              <input
                type="number"
                min="0"
                step="1"
                value={tradeable}
                onChange={(e) => setTradeable(e.target.value)}
                required
              />
            </label>

            <label>
              Purchase cost (optional)
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </label>

            <label>
              Personal notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condition, where you found it, or other details..."
                rows="4"
              />
            </label>
          </div>

          {message && <p role="alert">{message}</p>}

          <button
            className="button button-gold button-wide"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save changes"}
          </button>

          <button
            className="button button-secondary button-wide"
            type="button"
            disabled={busy}
            onClick={removePin}
          >
            {busy ? "Please wait..." : "Remove from collection"}
          </button>
        </form>
      </div>
    </div>
  );
}




function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage(
          data.session
            ? "Account created! You're signed in."
            : "Account created! Check your email for a confirmation link."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "#101a30",
      color: "#f8f2e5",
      fontFamily: "inherit"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          boxSizing: "border-box",
          padding: 32,
          borderRadius: 20,
          background: "#1a2740",
          border: "1px solid #35415a"
        }}
      >
        <div style={{
          color: "#e7c779",
          fontSize: 14,
          letterSpacing: 3,
          marginBottom: 12
        }}>
          ✦ PINFOLIO
        </div>

        <h1 style={{ marginBottom: 8 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <p style={{ color: "#b8c0cf", lineHeight: 1.5 }}>
          {mode === "login"
            ? "Sign in to access your pin collection."
            : "Start organizing your collection and wishlist."}
        </p>

        <label style={{ display: "block", marginTop: 24 }}>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={authInputStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: 16 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
            style={authInputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 24,
            padding: 13,
            border: 0,
            borderRadius: 10,
            background: "#e7c779",
            color: "#172039",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer"
          }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>

        {message && (
          <p role="status" style={{
            marginTop: 16,
            color: "#f8f2e5",
            overflowWrap: "anywhere"
          }}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 10,
            border: "1px solid #53617a",
            borderRadius: 10,
            background: "transparent",
            color: "#f8f2e5",
            cursor: "pointer"
          }}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

const authInputStyle = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  marginTop: 8,
  padding: 12,
  border: "1px solid #53617a",
  borderRadius: 9,
  background: "#101a30",
  color: "#ffffff",
  fontSize: 16
};


export default function App() {
  
const [connectionStatus, setConnectionStatus] = useState("Not tested");
const [session, setSession] = useState(null);
const [authReady, setAuthReady] = useState(false);

const [page, setPage] = useState("Dashboard");
const [search, setSearch] = useState("");
const [selectedPin, setSelectedPin] = useState(null);
const [collectionPins, setCollectionPins] = useState([]);
const [collectionLoading, setCollectionLoading] = useState(true);
const [wishlistItems, setWishlistItems] = useState([]);
const [wishlistLoading, setWishlistLoading] = useState(false);
const [wishlistError, setWishlistError] = useState("");
const [showWishlistAdd, setShowWishlistAdd] = useState(false);
const [wishlistRefresh, setWishlistRefresh] = useState(0);
const [collectionRefresh, setCollectionRefresh] = useState(0);
const [showAddPin, setShowAddPin] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [editingPin, setEditingPin] = useState(null);

const userEmail = session?.user?.email ?? "Account";


  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

  

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Could not load session:", error.message);
      }

      setSession(data?.session ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


useEffect(() => {
  let ignore = false;

  async function loadWishlist() {
    if (!session?.user || !supabase) {
      setWishlistItems([]);
      setWishlistLoading(false);
      setWishlistError("");
      return;
    }

    setWishlistLoading(true);
    setWishlistError("");

    const { data, error } = await supabase
      .from("wishlist_items")
      .select(`
        id,
        priority,
        target_price,
        notes,
        pin:pins (
          id,
          name,
          description,
          character_name,
          franchise,
          park,
          image_url
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (ignore) return;

    if (error) {
      console.error("Error loading wishlist:", error);
      setWishlistError("Couldn't load your wishlist. Please try again.");
      setWishlistItems([]);
    } else {
      const items = (data || [])
        .filter((item) => item.pin)
        .map((item) => ({
          id: item.id,
          pinId: item.pin.id,
          name: item.pin.name,
          set: item.pin.franchise || item.pin.park || "Uncategorized",
          character: item.pin.character_name || "Unknown character",
          imageUrl: item.pin.image_url,
          priority: item.priority,
          targetPrice: item.target_price,
          notes: item.notes,
        }));

      setWishlistItems(items);
    }

    setWishlistLoading(false);
  }

  loadWishlist();

  return () => {
    ignore = true;
  };
}, [session, wishlistRefresh]);


  


useEffect(() => {
  async function loadCollection() {
    if (!supabase || !session?.user?.id) {
      setCollectionPins([]);
      setCollectionLoading(false);
      return;
    }

    setCollectionLoading(true);

    const { data, error } = await supabase
      .from("collection_items")
      .select(`
        id,
        owned_quantity,
        tradeable_quantity,
        purchase_cost,
        authenticity_status,
        notes,
        pin:pins (
          id,
          name,
          description,
          character_name,
          franchise,
          park,
          release_year,
          edition_type,
          image_url
        )
      `)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Could not load collection:", error.message);
      setCollectionLoading(false);
      return;
    }

    const pins = (data ?? [])
      .filter((item) => item.pin)
      .map((item) => ({
        id: item.pin.id,
        collectionItemId: item.id,
        name: item.pin.name,
        set: item.pin.franchise || item.pin.park || "Uncategorized",
        character: item.pin.character_name || "Unknown character",
        owned: item.owned_quantity,
        tradeable: item.tradeable_quantity,
        visibility: "Private",
        color: "navy",
        symbol: "✦",
        purchaseCost: item.purchase_cost,
        authenticityStatus: item.authenticity_status,
        notes: item.notes,
        imageUrl: item.pin.image_url,
      }));

    setCollectionPins(pins);
    setCollectionLoading(false);
  }

  loadCollection();
}, [session, collectionRefresh]);


  async function testSupabaseConnection() {
    if (isDemoMode || !supabase) {
      setConnectionStatus("Demo mode — credentials not loaded");
      return;
    }
  
    const { data, error } = await supabase.auth.getSession();
  
    if (error) {
      setConnectionStatus(`Supabase error: ${error.message}`);
      return;
    }
  
    setConnectionStatus(
      data.session
        ? "Supabase connected — user session found."
        : "Supabase connected — no user signed in yet. Login setup is next."
    );
  }
  

  const navigate = (id) => { setPage(id); setMobileMenuOpen(false); };
  const currentIcon = navItems.find(n => n.id === page)?.icon || MoreHorizontal;
  if (!authReady) {
    return <p style={{ padding: 24 }}>Loading Pinfolio...</p>;
  }
  
  if (!session) {
    return <AuthScreen />;
  }

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
        <header className="topbar"><button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><div className="breadcrumb"><span>Pinfolio</span><ChevronRight size={15} /><strong>{page}</strong></div><div className="topbar-actions"><span className="sync-status"><span className="status-dot"></span>{isDemoMode ? "Preview mode" : "Connected"}</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /></button><div
  className="avatar top-avatar"
  title={userEmail}
  aria-label={`Signed in as ${userEmail}`}
>
  {userEmail.slice(0, 1).toUpperCase()}
</div></div></header>
        <div className="page-content">
        {/* Temporary Supabase connection test */}
        <div style={{ padding: 16 }}>
          <button onClick={testSupabaseConnection}>
            Test Supabase connection
          </button>
          <p>{connectionStatus}</p>
        </div>

        {page === "Dashboard" && <Dashboard setPage={navigate} />}
        {page === "Collection" && (
          <Collection
          search={search}
          setSearch={setSearch}
          setSelectedPin={setSelectedPin}
          pins={collectionPins}
          loading={collectionLoading}
          onAddPin={() => setShowAddPin(true)}
        />
        )}
        {page === "Traders" && <Traders />}
        {page === "Wishlist" && (
          <Wishlist
            wishlistItems={wishlistItems}
            loading={wishlistLoading}
            error={wishlistError}
            onAdd={() => setShowWishlistAdd(true)}
          />
        )}
        {page === "More" && <MorePage setPage={navigate} />}
        <footer className="footer"><span>Pinfolio · Personal pin collection tracker</span><span><LockKeyhole size={13} /> Private by default</span></footer>
      </div>
        <nav className="mobile-bottom-nav">{navItems.map(item => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => navigate(item.id)}><item.icon size={20} /><span>{item.id}</span></button>)}</nav>
      </main>
      <PinDetail
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        onEdit={(pin) => {
          setEditingPin(pin);
          setSelectedPin(null);
        }}
        onRemove={(pin) => {
          setEditingPin(pin);
        }}
      />
      {showAddPin && (
      <AddPinForm
        userId={session.user.id}
        onClose={() => setShowAddPin(false)}
        onSaved={() => {
          setShowAddPin(false);
          setCollectionRefresh((value) => value + 1);
        }}
      />
      )}
      {editingPin && (
        <EditPinForm
          pin={editingPin}
          onClose={() => setEditingPin(null)}
          onSaved={() => {
            setEditingPin(null);
            setSelectedPin(null);
            setCollectionRefresh((value) => value + 1);
          }}
          onRemove={() => {
            setEditingPin(null);
            setSelectedPin(null);
            setCollectionRefresh((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}
