import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, GalleryVerticalEnd, Repeat2, Heart, MoreHorizontal,
  Search, Bell, Plus, ChevronRight, ArrowUpRight, LockKeyhole,
  SlidersHorizontal, Sparkles, ShieldCheck, Menu, X, CircleHelp,
  Settings, Layers3, ChartNoAxesCombined, ImagePlus, EyeOff, Clock3,
  CheckCircle2, Handshake, ArrowRightLeft, Palette, Check
} from "lucide-react";
import { supabase, isDemoMode } from "../lib/supabase";


export function PinArt({ pin, small = false }) {
  return (
    <div
      className={`pin-art ${pin.color || "navy"} ${small ? "pin-art-small" : ""}`}
      aria-label={`${pin.name} pin artwork`}
    >
      {pin.imageUrl ? (
        <img
          src={pin.imageUrl}
          alt={pin.name}
          className="pin-photo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <div className="pin-art-ring">
          <span>{pin.symbol || "✦"}</span>
        </div>
      )}
    </div>
  );
}


export function SectionTitle({ eyebrow, title, subtitle, action, onAction }) {
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

export function StatCard({ icon: Icon, label, value, note, tone = "" }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}


export function AuthenticityBadge({ status }) {
  const labels = {
    unknown: "Authenticity unknown",
    suspected_counterfeit: "Suspected counterfeit",
    confirmed_counterfeit: "Confirmed counterfeit",
    verified_authentic: "Verified authentic",
  };
  const value = status || "unknown";
  return <span className={`authenticity-badge authenticity-${value}`} title="Personal authenticity assessment, not an official authentication">{labels[value] || value.replaceAll("_", " ")}</span>;
}

export function PinCard({ pin, onClick, onEdit }) {
  return (
    <article className="pin-card">
      <button
        className="pin-image-button"
        onClick={onClick}
        aria-label={`View ${pin.name}`}
      >
        <PinArt pin={pin} />
        {pin.visibility !== "public" && (
          <span className="privacy-dot" title={pin.visibility === "friends" ? "Shared with friends" : "Private"}>
            <LockKeyhole size={13} />
          </span>
        )}
      </button>

      <div className="pin-card-body">
        <div className="pin-card-title">{pin.name}</div>
        <div className="pin-card-subtitle">{pin.set}</div>
        <AuthenticityBadge status={pin.authenticityStatus} />

        <div className="pin-card-footer">
          <span className="quantity">Owned ×{pin.owned}</span>
          {pin.tradeable > 0 ? (
            <span className="tradeable-label">
              {pin.tradeable} tradeable
            </span>
          ) : (
            <span className="kept-label">Keeping</span>
          )}
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
        >
          Edit
        </button>
      </div>
    </article>
  );
}


export function Dashboard({ setPage, pins = [], wishlistItems = [], loading = false }) {
  const owned = pins.reduce((sum, pin) => sum + Number(pin.owned || 0), 0);
  const tradeable = pins.reduce((sum, pin) => sum + Number(pin.tradeable || 0), 0);
  const costTotal = pins.reduce((sum, pin) => sum + (Number(pin.purchaseCost) || 0), 0);
  const setCount = new Set(pins.map(pin => pin.set).filter(Boolean)).size;
  const matches = wishlistItems.filter(wish => pins.some(pin => pin.id === wish.pinId));
  return (
    <>
      {isDemoMode && <div className="demo-banner"><Sparkles size={15} /> Preview mode · configure Supabase to save your collection</div>}
      <div className="welcome-panel">
        <div className="welcome-copy">
          <div className="eyebrow light">YOUR COLLECTION, IN ONE PLACE</div>
          <h1>A little magic,<br /><em>well organized.</em></h1>
          <p>Keep track of your pins, find your next favorite, and make trading with friends easier.</p>
          <button className="button button-gold" onClick={() => setPage("Collection")}><Plus size={17} /> Explore collection</button>
        </div>
        <div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-star">✦</div><div className="hero-moon">☾</div><div className="hero-spark">✧</div></div>
      </div>
      <div className="stat-grid">
        <StatCard icon={GalleryVerticalEnd} label="Pins owned" value={loading ? "…" : owned} note={`${pins.length} unique designs`} tone="tone-blue" />
        <StatCard icon={ChartNoAxesCombined} label="Recorded cost" value={loading ? "…" : `$${costTotal.toFixed(2)}`} note="Based on costs you entered" tone="tone-gold" />
        <StatCard icon={Layers3} label="Collections / sets" value={loading ? "…" : setCount} note="Distinct catalog groups" tone="tone-purple" />
        <StatCard icon={Repeat2} label="Tradeable copies" value={loading ? "…" : tradeable} note="Marked available to trade" tone="tone-green" />
      </div>
      <div className="content-grid dashboard-grid">
        <section className="panel"><div className="panel-heading"><div><h2>Recently added</h2><p>Your latest collection finds</p></div><button className="text-link" onClick={() => setPage("Collection")}>View collection <ChevronRight size={15} /></button></div>
          {loading ? <p>Loading your collection…</p> : pins.length === 0 ? <div className="empty-state"><h3>Your collection starts here</h3><p>Add your first pin to begin tracking your collection.</p><button className="button button-secondary" onClick={() => setPage("Collection")}>Add a pin</button></div> : <div className="recent-list">{pins.slice(0,3).map(pin => <div className="recent-row" key={pin.collectionItemId || pin.id}><PinArt pin={pin} small /><div className="recent-copy"><strong>{pin.name}</strong><span>{pin.set}</span><AuthenticityBadge status={pin.authenticityStatus} /></div><span className="quantity">×{pin.owned}</span></div>)}</div>}
        </section>
        <section className="panel wishlist-panel"><div className="panel-heading"><div><h2>Wishlist</h2><p>Your next pin finds</p></div><Heart size={19} className="muted-icon" /></div>
          {loading ? <p>Loading wishlist…</p> : wishlistItems.length === 0 ? <p>Your wishlist is empty. Add pins you hope to find.</p> : wishlistItems.slice(0,4).map(item => <div className="match-row" key={item.id}><div className="match-check"><Heart size={15} /></div><div className="match-copy"><strong>{item.name}</strong><span>{item.priority || "Medium"} priority</span></div></div>)}
          <button className="button button-secondary button-wide" onClick={() => setPage("Wishlist")}>Open wishlist <ArrowUpRight size={16} /></button>
          {matches.length > 0 && <p className="subtle-count">{matches.length} wishlist item(s) also appear in your collection.</p>}
        </section>
      </div>
    </>
  );
}

export function Collection({
  search,
  setSearch,
  setSelectedPin,
  pins,
  loading,
  onAddPin,
  onEditPin,
}) {
  const [filter, setFilter] = useState("All pins");
  const [authFilter, setAuthFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const filtered = useMemo(() => pins.filter(p => {
    const matchesSearch = `${p.name} ${p.character} ${p.set} ${p.franchise || ""} ${p.park || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All pins" || (filter === "Tradeable" && p.tradeable > 0) || (filter === "Duplicates" && p.owned > 1) || (filter === "Private" && p.visibility === "private") || (filter === "Friends" && p.visibility === "friends") || (filter === "Public" && p.visibility === "public");
    const matchesAuth = authFilter === "all" || (p.authenticityStatus || "unknown") === authFilter;
    return matchesSearch && matchesFilter && matchesAuth;
  }).sort((a,b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "year-new") return (Number(b.releaseYear) || 0) - (Number(a.releaseYear) || 0) || a.name.localeCompare(b.name);
    if (sortBy === "year-old") return (Number(a.releaseYear) || 9999) - (Number(b.releaseYear) || 9999) || a.name.localeCompare(b.name);
    if (sortBy === "quantity") return (Number(b.owned) || 0) - (Number(a.owned) || 0);
    if (sortBy === "tradeable") return (Number(b.tradeable) || 0) - (Number(a.tradeable) || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }), [pins, search, filter, authFilter, sortBy]);
  return (
    <>
      <SectionTitle
        eyebrow="YOUR PERSONAL ARCHIVE"
        title="My Collection"
        subtitle="Every pin has a place. Keep your collection organized your way."
        action="+ Add pin"
        onAction={onAddPin}
      />
      <button className="button button-gold mobile-add-pin" type="button" onClick={onAddPin}>
        + Add pin
      </button>
      <div className="toolbar">
        <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pins, characters, sets..." /></div>
        <label className="toolbar-select"><SlidersHorizontal size={15}/><span className="sr-only">Sort collection</span><select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort collection"><option value="recent">Recently added</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="year-new">Release year: newest</option><option value="year-old">Release year: oldest</option><option value="quantity">Most owned</option><option value="tradeable">Most tradeable</option></select></label>
      </div>
      <div className="filter-chips">{["All pins", "Tradeable", "Duplicates", "Private", "Friends", "Public"].map(f => <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <div className="catalog-refine-row"><label>Authenticity <select value={authFilter} onChange={e => setAuthFilter(e.target.value)}><option value="all">Any status</option><option value="unknown">Unknown</option><option value="verified_authentic">Verified authentic</option><option value="suspected_counterfeit">Suspected counterfeit</option><option value="confirmed_counterfeit">Confirmed counterfeit</option></select></label><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
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
            onEdit={() => onEditPin(pin)}
          />
        ))}
        </div>
      )}
      <p className="demo-footnote"><LockKeyhole size={14} /> Sharing is controlled by each pin’s visibility setting and enforced by Supabase row-level security.</p>
    </>
  );
}


export function Traders() {
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [traderPins, setTraderPins] = useState([]);
  const [myPins, setMyPins] = useState([]);
  const [incomingTrades, setIncomingTrades] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [offerListing, setOfferListing] = useState(null);
  const [offerPinId, setOfferPinId] = useState("");
  const [offerSelections, setOfferSelections] = useState([]);
  const [requestSelections, setRequestSelections] = useState([]);
  const [exchangeGivenItems, setExchangeGivenItems] = useState([]);
  const [exchangeReceivedItems, setExchangeReceivedItems] = useState([]);
  const [offerPinView, setOfferPinView] = useState("collection");
  const [offerQuantity, setOfferQuantity] = useState("1");
  const [requestQuantity, setRequestQuantity] = useState("1");
  const [offerMessage, setOfferMessage] = useState("");
  const [savingOffer, setSavingOffer] = useState(false);
  const [counterTradeId, setCounterTradeId] = useState(null);
  const [wishlistMatches, setWishlistMatches] = useState([]);
  const [notificationItems, setNotificationItems] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [outsideExchangeOpen, setOutsideExchangeOpen] = useState(false);
  const [exchangeGivenId, setExchangeGivenId] = useState("");
  const [exchangeGivenQty, setExchangeGivenQty] = useState("1");
  const [exchangeReceivedMode, setExchangeReceivedMode] = useState("existing");
  const [exchangeReceivedId, setExchangeReceivedId] = useState("");
  const [exchangeNewName, setExchangeNewName] = useState("");
  const [exchangeNewSet, setExchangeNewSet] = useState("");
  const [exchangeNewCharacter, setExchangeNewCharacter] = useState("");
  const [exchangeNewImage, setExchangeNewImage] = useState("");
  const [exchangeReceivedQty, setExchangeReceivedQty] = useState("1");
  const [savingExchange, setSavingExchange] = useState(false);
  const [catalogPins, setCatalogPins] = useState([]);

  async function loadTraderData() {
    if (!supabase || isDemoMode) {
      setLoading(false);
      setError("Connect Supabase and sign in to use real trader features.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) throw new Error("Please sign in again.");
      setCurrentUserId(user.id);

      const [requestResult, ownPinsResult, tradeResult] = await Promise.all([
        supabase.from("friend_requests")
          .select("id,sender_id,receiver_id,status,created_at")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
        supabase.from("collection_items")
          .select("id,pin_id,owned_quantity,tradeable_quantity,pin:pins(id,name,franchise,park,image_url,image_path,character_name)")
          .eq("user_id", user.id)
          .gt("owned_quantity", 0),
        supabase.from("trades")
          .select("id,proposer_id,recipient_id,status,message,created_at,updated_at,proposer_confirmed,recipient_confirmed,trade_items(id,owner_id,pin_id,quantity,item_type,pin:pins(id,name,franchise,park,image_url,image_path,character_name,release_year))")
          .or(`proposer_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);
      if (requestResult.error) throw requestResult.error;
      if (ownPinsResult.error) throw ownPinsResult.error;
      if (tradeResult.error) throw tradeResult.error;

      const requests = requestResult.data || [];
      setFriendRequests(requests);
      const resolvedMyPins = await Promise.all((ownPinsResult.data || []).filter(row => row.pin).map(async row => {
        let imageUrl = row.pin.image_url || null;
        if (row.pin.image_path) {
          const { data: signed, error: signedError } = await supabase.storage.from("pin-images").createSignedUrl(row.pin.image_path, 60 * 60);
          if (!signedError && signed?.signedUrl) imageUrl = signed.signedUrl;
        }
        return {
          id: row.pin_id, collectionItemId: row.id, name: row.pin.name,
          imageUrl, character: row.pin.character_name || "",
          set: row.pin.franchise || row.pin.park || "Uncategorized",
          owned: row.owned_quantity, tradeable: row.tradeable_quantity,
        };
      }));
      setMyPins(resolvedMyPins);
      const resolvedTrades = await Promise.all((tradeResult.data || []).map(async trade => ({
        ...trade,
        trade_items: await Promise.all((trade.trade_items || []).map(async item => {
          if (!item.pin) return item;
          let image_url = item.pin.image_url || null;
          if (item.pin.image_path) {
            const { data: signed, error: signedError } = await supabase.storage.from("pin-images").createSignedUrl(item.pin.image_path, 60 * 60);
            if (!signedError && signed?.signedUrl) image_url = signed.signedUrl;
          }
          return { ...item, pin: { ...item.pin, image_url } };
        }))
      })));
      setIncomingTrades(resolvedTrades);
      const [matchesResult, notificationsResult, catalogResult] = await Promise.all([
        supabase.rpc("get_friend_wishlist_matches"),
        supabase.from("notifications").select("id,kind,title,body,created_at,read_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("pins").select("id,name,franchise,park,image_url,image_path,character_name").order("name").limit(5000),
      ]);
      if (!catalogResult.error) {
        const resolvedCatalog = await Promise.all((catalogResult.data || []).map(async pin => {
          let imageUrl = pin.image_url || null;
          if (pin.image_path) {
            const { data: signed, error: signedError } = await supabase.storage.from("pin-images").createSignedUrl(pin.image_path, 60 * 60);
            if (!signedError && signed?.signedUrl) imageUrl = signed.signedUrl;
          }
          return { ...pin, imageUrl };
        }));
        setCatalogPins(resolvedCatalog);
      }
      if (!matchesResult.error) setWishlistMatches(matchesResult.data || []);
      if (!notificationsResult.error) setNotificationItems(notificationsResult.data || []);

      const acceptedIds = [...new Set(requests.filter(r => r.status === "accepted")
        .map(r => r.sender_id === user.id ? r.receiver_id : r.sender_id))];
      if (acceptedIds.length) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles").select("id,username,display_name,avatar_url").in("id", acceptedIds);
        if (profileError) throw profileError;
        setFriends(profiles || []);
        const { data: listings, error: listingError } = await supabase.rpc("get_shared_trader_listings", { p_user_ids: acceptedIds });
        if (listingError) throw listingError;
        const byId = new Map((profiles || []).map(profile => [profile.id, profile]));
        const signedListings = await Promise.all((listings || []).map(async row => {
          let imageUrl = row.image_url || null;
          if (row.image_path) {
            const { data: signedData, error: signedError } = await supabase.storage.from("pin-images").createSignedUrl(row.image_path, 60 * 60);
            if (!signedError && signedData?.signedUrl) imageUrl = signedData.signedUrl;
          }
          return {
            id: row.collection_item_id, ownerId: row.owner_id, pinId: row.pin_id,
            quantity: row.tradeable_quantity, visibility: row.visibility,
            name: row.pin_name, character: row.character_name,
            set: row.franchise || row.park || "Uncategorized",
            imageUrl, releaseYear: row.release_year,
            owner: byId.get(row.owner_id) || { username: row.username, display_name: row.display_name },
          };
        }));
        setTraderPins(signedListings);
      } else {
        setFriends([]);
        setTraderPins([]);
      }
    } catch (loadError) {
      console.error("Could not load trader data:", loadError);
      setError(loadError.message || "Couldn't load trader information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTraderData(); }, []);

  async function searchTrader(event) {
    event.preventDefault();
    setFoundUser(null);
    setSearchMessage("");
    setNotice("");
    const normalized = username.trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9_.-]{2,30}$/.test(normalized)) {
      setSearchMessage("Enter a username between 2 and 30 characters (letters, numbers, ., _ or -).");
      return;
    }
    if (!supabase) return;
    setSearching(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("find-trading-user", {
        body: { username: normalized },
      });
      if (invokeError) {
        let detail = invokeError.message;
        try { const payload = await invokeError.context?.json(); if (payload?.error) detail = payload.error; } catch {}
        throw new Error(detail);
      }
      setFoundUser(data?.user || null);
      setSearchMessage(data?.message || (data?.user ? "Trader found." : "No matching trader found."));
    } catch (searchError) {
      setSearchMessage(searchError.message || "Username search failed.");
    } finally { setSearching(false); }
  }

  async function sendFriendRequest(profile) {
    if (!supabase || !currentUserId || !profile) return;
    setNotice(""); setSearchMessage("");
    const existing = friendRequests.find(r =>
      [r.sender_id, r.receiver_id].includes(profile.id) && r.status === "pending"
    );
    if (existing && existing.receiver_id === currentUserId) {
      setSearchMessage("This person has already sent you a request. Accept it in Friend requests below.");
      return;
    }
    if (existing) { setSearchMessage("You've already sent this person a request."); return; }
    if (friends.some(friend => friend.id === profile.id)) { setSearchMessage("You're already friends."); return; }
    const { error: insertError } = await supabase.from("friend_requests").insert({ sender_id: currentUserId, receiver_id: profile.id });
    if (insertError) {
      setSearchMessage(insertError.code === "23505" ? "A pending request or friendship already exists." : insertError.message);
      return;
    }
    setNotice(`Friend request sent to @${profile.username}.`);
    await loadTraderData();
  }

  async function respondToFriend(requestId, response) {
    setError(""); setNotice("");
    const { error: rpcError } = await supabase.rpc("respond_to_friend_request", {
      p_request_id: requestId, p_response: response,
    });
    if (rpcError) { setError(rpcError.message); return; }
    setNotice(response === "accepted" ? "Friend request accepted." : "Friend request declined.");
    await loadTraderData();
  }

  async function createOffer(event) {
    event.preventDefault();
    const offeredItems = offerSelections.filter(item => Number(item.quantity) > 0);
    const requestedItems = requestSelections.filter(item => Number(item.quantity) > 0);
    if (!offerListing || !offeredItems.length || !requestedItems.length) {
      setError("Choose at least one pin to offer and one pin to request."); return;
    }
    setSavingOffer(true); setError(""); setNotice("");
    const rpcName = counterTradeId ? "counteroffer_trade_multi" : "create_trade_proposal_multi";
    const rpcArgs = counterTradeId ? {
      p_trade_id: counterTradeId, p_offered_items: offeredItems, p_requested_items: requestedItems,
      p_message: offerMessage.trim() || "Counteroffer",
    } : {
      p_recipient_id: offerListing.ownerId, p_offered_items: offeredItems, p_requested_items: requestedItems,
      p_message: offerMessage.trim() || null,
    };
    const { error: offerError } = await supabase.rpc(rpcName, rpcArgs);
    setSavingOffer(false);
    if (offerError) { setError(offerError.message); return; }
    setNotice(counterTradeId ? "Multi-pin counteroffer sent." : "Multi-pin trade proposal sent. The other trader must accept it before either person confirms completion.");
    setOfferListing(null); setCounterTradeId(null); setOfferPinId(""); setOfferSelections([]); setRequestSelections([]); setOfferMessage("");
    await loadTraderData();
  }

  function toggleTradeSelection(setter, selections, pinId, defaultQuantity = 1) {
    setter(selections.some(item => String(item.pin_id) === String(pinId))
      ? selections.filter(item => String(item.pin_id) !== String(pinId))
      : [...selections, { pin_id: pinId, quantity: defaultQuantity }]);
  }

  function updateTradeSelectionQuantity(setter, selections, pinId, quantity) {
    setter(selections.map(item => String(item.pin_id) === String(pinId) ? { ...item, quantity: Number(quantity) } : item));
  }

  async function recordOutsideExchange(event) {
    event.preventDefault();
    const givenItems = exchangeGivenItems.filter(item => item.pin_id && Number(item.quantity) > 0);
    const receivedItems = exchangeReceivedItems.filter(item => (item.mode === "new" ? item.name?.trim() : item.pin_id) && Number(item.quantity) > 0);
    if (!givenItems.length || !receivedItems.length) { setError("Add at least one pin you gave and one pin you received."); return; }
    setSavingExchange(true); setError(""); setNotice("");
    try {
      const { error: exchangeError } = await supabase.rpc("record_outside_pin_exchange_multi", {
        p_given_items: givenItems.map(item => ({ pin_id: item.pin_id, quantity: Number(item.quantity) })),
        p_received_items: receivedItems.map(item => item.mode === "new" ? ({ quantity: Number(item.quantity), new_pin: { name: item.name.trim(), franchise: item.franchise?.trim() || null, character_name: item.character_name?.trim() || null, image_url: item.image_url?.trim() || null } }) : ({ pin_id: item.pin_id, quantity: Number(item.quantity) }))
      });
      if (exchangeError) throw exchangeError;
      setNotice("Multi-pin exchange recorded. Your collection has been updated."); setOutsideExchangeOpen(false);
      setExchangeGivenItems([]); setExchangeReceivedItems([]);
      await loadTraderData();
    } catch (exchangeError) { setError(exchangeError.message || "Could not record this exchange."); }
    finally { setSavingExchange(false); }
  }

  async function respondToTrade(tradeId, response) {
    const { error: rpcError } = await supabase.rpc("respond_to_trade", { p_trade_id: tradeId, p_response: response });
    if (rpcError) { setError(rpcError.message); return; }
    setNotice(response === "accepted" ? "Trade accepted. Pins transfer only after both traders confirm." : "Trade declined.");
    await loadTraderData();
  }

  async function confirmTrade(tradeId) {
    const { data, error: rpcError } = await supabase.rpc("confirm_trade_completion", { p_trade_id: tradeId });
    if (rpcError) { setError(rpcError.message); return; }
    setNotice(data === "completed" ? "Trade completed and inventory transferred." : "Your confirmation is saved. Waiting for the other trader.");
    await loadTraderData();
  }

  const incomingRequests = friendRequests.filter(r => r.receiver_id === currentUserId && r.status === "pending");
  const outgoingRequests = friendRequests.filter(r => r.sender_id === currentUserId && r.status === "pending");

  return (
    <>
      <SectionTitle eyebrow="TRADE WITH YOUR CIRCLE" title="Friends' Traders" subtitle="Find collectors, choose what you share, and propose trades." />
      {error && <p className="inline-alert" role="alert">{error}</p>}
      {notice && <p className="inline-success" role="status">{notice}</p>}
      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-heading"><div><h2>Notifications</h2><p>Recent trade and friend activity.</p></div><button className="button button-secondary" onClick={async () => { setShowNotifications(v => !v); if (currentUserId && notificationItems.some(n => !n.read_at)) { const ids = notificationItems.filter(n => !n.read_at).map(n => n.id); await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids); setNotificationItems(items => items.map(n => ({...n, read_at: n.read_at || new Date().toISOString()}))); } }}>{showNotifications ? "Hide" : `View (${notificationItems.filter(n => !n.read_at).length} unread)`}</button></div>
        {showNotifications && (notificationItems.length ? <div className="recent-list">{notificationItems.map(n => <div className="recent-row" key={n.id}><div className="recent-copy"><strong>{n.title}</strong><span>{n.body}</span><span className="subtle-count">{new Date(n.created_at).toLocaleString()}</span></div></div>)}</div> : <p>No notifications yet.</p>)}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-heading"><div><h2>Wishlist matches</h2><p>Friends currently have pins on your wishlist available to trade.</p></div><Heart size={19} /></div>
        {wishlistMatches.length === 0 ? <p className="subtle-count">No matches yet. Add pins to your wishlist and ask friends to share tradeable copies.</p> : <div className="recent-list">{wishlistMatches.map((match) => <div className="recent-row" key={`${match.owner_id}-${match.pin_id}`}><div className="recent-copy"><strong>{match.pin_name}</strong><span>{match.franchise || match.park || "Pin collection"} · {match.tradeable_quantity} tradeable</span><span className="subtle-count">@{match.username || match.display_name || "friend"} · {match.priority || "normal"} priority</span></div></div>)}</div>}
      </section>
      <section className="panel trader-search-panel">
        <div className="panel-heading"><div><h2>Find a trader</h2><p>Search by their unique Pinfolio username.</p></div><Search size={20} /></div>
        <form className="trader-search-form" onSubmit={searchTrader}>
          <label className="sr-only" htmlFor="trader-username">Username</label>
          <input id="trader-username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username (e.g. pinfan_24)" maxLength={30} />
          <button className="button button-gold" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </form>
        {searchMessage && <p className="search-result-message" role="status">{searchMessage}</p>}
        {foundUser && <div className="found-trader"><div className="avatar">{foundUser.avatar_url ? <img src={foundUser.avatar_url} alt="" /> : (foundUser.display_name || foundUser.username || "P").slice(0,1).toUpperCase()}</div><div className="recent-copy"><strong>{foundUser.display_name || foundUser.username}</strong><span>@{foundUser.username}</span></div><button className="button button-secondary" onClick={() => sendFriendRequest(foundUser)}>Add friend</button></div>}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-heading"><div><h2>Friend requests</h2><p>Accept a request before sharing trader listings.</p></div><Handshake size={20} /></div>
        {loading ? <p>Loading requests…</p> : incomingRequests.length === 0 && outgoingRequests.length === 0 ? <p>No pending friend requests.</p> : <div className="recent-list">
          {incomingRequests.map(request => <FriendRequestRow key={request.id} request={request} currentUserId={currentUserId} onRespond={respondToFriend} />)}
          {outgoingRequests.map(request => <FriendRequestRow key={request.id} request={request} currentUserId={currentUserId} />)}
        </div>}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-heading"><div><h2>Your friends</h2><p>{friends.length} accepted {friends.length === 1 ? "connection" : "connections"}</p></div><ShieldCheck size={20} /></div>
        {loading ? <p>Loading friends…</p> : friends.length === 0 ? <p>Once someone accepts your friend request, their shared trader pins will appear here.</p> : <div className="friend-strip">{friends.map(friend => <div className="friend-chip" key={friend.id}><div className="avatar">{friend.avatar_url ? <img src={friend.avatar_url} alt="" /> : (friend.display_name || friend.username || "P").slice(0,1).toUpperCase()}</div><div><strong>{friend.display_name || friend.username}</strong><span>@{friend.username}</span></div></div>)}</div>}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-heading"><div><h2>Exchange outside Pinfolio</h2><p>Record an in-person trade, gift, or exchange without needing the other person's account.</p></div><ArrowRightLeft size={20} /></div>
        <button className="button button-primary" onClick={() => { setOutsideExchangeOpen(true); setExchangeGivenItems([{ pin_id: myPins[0]?.id || "", quantity: 1 }]); setExchangeReceivedItems([{ mode: "existing", pin_id: "", quantity: 1, name: "", franchise: "", character_name: "", image_url: "" }]); }}>Record an exchange</button>
      </section>

      <div className="trader-heading"><h2>Available to trade</h2><span className="subtle-count">Shared by your friends</span></div>
      {loading ? <p>Loading shared pins…</p> : traderPins.length === 0 ? <div className="empty-state"><h3>No shared pins yet</h3><p>Ask a friend to set one of their collection pins to “Friends” or “Public” visibility and mark at least one copy tradeable.</p></div> : <div className="pin-grid">{traderPins.map(listing => <article className="pin-card trader-card" key={listing.id}><div className="pin-image-button"><PinArt pin={{ name: listing.name, imageUrl: listing.imageUrl }} /><span className="trade-badge">Tradeable ×{listing.quantity}</span></div><div className="pin-card-body"><div className="pin-card-title">{listing.name}</div><div className="pin-card-subtitle">{listing.set}</div><div className="owner-row"><div className="avatar avatar-small">{listing.owner?.avatar_url ? <img src={listing.owner.avatar_url} alt="" /> : (listing.owner?.display_name || listing.owner?.username || "P").slice(0,1).toUpperCase()}</div><span>@{listing.owner?.username || "trader"}</span></div><button className="button button-secondary button-wide" onClick={() => { setOfferListing(listing); setOfferPinView("collection"); setOfferPinId(""); setOfferSelections([]); setRequestSelections([{ pin_id: listing.pinId, quantity: 1 }]); setOfferQuantity("1"); setRequestQuantity("1"); setOfferMessage(""); }}>Propose trade <ArrowRightLeft size={15} /></button></div></article>)}</div>}

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-heading"><div><h2>Trade history</h2><p>Active proposals and completed or declined trades.</p></div><ArrowRightLeft size={20} /></div>
        {loading ? <p>Loading trades…</p> : incomingTrades.length === 0 ? <p>No active trade proposals.</p> : <div className="recent-list">{incomingTrades.map(trade => <div className="recent-row trade-request-row" key={trade.id}><div className="recent-copy"><strong>{trade.proposer_id === currentUserId ? "Trade you proposed" : "Incoming trade"}</strong><span>{trade.message || "No message included."}</span><span className="subtle-count">{new Date(trade.created_at).toLocaleString()}</span><span className="subtle-count">{trade.status === "pending" ? (trade.recipient_id === currentUserId ? "Waiting for your response" : "Waiting for recipient") : `Your confirmation: ${(trade.proposer_id === currentUserId ? trade.proposer_confirmed : trade.recipient_confirmed) ? "confirmed" : "not yet confirmed"}`}</span><div className="trade-item-card-grid">{(trade.trade_items || []).map(item => <article className="trade-item-card" key={item.id}><div className="trade-item-image"><PinArt pin={{name:item.pin?.name || "Pin", imageUrl:item.pin?.image_url || null}} small /></div><div className="trade-item-copy"><span className="trade-item-type">{item.item_type === "offered" ? "OFFERED" : "REQUESTED"}</span><strong>{item.pin?.name || "Pin"}</strong><span>{item.pin?.franchise || item.pin?.park || "Pin collection"}</span><span>Quantity ×{item.quantity}</span></div></article>)}</div></div>{trade.status === "pending" && trade.recipient_id === currentUserId ? <><button className="button button-primary" onClick={() => respondToTrade(trade.id, "accepted")}>Accept</button><button className="button button-secondary" onClick={() => respondToTrade(trade.id, "declined")}>Decline</button><button className="button button-secondary" onClick={() => { const offered = (trade.trade_items || []).find(i => i.item_type === "offered"); if (!offered) return; setCounterTradeId(trade.id); setOfferPinView("collection"); const otherId = trade.proposer_id === currentUserId ? trade.recipient_id : trade.proposer_id; const firstRequested = (trade.trade_items || []).find(i => i.item_type === "offered" && i.owner_id === otherId); setOfferListing({ ownerId: otherId, pinId: firstRequested?.pin_id || offered.pin_id, name: firstRequested?.pin?.name || offered.pin?.name || "their pin", quantity: firstRequested?.quantity || offered.quantity, owner: { username: "trader" } }); setOfferPinId(""); setOfferSelections([]); setRequestSelections([]); setOfferQuantity("1"); setRequestQuantity("1"); setOfferMessage("Counteroffer"); }}>Counteroffer</button></> : trade.status === "accepted" ? <button className="button button-primary" disabled={trade.proposer_id === currentUserId ? trade.proposer_confirmed : trade.recipient_confirmed} onClick={() => confirmTrade(trade.id)}>{(trade.proposer_id === currentUserId ? trade.proposer_confirmed : trade.recipient_confirmed) ? "Confirmed" : "Confirm completion"}</button> : <span className="trade-status-label">{trade.status}</span>}</div>)}</div>}
      </section>

      {outsideExchangeOpen && <div className="modal-backdrop" onClick={() => setOutsideExchangeOpen(false)}><div className="modal multi-trade-modal" role="dialog" aria-modal="true" aria-labelledby="outside-exchange-title" onClick={e => e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">COLLECTION EXCHANGE</span><h2 id="outside-exchange-title">Record an exchange</h2><p>Add multiple pins given and received. Both sides save together.</p></div><button className="icon-button" type="button" onClick={() => setOutsideExchangeOpen(false)} aria-label="Close">×</button></div><form onSubmit={recordOutsideExchange}><h3>Pins you gave away</h3>{exchangeGivenItems.map((item,index) => <div className="exchange-multi-row" key={`given-${index}`}><div className="exchange-row-fields"><label>Pin<select value={item.pin_id} onChange={e => setExchangeGivenItems(items => items.map((row,i) => i===index ? {...row,pin_id:e.target.value} : row))} required><option value="">Choose from collection</option>{myPins.map(pin => <option key={pin.id} value={pin.id}>{pin.name} — owned {pin.owned}</option>)}</select></label><label>Quantity<input type="number" min="1" max={myPins.find(pin => pin.id===item.pin_id)?.owned || 1} value={item.quantity} onChange={e => setExchangeGivenItems(items => items.map((row,i) => i===index ? {...row,quantity:Number(e.target.value)} : row))} required /></label></div><button type="button" className="button button-secondary" disabled={exchangeGivenItems.length===1} onClick={() => setExchangeGivenItems(items => items.filter((_,i)=>i!==index))}>Remove</button></div>)}<button type="button" className="button button-secondary" onClick={() => setExchangeGivenItems(items => [...items,{pin_id:"",quantity:1}])}>+ Add another pin given</button>
        <h3>Pins you received</h3>{exchangeReceivedItems.map((item,index) => <div className="exchange-multi-row" key={`received-${index}`}><div className="choice-row"><label><input type="radio" checked={item.mode==="existing"} onChange={() => setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,mode:"existing"}:row))} /> Existing catalog pin</label><label><input type="radio" checked={item.mode==="new"} onChange={() => setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,mode:"new"}:row))} /> Create new</label></div>{item.mode==="existing" ? <label>Received pin<select value={item.pin_id} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,pin_id:e.target.value}:row))} required><option value="">Choose catalog pin</option>{catalogPins.map(pin=><option key={pin.id} value={pin.id}>{pin.name} — {pin.franchise || pin.park || "Uncategorized"}</option>)}</select></label> : <div className="exchange-row-fields"><label>Pin name<input value={item.name} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,name:e.target.value}:row))} required /></label><label>Set / franchise<input value={item.franchise} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,franchise:e.target.value}:row))} /></label><label>Character<input value={item.character_name} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,character_name:e.target.value}:row))} /></label><label>Image URL<input type="url" value={item.image_url} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,image_url:e.target.value}:row))} placeholder="https://…" /></label></div>}<label>Quantity received<input type="number" min="1" value={item.quantity} onChange={e=>setExchangeReceivedItems(items=>items.map((row,i)=>i===index?{...row,quantity:Number(e.target.value)}:row))} required /></label><button type="button" className="button button-secondary" disabled={exchangeReceivedItems.length===1} onClick={()=>setExchangeReceivedItems(items=>items.filter((_,i)=>i!==index))}>Remove received pin</button></div>)}<button type="button" className="button button-secondary" onClick={()=>setExchangeReceivedItems(items=>[...items,{mode:"existing",pin_id:"",quantity:1,name:"",franchise:"",character_name:"",image_url:""}])}>+ Add another pin received</button><div className="modal-actions"><button type="button" onClick={()=>setOutsideExchangeOpen(false)}>Cancel</button><button type="submit" disabled={savingExchange || !exchangeGivenItems.some(i=>i.pin_id) || !exchangeReceivedItems.length}>{savingExchange?"Saving…":"Complete exchange"}</button></div></form></div></div>}
      {offerListing && <div className="modal-backdrop" onClick={() => { setOfferListing(null); setCounterTradeId(null); }}><div className="modal multi-trade-modal" role="dialog" aria-modal="true" aria-labelledby="offer-trade-title" onClick={e => e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">TRADE PROPOSAL</span><h2 id="offer-trade-title">{counterTradeId ? "Make a counteroffer" : "Offer a trade"}</h2><p>Trading with @{offerListing.owner?.username || "your friend"}. Select multiple pins on either side.</p></div><button className="icon-button" type="button" onClick={() => { setOfferListing(null); setCounterTradeId(null); }} aria-label="Close">×</button></div><form onSubmit={createOffer}>
        <h3>What you're offering</h3><div className="offer-pin-view-tabs" role="group" aria-label="Filter your pins"><button type="button" className={offerPinView === "collection" ? "button button-primary" : "button button-secondary"} onClick={() => setOfferPinView("collection")}>My collection</button><button type="button" className={offerPinView === "tradable" ? "button button-primary" : "button button-secondary"} onClick={() => setOfferPinView("tradable")}>Tradable pins</button><button type="button" className={offerPinView === "all" ? "button button-primary" : "button button-secondary"} onClick={() => setOfferPinView("all")}>All pins</button></div>
        <div className="offer-pin-card-grid">{(offerPinView === "all" ? catalogPins.map(pin => { const owned = myPins.find(m => m.id === pin.id); return { ...pin, imageUrl: pin.imageUrl || pin.image_url || null, set: pin.franchise || pin.park || "Uncategorized", owned: owned?.owned || 0, tradeable: owned?.tradeable || 0 }; }) : offerPinView === "tradable" ? myPins.filter(pin => pin.tradeable > 0) : myPins).map(pin => { const selectable = pin.owned > 0; const selected = offerSelections.some(item => String(item.pin_id) === String(pin.id)); const selection = offerSelections.find(item => String(item.pin_id) === String(pin.id)); return <div key={pin.id} className={`offer-pin-card${selected ? " selected" : ""}${!selectable ? " unavailable" : ""}`}><button type="button" disabled={!selectable} className="offer-pin-card-select" onClick={() => toggleTradeSelection(setOfferSelections, offerSelections, pin.id)} aria-pressed={selected}><div className="offer-pin-card-image"><PinArt pin={{name:pin.name, imageUrl:pin.imageUrl || pin.image_url || null}} small /></div><strong>{pin.name}</strong><span>{pin.set || pin.franchise || pin.park || "Uncategorized"}</span><span>{selectable ? `${pin.owned} owned` : "Not in your collection"}</span><span>{selected ? "✓ Selected" : "Select pin"}</span></button>{selected && <label className="multi-quantity">Quantity <input aria-label={`Quantity of ${pin.name} offered`} type="number" min="1" max={pin.owned} value={selection.quantity} onChange={e => updateTradeSelectionQuantity(setOfferSelections, offerSelections, pin.id, e.target.value)} required /></label>}</div>; })}</div>
        <h3>What you want in return</h3><p className="subtle-count">Choose one or more pins from this friend's available listings. Each must be marked tradeable by its owner.</p><div className="offer-pin-card-grid">{traderPins.filter(pin => pin.ownerId === offerListing.ownerId).map(pin => { const selected = requestSelections.some(item => String(item.pin_id) === String(pin.pinId)); const selection = requestSelections.find(item => String(item.pin_id) === String(pin.pinId)); return <div key={pin.pinId} className={`offer-pin-card${selected ? " selected" : ""}`}><button type="button" className="offer-pin-card-select" onClick={() => toggleTradeSelection(setRequestSelections, requestSelections, pin.pinId)} aria-pressed={selected}><div className="offer-pin-card-image"><PinArt pin={{name:pin.name, imageUrl:pin.imageUrl}} small /></div><strong>{pin.name}</strong><span>{pin.set || "Pin collection"}</span><span>{pin.quantity} tradeable</span><span>{selected ? "✓ Selected" : "Select pin"}</span></button>{selected && <label className="multi-quantity">Quantity <input aria-label={`Quantity of ${pin.name} requested`} type="number" min="1" max={pin.quantity} value={selection.quantity} onChange={e => updateTradeSelectionQuantity(setRequestSelections, requestSelections, pin.pinId, e.target.value)} required /></label>}</div>; })}</div>
        <label htmlFor="offer-message">Message (optional)</label><textarea id="offer-message" value={offerMessage} onChange={e => setOfferMessage(e.target.value)} rows={3} maxLength={500} placeholder="Add a note for your trading partner" /><div className="multi-trade-summary">Offering {offerSelections.length} pin design(s) · Requesting {requestSelections.length} pin design(s)</div><div className="modal-actions"><button type="button" onClick={() => { setOfferListing(null); setCounterTradeId(null); }}>Cancel</button><button type="submit" disabled={savingOffer || !offerSelections.length || !requestSelections.length}>{savingOffer ? "Sending…" : counterTradeId ? "Send counteroffer" : "Send proposal"}</button></div></form></div></div>}
    </>
  );
}

