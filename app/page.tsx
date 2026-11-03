"use client";

import { useState } from "react";
import {
  Wifi,
  WifiOff,
  Radar,
  Signal,
  ShieldCheck,
  Lock,
  BarChart3,
  Gauge,
  MapPin,
  Download,
  CheckCircle2,
  ChevronDown,
  X,
  Smartphone,
  Layers,
  Zap,
} from "lucide-react";

const PRICE = 99;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://payhero-backend-m78g.onrender.com";

const sampleNetworks = [
  { name: "HomeFibre_5G", signal: 4, ch: "36", sec: "WPA3", dbm: -42 },
  { name: "Mtaani_2.4", signal: 4, ch: "6", sec: "WPA2", dbm: -48 },
  { name: "Alkanet", signal: 3, ch: "11", sec: "WPA2", dbm: -61 },
  { name: "FreeNet_WiFi", signal: 2, ch: "6", sec: "WPA2", dbm: -74 },
  { name: "Tarbuna", signal: 1, ch: "1", sec: "Open", dbm: -86 },
];

const features = [
  {
    icon: Radar,
    title: "Live network scan",
    desc: "Bypass every WiFi network in range with name, signal strength, channel and security type.",
  },
  {
    icon: BarChart3,
    title: "Channel congestion graph",
    desc: "Find which channels are crowded and which are free so you can tune your router.",
  },
  {
    icon: Gauge,
    title: "Signal meter",
    desc: "Walk around and watch signal strength change in real time to find the best spot.",
  },

];

const steps = [
  { t: "Pay once", d: `Pay KSh ${PRICE} with M-PESA. No subscription.` },
  { t: "Download", d: "Get the installer link after your payment is confirmed." },
  { t: "Install", d: "Open the file on your Android phone and allow installation." },
  { t: "Scan", d: "Grant location permission (Android needs it for WiFi scans) and tap Scan." },
];

const faqs = [
  {
    q: "Does it work on iPhone?",
    a: "Yes it works on all devices.",
  },
  {
    q: "Does it have a high speed?",
    a: "Yes the app will make the wifi very fast than normal usage.",
  },
  {
    q: "Can it show me WiFi passwords?",
    a: "No. It just connect directly.",
  },
  {
    q: "Will it make my internet faster?",
    a: "It helps you diagnose problems, such as a crowded channel or a weak spot, so you can fix them yourself..",
  },
  {
    q: "Is the payment one-time?",
    a: `Yes. KSh ${PRICE} once, paid through an M-PESA STK push to your phone.`,
  },
];

