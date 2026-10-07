"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

/* ================= CONFIG: edit these ================= */
const TREASURY = "EDzTz45DnzVptyrCtZ1yY4dkYmVM9nMcSvXqqcNDi81a"; // fee wallet
const BASE = 0.3; // base platform fee (SOL)
const CLUSTER = "devnet" as const; // test on devnet first, switch to "mainnet-beta" later
// Files in /public are served from the site root: public/iPhoneSS.webp -> "/iPhoneSS.webp" (never "/public/...")
const IMG = {
  hero: "/bg.webp", // change to the real path of your earth/moon background inside /public
  phone: "/iPhoneSS.webp",
  content: "/sol.webp", // Solana Token Creator screenshot (framed section)
  coins1: "/coinGroup1.webp",
  coins2: "/coinGroup2.webp",
  unlock: "/Iph.webp", // 2nd phone ("Unlock the Full Potential" section)
  feature: "/Iph2.webp", // last phone (Features card)
};
const STATS: [number, string, number, string][] = [[400000, "+", 0, "Tokens Created"], [25000, "+", 0, "Active Users"], [99.9, "%", 1, "Success Rate"]];
const FEED: [string, string][] = [["SP**", "launched"], ["Fair a***", "deployed"], ["FistTo***", "created"], ["The Sp***", "launched"], ["M**", "deployed"], ["The Ki***", "created"], ["Cr**", "launched"], ["Altura***", "deployed"], ["Ghostw***", "created"]];
const FEED0 = [{ id: 0, n: "SP**", a: "launched", m: 3 }, { id: 1, n: "Fair a***", a: "deployed", m: 1 }, { id: 2, n: "FistTo***", a: "created", m: 2 }];
/* ===================================================== */

const VIEWS = ["home", "create", "tools", "pool", "manage", "portfolio"];
const NAV: [string, string][] = [["home", "Home"], ["create", "Create Token"], ["tools", "Tools"], ["pool", "Liquidity Pool"], ["manage", "Manage Liquidity"]];
const NO_WALLETS: never[] = [];

// name, url, bg, fg, popular
const POP: [string, string, string, string, boolean][] = [
  ["Solflare", "https://solflare.com", "#fed033", "#000", true],
  ["Phantom", "https://phantom.app", "#ab9ff2", "#fff", true],
  ["Trust Wallet", "https://trustwallet.com", "#fff", "#0b5cff", false],
  ["Jupiter", "https://jup.ag", "#10232a", "#4fe3c1", false],
  ["MetaMask", "https://metamask.io", "#fff", "#f6851b", false],
];
const MORE: [string, string][] = [
  ["Backpack", "https://backpack.app"], ["Coinbase Wallet", "https://www.coinbase.com/wallet"], ["OKX Wallet", "https://www.okx.com/web3"],
  ["Ledger", "https://www.ledger.com"], ["Exodus", "https://www.exodus.com"], ["Glow", "https://glow.app"], ["Coin98", "https://coin98.com"],
  ["Bitget Wallet", "https://web3.bitget.com"], ["TokenPocket", "https://www.tokenpocket.pro"], ["SafePal", "https://www.safepal.com"]];
const DL: Record<string, (u: string) => string> = {
  Phantom: (u) => "https://phantom.app/ul/browse/" + encodeURIComponent(u) + "?ref=" + encodeURIComponent(location.origin),
  Solflare: (u) => "https://solflare.com/ul/v1/browse/" + encodeURIComponent(u) + "?ref=" + encodeURIComponent(location.origin),
  "Trust Wallet": (u) => "https://link.trustwallet.com/open_url?coin_id=501&url=" + encodeURIComponent(u),
  MetaMask: (u) => "https://metamask.app.link/dapp/" + u.replace(/^https?:\/\//, ""),
};

// key, title, cost (SOL), label shown, description
const OPTS: [string, string, number, string, string][] = [
  ["banner", "Custom Token Banner", 0.1, "+0.1 SOL", "Add a custom banner image to your token's metadata (e.g., for display on DEX Screener)."],
  ["multi", "Multi Chain Launch", 0, "FREE", "Deploy your token across multiple blockchains for broader reach and liquidity."],
  ["privacy", "Advanced Privacy", 0.5, "0.5 SOL", "Enhanced privacy features and anonymization tools for secure token operations."],
  ["trend", "Project Trend", 0.3, "0.3 SOL", "Boost your coin's visibility by appearing as trending across major platforms."],
  ["bot", "Bot Your Coin", 1, "1 SOL", "We will bot your coin with 200-500 random wallets investing random amounts to boost your coin to the top on DEX and Axiom."],
  ["creator", "Creator's Info (Optional)", 0.1, "+0.1 SOL", "Change the information of the creator in the metadata. By default, it is Luna Launch."],
  ["social", "Add Social Links & Tags", 0.1, "+0.1 SOL", "Add links to your token metadata."],
  ["lp", "Luna Liquidity Pool", 0, "FREE", "Full access to the liquidity pool."],
];
const REV: [string, string, string][] = [
  ["freeze", "Revoke Freeze", "No one will be able to freeze holders' token accounts anymore"],
  ["mint", "Revoke Mint", "No one will be able to create more tokens anymore"],
  ["update", "Revoke Update", "No one will be able to modify token metadata anymore"],
];
// icon, title, badge, desc, price (SOL), href
const TOOLS: [string, string, string, string, string, string?][] = [
  ["🚀", "Solana Token Creator", "POPULAR", "Create SPL tokens instantly with no coding required", "0.1", "#create"],
  ["📈", "Volume Bot", "PREMIUM", "Automated bot to increase trading volume and activity", "3"],
  ["📦", "Bundler Bot", "PREMIUM", "Bundle multiple transactions for optimal execution", "3"],
  ["🎯", "Sniper Bot", "PREMIUM", "Fast execution bot for sniping token launches", "3"],
  ["⚡", "Arbitrage Bot", "PREMIUM", "Automated arbitrage trading across multiple DEXes", "3"],
  ["👥", "Copy Trading Bot", "PREMIUM", "Mirror successful traders automatically", "3"],
  ["💧", "Create Liquidity Pool", "", "Create a liquidity pool on Raydium or other DEXes", "0.2"],
  ["📤", "Token Multisender", "", "Send tokens to multiple wallets in one transaction", "0.1"],
  ["🔓", "Revoke Authorities", "", "Revoke mint/freeze authorities for trust building", "0.05"],
  ["🔥", "Token Burn", "", "Permanently burn tokens to reduce supply", "0.05"],
  ["✨", "Vanity Address Generator", "", "Generate custom wallet addresses with patterns", "0.2"],
  ["📊", "Token Analytics Dashboard", "", "Real-time analytics and holder insights", "0.15"],
  ["🛡️", "Rug Pull Checker", "", "Analyze tokens for potential rug pull risks", "0.1"],
  ["👁️", "Wallet Tracker", "", "Monitor and track whale wallet movements", "0.25"],
  ["🎯", "Presale Creator", "", "Launch token presales with automated features", "0.3"],
  ["🎁", "Airdrop Tool", "", "Mass distribute tokens with eligibility criteria", "0.15"],
];

type Hist = { name: string; sym: string; fee: number; sig: string; t: number };
const short = (a: string) => a.slice(0, 4) + "…" + a.slice(-4);
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const Logo = () => <span className="logo">L<i className="cres" />NA</span>;

function loadQR(): Promise<any> {
  return new Promise((res) => {
    const w = window as any;
    if (w.qrcode) return res(w.qrcode);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";
    s.onload = () => res(w.qrcode);
    s.onerror = () => res(null);
    document.head.appendChild(s);
  });
}

function Count({ to, suf, dec }: { to: number; suf: string; dec: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now(), D = 1900;
    const step = (t: number) => { const p = Math.min(1, (t - t0) / D); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}{suf}</>;
}

function Ic({ k }: { k: string }) {
  const p = { viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (k === "lock") return <svg {...p} fill="none" stroke="#2ee59d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /><circle cx="12" cy="15.5" r="1" fill="#2ee59d" /></svg>;
  if (k === "bolt") return <svg {...p}><path d="M13.5 2 5 13.5h6L10 22l9-12h-6.2z" fill="#facc15" /></svg>;
  if (k === "shield") return <svg {...p}><path d="M12 2 4.5 5v6.2c0 4.8 3.2 8.7 7.5 10.8 4.3-2.1 7.5-6 7.5-10.8V5z" fill="#1fe08a" /><rect x="9.5" y="9.5" width="5" height="6" rx="1.2" fill="#04130c" /></svg>;
  if (k === "launched") return <svg {...p}><path d="m12 2 3 6.8 7.2.7-5.4 4.8 1.6 7.2L12 17.8 5.6 21.5l1.6-7.2L1.8 9.5l7.2-.7z" fill="#ff7a2f" /></svg>;
  if (k === "deployed") return <svg {...p}><path d="M6 3l13 8.5-6 1.6-3.2 6.4z" fill="#22b8f0" /></svg>;
  return <svg {...p}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" fill="#ffd21f" /></svg>;
}


/* ================= Manage Liquidity: chart + swap-style panel ================= */
const TOK: Record<string, { bg: string; ch: string; fg?: string }> = {
  LUNA: { bg: "linear-gradient(135deg,#3cc4f0,#7c6cf0)", ch: "L", fg: "#fff" },
  SOL: { bg: "#0d1018", ch: "S", fg: "#b98bff" },
  USDC: { bg: "#2775ca", ch: "$", fg: "#fff" },
};
const TOKS = Object.keys(TOK);
const TokIcon = ({ s, size = 34 }: { s: string; size?: number }) => (
  <span className="tki" style={{ width: size, height: size, background: TOK[s].bg, color: TOK[s].fg, fontSize: size * 0.48 }}>{TOK[s].ch}</span>
);
const Svg = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
const fmtN = (n: number) => (n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 4 }) : n === 0 ? "0" : n.toFixed(6).replace(/0+$/, ""));

function Chart({ pair }: { pair: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    let h = 7; for (const c of pair) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
    const out: { o: number; h: number; l: number; c: number }[] = [];
    let p = 0.0185;
    for (let i = 0; i < 110; i++) {
      const o = p, c = Math.max(0.0125, o + (rnd() - 0.5) * 0.0011 + Math.sin(i / 9) * 0.00018);
      out.push({ o, c, h: Math.max(o, c) + rnd() * 0.0004, l: Math.min(o, c) - rnd() * 0.0004 }); p = c;
    }
    return out;
  }, [pair]);

  useEffect(() => {
    const c = cv.current, w = wrap.current; if (!c || !w) return;
    const draw = () => {
      const W = w.clientWidth, H = w.clientHeight; if (W < 50 || H < 50) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = W * dpr; c.height = H * dpr;
      const x = c.getContext("2d"); if (!x) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      const AX = 74, BY = 30, pw = W - AX, ph = H - BY;
      const hi = Math.max(...data.map((d) => d.h)), lo = Math.min(...data.map((d) => d.l));
      const step = 0.0005, top = Math.ceil((hi + 0.0003) / step) * step, bot = Math.floor((lo - 0.0003) / step) * step;
      const Y = (v: number) => ph - ((v - bot) / (top - bot)) * ph;
      x.font = "13px sans-serif"; x.textBaseline = "middle";
      x.strokeStyle = "#0b1022"; x.lineWidth = 1; x.fillStyle = "#c9d3ee";
      const every = Math.max(1, Math.round(((top - bot) / step) / 8));
      for (let v = bot; v <= top + 1e-9; v += step * every) { const y = Math.round(Y(v)) + .5; x.beginPath(); x.moveTo(0, y); x.lineTo(pw, y); x.stroke(); x.fillText(v.toFixed(4), pw + 8, y); }
      const lab = ["25", "05:00", "28", "Oct", "4", "6", "12:00"]; x.textAlign = "center";
      lab.forEach((t, i) => { const xx = Math.round((pw / lab.length) * (i + 0.5)) + .5; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, ph); x.stroke(); x.fillStyle = "#c9d3ee"; x.fillText(t, xx, ph + 16); });
      x.textAlign = "left";
      const cw = pw / data.length;
      data.forEach((d, i) => {
        const up = d.c >= d.o, col = up ? "#27d3b4" : "#f2517a", cx = i * cw + cw / 2;
        x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 1;
        x.beginPath(); x.moveTo(cx, Y(d.h)); x.lineTo(cx, Y(d.l)); x.stroke();
        const y1 = Y(Math.max(d.o, d.c)), y2 = Y(Math.min(d.o, d.c));
        x.fillRect(cx - cw * 0.3, y1, cw * 0.6, Math.max(1, y2 - y1));
      });
      const tag = (v: number, label: string, bg: string, fg: string, dash: boolean) => {
        const y = Y(v);
        if (dash) { x.strokeStyle = "#5b6a95"; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(0, y); x.lineTo(pw, y); x.stroke(); x.setLineDash([]); }
        x.fillStyle = bg; x.fillRect(pw + 2, y - 11, AX - 4, 22); x.fillStyle = fg; x.fillText(v.toFixed(6), pw + 6, y);
        if (label) { x.fillStyle = "#0b1022"; x.fillRect(pw - 52, y - 11, 50, 22); x.fillStyle = "#fff"; x.fillText(label, pw - 44, y); }
      };
      tag(hi, "High", "#0b1022", "#fff", true); tag(lo, "Low", "#0b1022", "#fff", true);
      const last = data[data.length - 1]; tag(last.c, "", "#27d3b4", "#06251f", true);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(w); return () => ro.disconnect();
  }, [data]);

  const l = data[data.length - 1], f = (n: number) => n.toFixed(6);
  return (
    <>
      <div className="ohlc"><span>O</span>{f(l.o)} <span>H</span>{f(l.h)} <span>L</span>{f(l.l)} <span>C</span>{f(l.c)} {fmtN(l.c - l.o)} ({(((l.c - l.o) / l.o) * 100).toFixed(2)}%)</div>
      <div className="plot" ref={wrap}><canvas ref={cv} /></div>
    </>
  );
}