function FriendRequestRow({ request, currentUserId, onRespond }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const otherId = request.sender_id === currentUserId ? request.receiver_id : request.sender_id;
    let active = true;
    supabase?.from("profiles").select("username,display_name").eq("id", otherId).maybeSingle().then(({data}) => { if (active) setProfile(data); });
    return () => { active = false; };
  }, [request.id, currentUserId, request.sender_id, request.receiver_id]);
  const incoming = request.receiver_id === currentUserId;
  return <div className="recent-row"><div className="recent-copy"><strong>{profile?.display_name || profile?.username || "Pinfolio user"}</strong><span>@{profile?.username || "loading"} · {incoming ? "Sent you a request" : "Request sent"}</span></div>{incoming ? <><button className="button button-primary" onClick={() => onRespond(request.id,"accepted")}>Accept</button><button className="button button-secondary" onClick={() => onRespond(request.id,"declined")}>Decline</button></> : <span className="subtle-count">Pending</span>}</div>;
}


export function Wishlist({
        wishlistItems = [],
        loading = false,
        error = "",
        onAdd,
        onEdit,
        onRemove,
      }) {
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
                <div className="wishlist-item-actions">
                <button type="button" onClick={() => onEdit(item)}>
                  Edit
                </button>
                <button type="button" onClick={() => onRemove(item)}>
                  Remove
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}


