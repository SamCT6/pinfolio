import { useEffect, useState } from "react";
import {
  LayoutDashboard, GalleryVerticalEnd, Repeat2, Heart, MoreHorizontal,
  Search, Bell, Plus, ChevronRight, ArrowUpRight, LockKeyhole,
  SlidersHorizontal, Sparkles, ShieldCheck, Menu, X, CircleHelp,
  Settings, Layers3, ChartNoAxesCombined, ImagePlus, EyeOff, Clock3,
  CheckCircle2, Handshake, ArrowRightLeft, Eye
} from "lucide-react";
import { supabase, isDemoMode } from "../lib/supabase";

import { PinArt, SectionTitle } from "../components/AppViews.jsx";

// In-app autocomplete dropdown (not the browser/keyboard datalist).
function AutocompleteField({ label, value, onChange, options = [], placeholder = "", onSelect, type = "text" }) {
  const [open, setOpen] = useState(false);
  const normalized = String(value || "").trim().toLowerCase();
  const matches = [...new Set(options.filter(Boolean).map((option) => String(option).trim()).filter(Boolean))]
    .filter((option) => !normalized || option.toLowerCase().includes(normalized))
    .slice(0, 8);
  return (
    <label className="autocomplete-field">{label}
      <input type={type} value={value} onChange={(event) => { onChange(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        placeholder={placeholder} autoComplete="off" />
      {open && matches.length > 0 && (
        <div className="autocomplete-menu" role="listbox">
          {matches.map((option) => <button type="button" role="option" key={option} className="autocomplete-option"
            onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option); onSelect?.(option); setOpen(false); }}>
            {option}
          </button>)}
        </div>
      )}
    </label>
  );
}

