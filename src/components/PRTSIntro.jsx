import { useEffect, useMemo, useState } from "react";

function formatClock(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDateLine(date) {
  const day = date
    .toLocaleDateString(undefined, { weekday: "short" })
    .toUpperCase();
  const month = date
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const dayNumber = String(date.getDate()).padStart(2, "0");
  return `${day} / ${dayNumber} ${month} / RHODES NODE`;
}

export default function PRTSIntro({
  onComplete,
  duration = 5000,
  subtitle = "R H O D E S • I S L A N D",
  className = "",
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!onComplete) return;

    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [onComplete, duration]);

  const time = useMemo(() => formatClock(now), [now]);
  const dateLine = useMemo(() => formatDateLine(now), [now]);

  return (
    <section
      className={`prtsIntro ${className}`}
      aria-label="PRTS intro animation"
    >
      <div className="networkBg" />
      <div className="networkGlow" />
      <div className="prtsScan" />

      <div className="topHud">
        <div className="clock">{time}</div>
        <div className="dateLine">{dateLine}</div>
      </div>

      <div className="corner cornerTL" />
      <div className="corner cornerTR" />
      <div className="corner cornerBL" />
      <div className="corner cornerBR" />

      <main className="centerPanel">
        <div className="thinLine lineA" />

        <div className="logoWrap" aria-hidden="true">
          <div className="diamondFrame" />

          <div className="logoBackLetters">
            <span className="letterP">P</span>
            <span className="letterR">R</span>
            <span className="letterT">T</span>
            <span className="letterS">S</span>
          </div>

          <div className="logoCenterBars">
            <span className="barTop" />
            <span className="barBottom" />
          </div>

          <div className="logoCore">
            <div className="titleMain">RHO DES</div>
            <div className="titleDivider" />
            <div className="titleSub">ISL AND</div>
          </div>
        </div>

        <p className="subtitle">{subtitle}</p>

        <div className="bottomInfo">
          <div className="infoLine" />
          <div className="loadingRows">
            <div className="loadingItem">
              <span className="dot" />
              <span>INITIALIZING TERMINAL</span>
            </div>
            <div className="loadingItem">
              <span className="dot" />
              <span>VERIFYING IDENTITY</span>
            </div>
            <div className="loadingItem">
              <span className="dot" />
              <span>COMPLETE</span>
            </div>
          </div>
          <div className="bootStatus">
            <span>BOOT SEQUENCE</span>
            <span>00:05</span>
          </div>
          <div className="progressTrack" aria-hidden="true">
            <div className="progressBar" />
          </div>
        </div>
      </main>

      <aside className="rightDiagnostics">
        <div className="diagTitle">DIAGNOSTIC</div>

        <div className="diagRow">
          <span>CORE</span>
          <b>OK</b>
        </div>

        <div className="diagRow">
          <span>LINK</span>
          <b>ACTIVE</b>
        </div>

        <div className="diagRow">
          <span>SYNC</span>
          <b>97%</b>
        </div>
      </aside>

      <style>{`
        .prtsIntro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          display: grid;
          place-items: center;
          color: #d6d8dc;
          background:
            radial-gradient(circle at 50% 45%, rgba(105, 111, 120, .16), transparent 34%),
            linear-gradient(135deg, #020304 0%, #0a0d11 42%, #171b20 72%, #2a3038 100%);
          font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          isolation: isolate;
          animation: sceneFlash 3s cubic-bezier(.2,.8,.2,1) forwards;
        }

        .networkBg {
          position: absolute;
          inset: 0;
          opacity: .34;
          background:
            radial-gradient(circle at 14% 22%, rgba(255,255,255,.65) 0 1px, transparent 2px),
            radial-gradient(circle at 72% 18%, rgba(255,255,255,.55) 0 1px, transparent 2px),
            radial-gradient(circle at 22% 72%, rgba(255,255,255,.55) 0 1px, transparent 2px),
            radial-gradient(circle at 88% 74%, rgba(255,255,255,.65) 0 1px, transparent 2px),
            linear-gradient(118deg, transparent 49.4%, rgba(255,255,255,.09) 49.7%, transparent 50%),
            linear-gradient(54deg, transparent 49.4%, rgba(255,255,255,.08) 49.7%, transparent 50%),
            linear-gradient(12deg, transparent 49.4%, rgba(255,255,255,.06) 49.7%, transparent 50%);
          background-size: 240px 180px, 280px 210px, 260px 220px, 300px 200px, 220px 180px, 260px 220px, 300px 260px;
          filter: blur(.2px);
          z-index: -3;
          animation: meshFloat 8s ease-in-out infinite alternate;
        }

        .networkGlow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 18% 32%, rgba(255,255,255,.18), transparent 10%),
            radial-gradient(circle at 58% 22%, rgba(255,255,255,.18), transparent 12%),
            radial-gradient(circle at 82% 70%, rgba(255,255,255,.16), transparent 10%),
            radial-gradient(circle at 30% 82%, rgba(255,255,255,.12), transparent 10%);
          opacity: .6;
          z-index: -2;
        }

        .prtsScan {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,.08) 48%, transparent 55%);
          transform: translateY(-115%);
          animation: scanPass 1.7s .45s cubic-bezier(.22,.8,.22,1) forwards;
          z-index: 4;
        }

        .topHud {
          position: absolute;
          top: clamp(28px,7vh,74px);
          left: clamp(30px,10vw,150px);
          opacity: 0;
          transform: translateY(-12px);
          animation: hudIn .55s .16s ease-out forwards;
        }

        .clock {
          color: #f1f3f6;
          font-size: clamp(2.5rem,7vw,6.4rem);
          font-weight: 800;
          letter-spacing: -.08em;
          line-height: .85;
          text-shadow: 0 0 18px rgba(255,255,255,.12), 0 8px 24px rgba(0,0,0,.34);
        }

        .dateLine {
          margin-top: 10px;
          color: rgba(232,236,241,.72);
          font-size: clamp(.72rem,1.3vw,1rem);
          font-weight: 700;
          letter-spacing: .22em;
        }

        .centerPanel {
          position: relative;
          width: min(74vw, 880px);
          padding: clamp(24px, 4vw, 50px) clamp(26px, 6vw, 76px) clamp(18px, 3vw, 36px);
          transform: translateY(18px) scale(.985);
          opacity: 0;
          animation: panelIn .72s .62s cubic-bezier(.2,.85,.2,1) forwards;
        }

        .logoWrap {
          position: relative;
          width: min(52vw, 400px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
        }  

        .diamondFrame {
          position: absolute;
          inset: 11%;
          border: clamp(10px, 1.2vw, 14px) solid rgba(245,246,248,.96);
          transform: rotate(45deg);
          box-shadow: 0 0 24px rgba(255,255,255,.08);
          animation: diamondIn .68s .86s cubic-bezier(.16,.84,.2,1) forwards;
          opacity: 0;
        }

        .logoBackLetters {
          position: absolute;
          inset: 0;
          color: rgba(235,238,242,.34);
          font-weight: 300;
          line-height: 1;
          opacity: 0;
          animation: fadeIn .5s 1s ease-out forwards;
          z-index: 1;
        }

        .logoBackLetters span {
          position: absolute;
          font-size: clamp(7.6rem, 15vw, 10.8rem);
          line-height: 1;
          letter-spacing: -.10em;
          text-shadow: 0 0 8px rgba(255,255,255,.05);
        }

        .letterP { top: 2.5%; left: 18%; }
        .letterR { top: 2.5%; right: 18%; }
        .letterT { bottom: 4%; left: 18%; }
        .letterS { bottom: 4%; right: 18%; }

        .logoCenterBars {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: fadeIn .5s 1.04s ease-out forwards;
          z-index: 2;
          pointer-events: none;
        }

        .logoCenterBars span {
          position: absolute;
          left: 50%;
          width: clamp(3px, .3vw, 5px);
          transform: translateX(-50%);
          background: rgba(246,248,250,.94);
          box-shadow: 0 0 10px rgba(255,255,255,.10);
        }

        .barTop {
          top: 20%;
          height: 19%;
        }

        .barBottom {
          bottom: 20%;
          height: 19%;
        }

        .logoCore {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30% 16% 28%;
          opacity: 0;
          animation: fadeIn .5s 1.12s ease-out forwards;
          z-index: 3;
        }

        .titleMain,
        .titleSub {
          color: rgba(248,249,251,.98);
          font-size: clamp(2.1rem, 5.1vw, 3.4rem);
          font-weight: 900;
          font-style: italic;
          letter-spacing: -.09em;
          line-height: .92;
          white-space: nowrap;
          text-transform: uppercase;
          text-shadow:
            0 1px 0 rgba(255,255,255,.35),
            0 4px 10px rgba(0,0,0,.32),
            0 10px 18px rgba(0,0,0,.26);
          transform: skewX(-10deg);
        }

        .titleMain {
          margin-bottom: 4px;
        }

        .titleDivider {
          width: min(76%, 245px);
          height: clamp(5px, .48vw, 7px);
          margin: 3px auto 6px;
          background: rgba(248,249,251,.98);
          box-shadow:
            0 1px 0 rgba(255,255,255,.38),
            0 6px 14px rgba(0,0,0,.28);
        }

        .titleSub {
          margin-top: 0;
        }

        .logoFooter {
          position: absolute;
          left: 50%;
          bottom: -7.5%;
          transform: translateX(-50%);
          color: rgba(248,249,251,.96);
          font-size: clamp(.70rem, .95vw, .88rem);
          font-weight: 700;
          letter-spacing: .55em;
          white-space: nowrap;
          opacity: 0;
          animation: fadeIn .5s 1.18s ease-out forwards;
          z-index: 3;
        }

        .subtitle {
          display: block;
          width: 100%;
          margin: clamp(14px, 2.4vw, 26px) auto 0;
          color: rgba(213,217,223,.72);
          font-size: clamp(.82rem, 1.8vw, 1.08rem);
          font-weight: 800;
          letter-spacing: clamp(.18em, .85vw, .42em);
          line-height: 1.25;
          text-align: center;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(10px);
          animation: subtitleIn .46s 1.34s ease-out forwards;
        }

        .thinLine {
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(228,232,236,.55), transparent);
          transform-origin: center;
          transform: scaleX(0);
        }

        .lineA {
          width: min(54%, 520px);
          margin: 0 auto 18px;
          animation: lineGrow .5s .72s ease-out forwards;
        }

        .bottomInfo {
          width: min(58vw, 620px);
          margin: clamp(18px, 2.8vw, 32px) auto 0;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          animation: tickerIn .38s 2.05s ease-out forwards;
        }

        .infoLine {
          width: 100%;
          height: 2px;
          margin: 0 auto clamp(12px, 1.5vw, 18px);
          background: linear-gradient(90deg, transparent, rgba(228,232,236,.34), transparent);
        }

        .loadingRows {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: center;
          gap: clamp(14px, 3vw, 44px);
          color: rgba(221,225,230,.62);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: clamp(.58rem, 1vw, .78rem);
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .loadingItem {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          min-width: 0;
          white-space: nowrap;
        }

        .dot {
          flex: 0 0 auto;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,.84);
          box-shadow: 0 0 10px rgba(255,255,255,.28);
        }

        .bootStatus {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(28px, 8vw, 120px);
          width: 100%;
          margin: 12px auto 0;
          color: rgba(219,223,228,.8);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: clamp(.6rem, 1vw, .78rem);
          font-weight: 800;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .progressTrack {
          position: relative;
          width: min(100%, 520px);
          height: 6px;
          margin: 12px auto 0;
          border: 1px solid rgba(216,221,227,.22);
          background: rgba(255,255,255,.06);
          overflow: hidden;
        }

        .progressBar {
          height: 100%;
          width: 100%;
          transform: scaleX(0);
          transform-origin: left;
          background: linear-gradient(90deg, rgba(136,144,156,.7), rgba(242,244,247,.92));
          animation: progressFill 1.02s 1.74s cubic-bezier(.3,.75,.2,1) forwards;
        }

        .rightDiagnostics {
          position: absolute;
          right: clamp(20px,6vw,86px);
          top: 50%;
          width: min(250px,28vw);
          padding: 18px;
          border: 1px solid rgba(220,224,229,.14);
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(8px);
          opacity: 0;
          transform: translateX(18px);
          animation: diagnosticsIn .5s 1.62s ease-out forwards;
        }

        .diagTitle {
          margin-bottom: 12px;
          color: rgba(226,230,235,.58);
          font-size: .72rem;
          font-weight: 900;
          letter-spacing: .22em;
        }

        .diagRow {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-top: 1px solid rgba(224,228,233,.1);
          color: rgba(220,224,230,.68);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: .76rem;
          letter-spacing: .12em;
        }

        .diagRow b {
          color: #f4f5f7;
          text-shadow: 0 0 8px rgba(255,255,255,.12);
        }

        .corner {
          position: absolute;
          width: clamp(42px,7vw,92px);
          height: clamp(42px,7vw,92px);
          border-color: rgba(245,246,248,.76);
          opacity: 0;
          animation: cornerIn .5s .4s ease-out forwards;
        }

        .cornerTL {
          top: 30px;
          left: 30px;
          border-top: 3px solid;
          border-left: 3px solid;
        }

        .cornerTR {
          top: 30px;
          right: 30px;
          border-top: 3px solid;
          border-right: 3px solid;
        }

        .cornerBL {
          bottom: 30px;
          left: 30px;
          border-bottom: 3px solid;
          border-left: 3px solid;
        }

        .cornerBR {
          bottom: 30px;
          right: 30px;
          border-bottom: 3px solid;
          border-right: 3px solid;
        }

        @keyframes sceneFlash {
          0% { filter: brightness(1.12) saturate(.75); }
          14% { filter: brightness(1.22) saturate(.78); }
          38% { filter: brightness(1) saturate(1); }
          100% { filter: brightness(1.04) saturate(1.02); }
        }

        @keyframes meshFloat {
          from { transform: scale(1) translateY(0); }
          to { transform: scale(1.03) translateY(-8px); }
        }

        @keyframes scanPass {
          0% { transform: translateY(-115%); opacity: 0; }
          15% { opacity: .8; }
          100% { transform: translateY(115%); opacity: 0; }
        }

        @keyframes hudIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes panelIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes diamondIn {
          from { opacity: 0; transform: rotate(45deg) scale(.9); }
          to { opacity: 1; transform: rotate(45deg) scale(1); }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes subtitleIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes lineGrow {
          to { transform: scaleX(1); }
        }

        @keyframes progressFill {
          to { transform: scaleX(1); }
        }

        @keyframes diagnosticsIn {
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes tickerIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cornerIn {
          from { opacity: 0; transform: scale(.84); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 920px) {
          .rightDiagnostics {
            display: none;
          }
        }

        @media (max-width: 820px) {
          .centerPanel {
            width: 92vw;
            padding-top: 84px;
          }

          .logoWrap {
            width: min(78vw, 420px);
          }

          .bottomInfo {
            width: min(88vw, 620px);
          }

          .loadingRows {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .loadingItem:nth-child(3) {
            display: none;
          }

          .subtitle {
            white-space: normal;
          }
        }
      `}</style>
    </section>
  );
}
