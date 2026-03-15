
import { useState, useEffect } from "react";

// Load Google Fonts
if (typeof document !== "undefined" && !document.getElementById("bday-fonts")) {
  const link = document.createElement("link");
  link.id = "bday-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&display=swap";
  document.head.appendChild(link);
}

// Colors
const C = {
  bg: "#FDF6F0",
  surface: "#FFFFFF",
  primary: "#C23B6E",
  primaryLight: "#FCEAF1",
  primaryMid: "#E8759F",
  accent: "#D4934A",
  accentLight: "#FEF0E2",
  text: "#2C1319",
  muted: "#896070",
  border: "#F0D5DC",
  success: "#3D7A56",
  successLight: "#D8F0E2",
};

// Typography
const T = {
  heading: { fontFamily: "'Playfair Display', serif" },
  body: { fontFamily: "'DM Sans', sans-serif" },
};

// Generate random ID
function genId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Storage helpers using localStorage (replacing window.storage)
function saveWishlist(wl) {
  localStorage.setItem(`wl:${wl.id}`, JSON.stringify(wl));
}

function loadWishlist(id) {
  const data = localStorage.getItem(`wl:${id}`);
  return data ? JSON.parse(data) : null;
}

function saveClaim(wishlistId, giftId, claimerName) {
  localStorage.setItem(
    `claim:${wishlistId}:${giftId}`,
    JSON.stringify({ name: claimerName, at: Date.now() })
  );
}

function loadClaim(wishlistId, giftId) {
  const data = localStorage.getItem(`claim:${wishlistId}:${giftId}`);
  return data ? JSON.parse(data) : null;
}

// Gift categories
const categories = [
  { label: "Gift", icon: "🎁" },
  { label: "Tech", icon: "💻" },
  { label: "Books", icon: "📚" },
  { label: "Fashion", icon: "👗" },
  { label: "Beauty", icon: "💄" },
  { label: "Food", icon: "🍫" },
  { label: "Music", icon: "🎵" },
  { label: "Sport", icon: "🏃" },
  { label: "Home", icon: "🏠" },
  { label: "Travel", icon: "✈️" },
];

// Home Screen
function HomeScreen({ onCreate, onView }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const handleView = () => {
    const wl = loadWishlist(code.trim());
    if (!wl) {
      setErr("Wishlist not found");
      return;
    }
    onView(wl.id);
  };

  return (
    <div style={{ ...T.body, background: C.bg, minHeight: "100vh", padding: 40 }}>
      <h1 style={{ ...T.heading }}>🎂 Birthday Wishlist</h1>

      <button onClick={onCreate} style={{ marginTop: 20 }}>
        Create Wishlist
      </button>

      <div style={{ marginTop: 30 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter wishlist code"
        />
        <button onClick={handleView}>View</button>
      </div>

      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}

// Create Screen
function CreateScreen({ onCreated, onBack }) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    const wl = {
      id: genId(),
      ownerName: name,
      gifts: [],
      createdAt: Date.now(),
    };

    saveWishlist(wl);
    onCreated(wl.id);
  };

  return (
    <div style={{ padding: 40 }}>
      <button onClick={onBack}>Back</button>

      <h2>Create Wishlist</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />

      <button onClick={handleCreate}>Create</button>
    </div>
  );
}

// Edit Screen
function EditScreen({ id, onBack }) {
  const [wl, setWl] = useState(null);
  const [giftName, setGiftName] = useState("");

  useEffect(() => {
    setWl(loadWishlist(id));
  }, [id]);

  const addGift = () => {
    if (!giftName.trim()) return;

    const newGift = { id: genId(), name: giftName };

    const updated = { ...wl, gifts: [...wl.gifts, newGift] };
    saveWishlist(updated);

    setWl(updated);
    setGiftName("");
  };

  if (!wl) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={onBack}>Back</button>

      <h2>{wl.ownerName}'s Wishlist</h2>

      <input
        value={giftName}
        onChange={(e) => setGiftName(e.target.value)}
        placeholder="Gift name"
      />

      <button onClick={addGift}>Add Gift</button>

      <ul>
        {wl.gifts.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}

// View Screen
function ViewScreen({ id, onBack }) {
  const [wl, setWl] = useState(null);

  useEffect(() => {
    setWl(loadWishlist(id));
  }, [id]);

  if (!wl) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={onBack}>Back</button>

      <h2>{wl.ownerName}'s Wishlist</h2>

      <ul>
        {wl.gifts.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Main App
export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeId, setActiveId] = useState(null);

  if (screen === "create")
    return (
      <CreateScreen
        onCreated={(id) => {
          setActiveId(id);
          setScreen("edit");
        }}
        onBack={() => setScreen("home")}
      />
    );

  if (screen === "edit")
    return <EditScreen id={activeId} onBack={() => setScreen("home")} />;

  if (screen === "view")
    return <ViewScreen id={activeId} onBack={() => setScreen("home")} />;

  return (
    <HomeScreen
      onCreate={() => setScreen("create")}
      onView={(id) => {
        setActiveId(id);
        setScreen("view");
      }}
    />
  );
}