export function PinDetail({ pin, onClose, onEdit, onRemove }) {
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



export function AddPinForm({ onClose, onSaved, userId }) {
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [franchise, setFranchise] = useState("");
  const [pinSetName, setPinSetName] = useState("");
  const [pinSets, setPinSets] = useState([]);
  const [park, setPark] = useState("");
  const [year, setYear] = useState("");
  const [owned, setOwned] = useState("1");
  const [tradeable, setTradeable] = useState("0");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [editionType, setEditionType] = useState("");
  const [catalogCode, setCatalogCode] = useState("");
  const [setNumber, setSetNumber] = useState("");
  const [authenticityStatus, setAuthenticityStatus] = useState("unknown");
  const [visibility, setVisibility] = useState("private");
  const [sharedPins, setSharedPins] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSharedSets() {
      if (!supabase) return;
      const allSets = [];
      for (let start = 0; ; start += 1000) {
        const { data, error } = await supabase
          .from("pin_sets")
          .select("id, name, franchise, release_year, description")
          .order("name", { ascending: true })
          .range(start, start + 999);

        if (cancelled) return;
        if (error) {
          console.error("Could not load shared pin sets:", error);
          setMessage("Could not load shared sets. You can still enter a set name manually.");
          return;
        }
        allSets.push(...(data || []));
        if (!data || data.length < 1000) break;
      }

      if (!cancelled) setPinSets(allSets);
    }

    loadSharedSets();
    async function loadSharedPins() {
      if (!supabase) return;
      const { data, error } = await supabase.from("pins")
        .select("id, name, character_name, franchise, park, release_year, edition_type, description, image_url, image_path, catalog_code, set_number, pin_set_id")
        .order("name", { ascending: true }).limit(5000);
      if (!cancelled && !error) setSharedPins(data || []);
    }
    loadSharedPins();
    return () => { cancelled = true; };
  }, []);

  function handleSetNameChange(value) {
    setPinSetName(value);
    const match = pinSets.find(
      (set) => set.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (match) {
      if (match.franchise) setFranchise(match.franchise);
      if (match.release_year) setYear(String(match.release_year));
    }
  }

  async function searchCatalog() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    
    const searchTerm = query.trim();

    let catalogQuery = supabase
      .from("pins")
      .select("id, name, character_name, franchise, park, release_year, edition_type, description, image_url, image_path, catalog_code, set_number, pin_set_id")
      .order("name")
      .limit(20);

    if (searchTerm) {
      catalogQuery = catalogQuery.or(
        `name.ilike.%${searchTerm}%,character_name.ilike.%${searchTerm}%,franchise.ilike.%${searchTerm}%,park.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await catalogQuery;


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

        let imagePath = null;
        let pinSetId = null;
        const normalizedSetName = pinSetName.trim().toLowerCase();

        if (normalizedSetName) {
          const existingSet = pinSets.find(
            (set) => set.name.trim().toLowerCase() === normalizedSetName
          );

          if (existingSet) {
            pinSetId = existingSet.id;
          } else {
            const { data: newSet, error: setError } = await supabase
              .from("pin_sets")
              .insert({
                name: pinSetName.trim(),
                franchise: franchise.trim() || null,
                release_year: year ? Number(year) : null,
                created_by: userId,
              })
              .select("id, name, franchise, release_year, description")
              .single();

            if (setError) {
              // Another user may have created the same set at the same time.
              if (setError.code === "23505") {
                const { data: matchingSet, error: lookupError } = await supabase
                  .from("pin_sets")
                  .select("id, name, franchise, release_year, description")
                  .ilike("name", pinSetName.trim())
                  .limit(1)
                  .maybeSingle();
                if (lookupError || !matchingSet) throw setError;
                pinSetId = matchingSet.id;
                setPinSets((current) => current.some((set) => set.id === matchingSet.id)
                  ? current : [...current, matchingSet]);
              } else {
                throw setError;
              }
            } else {
              pinSetId = newSet.id;
              setPinSets((current) => current.some((set) => set.id === newSet.id)
                ? current : [...current, newSet]);
            }
          }
        }

        if (imageFile) {
          const fileExtension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
          imagePath = `${userId}/${crypto.randomUUID()}.${fileExtension}`;
          const { error: uploadError } = await supabase.storage
            .from("pin-images")
            .upload(imagePath, imageFile, { contentType: imageFile.type, upsert: false });
          if (uploadError) throw uploadError;
        }

        const { data: newPin, error: pinError } = await supabase
          .from("pins")
          .insert({
            name: name.trim(),
            character_name: character.trim() || null,
            franchise: franchise.trim() || null,
            park: park.trim() || null,
            release_year: year ? Number(year) : null,
            edition_type: editionType.trim() || null,
            description: description.trim() || null,
            catalog_code: catalogCode.trim() || null,
            set_number: setNumber.trim() || null,
            image_url: imagePath ? null : (imageUrl.trim() || null),
            image_path: imagePath,
            pin_set_id: pinSetId,
            created_by: userId,
            is_catalog: true,
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
          authenticity_status: authenticityStatus,
          visibility,
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
            <label className="autocomplete-field">Search catalog
              <input autoComplete="off" value={query} onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                setSelectedPin(null);
                const term = value.trim().toLowerCase();
                setResults(sharedPins.filter((pin) => `${pin.name || ""} ${pin.character_name || ""} ${pin.franchise || ""} ${pin.park || ""} ${pin.catalog_code || ""}`.toLowerCase().includes(term)).slice(0, 20));
              }} placeholder="Type a pin, character, or set..." />
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
            <AutocompleteField label="Pin name *" value={name} onChange={setName} options={sharedPins.map((pin) => pin.name)} placeholder="e.g. Mickey Mouse castle pin" />
            <AutocompleteField label="Character" value={character} onChange={setCharacter} options={sharedPins.map((pin) => pin.character_name)} />
            <AutocompleteField label="Franchise" value={franchise} onChange={setFranchise} options={sharedPins.map((pin) => pin.franchise)} placeholder="e.g. Mickey Mouse" />
            <AutocompleteField label="Set name (optional)" value={pinSetName} onChange={handleSetNameChange} options={pinSets.map((set) => set.name)} placeholder="Type to search shared sets" onSelect={handleSetNameChange} />
            {pinSets.length > 0 && <small>Suggestions include {pinSets.length} shared set{pinSets.length === 1 ? "" : "s"} contributed by Pinfolio users.</small>}
            <AutocompleteField label="Disney park" value={park} onChange={setPark} options={sharedPins.map((pin) => pin.park)} placeholder="Start typing a park" />
            <label>Release year<input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} /></label>
            <AutocompleteField label="Edition type" value={editionType} onChange={setEditionType} options={sharedPins.map((pin) => pin.edition_type)} placeholder="e.g. Limited Edition, Open Edition" />
            <AutocompleteField label="Set number" value={setNumber} onChange={setSetNumber} options={sharedPins.filter((pin) => pin.pin_set_id === pinSets.find((set) => set.name.toLowerCase() === pinSetName.trim().toLowerCase())?.id).map((pin) => pin.set_number)} />
            <AutocompleteField label="Catalog code (optional)" value={catalogCode} onChange={setCatalogCode} options={sharedPins.map((pin) => pin.catalog_code)} />
            <label>Description (optional)<textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about this pin" /></label>

            <label>Photo URL (optional)
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" autoComplete="off" />
            </label>
            <label>Pin photo upload (optional)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    setImageFile(null);
                    setImagePreview("");
                    return;
                  }

                  if (!file.type.startsWith("image/")) {
                    setMessage("Please select an image file.");
                    event.target.value = "";
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    setMessage("The image must be 5 MB or smaller.");
                    event.target.value = "";
                    return;
                  }

                  setMessage("");
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Pin preview"
                style={{
                  display: "block",
                  width: "160px",
                  height: "160px",
                  objectFit: "contain",
                  marginTop: "12px",
                  borderRadius: "12px",
                }}
              />
            )}

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
            <label>Authenticity
              <select value={authenticityStatus} onChange={(e) => setAuthenticityStatus(e.target.value)}>
                <option value="unknown">Unknown</option><option value="suspected_counterfeit">Suspected counterfeit</option><option value="confirmed_counterfeit">Confirmed counterfeit</option><option value="verified_authentic">Verified authentic</option>
              </select>
            </label>
            <label>Visibility
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="private">Private — only me</option><option value="friends">Friends — accepted friends</option><option value="public">Public — signed-in users</option>
              </select>
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


export function AddWishlistForm({ onClose, onSaved, session, initialPin = null }) {
  const [catalogPins, setCatalogPins] = useState([]);
  const [pinSets, setPinSets] = useState([]);
  const [mode, setMode] = useState(initialPin ? "search" : "search");
  const [loadingPins, setLoadingPins] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialPin?.name || "");
  const [selectedPin, setSelectedPin] = useState(initialPin);
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("");
  const [franchise, setFranchise] = useState("");
  const [park, setPark] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [description, setDescription] = useState("");
  const [pinSetName, setPinSetName] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetPrice, setTargetPrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadPins() {
      if (!supabase) { setError("Supabase isn't connected."); setLoadingPins(false); return; }
      const [pinsResult, setsResult] = await Promise.all([
        supabase.from("pins").select("id,name,character_name,franchise,park,release_year,description,edition_type,image_url,image_path,pin_set_id,set_number,catalog_code").eq("is_catalog", true).order("name").limit(5000),
        supabase.from("pin_sets").select("id,name,franchise,release_year").order("name").limit(3000),
      ]);
      if (ignore) return;
      if (pinsResult.error) { setError("Couldn't load the pin catalog. Please try again."); console.error(pinsResult.error); }
      else setCatalogPins(pinsResult.data || []);
      if (!setsResult.error) setPinSets(setsResult.data || []);
      setLoadingPins(false);
    }
    loadPins();
    return () => { ignore = true; };
  }, []);

  const filteredPins = catalogPins.filter((pin) =>
    `${pin.name || ""} ${pin.character_name || ""} ${pin.franchise || ""} ${pin.park || ""} ${pin.catalog_code || ""}`
      .toLowerCase().includes(search.trim().toLowerCase())
  ).slice(0, 10);

  function choosePin(pin) {
    setSelectedPin(pin);
    setSearch(pin.name);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (!session?.user?.id || !supabase) { setError("Please sign in before adding a wishlist pin."); return; }
    const price = targetPrice.trim() === "" ? null : Number(targetPrice);
    if (price !== null && (!Number.isFinite(price) || price < 0)) { setError("Enter a valid target price of zero or more."); return; }
    setSaving(true);
    try {
      let pinId = selectedPin?.id;
      if (mode === "create") {
        if (!name.trim()) throw new Error("Pin name is required.");
        let pinSetId = null;
        const matchingSet = pinSets.find((set) => set.name.trim().toLowerCase() === pinSetName.trim().toLowerCase());
        if (matchingSet) pinSetId = matchingSet.id;
        else if (pinSetName.trim()) {
          const { data: newSet, error: setError } = await supabase.from("pin_sets").insert({
            name: pinSetName.trim(), franchise: franchise.trim() || null,
            release_year: releaseYear ? Number(releaseYear) : null, created_by: session.user.id,
          }).select("id").single();
          if (setError) {
            if (setError.code === "23505") {
              const { data: foundSet, error: findError } = await supabase.from("pin_sets").select("id").ilike("name", pinSetName.trim()).limit(1).maybeSingle();
              if (findError || !foundSet) throw setError;
              pinSetId = foundSet.id;
            } else throw setError;
          } else pinSetId = newSet.id;
        }
        const { data: newPin, error: pinError } = await supabase.from("pins").insert({
          name: name.trim(), character_name: character.trim() || null,
          franchise: franchise.trim() || null, park: park.trim() || null,
          release_year: releaseYear ? Number(releaseYear) : null,
          description: description.trim() || null, pin_set_id: pinSetId,
          created_by: session.user.id, is_catalog: true,
        }).select("id").single();
        if (pinError) throw pinError;
        pinId = newPin.id;
      } else if (!pinId) {
        throw new Error("Choose a catalog pin or switch to Create new pin.");
      }
      const { error: saveError } = await supabase.from("wishlist_items").insert({
        user_id: session.user.id, pin_id: pinId, priority, target_price: price, notes: notes.trim() || null,
      });
      if (saveError) throw saveError;
      onSaved();
    } catch (saveError) {
      console.error("Could not save wishlist item:", saveError);
      setError(saveError.code === "23505" ? "This pin is already on your wishlist." : (saveError.message || "Couldn't save this pin. Please try again."));
    } finally { setSaving(false); }
  }

  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="wishlist-form-title" onClick={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><span className="eyebrow">YOUR NEXT FINDS</span><h2 id="wishlist-form-title">Add to Wishlist</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form">×</button></div>
      <div className="filter-chips"><button type="button" className={`chip ${mode === "search" ? "active" : ""}`} onClick={() => { setMode("search"); setError(""); }}>Choose catalog pin</button><button type="button" className={`chip ${mode === "create" ? "active" : ""}`} onClick={() => { setMode("create"); setSelectedPin(null); setError(""); }}>Create new pin</button></div>
      <form onSubmit={handleSubmit}>
        {mode === "search" ? <>
          <label className="autocomplete-field">Find a catalog pin
            <input value={search} onChange={(event) => { setSearch(event.target.value); setSelectedPin(null); }} placeholder="Type a pin, character, or collection" autoComplete="off" />
            {search && !selectedPin && filteredPins.length > 0 && <div className="autocomplete-menu" role="listbox">{filteredPins.map((pin) => <button type="button" role="option" className="autocomplete-option" key={pin.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choosePin(pin)}><strong>{pin.name}</strong><span>{[pin.character_name, pin.franchise, pin.park, pin.release_year].filter(Boolean).join(" · ")}</span></button>)}</div>}
          </label>
          {loadingPins && <p>Loading catalog…</p>}
          {selectedPin && <p className="selected-catalog-pin">Selected: <strong>{selectedPin.name}</strong></p>}
          {!loadingPins && search && !selectedPin && filteredPins.length === 0 && <p>No matching catalog pin. Choose “Create new pin” to add it.</p>}
        </> : <div className="add-pin-fields">
          <AutocompleteField label="Pin name *" value={name} onChange={setName} options={catalogPins.map((pin) => pin.name)} placeholder="Pin name" />
          <AutocompleteField label="Character" value={character} onChange={setCharacter} options={catalogPins.map((pin) => pin.character_name)} />
          <AutocompleteField label="Franchise" value={franchise} onChange={setFranchise} options={catalogPins.map((pin) => pin.franchise)} />
          <AutocompleteField label="Park" value={park} onChange={setPark} options={catalogPins.map((pin) => pin.park)} />
          <label>Release year<input type="number" min="1900" max="2100" value={releaseYear} onChange={(event) => setReleaseYear(event.target.value)} /></label>
          <AutocompleteField label="Set name (optional)" value={pinSetName} onChange={setPinSetName} options={pinSets.map((set) => set.name)} />
          <label>Description (optional)<textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        </div>}
        <label htmlFor="wishlist-priority">Priority</label><select id="wishlist-priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="normal">Medium</option><option value="high">High</option></select>
        <label htmlFor="wishlist-target-price">Target price (optional)</label><input id="wishlist-target-price" type="number" min="0" step="0.01" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} placeholder="e.g. 25.00" />
        <label htmlFor="wishlist-notes">Notes (optional)</label><textarea id="wishlist-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Edition, color variant, or where you hope to find it..." rows={3} />
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={saving || loadingPins || (mode === "search" && !selectedPin)}>{saving ? "Saving..." : "Add to Wishlist"}</button></div>
      </form>
    </div>
  </div>;
}

export function EditWishlistForm({ item, session, onClose, onSaved, onRemove }) {
  const [priority, setPriority] = useState(
    item.priority?.toLowerCase() === "medium"
      ? "normal"
      : item.priority?.toLowerCase() || "normal"
  );
  const [targetPrice, setTargetPrice] = useState(
    item.targetPrice ?? ""
  );
  const [notes, setNotes] = useState(item.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!session?.user?.id || !supabase) {
      setError("Please sign in to edit your wishlist.");
      return;
    }

    const price =
      String(targetPrice).trim() === "" ? null : Number(targetPrice);

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError("Enter a valid target price of zero or more.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("wishlist_items")
      .update({
        priority,
        target_price: price,
        notes: notes.trim() || null,
      })
      .eq("id", item.id)
      .eq("user_id", session.user.id);

    setSaving(false);

    if (updateError) {
      console.error("Could not update wishlist item:", updateError);
      setError("Couldn't update this pin. Please try again.");
      return;
    }

    onSaved();
  }

  async function handleRemove() {
    if (!session?.user?.id || !supabase) {
      setError("Please sign in to remove this wishlist pin.");
      return;
    }

    if (!window.confirm(`Remove "${item.name}" from your wishlist?`)) {
      return;
    }

    setSaving(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", session.user.id);

    setSaving(false);

    if (deleteError) {
      console.error("Could not remove wishlist item:", deleteError);
      setError("Couldn't remove this pin. Please try again.");
      return;
    }

    onRemove();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-wishlist-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">YOUR NEXT FINDS</span>
            <h2 id="edit-wishlist-title">Edit Wishlist Pin</h2>
            <p>{item.name}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="edit-wishlist-priority">Priority</label>
          <select
            id="edit-wishlist-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="normal">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="edit-wishlist-price">Target price (optional)</label>
          <input
            id="edit-wishlist-price"
            type="number"
            min="0"
            step="0.01"
            value={targetPrice}
            onChange={(event) => setTargetPrice(event.target.value)}
            placeholder="e.g. 25.00"
          />

          <label htmlFor="edit-wishlist-notes">Notes (optional)</label>
          <textarea
            id="edit-wishlist-notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add notes about this pin..."
          />

          {error && <p role="alert">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
            >
              Remove pin
            </button>
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export function EditCollectionForm({ pin, session, onClose, onSaved }) {
  const [owned, setOwned] = useState(String(pin.owned ?? 1));
  const [tradeable, setTradeable] = useState(
    String(pin.tradeable ?? 0)
  );
  const [purchaseCost, setPurchaseCost] = useState(
    pin.purchaseCost ?? ""
  );
  const [authenticityStatus, setAuthenticityStatus] = useState(
    pin.authenticityStatus || "unknown"
  );
  const [visibility, setVisibility] = useState(pin.visibility || "private");
  const [notes, setNotes] = useState(pin.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [catalogImageFile, setCatalogImageFile] = useState(null);
  const [catalogImagePreview, setCatalogImagePreview] = useState("");
  const [pinName, setPinName] = useState(pin.name || "");
  const [character, setCharacter] = useState(pin.character || "");
  const [franchise, setFranchise] = useState(pin.franchise || "");
  const [park, setPark] = useState(pin.park || "");
  const [releaseYear, setReleaseYear] = useState(pin.releaseYear == null ? "" : String(pin.releaseYear));
  const [editionType, setEditionType] = useState(pin.editionType || "");
  const [description, setDescription] = useState(pin.description || "");
  const [catalogCode, setCatalogCode] = useState(pin.catalogCode || "");
  const [setNumber, setSetNumber] = useState(pin.setNumber || "");
  const [pinSetId, setPinSetId] = useState(pin.pinSetId || "");
  const [pinSetName, setPinSetName] = useState("");
  const [catalogImageUrl, setCatalogImageUrl] = useState(pin.catalogImageUrl || "");
  const [pinSets, setPinSets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let active = true;
    if (!supabase) return;
    Promise.all([
      supabase.from("pin_sets").select("id,name,franchise,release_year").order("name"),
      supabase.from("pins").select("name,character_name,franchise,park,edition_type,catalog_code,set_number")
    ]).then(([setsResult, pinsResult]) => {
      if (!active) return;
      if (!setsResult.error) {
        const loadedSets = setsResult.data || [];
        setPinSets(loadedSets);
        const currentSet = loadedSets.find((set) => set.id === (pin.pinSetId || ""));
        if (currentSet) setPinSetName(currentSet.name);
      }
      if (!pinsResult.error) setSuggestions(pinsResult.data || []);
    });
    return () => { active = false; };
  }, [pin.pinSetId]);

  function handleSetNameChange(value) {
    setPinSetName(value);
    const match = pinSets.find(
      (set) => set.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    setPinSetId(match?.id || "");
    if (match?.franchise) setFranchise(match.franchise);
    if (match?.release_year) setReleaseYear(String(match.release_year));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!session?.user?.id || !supabase) {
      setError("Please sign in to edit your collection.");
      return;
    }

    const ownedCount = Number(owned);
    const tradeableCount = Number(tradeable);
    const cost =
      String(purchaseCost).trim() === ""
        ? null
        : Number(purchaseCost);

    if (
      !Number.isInteger(ownedCount) ||
      ownedCount < 0 ||
      !Number.isInteger(tradeableCount) ||
      tradeableCount < 0
    ) {
      setError("Quantities must be whole numbers of zero or more.");
      return;
    }

    if (tradeableCount > ownedCount) {
      setError("Tradeable quantity cannot exceed the quantity you own.");
      return;
    }

    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) {
      setError("Purchase cost must be zero or more.");
      return;
    }


    setSaving(true);

try {
  // Match an existing shared set or create it, using the same workflow as Add Pin.
  let resolvedPinSetId = pinSetId || null;
  const normalizedSetName = pinSetName.trim().toLowerCase();
  if (normalizedSetName) {
    const existingSet = pinSets.find((set) => set.name.trim().toLowerCase() === normalizedSetName);
    if (existingSet) {
      resolvedPinSetId = existingSet.id;
    } else {
      const { data: newSet, error: setError } = await supabase
        .from("pin_sets")
        .insert({
          name: pinSetName.trim(),
          franchise: franchise.trim() || null,
          release_year: releaseYear ? Number(releaseYear) : null,
          created_by: session.user.id,
        })
        .select("id, name, franchise, release_year, description")
        .single();

      if (setError) {
        if (setError.code === "23505") {
          const { data: matchingSet, error: lookupError } = await supabase
            .from("pin_sets")
            .select("id, name, franchise, release_year, description")
            .ilike("name", pinSetName.trim())
            .limit(1)
            .maybeSingle();
          if (lookupError || !matchingSet) throw setError;
          resolvedPinSetId = matchingSet.id;
          setPinSets((current) => current.some((set) => set.id === matchingSet.id) ? current : [...current, matchingSet]);
        } else {
          throw setError;
        }
      } else {
        resolvedPinSetId = newSet.id;
        setPinSets((current) => current.some((set) => set.id === newSet.id) ? current : [...current, newSet]);
      }
    }
  } else {
    resolvedPinSetId = null;
  }

  // Keep the existing personal photo unless a new one is uploaded.
  let personalPhotoUrl = pin.photoUrl || null;
  let personalPhotoPath = pin.photoPath || null;

  if (imageFile) {
    const fileExtension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      `${session.user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("pin-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Save the storage path for private images.
    personalPhotoPath = filePath;
    personalPhotoUrl = null;
  }

  let catalogImagePath = pin.imagePath || null;
  if (catalogImageFile) {
    const fileExtension = catalogImageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    catalogImagePath = `${session.user.id}/${crypto.randomUUID()}.${fileExtension}`;
    const { error: catalogUploadError } = await supabase.storage.from("pin-images").upload(catalogImagePath, catalogImageFile, {
      contentType: catalogImageFile.type || "image/jpeg", upsert: false,
    });
    if (catalogUploadError) throw catalogUploadError;
  }

  const { error: pinUpdateError } = await supabase.from("pins").update({
    name: pinName.trim(),
    character_name: character.trim() || null,
    franchise: franchise.trim() || null,
    park: park.trim() || null,
    release_year: releaseYear ? Number(releaseYear) : null,
    edition_type: editionType.trim() || null,
    description: description.trim() || null,
    catalog_code: catalogCode.trim() || null,
    set_number: setNumber.trim() || null,
    pin_set_id: resolvedPinSetId,
    image_path: catalogImageFile ? catalogImagePath : (catalogImageUrl.trim() ? null : (pin.imagePath || null)),
    image_url: catalogImageFile ? null : (catalogImageUrl.trim() || null),
  }).eq("id", pin.id);
  if (pinUpdateError) throw pinUpdateError;

  const { error: updateError } = await supabase
    .from("collection_items")
    .update({
      owned_quantity: ownedCount,
      tradeable_quantity: tradeableCount,
      purchase_cost: cost,
      authenticity_status: authenticityStatus,
      visibility,
      photo_url: personalPhotoUrl,
      photo_path: personalPhotoPath,
      notes: notes.trim() || null,
    })
    .eq("id", pin.collectionItemId)
    .eq("user_id", session.user.id);

  if (updateError) throw updateError;

  onSaved();
} catch (error) {
  console.error("Could not save collection changes:", error);
  setError(error.message || "Could not save your changes.");
} finally {
  setSaving(false);
}
  }


  async function handleRemove() {
    if (!session?.user?.id || !supabase) {
      setError("Please sign in to edit your collection.");
      return;
    }

    if (!window.confirm(`Remove "${pin.name}" from your collection?`)) {
      return;
    }

    setSaving(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("collection_items")
      .delete()
      .eq("id", pin.collectionItemId)
      .eq("user_id", session.user.id);

    setSaving(false);

    if (deleteError) {
      console.error("Could not remove collection item:", deleteError);
      setError("Couldn't remove this pin. Please try again.");
      return;
    }

    onSaved();
  }


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-collection-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">YOUR PERSONAL ARCHIVE</span>
            <h2 id="edit-collection-title">Edit Collection Pin</h2>
            <p>{pin.name}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <h3>Catalog information</h3>
          <label htmlFor="edit-catalog-pin-name">Pin name *</label>
          <input id="edit-catalog-pin-name" value={pinName} onChange={(e) => setPinName(e.target.value)} required />
          <AutocompleteField label="Character" value={character} onChange={setCharacter} options={suggestions.map((row) => row.character_name)} />
          <AutocompleteField label="Franchise" value={franchise} onChange={setFranchise} options={suggestions.map((row) => row.franchise)} />
          <AutocompleteField label="Disney park" value={park} onChange={setPark} options={suggestions.map((row) => row.park)} />
          <label htmlFor="edit-catalog-year">Release year</label><input id="edit-catalog-year" type="number" min="1900" max="2100" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
          <AutocompleteField label="Edition type" value={editionType} onChange={setEditionType} options={suggestions.map((row) => row.edition_type)} />
          <label htmlFor="edit-catalog-description">Description</label><textarea id="edit-catalog-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <AutocompleteField label="Catalog code" value={catalogCode} onChange={setCatalogCode} options={suggestions.map((row) => row.catalog_code)} />
          <AutocompleteField label="Set number" value={setNumber} onChange={setSetNumber} options={suggestions.map((row) => row.set_number)} />
          <AutocompleteField
            label="Set name (optional)"
            value={pinSetName}
            onChange={handleSetNameChange}
            options={pinSets.map((set) => set.name)}
            placeholder="Type to search shared sets"
            onSelect={handleSetNameChange}
          />
          {pinSets.length > 0 && <small>Suggestions include {pinSets.length} shared set{pinSets.length === 1 ? "" : "s"} contributed by Pinfolio users. Leave this blank if the pin is not part of a set.</small>}
          <label htmlFor="collection-owned">Quantity owned</label>
          <input
            id="collection-owned"
            type="number"
            min="0"
            step="1"
            required
            value={owned}
            onChange={(event) => setOwned(event.target.value)}
          />


          <label htmlFor="collection-tradeable">Quantity available to trade</label>
          <input
            id="collection-tradeable"
            type="number"
            min="0"
            step="1"
            required
            value={tradeable}
            onChange={(event) => setTradeable(event.target.value)}
          />

          <label htmlFor="collection-cost">Total purchase cost (optional)</label>
          <input
            id="collection-cost"
            type="number"
            min="0"
            step="0.01"
            value={purchaseCost}
            onChange={(event) => setPurchaseCost(event.target.value)}
            placeholder="e.g. 12.50"
          />

          <label htmlFor="collection-authenticity">Authenticity</label>
          
          <select
            id="collection-authenticity"
            value={authenticityStatus}
            onChange={(event) => setAuthenticityStatus(event.target.value)}
          >
            <option value="unknown">Unknown</option>
            <option value="suspected_counterfeit">
              Suspected counterfeit
            </option>
            <option value="confirmed_counterfeit">
              Confirmed counterfeit
            </option>
            <option value="verified_authentic">
              Verified authentic
            </option>
          </select>


          <label htmlFor="collection-visibility">Who can see this pin?</label>
          <select
            id="collection-visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option value="private">Private — only me</option>
            <option value="friends">Friends — accepted friends</option>
            <option value="public">Public — signed-in users</option>
          </select>

          <label htmlFor="collection-notes">Notes (optional)</label>
          <textarea
            id="collection-notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add condition, trade, or purchase notes..."
          />

          
          <label htmlFor="edit-catalog-image-url">Shared catalog photo URL (optional)</label>
          <input id="edit-catalog-image-url" type="url" value={catalogImageUrl} onChange={(e) => { setCatalogImageUrl(e.target.value); if (e.target.value.trim()) { setCatalogImageFile(null); setCatalogImagePreview(""); } }} placeholder="https://…" />
          <label htmlFor="edit-catalog-photo-file">Upload shared catalog photo (shown to catalog users)</label>
          <input id="edit-catalog-photo-file" type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) { setCatalogImageFile(null); setCatalogImagePreview(""); return; }
            if (!file.type.startsWith("image/")) { setError("Please select an image file."); event.target.value = ""; return; }
            if (file.size > 5 * 1024 * 1024) { setError("The image must be 5 MB or smaller."); event.target.value = ""; return; }
            setError(""); setCatalogImageFile(file); setCatalogImagePreview(URL.createObjectURL(file)); setCatalogImageUrl("");
          }} />
          {catalogImagePreview && <img src={catalogImagePreview} alt="Shared catalog pin preview" style={{ display: "block", width: "160px", height: "160px", objectFit: "contain", margin: "12px 0" }} />}
          <label htmlFor="edit-pin-photo">Personal photo (private to your collection, optional)</label>
          <input
            id="edit-pin-photo"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                setImageFile(null);
                setImagePreview("");
                return;
              }

              if (!file.type.startsWith("image/")) {
                setError("Please select an image file.");
                event.target.value = "";
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setError("The image must be 5 MB or smaller.");
                event.target.value = "";
                return;
              }

              setError("");
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }}
          />

          {imagePreview && (
            <img
              src={imagePreview}
              alt={`New photo for ${pin.name}`}
              style={{
                display: "block",
                width: "160px",
                height: "160px",
                objectFit: "contain",
                margin: "12px 0",
              }}
            />
          )}


          {error && <p role="alert">{error}</p>}

          <div className="modal-actions">

          <button
            type="button"
            className="button button-secondary"
            onClick={handleRemove}
            disabled={saving}
          >
            {saving ? "Working..." : "Remove from Collection"}
          </button>

            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