const PINFOLIO_THEMES = [
  { id: "classic", name: "Classic", description: "Navy and gold", colors: ["#101b33", "#d7b66a", "#f7f6f2"] },
  { id: "ocean", name: "Ocean", description: "Deep blue and aqua", colors: ["#123047", "#4fc3c7", "#eef7f8"] },
  { id: "rose", name: "Rose", description: "Berry and blush", colors: ["#54283f", "#e7a0b4", "#fff4f6"] },
  { id: "forest", name: "Forest", description: "Evergreen and sage", colors: ["#203d32", "#a5c49a", "#f1f6ef"] },
  { id: "lavender", name: "Lavender", description: "Plum and lilac", colors: ["#3c315e", "#b8a6e3", "#f6f3fc"] },
  { id: "sunset", name: "Sunset", description: "Terracotta and peach", colors: ["#713c32", "#f0a477", "#fff3e9"] },
  { id: "midnight", name: "Midnight", description: "Dark navy and electric blue", colors: ["#101827", "#78a9ff", "#eaf0fa"] },
  { id: "mint", name: "Mint", description: "Teal and soft mint", colors: ["#164e4a", "#75d6bd", "#effaf5"] },
  { id: "cherry", name: "Cherry", description: "Cherry red and rosewater", colors: ["#702632", "#ed8b98", "#fff1f2"] },
  { id: "slate", name: "Slate", description: "Modern charcoal and silver", colors: ["#303944", "#aeb9c5", "#f1f3f5"] },
  { id: "storybook", name: "Storybook", description: "Royal blue and enchanted gold", colors: ["#24356f", "#f2c75c", "#f4f5ff"] },
  { id: "sorcerer", name: "Sorcerer", description: "Red primary, yellow secondary, blue tertiary, with a light blue background", colors: ["#c13a49", "#f4ca35", "#173b78", "#b8dcff"] },
];