function ManageView({ addr, publicKey, openWallet, toast }: { addr: string | null; publicKey: PublicKey | null; openWallet: () => void; toast: (m: string) => void }) {
  const { connection } = useConnection();
  const [from, setFrom] = useState("LUNA");
  const [to, setTo] = useState("SOL");
  const [amt, setAmt] = useState("");
  const [sel, setSel] = useState<null | "from" | "to">(null);
  const [solBal, setSolBal] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let off = false; if (!publicKey) { setSolBal(0); return; }
    const go = () => connection.getBalance(publicKey).then((b) => { if (!off) setSolBal(b / LAMPORTS_PER_SOL); }).catch(() => {});
    go(); const t = setInterval(go, 15000); return () => { off = true; clearInterval(t); };
  }, [publicKey, connection]);

  const bal = (s: string) => (s === "SOL" ? solBal : 0);
  const fb = addr ? bal(from) : 0, tb = addr ? bal(to) : 0;
  const flip = () => { setFrom(to); setTo(from); setAmt(""); };
  const pick = (side: "from" | "to", s: string) => {
    setSel(null);
    if (side === "from") { if (s === to) flip(); else setFrom(s); } else { if (s === from) flip(); else setTo(s); }
  };
  const num = parseFloat(amt) || 0;
  const tz = now ? -now.getTimezoneOffset() / 60 : 0;
  const clock = now ? now.toLocaleTimeString("en-GB") + ` (UTC${tz >= 0 ? "+" : ""}${tz})` : "";
  const stamp = now ? `${String(now.getFullYear()).slice(2)}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` : "";

  let cta = "Swap", dis = false;
  if (!addr) cta = "Connect Wallet"; else if (!num) { cta = "Enter an amount"; dis = true; } else if (num > fb) { cta = `Insufficient ${from} balance`; dis = true; }
  const act = () => { if (!addr) return openWallet(); if (!dis) toast("Swaps and liquidity actions go live once the backend is connected."); };

  const renderSide = (side: "from" | "to", s: string, b: number) => (
    <div className="sbox">
      <div className="sh">
        <b>{side === "from" ? "From" : "To"}</b>
        <span className="sbal"><Svg d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l12-3v3M17 14h2" size={15} /><u>{fmtN(b)}</u></span>
        <button className="mx" disabled={!addr} onClick={() => setAmt(String(Math.max(0, s === "SOL" ? b - 0.01 : b)))}>Max</button>
        <button className="mx" disabled={!addr} onClick={() => setAmt(String(b / 2))}>50%</button>
      </div>
      <div className="si">
        <div className="tsel">
          <button className="tp" onClick={() => setSel(sel === side ? null : side)} aria-haspopup="listbox"><TokIcon s={s} size={34} /><span>{s}</span><i className="chev" /></button>
          {sel === side && (
            <div className="tdd" role="listbox">{TOKS.map((t) => (<button key={t} role="option" aria-selected={t === s} onClick={() => pick(side, t)}><TokIcon s={t} size={26} />{t}</button>))}</div>
          )}
        </div>
        <div className="amt">
          {side === "from"
            ? <input inputMode="decimal" placeholder="0.00" value={amt} aria-label="Amount to swap" onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmt(e.target.value)} />
            : <input value="" placeholder="0.00" readOnly aria-label="Amount to receive" />}
          <small>~$0</small>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mgw">
      <section className="cpanel">
        <div className="chead">
          <span className="pair"><span className="pi"><TokIcon s={from} size={34} /><TokIcon s={to} size={34} /></span><b>{from} / {to}</b>
            <button className="sw2" aria-label="Flip pair" onClick={flip}><Svg d="M7 7h12M16 3l4 4-4 4M17 17H5M8 21l-4-4 4-4" size={18} /></button></span>
          <span className="stamp">{stamp}</span>
        </div>
        <div className="ctool">
          <button className="tf">15m</button>
          <button className="ib" aria-label="Candles"><Svg d="M7 4v16M17 6v12M5 8h4v8H5zM15 9h4v6h-4z" size={20} /></button>
          <button className="ind"><i>ƒx</i> Indicators</button>
          <span className="sp" />
          <button className="ib" aria-label="Alerts"><Svg d="M12 8v5l3 2M5 3 2 6M19 3l3 3M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" size={22} /></button>
          <button className="ib" aria-label="Settings"><Svg d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" size={22} /></button>
          <button className="ib" aria-label="Fullscreen" onClick={() => document.querySelector(".cpanel")?.requestFullscreen?.().catch(() => {})}><Svg d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" size={22} /></button>
          <button className="ib" aria-label="Screenshot"><Svg d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={22} /></button>
        </div>
        <Chart pair={from + "/" + to} />
        <div className="cfoot"><span className="mute">Sample data — live prices connect with the backend</span><span className="sp" /><span>{clock}</span><button>%</button><button>log</button><button className="auto">auto</button></div>
      </section>

      <section className="rcol">
        <div className="rbar">
          <div className="seg"><button className="on">Market</button><button onClick={() => toast("Limit orders are coming soon")}>Limit</button></div>
          <span className="sp" />
          <span className="slip"><Svg d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" size={16} /> 0.5%</span>
          <button className="ib2" aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(location.href).catch(() => {}); toast("Link copied"); }}><Svg d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" size={22} /></button>
          <button className="ib2" aria-label="Swap view"><Svg d="M4 7h16M4 12h16M4 17h16" size={22} /></button>
          <button className="ib2" aria-label="Chart"><Svg d="M5 20V10M12 20V4M19 20v-7" size={22} /></button>
          <button className="ib2" aria-label="Orders"><Svg d="M3 6h18v12H3zM3 10h18" size={22} /></button>
        </div>
        <div className="spanel">
          {renderSide("from", from, fb)}
          <button className="mid" aria-label="Switch tokens" onClick={flip}><Svg d="M12 5v14M6 13l6 6 6-6" size={26} /></button>
          {renderSide("to", to, tb)}
          <button className="scta" disabled={dis} onClick={act}>{cta}</button>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  const endpoint = useMemo(() => clusterApiUrl(CLUSTER), []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={NO_WALLETS} autoConnect>
        <App />
      </WalletProvider>
    </ConnectionProvider>
  );
}