export function EditPinForm({ pin, onClose, onSaved, onRemove }) {
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




export function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(data.session
          ? "Account created! You're signed in."
          : "Account created! Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setMessage("");
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    if (!email.trim()) {
      setMessage("Enter your email address above first, then choose Forgot password.");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setMessage("If an account exists for that email, a password-reset link has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error.message || "Couldn't send the password-reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#101a30", color: "#f8f2e5", fontFamily: "inherit" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400, boxSizing: "border-box", padding: 32, borderRadius: 20, background: "#1a2740", border: "1px solid #35415a" }}>
        <div style={{ color: "#e7c779", fontSize: 14, letterSpacing: 3, marginBottom: 12 }}>✦ PINFOLIO</div>
        <h1 style={{ marginBottom: 8 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p style={{ color: "#b8c0cf", lineHeight: 1.5 }}>
          {mode === "login" ? "Sign in to access your pin collection." : "Start organizing your collection and wishlist."}
        </p>

        <label style={{ display: "block", marginTop: 24 }}>
          Email address
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required style={authInputStyle} />
        </label>

        <label style={{ display: "block", marginTop: 16 }}>
          Password
          <span style={{ display: "block", position: "relative", marginTop: 8 }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required style={{ ...authInputStyle, marginTop: 0, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#b8c0cf", padding: 8, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {mode === "login" && (
          <button type="button" onClick={handleResetPassword} disabled={loading} style={{ display: "block", marginTop: 12, padding: 0, border: 0, background: "transparent", color: "#e7c779", textDecoration: "underline", cursor: loading ? "wait" : "pointer", font: "inherit", fontSize: 14 }}>
            Forgot password?
          </button>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 24, padding: 13, border: 0, borderRadius: 10, background: "#e7c779", color: "#172039", fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>

        {message && <p role="status" aria-live="polite" style={{ marginTop: 16, color: "#f8f2e5", overflowWrap: "anywhere", lineHeight: 1.5 }}>{message}</p>}

        <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); setPassword(""); setShowPassword(false); }} style={{ width: "100%", marginTop: 16, padding: 10, border: "1px solid #53617a", borderRadius: 10, background: "transparent", color: "#f8f2e5", cursor: "pointer" }}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

export function PasswordRecoveryScreen({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Your new password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords don't match. Please check them and try again.");
      return;
    }
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Your password has been updated. Taking you back to Pinfolio...");
      window.setTimeout(() => {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
        onComplete?.();
      }, 900);
    } catch (error) {
      setMessage(error.message || "Couldn't update your password. Please request a new reset link and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#101a30", color: "#f8f2e5", fontFamily: "inherit" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400, boxSizing: "border-box", padding: 32, borderRadius: 20, background: "#1a2740", border: "1px solid #35415a" }}>
        <div style={{ color: "#e7c779", fontSize: 14, letterSpacing: 3, marginBottom: 12 }}>✦ PINFOLIO</div>
        <h1 style={{ marginBottom: 8 }}>Choose a new password</h1>
        <p style={{ color: "#b8c0cf", lineHeight: 1.5 }}>Use at least 8 characters. Your new password will replace the old one.</p>
        <label style={{ display: "block", marginTop: 24 }}>New password
          <span style={{ display: "block", position: "relative", marginTop: 8 }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required style={{ ...authInputStyle, marginTop: 0, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#b8c0cf", padding: 8, display: "grid", placeItems: "center", cursor: "pointer" }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>
        </label>
        <label style={{ display: "block", marginTop: 16 }}>Confirm new password
          <span style={{ display: "block", position: "relative", marginTop: 8 }}>
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required style={{ ...authInputStyle, marginTop: 0, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#b8c0cf", padding: 8, display: "grid", placeItems: "center", cursor: "pointer" }}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>
        </label>
        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 24, padding: 13, border: 0, borderRadius: 10, background: "#e7c779", color: "#172039", fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>{loading ? "Updating password..." : "Update password"}</button>
        {message && <p role="status" aria-live="polite" style={{ marginTop: 16, color: "#f8f2e5", overflowWrap: "anywhere", lineHeight: 1.5 }}>{message}</p>}
      </form>
    </div>
  );
}

export const authInputStyle = {
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
