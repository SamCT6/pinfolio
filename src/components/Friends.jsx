import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, Heart, LoaderCircle, Search, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { supabase } from "../lib/supabase";

function displayName(profile) {
  return profile?.display_name || profile?.username || "Pinfolio member";
}

function Avatar({ profile }) {
  if (profile?.avatar_url) {
    return <img className="friends-avatar" src={profile.avatar_url} alt="" />;
  }
  return <div className="friends-avatar friends-avatar-fallback">{displayName(profile).slice(0, 1).toUpperCase()}</div>;
}

export default function Friends({ session }) {
  const userId = session?.user?.id;
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyRequest, setBusyRequest] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendPins, setFriendPins] = useState([]);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [pinsError, setPinsError] = useState("");

  const loadFriendsData = useCallback(async () => {
    if (!supabase || !userId) { setLoading(false); return; }
    setLoading(true);
    setMessage("");
    try {
      const { data: requests, error: requestError } = await supabase
        .from("friend_requests")
        .select("id,sender_id,receiver_id,status,created_at")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (requestError) throw requestError;
      const rows = requests || [];
      const incomingRows = rows.filter(r => r.receiver_id === userId && r.status === "pending");
      const outgoingRows = rows.filter(r => r.sender_id === userId && r.status === "pending");
      const acceptedRows = rows.filter(r => r.status === "accepted");
      const otherIds = [...new Set(rows.map(r => r.sender_id === userId ? r.receiver_id : r.sender_id))];
      let profiles = [];
      if (otherIds.length) {
        const { data, error } = await supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", otherIds);
        if (error) throw error;
        profiles = data || [];
      }
      const byId = new Map(profiles.map(p => [p.id, p]));
      setFriends(acceptedRows.map(r => ({ ...byId.get(r.sender_id === userId ? r.receiver_id : r.sender_id), requestId: r.id })).filter(p => p.id));
      setIncoming(incomingRows.map(r => ({ ...r, profile: byId.get(r.sender_id) || { id: r.sender_id, username: "Pinfolio member" } })));
      setOutgoing(outgoingRows.map(r => ({ ...r, profile: byId.get(r.receiver_id) || { id: r.receiver_id, username: "Pinfolio member" } })));
    } catch (error) {
      console.error("Could not load friends:", error);
      setMessage(error.message || "Couldn't load friends. Check your Supabase policies and try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadFriendsData(); }, [loadFriendsData]);

  async function searchForFriend(event) {
    event.preventDefault();
    const value = username.trim().replace(/^@/, "");
    if (!value) return;
    setSearching(true); setMessage(""); setSearchResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("find-trading-user", { body: { username: value } });
      if (error) throw error;
      if (!data?.user) {
        setMessage(data?.message || "No user found. Check the username and try again.");
      } else if (data.user.id === userId) {
        setMessage("That's your own username!");
      } else {
        setSearchResult(data.user);
      }
    } catch (error) {
      setMessage(error.message || "Couldn't search for that username.");
    } finally { setSearching(false); }
  }

  async function sendRequest() {
    if (!searchResult || !userId) return;
    setSending(true); setMessage("");
    try {
      const { error } = await supabase.from("friend_requests").insert({ sender_id: userId, receiver_id: searchResult.id, status: "pending" });
      if (error) {
        if (error.code === "23505") throw new Error("A friend request or friendship already exists with this person.");
        throw error;
      }
      setMessage(`Friend request sent to ${displayName(searchResult)}.`);
      setSearchResult(null); setUsername("");
      await loadFriendsData();
    } catch (error) { setMessage(error.message || "Couldn't send the friend request."); }
    finally { setSending(false); }
  }

  async function respondToRequest(requestId, response) {
    setBusyRequest(requestId); setMessage("");
    try {
      const { error } = await supabase.rpc("respond_to_friend_request", { p_request_id: requestId, p_response: response });
      if (error) throw error;
      await loadFriendsData();
    } catch (error) { setMessage(error.message || "Couldn't update this friend request."); }
    finally { setBusyRequest(null); }
  }

  async function openFriend(profile) {
    setSelectedFriend(profile); setFriendPins([]); setPinsError(""); setPinsLoading(true);
    try {
      const { data, error } = await supabase
        .from("collection_items")
        .select("id,owned_quantity,tradeable_quantity,visibility,authenticity_status,photo_url,photo_path,pins(id,name,character_name,franchise,park,release_year,image_url,image_path)")
        .eq("user_id", profile.id)
        .eq("visibility", "public");
      if (error) throw error;
      const resolvedPins = await Promise.all((data || []).filter(row => row.pins).map(async row => {
        const pin = row.pins;
        const imagePath = row.photo_path || pin.image_path || null;
        let displayImageUrl = row.photo_url || pin.image_url || null;
        if (imagePath && supabase?.storage) {
          const { data: signed, error: signedError } = await supabase.storage.from("pin-images").createSignedUrl(imagePath, 60 * 60);
          if (!signedError && signed?.signedUrl) displayImageUrl = signed.signedUrl;
        }
        return { ...pin, display_image_url: displayImageUrl, owned: row.owned_quantity, tradeable: row.tradeable_quantity, authenticity_status: row.authenticity_status || "unknown" };
      }));
      setFriendPins(resolvedPins);
    } catch (error) {
      console.error("Could not load public pins:", error);
      setPinsError("Couldn't load this friend's public pins. Check that the Friends access migration has been applied.");
    } finally { setPinsLoading(false); }
  }

  if (selectedFriend) {
    return <section className="friends-page">
      <button className="button button-secondary friends-back" onClick={() => setSelectedFriend(null)}><ArrowLeft size={16} /> Back to friends</button>
      <div className="friends-profile-heading"><Avatar profile={selectedFriend} /><div><div className="eyebrow">FRIEND'S PROFILE</div><h1>{displayName(selectedFriend)}</h1><p>{selectedFriend.username ? `@${selectedFriend.username}` : "Pinfolio member"} · Public pins only</p></div></div>
      {pinsLoading ? <div className="friends-empty"><LoaderCircle className="spin" size={22} /> Loading public pins…</div> : pinsError ? <div className="friends-alert" role="alert">{pinsError}</div> : friendPins.length === 0 ? <div className="friends-empty"><Heart size={25} /><h3>No public pins yet</h3><p>This friend hasn't shared any collection pins publicly.</p></div> : <>
        <div className="friends-section-heading"><div><h2>Public pins</h2><p>{friendPins.length} {friendPins.length === 1 ? "pin" : "pins"} shared publicly</p></div></div>
        <div className="friends-pin-grid">{friendPins.map(pin => <article className="friends-pin-card" key={pin.id}><div className="friends-pin-image">{pin.display_image_url ? <><img src={pin.display_image_url} alt={pin.name} loading="lazy" onError={event => { event.currentTarget.style.display = "none"; if (event.currentTarget.nextElementSibling) event.currentTarget.nextElementSibling.style.display = "flex"; }} /><div className="friends-pin-placeholder" style={{display:"none"}}>✦</div></> : <div className="friends-pin-placeholder">✦</div>}</div><div className="friends-pin-copy"><strong>{pin.name}</strong>{pin.character_name && <span>{pin.character_name}</span>}{(pin.park || pin.release_year) && <small>{[pin.park, pin.release_year].filter(Boolean).join(" · ")}</small>}<span className={`authenticity-badge authenticity-${pin.authenticity_status || "unknown"}`}>{({unknown:"Authenticity unknown",verified_authentic:"Verified authentic",suspected_counterfeit:"Suspected counterfeit",confirmed_counterfeit:"Confirmed counterfeit"})[pin.authenticity_status || "unknown"]}</span></div></article>)}</div>
      </>}
    </section>;
  }

  return <section className="friends-page">
    <div className="section-title"><div><div className="eyebrow">YOUR PIN COMMUNITY</div><h1>Friends</h1><p>Add friends, manage requests, and browse the pins they've chosen to share publicly.</p></div></div>
    <div className="friends-layout">
      <div className="friends-main-column">
        <section className="panel friends-panel"><div className="friends-section-heading"><div><h2><UserPlus size={19} /> Add a friend</h2><p>Search by their exact Pinfolio username.</p></div></div>
          <form className="friends-search-form" onSubmit={searchForFriend}><label className="friends-search-box"><Search size={18} /><span className="sr-only">Username</span><input value={username} onChange={e => { setUsername(e.target.value); setSearchResult(null); }} placeholder="Enter username" autoComplete="off" /></label><button className="button button-primary" type="submit" disabled={searching || !username.trim()}>{searching ? "Searching…" : "Search"}</button></form>
          {searchResult && <div className="friends-search-result"><Avatar profile={searchResult} /><div className="friends-person-copy"><strong>{displayName(searchResult)}</strong><span>@{searchResult.username}</span></div><button className="button button-gold" onClick={sendRequest} disabled={sending}>{sending ? "Sending…" : "Add friend"}</button></div>}
          {message && <p className="friends-message" role="status">{message}</p>}
        </section>
        <section className="panel friends-panel"><div className="friends-section-heading"><div><h2><Users size={19} /> My friends</h2><p>Open a friend to browse their public pins.</p></div><span className="friends-count">{friends.length}</span></div>
          {loading ? <div className="friends-empty"><LoaderCircle size={21} className="spin" /> Loading friends…</div> : friends.length === 0 ? <div className="friends-empty"><Users size={25} /><h3>Your friend list is empty</h3><p>Search for a friend by username to get started.</p></div> : <div className="friends-list">{friends.map(friend => <button className="friends-list-row" key={friend.id} onClick={() => openFriend(friend)}><Avatar profile={friend} /><span className="friends-person-copy"><strong>{displayName(friend)}</strong><span>@{friend.username || "member"}</span></span><span className="friends-view-link">View pins <ArrowLeft size={14} /></span></button>)}</div>}
        </section>
      </div>
      <div className="friends-side-column">
        <section className="panel friends-panel"><div className="friends-section-heading"><div><h2><Clock3 size={19} /> Friend requests</h2><p>Requests waiting for your response.</p></div><span className="friends-count">{incoming.length}</span></div>
          {loading ? <p className="friends-muted">Loading requests…</p> : incoming.length === 0 ? <div className="friends-compact-empty">No incoming requests right now.</div> : <div className="friends-request-list">{incoming.map(request => <div className="friends-request-row" key={request.id}><Avatar profile={request.profile} /><div className="friends-person-copy"><strong>{displayName(request.profile)}</strong><span>@{request.profile.username || "member"}</span></div><div className="friends-request-actions"><button aria-label="Accept friend request" title="Accept" disabled={busyRequest === request.id} onClick={() => respondToRequest(request.id, "accepted")}><Check size={17} /></button><button aria-label="Decline friend request" title="Decline" disabled={busyRequest === request.id} onClick={() => respondToRequest(request.id, "declined")}><X size={17} /></button></div></div>)}</div>}
          {outgoing.length > 0 && <><div className="friends-subheading">Sent requests</div><div className="friends-request-list">{outgoing.map(request => <div className="friends-request-row" key={request.id}><Avatar profile={request.profile} /><div className="friends-person-copy"><strong>{displayName(request.profile)}</strong><span>Awaiting response</span></div><Clock3 size={16} className="friends-muted-icon" /></div>)}</div></>}
        </section>
        <div className="friends-privacy-note"><ShieldCheck size={19} /><div><strong>Privacy stays in your hands</strong><p>Only pins marked Public appear here. Private pins are never shown.</p></div></div>
      </div>
    </div>
  </section>;
}