export function MorePage({ setPage, session, onAvatarUpdated }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("pinfolio-color-theme") || "classic"; } catch { return "classic"; }
  });
  const [textSize, setTextSize] = useState(() => {
    try { return localStorage.getItem("pinfolio-text-size") || "medium"; } catch { return "medium"; }
  });
  const [cardSize, setCardSize] = useState(() => {
    try { return localStorage.getItem("pinfolio-card-size") || localStorage.getItem("pinfolio-pin-image-size") || "medium"; } catch { return "medium"; }
  });
  const [profile, setProfile] = useState({ username: "", display_name: "", bio: "", avatar_url: "", is_collection_public: false });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [setStats, setSetStats] = useState([]);
  const [costTotal, setCostTotal] = useState(0);

  useEffect(() => {
    const selected = PINFOLIO_THEMES.some(item => item.id === theme) ? theme : "classic";
    document.documentElement.dataset.theme = selected;
    try { localStorage.setItem("pinfolio-color-theme", selected); } catch { /* Theme still applies for this session. */ }
  }, [theme]);

  useEffect(() => {
    const safeTextSize = ["small", "medium", "large"].includes(textSize) ? textSize : "medium";
    const safeCardSize = ["small", "medium", "large"].includes(cardSize) ? cardSize : "medium";
    document.documentElement.dataset.textSize = safeTextSize;
    document.documentElement.dataset.cardSize = safeCardSize;
    try {
      localStorage.setItem("pinfolio-text-size", safeTextSize);
      localStorage.setItem("pinfolio-card-size", safeCardSize);
    } catch { /* Settings still apply for this session. */ }
  }, [textSize, cardSize]);

  useEffect(() => {
    let active = true;
    async function loadProfileAndReports() {
      if (!supabase || !session?.user?.id) { setProfileLoading(false); return; }
      const [profileResult, collectionResult, catalogResult] = await Promise.all([
        supabase.from("profiles").select("username,display_name,bio,avatar_url,is_collection_public").eq("id", session.user.id).maybeSingle(),
        supabase.from("collection_items").select("purchase_cost,pin:pins(franchise,park)").eq("user_id", session.user.id),
        supabase.from("pins").select("id,franchise,park"),
      ]);
      if (!active) return;
      if (profileResult.data) setProfile({ username: profileResult.data.username || "", display_name: profileResult.data.display_name || "", bio: profileResult.data.bio || "", avatar_url: profileResult.data.avatar_url || "", is_collection_public: !!profileResult.data.is_collection_public });
      if (collectionResult.data) setCostTotal(collectionResult.data.reduce((sum,row) => sum + (Number(row.purchase_cost) || 0), 0));
      if (catalogResult.data && collectionResult.data) {
        const groups = new Map();
        for (const pin of catalogResult.data) { const name = pin.franchise || pin.park || "Uncategorized"; groups.set(name, (groups.get(name) || 0) + 1); }
        const ownedIds = new Set(collectionResult.data.map(row => row.pin).filter(Boolean).map(row => row.franchise || row.park || "Uncategorized"));
        setSetStats([...groups.entries()].map(([name,total]) => ({name,total,represented:ownedIds.has(name)})).sort((a,b) => a.name.localeCompare(b.name)));
      }
      setProfileLoading(false);
    }
    loadProfileAndReports();
    return () => { active = false; };
  }, [session?.user?.id]);

  async function uploadProfileAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !supabase || !session?.user?.id) return;
    if (!file.type.startsWith("image/")) { setProfileMessage("Choose an image file for your profile icon."); return; }
    if (file.size > 5 * 1024 * 1024) { setProfileMessage("Profile images must be 5 MB or smaller."); return; }
    setAvatarUploading(true); setProfileMessage("");
    try {
      const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${session.user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("profile-avatars").getPublicUrl(path);
      const avatarUrl = publicData.publicUrl;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", session.user.id);
      if (updateError) throw updateError;
      setProfile(current => ({ ...current, avatar_url: avatarUrl }));
      onAvatarUpdated?.(avatarUrl);
      setProfileMessage("Profile icon updated.");
    } catch (error) {
      setProfileMessage(error.message || "Could not upload profile icon.");
    } finally { setAvatarUploading(false); }
  }

  async function removeProfileAvatar() {
    if (!supabase || !session?.user?.id) return;
    setAvatarUploading(true); setProfileMessage("");
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", session.user.id);
    setAvatarUploading(false);
    if (error) { setProfileMessage(error.message); return; }
    setProfile(current => ({ ...current, avatar_url: "" }));
    onAvatarUpdated?.("");
    setProfileMessage("Profile icon reset to your initial.");
  }

  async function saveProfile(event) {
    event.preventDefault(); setProfileMessage("");
    if (!supabase || !session?.user?.id) return;
    const username = profile.username.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9_.-]{2,30}$/.test(username)) { setProfileMessage("Username must be 2–30 characters and use letters, numbers, periods, underscores, or hyphens."); return; }
    setProfileSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: session.user.id, username, display_name: profile.display_name.trim() || null, bio: profile.bio.trim() || null, is_collection_public: profile.is_collection_public, avatar_url: profile.avatar_url || null }, { onConflict: "id" });
    setProfileSaving(false);
    setProfileMessage(error ? (error.code === "23505" ? "That username is already taken. Try another." : error.message) : "Profile saved.");
  }

  return <>
    <SectionTitle eyebrow="YOUR PINFOLIO" title="More" subtitle="Profile, collection insights, and privacy controls." />
    <section className="panel theme-panel" style={{marginTop:20}}>
      <div className="panel-heading"><div><h2>Color scheme</h2><p>Choose the look you want for Pinfolio. Your choice is saved on this device.</p></div><Palette size={20}/></div>
      <div className="theme-options" role="radiogroup" aria-label="Color scheme">
        {PINFOLIO_THEMES.map(option => <button key={option.id} type="button" role="radio" aria-checked={theme === option.id} className={`theme-option ${theme === option.id ? "selected" : ""}`} onClick={() => setTheme(option.id)}>
          <span className="theme-swatches" aria-hidden="true">{option.colors.map(color => <span key={color} style={{backgroundColor:color}} />)}</span>
          <span className="theme-option-copy"><strong>{option.name}</strong><small>{option.description}</small></span>
          {theme === option.id && <Check size={17} className="theme-check"/>}
        </button>)}
      </div>
      <p className="theme-note">Color schemes change the app's main backgrounds, accents, and navigation. You can switch any time.</p>
    </section>
    <section className="panel display-settings-panel" style={{marginTop:20}}>
      <div className="panel-heading"><div><h2>Display preferences</h2><p>Adjust card width and text size across your pin pages. Your choices are saved on this device.</p></div><SlidersHorizontal size={20}/></div>
      <div className="display-setting-grid">
        <div className="display-setting-control">
          <label htmlFor="pinfolio-text-size">Text size</label>
          <select id="pinfolio-text-size" value={textSize} onChange={event => setTextSize(event.target.value)}>
            <option value="small">Small — fit more on screen</option>
            <option value="medium">Medium — default</option>
            <option value="large">Large — easier to read</option>
          </select>
          <p>Changes pin names, details, and catalog text.</p>
        </div>
        <div className="display-setting-control">
          <label htmlFor="pinfolio-card-size">Card size</label>
          <select id="pinfolio-card-size" value={cardSize} onChange={event => setCardSize(event.target.value)}>
            <option value="small">Small — show more cards</option>
            <option value="medium">Medium — default</option>
            <option value="large">Large — wider cards, fewer per row</option>
          </select>
          <p>Changes the width and number of cards per row in Collection, Catalog, Friends, and Traders.</p>
        </div>
      </div>
      <p className="theme-note">These preferences change the display only; they do not alter your pin records or photos.</p>
    </section>
    <section className="panel settings-panel"><div className="panel-heading"><div><h2>Trader profile</h2><p>Your username is how friends can find you.</p></div><Settings size={20} /></div>
      {profileLoading ? <p>Loading profile…</p> : <form onSubmit={saveProfile} className="settings-form">
        <label>Profile icon</label>
        <div className="profile-avatar-editor">
          <div className="avatar profile-avatar profile-avatar-preview">{profile.avatar_url ? <img src={profile.avatar_url} alt="Your profile icon" /> : (profile.display_name || profile.username || session?.user?.email || "P").slice(0, 1).toUpperCase()}</div>
          <div className="profile-avatar-actions">
            <label className="button button-secondary avatar-upload-button" htmlFor="profile-avatar-upload">{avatarUploading ? "Uploading…" : "Choose image"}</label>
            <input id="profile-avatar-upload" className="avatar-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadProfileAvatar} disabled={avatarUploading} />
            {profile.avatar_url && <button className="button button-secondary" type="button" onClick={removeProfileAvatar} disabled={avatarUploading}>Reset icon</button>}
            <small>Upload a JPG, PNG, WebP, or GIF up to 5 MB. Your icon appears in your account header and sidebar.</small>
          </div>
        </div>
        <label htmlFor="profile-username">Username</label><input id="profile-username" value={profile.username} onChange={e => setProfile({...profile,username:e.target.value})} minLength={2} maxLength={30} required placeholder="your_username" />
        <label htmlFor="profile-display-name">Display name</label><input id="profile-display-name" value={profile.display_name} onChange={e => setProfile({...profile,display_name:e.target.value})} maxLength={80} placeholder="How friends see your name" />
        <label htmlFor="profile-bio">Bio (optional)</label><textarea id="profile-bio" rows={3} value={profile.bio} onChange={e => setProfile({...profile,bio:e.target.value})} maxLength={300} placeholder="Favorite parks, pin themes, or trading interests" />
        <label className="setting-check"><input type="checkbox" checked={profile.is_collection_public} onChange={e => setProfile({...profile,is_collection_public:e.target.checked})} /> Allow my profile to be discoverable to signed-in Pinfolio users</label>
        <button className="button button-gold" type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save profile"}</button>
        {profileMessage && <p role="status">{profileMessage}</p>}
      </form>}
    </section>
    <section className="panel" style={{marginTop:20}}><div className="panel-heading"><div><h2>Collection report</h2><p>Based on the information you've entered, not live market prices.</p></div><ChartNoAxesCombined size={20}/></div><div className="wishlist-summary"><div><span className="eyebrow">RECORDED PURCHASE COST</span><strong>${costTotal.toFixed(2)}</strong></div><div><span className="eyebrow">CATALOG GROUPS</span><strong>{setStats.length}</strong></div><div><span className="eyebrow">GROUPS YOU OWN</span><strong>{setStats.filter(group=>group.represented).length}</strong></div></div><p className="subtle-count">Pinfolio does not currently fetch verified resale prices, so this report is not a market valuation.</p></section>
    <section className="panel" style={{marginTop:20}}><div className="panel-heading"><div><h2>Set overview</h2><p>Groups are based on franchise or park values in your catalog.</p></div><Layers3 size={20}/></div>{setStats.length === 0 ? <p>Add catalog pins with a franchise or park to start an overview.</p> : <div className="recent-list">{setStats.map(group=><div className="recent-row" key={group.name}><div className="recent-copy"><strong>{group.name}</strong><span>{group.represented ? "You own pins in this group" : "No pins owned yet"}</span></div><span className="subtle-count">{group.total} catalog {group.total===1?"pin":"pins"}</span></div>)}</div>}</section>
    <section className="panel" style={{marginTop:20}}><div className="panel-heading"><div><h2>Authenticity notes</h2><p>Record your assessment on each collection pin.</p></div><ShieldCheck size={20}/></div><p>Open Collection → Edit on any pin to record its authenticity status, notes, and photo. These are personal records, not an official authentication service.</p><button className="button button-secondary" onClick={() => setPage("Collection")}>Manage collection</button></section>
    <div className="security-card" style={{marginTop:20}}><LockKeyhole size={20}/><div><strong>Privacy controls</strong><p>Collection items default to private. Set individual pins to friends or public in their edit form. Supabase policies enforce access on the server.</p></div></div>
  </>;
}