function App() {
  const { wallets, select, connect, disconnect, publicKey, wallet, connected, connecting, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const addr = publicKey ? publicKey.toBase58() : null;

  const [view, setView] = useState("home");
  const [modal, setModal] = useState<null | "list" | "qr" | "all" | "done">(null);
  const [qrW, setQrW] = useState<(typeof POP)[number] | null>(null);
  const [want, setWant] = useState<WalletName | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState<Hist[]>([]);
  const [last, setLast] = useState<Hist | null>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cv = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const banRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ name: "", sym: "", dec: "9", sup: "1000000", desc: "", rcp: "", web: "", tw: "", tg: "", creator: "" });
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [rcpErr, setRcpErr] = useState(false);
  const [sc, setSc] = useState(false);
  const [menu, setMenu] = useState(false);
  const [feed, setFeed] = useState(FEED0);
  const fi = useRef(3);

  useEffect(() => {
    const f = () => setSc(window.scrollY > 30);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const t = setInterval(() => {
      const [n, a] = FEED[fi.current % FEED.length]; const id = fi.current++;
      setFeed((p) => [{ id, n, a, m: 0 }, ...p.slice(0, 2).map((x) => ({ ...x, m: x.m + 1 + Math.floor(Math.random() * 2) }))]);
    }, 3500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const toast = (m: string, ms = 3400) => { setMsg(m); clearTimeout(tRef.current); tRef.current = setTimeout(() => setMsg(""), ms); };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k: string) => setSel((p) => ({ ...p, [k]: !p[k] }));
  const fee = useMemo(
    () => +(BASE + OPTS.reduce((t, o) => t + (sel[o[0]] ? o[2] : 0), 0) + REV.reduce((t, r) => t + (sel[r[0]] ? 0.1 : 0), 0)).toFixed(2),
    [sel]
  );

  /* routing via hash */
  useEffect(() => {
    const fn = () => { const v = location.hash.slice(1) || "home"; setView(VIEWS.includes(v) ? v : "home"); setMenu(false); window.scrollTo(0, 0); };
    fn(); window.addEventListener("hashchange", fn);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    const rs = () => { if (window.innerWidth > 860) setMenu(false); };
    window.addEventListener("keydown", esc); window.addEventListener("resize", rs);
    return () => { window.removeEventListener("hashchange", fn); window.removeEventListener("keydown", esc); window.removeEventListener("resize", rs); };
  }, []);
  useEffect(() => { if (connected && (modal === "list" || modal === "all" || modal === "qr")) setModal(null); }, [connected]); // eslint-disable-line
  useEffect(() => {
    if (want && wallet?.adapter.name === want && !connected && !connecting) {
      setWant(null); connect().catch(() => toast("Connection rejected"));
    }
  }, [want, wallet, connected, connecting]); // eslint-disable-line

  /* history per wallet (localStorage) */
  useEffect(() => {
    if (!addr) return setHist([]);
    try { setHist(JSON.parse(localStorage.getItem("luna_hist_" + addr) || "[]")); } catch { setHist([]); }
  }, [addr]);

  /* QR */
  useEffect(() => {
    if (modal !== "qr" || !qrW) return;
    let off = false;
    loadQR().then((qrcode) => {
      const c = cv.current; if (off || !c) return;
      const x = c.getContext("2d"); if (!x) return;
      x.fillStyle = "#fff"; x.fillRect(0, 0, 400, 400);
      if (!qrcode) { x.fillStyle = "#000"; x.font = "16px sans-serif"; x.fillText("QR unavailable. Use Copy link.", 80, 200); return; }
      const q = qrcode(0, "H"); q.addData(DL[qrW[0]](window.location.href)); q.make();
      const n = q.getModuleCount(), m = Math.floor(400 / (n + 2)), o = Math.floor((400 - m * n) / 2);
      x.fillStyle = "#000";
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(o + k * m, o + r * m, m, m);
    });
    return () => { off = true; };
  }, [modal, qrW]);

  const installed = wallets.filter((w) => w.readyState === WalletReadyState.Installed);
  const others = POP.filter((p) => !installed.some((w) => w.adapter.name.toLowerCase() === p[0].toLowerCase()));
  const pick = (name: WalletName) => { select(name); setWant(name); };
  const copy = (t: string) => { navigator.clipboard.writeText(t).catch(() => {}); toast("Copied"); };

  function pickOther(p: (typeof POP)[number]) {
    if (DL[p[0]]) {
      if (isMobile()) { window.location.href = DL[p[0]](window.location.href); return; } // open inside wallet app
      setQrW(p); setModal("qr");
    } else window.open(p[1], "_blank", "noopener");
  }
  function readImg(file: File | undefined, cb: (s: string) => void) {
    if (!file || !/^image\/(png|jpeg)$/.test(file.type)) return toast("Use a .png or .jpg image");
    const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsDataURL(file);
  }

  async function launch() {
    if (!publicKey) { setModal("list"); return toast("Connect your wallet first"); }
    const d = +f.dec, s = +f.sup;
    if (!f.name.trim() || !f.sym.trim()) return toast("Token name and symbol are required");
    if (!(Number.isInteger(d) && d >= 0 && d <= 9)) return toast("Decimals must be a whole number from 0 to 9");
    if (!(s > 0)) return toast("Supply must be greater than 0");
    if (!logo) return toast("Please upload a logo");
    if (!f.desc.trim()) return toast("Description is required");
    const bad = !!f.rcp.trim() && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(f.rcp.trim());
    setRcpErr(bad); if (bad) return toast("Invalid recipient address");
    if (busy) return;
    setBusy(true);
    try {
      const lamports = Math.round(fee * LAMPORTS_PER_SOL);
      const bal = await connection.getBalance(publicKey);
      if (bal < lamports + 10000) { toast(`Not enough ${CLUSTER} SOL. You need ${fee} SOL. Get test SOL at faucet.solana.com`, 5500); return; }
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: publicKey, blockhash, lastValidBlockHeight }).add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(TREASURY), lamports })
      );
      const sig = await sendTransaction(tx, connection);
      toast("Confirming payment…", 8000);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
      const h: Hist = { name: f.name.trim(), sym: f.sym.trim().toUpperCase(), fee, sig, t: Date.now() };
      const next = [h, ...hist].slice(0, 50);
      setHist(next); setLast(h); setModal("done"); setMsg("");
      try { localStorage.setItem("luna_hist_" + addr, JSON.stringify(next)); } catch {}
    } catch (e: any) {
      const m = String(e?.message || e);
      toast(/reject|denied|cancel/i.test(m) ? "Transaction rejected" : "Payment failed: " + m.slice(0, 90), 5000);
    } finally { setBusy(false); }
  }

  const walletBtn = <button className="cw" onClick={() => setModal("list")}>{addr ? short(addr) : "Connect Wallet"}</button>;
  const hbtn = view === "tools" ? <a className="cw glow" href="#create">Create Token</a> : walletBtn;
  const cls = (v: string) => "view" + (view === v ? " on" : "");
  const explorer = (sig: string) => `https://solscan.io/tx/${sig}?cluster=${CLUSTER}`;

  return (
    <div className={outfit.className} data-v={view}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className={"top" + (sc ? " sc" : "")}>
        <a href="#home" aria-label="Luna home"><Logo /></a>
        <nav>{NAV.map(([v, t]) => <a key={v} href={"#" + v} className={view === v ? "on" : ""}>{t}</a>)}</nav>
        <div className="hr">{hbtn}<button className="burger" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}><i /><i /><i /></button></div>
      </header>

      {/* mobile side menu (outside the header so the blurred header can't clip it) */}
      <div className={"nbk" + (menu ? " on" : "")} onClick={() => setMenu(false)} />
      <aside className={"drawer" + (menu ? " open" : "")} aria-hidden={!menu}>
        <div className="dh"><Logo /><button aria-label="Close menu" onClick={() => setMenu(false)}>✕</button></div>
        {NAV.map(([v, t]) => <a key={v} href={"#" + v} className={view === v ? "on" : ""} onClick={() => setMenu(false)}>{t}</a>)}
        <a href="#portfolio" className={view === "portfolio" ? "on" : ""} onClick={() => setMenu(false)}>My Portfolio</a>
      </aside>

      {/* ================= HOME ================= */}
      <main className={cls("home") + " home"}>
        <div className="herowrap" style={{ backgroundImage: `linear-gradient(180deg,#0000 60%,#000 100%),url(${IMG.hero})` }}>
          <div className="top2">
            <div className="statbox"><div className="stats">{STATS.map(([n, suf, dec, l]) => <div key={l}><b><Count to={n} suf={suf} dec={dec} /></b><small>{l}</small></div>)}</div></div>
            <div className="chips">
              <div className="chip"><Ic k="lock" />Secure &amp; Audited</div>
              <div className="chip"><Ic k="bolt" />Lightning Fast</div>
              <div className="chip"><Ic k="shield" />Safe Deployment</div>
            </div>
            <div className="live"><div className="lh"><i className="dot" />Live Activity</div>
              {feed.map((x) => <div className="lv" key={x.id}><span className="li"><Ic k={x.a} /></span>{x.n} {x.a} {x.m === 0 ? "just now" : `${x.m} min ago`}</div>)}</div>
          </div>
          <section className="heroB">
            <span className="pill">#1 Solana Token Launcher in the World</span>
            <h1><span className="w4">Launch your</span><b>$Solana</b><span className="w5">Token</span><br /><b>Take it</b><span className="w4">to the</span><em>Moon!</em></h1>
            <p className="sub">Create and deploy your Solana coin effortlessly in seconds.<br />Reach the world and scale without limits!</p>
            <a className="cta" href="#create">CREATE TOKEN</a>
            <div className="crop"><img className="himg" src={IMG.phone} alt="Wallet preview" /></div>
          </section>
        </div>

        <div className="blk">
        <section className="sec rv">
          <h2>The world’s most powerful<br />Solana Launcher ever</h2>
          <div className="frame">
            <div className="dots"><i style={{ background: "#ff5f57" }} /><i style={{ background: "#febc2e" }} /><i style={{ background: "#28c840" }} /></div>
            <img className="fimg" src={IMG.content} alt="Token creator preview" />
          </div>
        </section>

        <section className="sec rv">
          <h2 className="light">Unlock the Full Potential of Your Solana Token Effortlessly</h2>
          <div className="fl2"><img src={IMG.coins1} alt="" /><img src={IMG.unlock} alt="" /><img src={IMG.coins2} alt="" /></div>
        </section>

        <section className="sec rv">
          <div className="fcard"><span className="pill">Features</span>
            <h2 className="light" style={{ marginTop: 10 }}>Solana Token Success, Simplified</h2>
            <p className="fp">Create, manage, and launch your Solana token effortlessly with secure transactions, instant deployment, and zero coding required!</p>
            <div className="fx">
              <img className="fph" src={IMG.feature} alt="" />
              <div className="tc t1">99.9%<small>Successful Token Launches</small></div>
              <div className="tc t2">85%+<small>Returned Users</small></div>
              <div className="wcard"><h3>Create &amp; Deploy Your Token in Minutes</h3>
                <p>Turn your idea into reality with lightning-fast token creation. Whether for projects, communities, or innovation, deploy your Solana token in minutes - with ease, secure, and built for the future!</p>
                <a className="cta dark" href="#create">Create Token</a></div>
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* ================= CREATE ================= */}
      <main className={cls("create")}>
        <div className="ctitle"><h1>Solana Token Creator</h1><p>Create and deploy your Solana coin effortlessly in seconds.<br />Reach the world and scale without limits!</p></div>
        <div className="form">
          <div className="g2">
            <div><label className="l">Token Name *</label><input type="text" maxLength={32} placeholder="Ex: Trump Coin" value={f.name} onChange={set("name")} /><div className="hint">Max 32 characters in your name</div></div>
            <div><label className="l">Token Symbol *</label><input type="text" maxLength={10} placeholder="Ex: SOL" value={f.sym} onChange={set("sym")} /></div>
          </div>
          <div className="g2">
            <div><label className="l">Decimals *</label><input type="number" min={0} max={9} value={f.dec} onChange={set("dec")} /><div className="hint">Change the number of decimals for your token</div></div>
            <div><label className="l">Supply *</label><input type="number" min={1} value={f.sup} onChange={set("sup")} /><div className="hint">The initial number of available tokens that will be created in your wallet</div></div>
          </div>
          <div className="g2">
            <div><label className="l">Logo *</label>
              <div className={"drop" + (over ? " over" : "")} onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); readImg(e.dataTransfer.files[0], setLogo); }}>
                {logo ? <img src={logo} alt="Logo preview" /> : <span className="dz"><b>⬆</b>Drag and drop here to upload<small>.png, .jpg 1000x1000 px</small></span>}
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => readImg(e.target.files?.[0], setLogo)} />
              <div className="hint">Add logo for your token!</div></div>
            <div className="ai"><label className="l aih">Generate Personalized AI Logo <span className="soon">COMING SOON</span></label>
              <div className="aibox">🖼️</div>
              <div className="hint">Lazy to Create a Logo? Use our Personalized AI Logo Generator for your Token Name</div>
              <button className="gen" disabled>Generate</button>
              <div className="hint">(At just 0.05 SOL)</div></div>
          </div>
          <label className="l">Description *</label>
          <textarea rows={4} placeholder="Here you can describe your token" value={f.desc} onChange={set("desc")} />

          <div className="opts">{OPTS.map(([k, t, c, lab, d]) => (
            <div className="opt" key={k}>
              <div className="r"><label className="sw"><input type="checkbox" checked={!!sel[k]} onChange={() => toggle(k)} /><i /></label><span className="ot">{t}</span>
                <span className={"op" + (c ? "" : " free")}>{lab}</span></div>
              <p>{d}</p></div>))}</div>

          {sel.banner && <div className="extra"><label className="l">Banner image</label>
            <button className="gen" style={{ width: "100%" }} onClick={() => banRef.current?.click()}>{banner ? "Banner selected ✓ (click to change)" : "Upload banner (.png, .jpg)"}</button>
            <input ref={banRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => readImg(e.target.files?.[0], setBanner)} /></div>}
          {sel.creator && <div className="extra"><label className="l">Creator name</label><input type="text" placeholder="Your name or brand" value={f.creator} onChange={set("creator")} /></div>}
          {sel.social && <div className="g3 extra"><div><label className="l">Website</label><input type="text" placeholder="https://" value={f.web} onChange={set("web")} /></div>
            <div><label className="l">Twitter / X</label><input type="text" placeholder="https://x.com/…" value={f.tw} onChange={set("tw")} /></div>
            <div><label className="l">Telegram</label><input type="text" placeholder="https://t.me/…" value={f.tg} onChange={set("tg")} /></div></div>}

          <div className="rt">Revoke Authorities (Investor’s Booster)</div>
          <div className="rev">{REV.map(([k, t, d]) => (
            <div key={k} className={"rc" + (sel[k] ? " on" : "")} onClick={() => toggle(k)}>
              <b>{t}<span className="bx">{sel[k] ? "✓" : ""}</span></b><span>{d}</span><em>+0.1 SOL</em></div>))}</div>
          <div className="hint">Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.</div>

          <div className="rcpt"><h3>Enter token recipient (Optional)</h3>
            <input type="text" placeholder="Leave empty to default to the wallet that sends payment" value={f.rcp} onChange={(e) => { setRcpErr(false); set("rcp")(e); }} />
            {rcpErr && <div className="err">Invalid Solana address</div>}
            <button className="launch" onClick={launch} disabled={busy}>{busy ? "Processing…" : "Launch Token"}</button>
            <div className="fee">Total Fees: <s>{(fee * 2).toFixed(2)} SOL</s> <b>{fee} SOL</b></div>
          </div>
        </div>
      </main>

      {/* ================= TOOLS ================= */}
      <main className={cls("tools")}>
        <div className="ctitle"><h1>Solana Manager</h1><p className="mute">Easily create and manage your Solana SPL tokens online without coding</p></div>
        <div className="tools">{TOOLS.map(([ic, t, b, d, pr, href]) => (
          <a className="tool" key={t} href={href || "#tools"} onClick={() => { if (!href) toast(t + " is coming soon"); }}>
            <span className="ti">{ic}</span>
            <div className="tb"><h3>{t}{b && <em className={"bd " + (b === "PREMIUM" ? "pm" : "pp")}>{b}</em>}</h3><p>{d}</p><div className="pr">Price: {pr} SOL</div></div>
            <span className="ar">›</span></a>))}</div>
      </main>

      <main className={cls("pool")}>
        <div className="lpw"><h1>Liquidity Pool</h1><div className="tab2"><span>My Pools</span></div>
          <div className="pbox3">{!addr ? "Connect wallet to see your liquidity pools." : "No liquidity pools found for this wallet yet."}</div>
          <h3 className="hh2">History</h3>
          <div className="pbox4">{!addr ? "Connect wallet to see your positions." : "No liquidity history yet."}</div></div>
      </main>
      <main className={cls("manage") + " mg"}><ManageView addr={addr} publicKey={publicKey} openWallet={() => setModal("list")} toast={toast} /></main>

      {/* ================= PORTFOLIO ================= */}
      <main className={cls("portfolio")}>
        <div className="pf"><h1>My Portfolio</h1><div className="tab">Token Lives</div>
          <div className="pbox">{!addr ? "Connect wallet to see your asset distribution." : hist.length ? `${hist.length} token launch${hist.length > 1 ? "es" : ""} paid with this wallet.` : "No tokens created with this wallet yet."}</div>
          <h3 className="hh">History</h3>
          <div className="pbox2">{!addr ? "Connect wallet to see your positions." : hist.length ? (
            <div className="hl">{hist.map((h) => (
              <a key={h.sig} href={explorer(h.sig)} target="_blank" rel="noopener noreferrer" className="hrow">
                <span>{h.name} <small>${h.sym}</small></span><span>{h.fee} SOL</span><span className="mute">{new Date(h.t).toLocaleString()}</span></a>))}</div>
          ) : "No history yet."}</div>
        </div>
      </main>

      <footer className="foot">
        <Logo />
        <div className="fm">© Luna Launcher 2026<br /><small>Terms of Service &nbsp;•&nbsp; Privacy Policy</small></div>
        <div className="fr">{hbtn}</div>
      </footer>

      {/* ================= WALLET MODAL ================= */}
      <div className={"modal" + (modal ? " on" : "")} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <div className="wm">
          <div className="wh">
            <button aria-label="Back / help" onClick={() => (modal === "qr" || modal === "all" ? setModal("list") : toast("A wallet lets you sign in and pay with SOL. Install Phantom or Solflare to start."))}>{modal === "qr" || modal === "all" ? "‹" : "ⓘ"}</button>
            <span>{modal === "qr" ? qrW?.[0] : modal === "all" ? "All Wallets" : modal === "done" ? "Payment confirmed" : addr ? "Your wallet" : "Connect Wallet"}</span>
            <button aria-label="Close" onClick={() => setModal(null)}>✕</button>
          </div>

          {modal === "done" && last ? (<>
            <div className="okc">✓</div>
            <div className="dn"><b>{last.name}</b> (${last.sym})</div>
            <div className="hint" style={{ textAlign: "center", marginBottom: 14 }}>Fee of {last.fee} SOL sent to the Luna fee wallet on {CLUSTER}. On-chain token minting will be connected with the backend next.</div>
            <a className="wi c" href={explorer(last.sig)} target="_blank" rel="noopener noreferrer">View transaction</a>
            <button className="wi c" onClick={() => { location.hash = "#portfolio"; setModal(null); }}>My Portfolio</button>
          </>) : modal === "qr" && qrW ? (<>
            <div className="qr"><canvas ref={cv} width={400} height={400} /><span className="ql" style={{ background: qrW[2], color: qrW[3] }}>{qrW[0][0]}</span></div>
            <div className="qt">Scan this QR Code with your phone</div>
            <div className="qa"><a href={qrW[1]} target="_blank" rel="noopener noreferrer">⬇ Download</a><button onClick={() => copy(DL[qrW[0]](window.location.href))}>⧉ Copy link</button></div>
          </>) : modal === "all" ? (<>
            {installed.map((w) => (<button className="wi" key={w.adapter.name} onClick={() => pick(w.adapter.name)}><span className="ic"><img src={w.adapter.icon} alt="" /></span>{w.adapter.name}<small className="d">DETECTED</small></button>))}
            {MORE.map(([n, u]) => (<button className="wi" key={n} onClick={() => window.open(u, "_blank", "noopener")}><span className="ic g">{n[0]}</span>{n}</button>))}
          </>) : addr ? (<>
            <div className="ad">{addr}</div>
            <button className="wi" onClick={() => { location.hash = "#portfolio"; setModal(null); }}>My Portfolio</button>
            <button className="wi" onClick={() => copy(addr)}>Copy address</button>
            <button className="wi" onClick={() => { disconnect().catch(() => {}); setModal(null); }}>Disconnect</button>
          </>) : (<>
            {installed.map((w) => (<button className="wi" key={w.adapter.name} onClick={() => pick(w.adapter.name)}>
              <span className="ic"><img src={w.adapter.icon} alt="" /></span>{w.adapter.name}<small className="d">DETECTED</small></button>))}
            {others.map((p) => (<button className="wi" key={p[0]} onClick={() => pickOther(p)}>
              <span className="ic" style={{ background: p[2], color: p[3] }}>{p[0][0]}</span>{p[0]}{p[4] && <small>POPULAR</small>}</button>))}
            <button className="wi" onClick={() => setModal("all")}><span className="ic g">▦</span>All Wallets<small className="n">130+</small></button>
            <div className="wf">Haven’t got a wallet? <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">Get started</a></div>
          </>)}
        </div>
      </div>
      <div id="toast" style={{ display: msg ? "block" : "none" }}>{msg}</div>
    </div>
  );
}