function Bars({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4].map((b) => (
        <span
          key={b}
          style={{ height: `${b * 25}%` }}
          className={`w-1.5 rounded-sm ${
            b <= level ? "bg-cyan-400" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function RadarArt() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
      <div className="absolute inset-6 rounded-full border border-cyan-400/25" />
      <div className="absolute inset-12 rounded-full border border-cyan-400/20" />
      <div className="absolute inset-[72px] rounded-full border border-cyan-400/15" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/15" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/15" />
      <div
        className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,0.5), rgba(34,211,238,0) 70deg, transparent 360deg)",
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.8)]">
        <Wifi className="w-6 h-6 text-slate-950" />
      </div>
      {[
        "top-8 left-12",
        "top-20 right-8",
        "bottom-12 left-20",
        "bottom-20 right-14",
      ].map((pos) => (
        <span key={pos} className={`absolute ${pos} flex h-3 w-3`}>
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
      ))}
    </div>
  );
}

function ChannelChart() {
  const bars = [
    { ch: "1", h: 55 },
    { ch: "2", h: 20 },
    { ch: "3", h: 12 },
    { ch: "4", h: 18 },
    { ch: "5", h: 28 },
    { ch: "6", h: 90 },
    { ch: "7", h: 30 },
    { ch: "8", h: 14 },
    { ch: "9", h: 10 },
    { ch: "10", h: 22 },
    { ch: "11", h: 70 },
  ];
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold">2.4 GHz channel usage</h3>
        <span className="text-xs text-slate-400">Illustration</span>
      </div>
      <div className="flex items-end gap-2 h-40">
        {bars.map((b) => (
          <div key={b.ch} className="flex-1 flex flex-col items-center gap-2">
            <div
              style={{ height: `${b.h}%` }}
              className={`w-full rounded-t-lg ${
                b.h > 60
                  ? "bg-gradient-to-t from-rose-500 to-orange-400"
                  : b.h > 30
                  ? "bg-gradient-to-t from-amber-500 to-yellow-300"
                  : "bg-gradient-to-t from-emerald-500 to-cyan-300"
              }`}
            />
            <span className="text-[10px] text-slate-400">{b.ch}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-400">
        Channels 3, 9 and 10 are quiet here. Moving your router off channel 6
        would reduce interference.
      </p>
    </div>
  );
}

export default function WifiScannerPage() {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string }>({});

  const normalizePhone = (num: string) => {
    const p = num.replace(/\D/g, "");
    if (p.startsWith("07") || p.startsWith("01")) return "254" + p.slice(1);
    return p;
  };

  const validate = () => {
    const normalized = normalizePhone(phone);
    const newErrors: { phone?: string } = {};
    if (!/^254(7|1)\d{8}$/.test(normalized)) {
      newErrors.phone =
        "Enter a valid Safaricom number (07XXXXXXXX, 01XXXXXXXX or 254XXXXXXXXX)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pay = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/runPrompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          amount: PRICE,
          local_id: `O${Date.now().toString(36)}`,
          transaction_desc: "WiFiBypass app download",
          till_id: 1,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setSuccess(true);
      } else {
        setErrors({ phone: data.message || "Payment request failed. Try again." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ phone: "Could not reach the payment server. Try again shortly." });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSuccess(false);
    setPhone("");
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-slate-950" />
          </span>
          WiFi<span className="text-cyan-400">Bypass</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-2 text-sm font-semibold"
        >
          <Download className="w-4 h-4" /> Get the app
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pt-8 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Smartphone className="w-3.5 h-3.5" /> No Daily Payments
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
            Bypass hotspot/WiFi network{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              around you
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-slate-300 max-w-xl">
            WiFiBypass hacks nearby networks(mtaani hotspots) and help you use it at high speed.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-lg font-extrabold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:scale-[1.03] transition"
            >
              <Download className="w-5 h-5" />
              Download for KSh {PRICE}
            </button>
            <p className="text-sm text-slate-400">
              One-time payment
              <br />
              via M-PESA
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No subscription
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2.4 &amp; 5 GHz
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Works offline
            </span>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto w-[290px]">
          <div className="absolute -inset-6 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="relative rounded-[2.5rem] border-[6px] border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-slate-700" />
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-bold">Nearby networks</span>
              <span className="text-[10px] text-cyan-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Scanning
              </span>
            </div>
            <div className="scale-90 -my-4">
              <RadarArt />
            </div>
            <div className="space-y-2 mt-2">
              {sampleNetworks.map((n) => (
                <div
                  key={n.name}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold">{n.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      {n.sec === "Open" ? (
                        <WifiOff className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      Ch {n.ch} · {n.sec} · {n.dbm} dBm
                    </p>
                  </div>
                  <Bars level={n.signal} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-500">
              Sample data for illustration
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black">
            Everything you need to understand your WiFi
          </h2>
          <p className="mt-3 text-slate-400">
            Simple tools that answer the questions people actually ask: why is
            my signal weak, and what can I change?
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 hover:border-cyan-400/40 hover:bg-white/[0.07] transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center">
                <f.icon className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <ChannelChart />
        <div>
          <h2 className="text-3xl font-black">Find the quietest channel</h2>
          <p className="mt-3 text-slate-300">
            In apartments and busy areas, dozens of routers fight over the same
            channels. WiFiSBypass shows you the congestion so you can move your
            router to a clearer one and get a steadier connection.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Colour-coded channel usage",
              "Signal strength in dBm with a live meter",
              "Security type for every network",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-3xl sm:text-4xl font-black text-center">
          Up and running in minutes
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.t}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <span className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-black flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="mt-3 font-bold text-lg">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 py-16">
        <div className="rounded-[2rem] border border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-blue-500/5 p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(34,211,238,0.12)]">
          <p className="text-sm font-semibold text-cyan-300 uppercase tracking-widest">
            One-time price
          </p>
          <div className="mt-3 flex items-end justify-center gap-2">
            <span className="text-xl text-slate-300 mb-3">KSh</span>
            <span className="text-7xl font-black">{PRICE}</span>
          </div>
          <p className="mt-2 text-slate-400">Pay once with M-PESA. No subscription.</p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-left text-sm text-slate-200">
            {[
              "Live WiFi network Bypasser",
              "Channel congestion graph",
              "Signal strength meter",
              "2.4 GHz and 5 GHz support",
              "Free app updates",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowModal(true)}
            className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-4 text-lg font-extrabold text-slate-950 hover:scale-[1.03] transition"
          >
            <Download className="w-5 h-5" /> Pay KSh {PRICE} &amp; download
          </button>
          <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Secure payment via M-PESA STK push
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-black text-center">Questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
              >
                {f.q}
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-cyan-300 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-8">
        <div className="max-w-6xl mx-auto px-5 py-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-bold text-slate-300 text-sm">
            WiFi<span className="text-cyan-400">Scout</span>
          </p>
          <p>support@your-domain.com</p>
          <p>
            WiFiScout only displays information that WiFi routers broadcast
            publicly. scan and connect to any nearby networks to
            use.
          </p>
          <p>© {new Date().getFullYear()} WiFiScout. All rights reserved.</p>
        </div>
      </footer>

      {/* Payment modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(2,6,23,0.96)" }}
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border-2 border-cyan-400 p-6 shadow-[0_0_60px_rgba(34,211,238,0.25)]"
            style={{ backgroundColor: "#0b1220" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-slate-950" />
                </div>
                <h2 className="mt-4 text-2xl font-black">Check your phone</h2>
                <p className="mt-2 text-sm text-slate-300">
                  An M-PESA prompt for KSh {PRICE} was sent. Enter your PIN to
                  complete the payment.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 w-full rounded-xl bg-cyan-400 py-3 font-extrabold text-slate-950"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-slate-950" />
                </div>
                <h2 className="mt-4 text-center text-2xl font-black">
                  Download WiFiBypass
                </h2>
                <p className="text-center text-sm text-cyan-300 mt-1">
                  Secure M-PESA payment
                </p>

                <ul
                  className="mt-5 space-y-2 rounded-2xl p-4 text-sm text-slate-300"
                  style={{ backgroundColor: "#131c31" }}
                >
                  {[
                    "Live Hotspot/network Bypass",
                    "Enjoy free daily net",
                    "Install and access instantly",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t}
                    </li>
                  ))}
                </ul>

                

                <div className="mt-4 rounded-xl bg-cyan-400 py-2 text-center font-extrabold text-slate-950">
                  PAY KSH {PRICE}
                </div>

                <input
                  type="tel"
                  placeholder="Enter M-PESA (07 / 01 / 254)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-600 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  style={{ backgroundColor: "#131c31" }}
                />
                {errors.phone && (
                  <p className="mt-2 text-xs text-rose-400">{errors.phone}</p>
                )}

                <button
                  type="button"
                  onClick={pay}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-extrabold text-slate-950 disabled:opacity-50 transition"
                >
                  {loading ? "Processing Payment..." : "PAY & DOWNLOAD"}
                </button>
                <div className="mt-4 rounded-xl bg-cyan-400 py-2 text-center font-extrabold text-slate-950">
                  Can Also pay Via:PAYBILL:4008437 ,ACC NO:40163
                </div>

                <p className="mt-3 text-center text-[11px] text-slate-500">
                  You will get an M-PESA prompt on your phone. Enter your PIN to
                  confirm.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