const CSS = `
*{box-sizing:border-box}
:root{--bg:#000;--panel:#0c0c0c;--field:#111;--line:#2c2c2c;--mute:#9a9aa6;--p:#6c5cf0;--p2:#8f6bd8;--ok:#26e07f}
html{scroll-behavior:smooth}
body{margin:0;background:#000;color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{font-family:inherit}
img{max-width:100%}
.mute{color:var(--mute)}
.view{display:none;padding-top:104px}.view.on{display:block}.view.home{padding-top:0}

/* logo */
.logo{font-weight:800;font-size:28px;letter-spacing:3px;display:inline-flex;align-items:center;line-height:1}
.cres{display:inline-block;width:.78em;height:.78em;margin:0 .1em;background:linear-gradient(135deg,#3cc4f0,#7c6cf0);border-radius:50%;
 -webkit-mask:radial-gradient(circle at 30% 28%,transparent 54%,#000 56%);mask:radial-gradient(circle at 30% 28%,transparent 54%,#000 56%);transform:rotate(-15deg)}

/* header */
.top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:18px 4vw;position:fixed;top:0;left:0;right:0;z-index:50;transition:background .3s}
.top.sc{background:#000b;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.top>a{justify-self:start}.hr{justify-self:end;display:flex}
nav{display:flex;gap:6px;border:1.5px solid #333;border-radius:40px;padding:14px 26px;background:#000}
nav a{padding:0 14px;font-size:15px;font-weight:500;color:#f0f0f4;white-space:nowrap}
nav a.on,nav a:hover{color:#9d90ff}
.cw{display:inline-block;background:#6c5cf0;box-shadow:0 8px 26px #6c5cf044;color:#fff;border:0;border-radius:30px;padding:14px 28px;font-weight:600;font-size:16px;cursor:pointer;transition:filter .15s}
.cw:hover{filter:brightness(1.12)}
.cw.glow{background:#6c5cf0;box-shadow:0 8px 26px #6c5cf066}
[data-v=portfolio] .top .cw{background:#6c5cf0}
.foot .cw{padding:14px 26px}

/* shared */
.pill{display:inline-block;border:1px solid #2f2f36;border-radius:20px;padding:7px 20px;font-size:14px;margin-bottom:18px;background:#0009;backdrop-filter:blur(4px)}
h1{font-size:clamp(34px,6vw,64px);margin:0 0 16px;line-height:1.15}
.cta{display:inline-block;background:#fff;color:#111;border:0;border-radius:40px;padding:17px 46px;font-weight:700;letter-spacing:1.5px;cursor:pointer;font-size:15px;transition:box-shadow .2s}
.cta:hover{box-shadow:0 0 30px #fff5}
.cta.dark{background:#111;color:#fff;letter-spacing:0;font-weight:600;padding:13px 26px;font-size:15px}
.sec{max-width:1000px;margin:70px auto;padding:0 5vw;text-align:center}
.sec h2{font-size:clamp(28px,4.6vw,48px);margin:0 0 34px;font-weight:600;line-height:1.2}
.sec h2.light{font-weight:400}
.ph{border:1px dashed var(--line);border-radius:24px;display:grid;place-items:center;color:var(--mute);height:200px;background:#0a0a0d}

/* hero */
.herowrap{margin-top:0;padding-top:130px;background:#000 center top/cover no-repeat}
.top2{position:relative;max-width:520px;margin:10px auto 0;padding:0 5vw;text-align:center}
.statbox{border:1px solid #2a2a31;border-radius:22px;padding:18px;background:#0a0a0dcc}
.stats{display:flex;justify-content:space-around;gap:10px}
.stats b{display:block;font-size:clamp(24px,5.4vw,34px);font-weight:600;background:linear-gradient(90deg,#5aa8ff,#7c8cff);-webkit-background-clip:text;background-clip:text;color:transparent}
.stats small{color:#cfd0da;font-size:13px}
.chips{display:flex;gap:10px;margin:14px 0}
.chip{flex:1;border:1px solid #2a2a31;border-radius:14px;padding:12px 8px;font-size:12.5px;background:#0a0a0dcc;display:flex;gap:8px;align-items:center;justify-content:center;text-align:left;line-height:1.2}
.live{border:1px solid #1d5a46;border-radius:20px;padding:16px 18px;text-align:left;font-size:13px;background:#08120ecc;box-shadow:0 0 30px #26e07f18}
.live .lh{color:var(--ok);margin-bottom:8px;font-size:12px}.live .lv{color:#e6efe9;margin:7px 0}.lv .li{margin-right:8px}
.heroB{position:relative;text-align:center;padding:150px 5vw 0}
.heroB h1{font-weight:700;text-shadow:0 2px 20px #000}.heroB h1 .w4{font-weight:400}.heroB h1 .w5{font-weight:500}
.heroB h1 em{font-style:normal;background:linear-gradient(90deg,#7c6cf0,#c08bff);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{max-width:520px;margin:0 auto 28px;color:#fff;text-shadow:0 2px 14px #000}
.crop{height:330px;overflow:hidden;margin-top:30px}
.himg{width:min(400px,92vw);display:block;margin:0 auto}
.herowrap{position:relative}



.frame{border:3px solid #5a4bd1;border-radius:30px;background:#050508;padding:18px 18px 0;overflow:hidden;box-shadow:0 0 60px #5a4bd155;-webkit-mask-image:linear-gradient(#000 60%,transparent);mask-image:linear-gradient(#000 60%,transparent);text-align:left}
.dots{display:flex;gap:8px;margin-bottom:16px}.dots i{width:12px;height:12px;border-radius:50%}
.fimg{width:100%;display:block;border-radius:14px}
.fl2{display:grid;grid-template-columns:1fr 1.8fr 1fr;align-items:center;gap:2%;max-width:780px;margin:0 auto}.fl2 img{width:100%;height:auto;display:block}

.fcard{background:#111114;border-radius:34px;padding:44px 5vw 36px;max-width:760px;margin:auto}
.fcard h2{margin-bottom:16px}
.fp{color:#b8b8c4;max-width:480px;margin:0 auto}
.fx{position:relative;height:440px;max-width:560px;margin:30px auto 0;text-align:left}
.fph{position:absolute;left:0;bottom:0;width:36%;height:300px;object-fit:cover;object-position:top;border-radius:22px 22px 0 0}
.tc{position:absolute;z-index:2;padding:22px 22px;border-radius:22px;font-weight:700;font-size:clamp(30px,6vw,44px);line-height:1.05}
.tc small{display:block;font-weight:500;font-size:14px;margin-top:6px;line-height:1.2}
.t1{left:20%;top:6px;width:210px;transform:rotate(-12deg);background:#fff;color:#111}
.t2{right:0;top:0;width:190px;transform:rotate(8deg);background:#6a5bf0}
.wcard{position:absolute;right:0;bottom:0;width:64%;z-index:1;background:#fff;color:#111;border-radius:22px;padding:24px}
.wcard h3{margin:0 0 10px;font-size:22px;line-height:1.2}.wcard p{font-size:13.5px;line-height:1.5;margin:0 0 16px;color:#333}

/* create */
.ctitle{text-align:center;padding:50px 5vw 10px}
.ctitle h1{font-size:clamp(34px,5.5vw,60px);margin-bottom:10px;font-weight:600}
.ctitle p{margin:0;font-size:clamp(15px,2.2vw,19px);color:#e4e4ec;line-height:1.5}
.ctitle p.mute{color:var(--mute)}
.form{width:min(840px,92vw);margin:34px auto 60px;border-radius:52px;background:var(--panel);padding:clamp(20px,5vw,48px)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:22px 32px;margin-bottom:22px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:18px}
label.l{display:block;font-size:17px;margin-bottom:10px}
input[type=text],input[type=number],textarea{width:100%;background:var(--field);border:1px solid var(--line);border-radius:22px;padding:17px 22px;color:#fff;font:inherit;font-size:16px;box-shadow:inset 0 0 0 1px #ffffff14,0 0 14px #ffffff0a}
input::placeholder,textarea::placeholder{color:#6f6f7a}
input:focus,textarea:focus{outline:1px solid var(--p)}
textarea{resize:vertical;border-radius:22px}
.hint{font-size:13px;color:#cfcfd8;margin-top:8px;line-height:1.4}
.drop{height:190px;border:1px solid var(--line);border-radius:22px;background:var(--field);display:grid;place-items:center;text-align:center;cursor:pointer;font-size:14px;overflow:hidden;box-shadow:inset 0 0 0 1px #ffffff14}
.drop.over{border-color:var(--p)}.drop>img{width:100%;height:100%;object-fit:cover}
.dz b{display:block;font-size:24px;margin-bottom:6px;font-weight:400}.dz small{display:block;color:var(--mute);margin-top:4px}
.ai{text-align:center}.aih{text-align:left}
.soon{font-size:10px;color:#8f84ff;background:#1b1a3a;border-radius:8px;padding:4px 8px;margin-left:8px;white-space:nowrap;vertical-align:middle}
.aibox{width:84px;height:84px;margin:0 auto 12px;border-radius:20px;background:#17171b;border:1px solid var(--line);display:grid;place-items:center;font-size:30px}
.gen{background:#1a1a1e;color:#888;border:1px solid #2c2c2c;border-radius:12px;padding:12px;width:82%;margin:12px auto 4px;font-size:15px}
.gen:disabled{cursor:not-allowed}.gen:not(:disabled){cursor:pointer;color:#fff}
.opts{border-top:1px solid #333;border-bottom:1px solid #333;padding:12px 0;margin:26px 0}
.opt{padding:9px 0}.opt .r{display:flex;align-items:center;gap:12px;font-size:16px}
.ot{flex:1}.op{font-size:14px}.op.free{color:var(--ok)}
.opt p{margin:5px 0 0;font-size:13px;color:#cfcfd8;line-height:1.45}
.sw{position:relative;width:42px;height:24px;flex:none}.sw input{opacity:0;position:absolute;inset:0;margin:0;cursor:pointer;z-index:1}
.sw i{position:absolute;inset:0;border-radius:20px;background:#2a2a30;border:1px solid #444;transition:.2s}
.sw i:after{content:"";position:absolute;top:4px;left:4px;width:14px;height:14px;border-radius:50%;background:#bbb;transition:.2s}
.sw input:checked+i{background:var(--p);border-color:var(--p)}.sw input:checked+i:after{left:22px;background:#fff}
.extra{margin-bottom:18px}
.rt{font-size:17px;margin:4px 0 12px}
.rev{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:12px 0}
.rc{border:1px solid #333;border-radius:16px;padding:16px;cursor:pointer;display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--mute);line-height:1.4;user-select:none}
.rc.on{border-color:var(--p);background:#161430}
.rc b{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;color:#fff;font-size:16px;font-weight:400}
.rc .bx{width:20px;height:20px;border:1px solid #888;border-radius:6px;display:grid;place-items:center;font-size:13px;flex:none}.rc.on .bx{background:var(--p);border-color:var(--p)}
.rc em{font-style:normal;color:#fff;text-align:right;margin-top:auto}
.rcpt{border:1px solid #2a2a2a;border-radius:30px;padding:30px 24px;margin-top:34px;text-align:center}
.rcpt h3{font-weight:400;font-size:clamp(20px,3vw,26px);margin:0 0 18px}
.rcpt input{font-size:14px;padding:15px 18px;border-radius:14px}
.err{color:#ff6b81;font-size:13px;margin-top:6px}
.launch{margin-top:26px;background:#fff;color:#111;border:0;border-radius:40px;padding:17px 0;width:min(274px,100%);font-size:17px;font-weight:500;cursor:pointer;box-shadow:0 10px 40px #ffffff22}
.launch:disabled{opacity:.6;cursor:wait}
.fee{margin-top:12px;font-size:15px}.fee s{color:#888;margin-right:6px}.fee b{font-weight:500}
.lk{color:#9d90ff}

/* tools */
.tools{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1290px;margin:40px auto 60px;padding:0 3vw}
.tool{display:flex;gap:18px;align-items:center;background:#0e0e11;border:1px solid #26262c;border-radius:20px;padding:26px 28px;transition:border-color .2s}
.tool:hover{border-color:#5a4bd1}
.ti{width:60px;height:60px;border-radius:14px;background:#17171f;display:grid;place-items:center;font-size:28px;flex:none}
.tb{min-width:0}
.tool h3{margin:0 0 6px;font-size:20px;font-weight:500}.tool p{margin:0 0 10px;color:#b9b9c4;font-size:16px;line-height:1.35}.pr{color:#7c6cff;font-size:15px}
.bd{font-style:normal;font-size:11px;padding:4px 10px;border-radius:7px;margin-left:10px;vertical-align:middle;letter-spacing:.3px}
.bd.pp{background:#063a4a;color:#2fd0e6;border:1px solid #0e6b80}
.bd.pm{background:#2d2606;color:#f5c518;border:1px solid #6b5a0b}
.ar{margin-left:auto;font-size:32px;color:#bbb;line-height:1}

/* portfolio */
.pf{max-width:970px;margin:30px auto 80px;padding:0 5vw}.pf h1{font-size:38px;margin:0 0 26px;font-weight:600}
.tab{position:relative;display:inline-block;background:#1b2039;padding:17px 76px 15px 62px;clip-path:polygon(0 0,88% 0,100% 100%,0 100%);font-weight:500;font-size:20px}
.tab:after{content:"";position:absolute;left:62px;bottom:0;width:76px;height:2px;background:linear-gradient(90deg,#3cc4f0,#7c6cf0)}
.pbox{background:#1b2039;border-radius:0 12px 12px 12px;padding:76px 20px;text-align:center;color:#aab4cc;font-size:18px}
.hh{margin:34px 0 14px;font-size:22px;font-weight:500}
.pbox2{background:#1b2039;border-radius:12px;padding:52px 20px;text-align:center;color:#aab4cc;font-size:18px}
.hl{display:flex;flex-direction:column;gap:8px;text-align:left;font-size:15px}
.hrow{display:grid;grid-template-columns:1.4fr .6fr 1fr;gap:10px;padding:12px 14px;background:#ffffff0d;border-radius:10px;color:#fff}
.hrow:hover{background:#ffffff18}.hrow small{color:#9d90ff}

/* footer */
.foot{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:60px 4vw 56px;gap:12px;font-size:16px;margin-top:40px}
.foot>.logo{justify-self:start}.fr{justify-self:end}.fm{text-align:center;color:#fff}
.foot small{color:#a6a6b2;font-size:14px}

/* modal */
.modal{position:fixed;inset:0;background:#000b;display:none;align-items:flex-start;justify-content:center;padding:70px 16px;z-index:200;overflow:auto}.modal.on{display:flex}
.wm{width:100%;max-width:400px;background:#121214;border:1px solid #26262c;border-radius:30px;padding:20px 16px 18px}
.wh{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;font-weight:600;font-size:18px}
.wh button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;width:34px;height:34px}
.wi{display:flex;align-items:center;gap:14px;width:100%;background:#17191a;border:0;border-radius:16px;padding:10px 12px;margin-bottom:8px;color:#fff;font:inherit;font-size:17px;cursor:pointer;text-align:left}
.wi.c{justify-content:center;padding:14px}
.wi:hover{background:#222527}
.wi .ic{width:50px;height:50px;border-radius:12px;display:grid;place-items:center;font-weight:800;font-size:20px;overflow:hidden;flex:none}
.wi .ic img{width:100%;height:100%;object-fit:cover}.wi .ic.g{background:#23262b;color:#8f9aa8}
.wi small{margin-left:auto;font-size:11px;font-weight:700;border-radius:6px;padding:5px 9px;background:#26254d;color:#7f86ff}
.wi small.d{background:#10331f;color:var(--ok)}.wi small.n{background:#2b2d30;color:#aaa}
.wf{text-align:center;font-size:15px;color:#9a9aa6;margin-top:12px}.wf a{color:#6c7bff;font-weight:600;margin-left:6px}
.ad{word-break:break-all;color:var(--mute);font-size:13px;margin-bottom:12px}
.qr{position:relative;width:100%;aspect-ratio:1;background:#fff;border-radius:22px;overflow:hidden}.qr canvas{width:100%;height:100%;display:block}
.ql{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:24%;aspect-ratio:1;border-radius:18%;display:grid;place-items:center;font-size:34px;font-weight:800}
.qt{text-align:center;font-weight:600;margin:16px 0 10px}
.qa{display:flex;justify-content:center;gap:28px;margin-bottom:6px}
.qa a,.qa button{background:none;border:0;color:#fff;font:inherit;cursor:pointer;font-size:15px}.qa a:hover,.qa button:hover{color:#9d90ff}
.okc{width:60px;height:60px;border-radius:50%;background:#26e07f22;color:var(--ok);display:grid;place-items:center;font-size:30px;margin:6px auto 12px}
.dn{text-align:center;font-size:18px;margin-bottom:8px}
#toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1c1c20;border:1px solid #333;padding:13px 20px;border-radius:14px;z-index:210;max-width:90vw;font-size:14px;text-align:center;box-shadow:0 8px 30px #000a}

/* ---------- responsive ---------- */
@media(max-width:1000px){.fl2{max-width:660px}}
@media(max-width:860px){
 .top{grid-template-columns:1fr auto;padding:14px 4vw}
 .top nav{display:none}
 .hr{gap:10px;align-items:center}
 .burger{display:inline-flex}
 .view{padding-top:84px}.view.home{padding-top:0}
 .logo{font-size:24px}
 .cw{padding:11px 20px;font-size:14px}
 .tools{grid-template-columns:1fr}
}
@media(max-width:640px){
 .g2,.g3,.rev{grid-template-columns:1fr}
 .form{border-radius:32px}
 .heroB{padding-top:110px}
 .herowrap{background-position:88% top}
 .tool{padding:18px;gap:14px}.tool h3{font-size:18px}.tool p{font-size:14px}.ti{width:52px;height:52px}
 .fx{height:560px}.wcard{width:72%}.fph{width:34%}.t1{left:14%;width:180px}.t2{width:170px}
 .foot{grid-template-columns:1fr auto;row-gap:18px}
 .fm{grid-column:1/-1;grid-row:2}
 .chips{flex-wrap:wrap}.chip{min-width:30%}
 .hrow{grid-template-columns:1fr 1fr}.hrow .mute{grid-column:1/-1}
 .pbox{padding:48px 16px}.tab{font-size:17px;padding:15px 60px 13px 40px}.tab:after{left:40px}
}

/* ================= v3: animations, colours, desktop scale ================= */
:root{--u:clamp(.62px,.05263vw,1.2px)}
@keyframes fadeUp{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes shimmer{to{background-position:200% center}}
@keyframes slideIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{box-shadow:0 0 18px 0 #ffffff33}50%{box-shadow:0 0 46px 6px #ffffff66}}
@keyframes blink{50%{opacity:.3}}
.heroB .pill{animation:fadeUp .8s both}
.heroB h1>:not(br){display:inline-block;margin:0 .13em;animation:fadeUp .9s both}
.heroB h1>:nth-child(1){animation-delay:.15s}.heroB h1>:nth-child(2){animation-delay:.28s}.heroB h1>:nth-child(3){animation-delay:.41s}
.heroB h1>:nth-child(5){animation-delay:.58s}.heroB h1>:nth-child(6){animation-delay:.71s}
.heroB h1>em{background:linear-gradient(90deg,#7c6cf0,#c9a0ff,#7c6cf0);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fadeUp .9s .84s both,shimmer 3.5s linear 1.8s infinite}
.heroB .sub{animation:fadeUp .9s .6s both}
.heroB .cta{animation:fadeUp .9s .8s both,pulse 3.2s 2s infinite}
.heroB .crop{animation:fadeUp 1.2s .9s both}
.statbox{animation:fadeUp .9s .2s both;background:#050507;border-color:#26264a}
.chip{animation:fadeUp .8s both;background:#000;border-color:#303036}
.chip:nth-child(1){animation-delay:.4s}.chip:nth-child(2){animation-delay:.5s}.chip:nth-child(3){animation-delay:.6s}
.chip svg{width:1.3em;height:1.3em;flex:none}
.live{animation:fadeUp .9s .75s both;background:#040d09;border-color:#0f7a52}
.live .lh{color:#1fe08a;display:flex;align-items:center}
.dot{display:inline-block;width:.6em;height:.6em;border-radius:50%;background:#1fe08a;margin-right:.7em;animation:blink 1.6s infinite}
.live .lv{color:#fff;animation:slideIn .6s both;white-space:nowrap}
.li{display:inline-block;margin-right:.6em}.li svg{width:1.15em;height:1.15em;vertical-align:-.22em}
.stats div:nth-child(1) b{background-image:linear-gradient(90deg,#4f7cff,#5aa9ff)}
.stats div:nth-child(2) b{background-image:linear-gradient(90deg,#4aa0f5,#3cc6d0)}
.stats div:nth-child(3) b{background-image:linear-gradient(90deg,#33b5e5,#2fe0a0)}
.stats b{-webkit-background-clip:text;background-clip:text;color:transparent;font-variant-numeric:tabular-nums}
.rv{opacity:0;transform:translateY(50px);transition:opacity 1s ease,transform 1s ease}.rv.in{opacity:1;transform:none}
.herowrap{position:relative}
.blk{position:relative;z-index:2;margin-top:-40px;border-radius:40px 40px 0 0;background:radial-gradient(ellipse 70% 22% at 50% 10%,#1d1458aa,transparent),#000}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}

/* ---- desktop: every size scales with the window (baseline 1900px wide) ---- */
@media(min-width:1180px){
 nav a{font-size:clamp(14px,1.05vw,20px);padding:0 clamp(10px,1.05vw,20px)}
 nav{padding:clamp(11px,.85vw,17px) clamp(18px,1.7vw,34px)}
 .logo{font-size:clamp(26px,1.9vw,36px)}
 .cw{font-size:clamp(14px,1.02vw,20px);padding:clamp(11px,.9vw,17px) clamp(20px,2vw,38px)}
 .top{padding:clamp(14px,1.2vw,24px) 4vw}
 .herowrap{padding-top:0}
 .top2{position:absolute;left:3.2vw;top:calc(330*var(--u));width:calc(290*var(--u));max-width:none;margin:0;padding:0;z-index:3}
 .statbox{padding:calc(36*var(--u)) calc(10*var(--u)) calc(42*var(--u));border-radius:calc(30*var(--u))}
 .stats{flex-direction:column;gap:calc(44*var(--u))}
 .stats b{font-size:calc(50*var(--u));font-weight:500;line-height:1.1}
 .stats small{font-size:calc(19*var(--u));color:#fff;display:block;margin-top:calc(8*var(--u))}
 .chips{flex-direction:column;gap:calc(16*var(--u));margin:calc(30*var(--u)) 0}
 .chip{flex:none;justify-content:flex-start;height:calc(64*var(--u));padding:0 calc(26*var(--u));font-size:calc(20*var(--u));gap:calc(16*var(--u));border-radius:calc(16*var(--u))}
 .live{padding:calc(22*var(--u)) calc(22*var(--u)) calc(26*var(--u));font-size:calc(18*var(--u));border-radius:calc(22*var(--u))}
 .live .lh{font-size:calc(20*var(--u));margin-bottom:calc(16*var(--u))}
 .live .lv{margin:calc(14*var(--u)) 0 0}
 .heroB{padding:calc(250*var(--u)) 0 0}
 .pill{font-size:calc(20*var(--u));padding:calc(10*var(--u)) calc(30*var(--u));margin-bottom:calc(38*var(--u))}
 .heroB h1{font-size:calc(84*var(--u));line-height:1.13;margin-bottom:calc(26*var(--u))}
 .sub{font-size:calc(22*var(--u));line-height:1.75;max-width:none;margin:0 auto calc(120*var(--u))}
 .cta{width:calc(340*var(--u));height:calc(90*var(--u));line-height:calc(90*var(--u));padding:0;font-size:calc(24*var(--u))}
 .crop{height:calc(620*var(--u));margin-top:calc(20*var(--u))}
 .himg{width:calc(1000*var(--u))}
 .blk{margin-top:calc(-90*var(--u));border-radius:calc(90*var(--u)) calc(90*var(--u)) 0 0}
 .sec{max-width:none;margin:calc(110*var(--u)) auto;padding:0}
 .sec h2{font-size:calc(72*var(--u));line-height:1.6;margin-bottom:calc(40*var(--u))}
 .sec h2.light{font-size:calc(56*var(--u));line-height:1.45;max-width:calc(1000*var(--u));margin-left:auto;margin-right:auto}
 .frame{width:calc(1285*var(--u));margin:0 auto;border-radius:calc(80*var(--u));padding:calc(34*var(--u)) calc(34*var(--u)) 0;border-width:calc(3*var(--u)) }
 .dots{gap:calc(12*var(--u));margin-bottom:calc(30*var(--u))}.dots i{width:calc(20*var(--u));height:calc(20*var(--u))}
 .fl2{width:calc(1180*var(--u));max-width:none}
 .fcard{width:calc(1121*var(--u));max-width:none;border-radius:calc(64*var(--u));padding:calc(52*var(--u)) 0 calc(60*var(--u))}
 .fcard .pill{font-size:calc(19*var(--u));margin-bottom:calc(16*var(--u))}
 .fcard h2.light{font-size:calc(54*var(--u));margin-bottom:calc(22*var(--u))}
 .fp{font-size:calc(20*var(--u));max-width:calc(820*var(--u))}
 .fx{width:calc(1000*var(--u));height:calc(660*var(--u));max-width:none;margin:calc(50*var(--u)) auto 0}
 .fph{width:calc(296*var(--u));height:calc(590*var(--u));border-radius:calc(40*var(--u));bottom:calc(30*var(--u));left:0}
 .tc{padding:calc(26*var(--u)) calc(30*var(--u));border-radius:calc(30*var(--u));font-size:calc(86*var(--u))}
 .tc small{font-size:calc(19*var(--u))}
 .t1{left:calc(270*var(--u));top:calc(10*var(--u));width:calc(360*var(--u))}
 .t2{right:0;top:calc(30*var(--u));width:calc(350*var(--u))}
 .wcard{width:calc(695*var(--u));padding:calc(40*var(--u));border-radius:calc(30*var(--u))}
 .wcard h3{font-size:calc(31*var(--u))}.wcard p{font-size:calc(17.5*var(--u))}
 .cta.dark{width:auto;height:auto;line-height:1.2;padding:calc(18*var(--u)) calc(34*var(--u));font-size:calc(19*var(--u));animation:none}
}

/* ================= v4: new phone images, 1000 sizes, plain screenshot ================= */
.frame{-webkit-mask-image:none;mask-image:none}
.fph{object-fit:contain;object-position:bottom;border-radius:0}
@media(min-width:1180px){
 .fl2{width:calc(1500*var(--u));max-width:none;grid-template-columns:1fr auto 1fr;gap:0}
 .fl2 img:nth-child(2){width:auto;height:calc(1000*var(--u))}
 .fcard{width:calc(1400*var(--u))}
 .fx{width:calc(1260*var(--u));height:calc(1090*var(--u))}
 .fph{width:auto;height:calc(1000*var(--u));bottom:calc(20*var(--u))}
 .t1{left:calc(400*var(--u));top:calc(10*var(--u))}
 .t2{top:calc(30*var(--u))}
 .wcard{width:calc(700*var(--u))}
}
@media(max-width:640px){.fph{height:420px}}

/* ================= v5: mobile side menu ================= */
.burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:0 12px;border:1.5px solid #333;border-radius:14px;background:#000;cursor:pointer}
.burger i{display:block;height:2px;border-radius:2px;background:#fff}
.nbk{position:fixed;inset:0;background:#000a;backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .25s;z-index:90}
.nbk.on{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;bottom:0;left:0;width:min(300px,82vw);background:#0b0b0e;border-right:1px solid #26262c;box-shadow:12px 0 40px #000a;transform:translateX(-102%);visibility:hidden;transition:transform .28s ease,visibility 0s .28s;z-index:100;padding:18px 18px 28px;display:flex;flex-direction:column;gap:6px;overflow-y:auto}
.drawer.open{transform:none;visibility:visible;transition:transform .28s ease}
.dh{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.dh button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;width:40px;height:40px}
.drawer>a{padding:15px 16px;border-radius:14px;font-size:17px;font-weight:500;color:#f0f0f4}
.drawer>a:hover,.drawer>a.on{background:#17172a;color:#9d90ff}
@media(max-width:860px){.burger{display:inline-flex}}
@media(min-width:861px){.drawer,.nbk{display:none}}

/* ================= v6: Liquidity Pool (portfolio style) + Manage Liquidity (chart + swap panel) ================= */
.lpw{margin:70px 0 90px;padding:0 5vw}
.lpw h1{font-size:40px;margin:0 0 38px;font-weight:600}
.tab2{position:relative;width:max(46%,240px);height:50px;background:#1a2039;border-top-left-radius:12px;clip-path:polygon(0 0,96.6% 0,100% 100%,0 100%);display:flex;align-items:center;justify-content:center;padding-left:7%;font-weight:500;font-size:24px}
.tab2 span{position:relative;line-height:50px}
.tab2 span:after{content:"";position:absolute;left:50%;bottom:-1px;width:75px;height:2px;transform:translateX(-50%);background:linear-gradient(90deg,#3cc4f0,#7c6cf0)}
.pbox3{background:#1a2039;border-radius:0 12px 12px 12px;min-height:170px;display:grid;place-items:center;text-align:center;color:#aab4cc;font-size:18px;padding:30px 16px}
.hh2{margin:38px 0 14px;font-size:26px;font-weight:600}
.pbox4{background:#1a2039;border-radius:12px;min-height:130px;display:grid;place-items:center;text-align:center;color:#aab4cc;font-size:18px;padding:30px 16px}
@media(min-width:1100px){.lpw{padding:0 200px}}
@media(max-width:640px){.lpw{margin-top:30px}.lpw h1{font-size:32px;margin-bottom:24px}.tab2{font-size:19px;height:46px}.pbox3,.pbox4{font-size:16px}}

.view.mg{background:#060c16;padding-bottom:70px;min-height:100vh}
.mgw{display:grid;grid-template-columns:minmax(0,1fr) clamp(380px,39.5%,642px);gap:20px;width:min(1625px,92vw);margin:34px auto 0;align-items:start;color:#fff}
.cpanel{background:#1c243e;border-radius:16px;margin-top:50px;padding:16px 20px 14px;min-width:0}
.chead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 6px 16px}
.pair{display:flex;align-items:center;gap:12px;font-size:26px}.pair b{font-weight:600}
.pi{display:inline-flex}.pi .tki+.tki{margin-left:-8px}
.tki{display:inline-grid;place-items:center;border-radius:50%;font-weight:700;flex:none;border:2px solid #1c243e}
.sw2{background:none;border:0;color:#8aa0d6;cursor:pointer;padding:4px;display:grid}.sw2:hover{color:#fff}
.stamp{color:#8aa0d6;font-size:17px;white-space:nowrap}
.ctool{display:flex;align-items:center;gap:6px;padding:8px 0 10px;color:#e8ecfa;font-size:17px;flex-wrap:wrap}
.ctool button{background:none;border:0;color:inherit;cursor:pointer;font-size:inherit;display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px}
.ctool button:hover{background:#2a3454}
.ctool .tf{font-weight:600}.ind i{font-style:italic;font-family:serif}
.sp{flex:1}
.ohlc{font-size:14px;color:#27d3b4;padding:6px 10px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ohlc span{color:#c9d3ee;margin-left:6px}.ohlc span:first-child{margin-left:0}
.plot{position:relative;height:clamp(280px,30vw,456px)}
.plot canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.cfoot{display:flex;align-items:center;gap:18px;padding:14px 6px 4px;font-size:16px;flex-wrap:wrap}
.cfoot .mute{font-size:12px}
.cfoot button{background:none;border:0;color:#fff;font-size:16px;cursor:pointer;padding:0}
.cfoot .auto{color:#27d3b4}

.rcol{min-width:0}
.rbar{display:flex;align-items:center;gap:10px;height:40px;margin-bottom:10px}
.seg{display:inline-flex;background:#1c243e;border-radius:12px;padding:4px}
.seg button{background:none;border:0;color:#8aa0d6;font-size:17px;padding:6px 16px;border-radius:9px;cursor:pointer}
.seg button.on{background:#333c59;color:#fff;font-weight:600}
.slip{display:inline-flex;align-items:center;gap:6px;background:#1c243e;border-radius:10px;padding:8px 12px;font-size:17px}
.ib2{background:none;border:0;color:#27c3e6;cursor:pointer;padding:4px;display:grid}.ib2:hover{color:#fff}
.spanel{position:relative;background:#1c243e;border-radius:16px;padding:30px 30px 30px}
.sbox{background:#0b1022;border-radius:12px;padding:0 0 20px;overflow:visible}
.sh{display:flex;align-items:center;gap:8px;background:#141a30;border-radius:12px 12px 0 0;padding:16px 22px;font-size:18px}
.sh b{flex:1;font-weight:600}
.sbal{display:inline-flex;align-items:center;gap:6px;color:#8aa0d6;margin-right:4px}.sbal u{color:#8aa0d6}
.mx{background:#2f3a5c;border:0;color:#8aa0d6;border-radius:6px;padding:4px 10px;font-size:15px;cursor:pointer}
.mx:hover:not(:disabled){color:#fff}.mx:disabled{opacity:.55;cursor:default}
.si{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px 0}
.tsel{position:relative}
.tp{display:inline-flex;align-items:center;gap:12px;background:#1c243e;border:0;color:#fff;font-size:30px;font-weight:500;border-radius:14px;padding:12px 18px 12px 14px;cursor:pointer}
.tp:hover{background:#243050}
.chev{width:9px;height:9px;border-right:2px solid #c9d3ee;border-bottom:2px solid #c9d3ee;transform:rotate(45deg);margin:-4px 2px 0 6px}
.tdd{position:absolute;left:0;top:calc(100% + 8px);z-index:20;background:#141a30;border:1px solid #2f3a5c;border-radius:14px;padding:6px;min-width:190px;box-shadow:0 14px 40px #000a}
.tdd button{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;color:#fff;font-size:20px;padding:10px 12px;border-radius:10px;cursor:pointer}
.tdd button:hover,.tdd button[aria-selected=true]{background:#232c4a}
.amt{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-end}
.amt input{width:100%;background:none;border:0;color:#fff;font:inherit;font-size:34px;text-align:right;padding:0;box-shadow:none;outline:none}
.amt input::placeholder{color:#44507a}
.amt small{color:#8aa0d6;font-size:17px;margin-top:10px}
.mid{position:relative;z-index:3;display:grid;place-items:center;width:50px;height:50px;border-radius:50%;background:#8a9ff0;border:0;color:#0b1022;margin:-18px auto -18px;cursor:pointer;transition:transform .2s}
.mid:hover{transform:rotate(180deg)}
.scta{width:100%;margin-top:30px;height:60px;border:0;border-radius:10px;background:linear-gradient(90deg,#27d0f1,#37d0d9);color:#0b1022;font-size:22px;font-weight:500;cursor:pointer;transition:filter .15s}
.scta:hover:not(:disabled){filter:brightness(1.08)}
.scta:disabled{background:#2f3a5c;color:#8aa0d6;cursor:not-allowed}

@media(max-width:1000px){
 .mgw{grid-template-columns:1fr;margin-top:18px}
 .rcol{order:-1}
 .cpanel{margin-top:0}
 .plot{height:340px}
}
@media(max-width:640px){
 .spanel{padding:18px 14px}
 .sh{padding:12px 14px;font-size:16px}.si{padding:14px 14px 0}
 .tp{font-size:22px;padding:8px 12px 8px 10px;gap:8px}.amt input{font-size:26px}
 .pair{font-size:20px}.stamp{display:none}
 .rbar .ib2:nth-of-type(n+2){display:none}
 .scta{height:54px;font-size:19px;margin-top:22px}
 .cfoot{gap:12px;font-size:14px}.ctool{font-size:15px}
 .cpanel{padding:12px 10px}
}
`;