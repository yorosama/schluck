// ---- Einstellungen ----
const ZIEL_ML = 2000;

// ---- Daten (bleiben lokal auf dem Gerät gespeichert) ----
const heute = new Date().toDateString();
let daten = laden();

function laden() {
  try {
    const d = JSON.parse(localStorage.getItem("schluck"));
    if (d && d.tag === heute) return d;      // gleicher Tag → weitermachen
  } catch (e) {}
  return { tag: heute, eintraege: [] };     // neuer Tag → bei 0 starten
}

function speichern() {
  try { localStorage.setItem("schluck", JSON.stringify(daten)); } catch (e) {}
}

// ---- Anzeige ----
const sprueche = [
  [0,    "Los geht's – trink was!"],
  [0.25, "Guter Anfang 💧"],
  [0.5,  "Halbzeit!"],
  [0.75, "Fast geschafft!"],
  [1,    "Ziel erreicht 🎉"],
];

function anzeigen() {
  const summe = daten.eintraege.reduce((a, b) => a + b, 0);
  const anteil = summe / ZIEL_ML;

  document.getElementById("menge").textContent = summe;
  document.getElementById("ziel").textContent = ZIEL_ML;
  document.getElementById("wasser").style.height = Math.min(anteil, 1) * 100 + "%";

  let text = sprueche[0][1];
  for (const [ab, s] of sprueche) if (anteil >= ab) text = s;
  document.getElementById("spruch").textContent = text;
}

// ---- Buttons ----
document.querySelectorAll("[data-ml]").forEach(btn => {
  btn.addEventListener("click", () => {
    daten.eintraege.push(Number(btn.dataset.ml));
    speichern();
    anzeigen();
    if (navigator.vibrate) navigator.vibrate(15);   // kurzes Vibrieren (Android)
  });
});

document.getElementById("rueckgaengig").addEventListener("click", () => {
  daten.eintraege.pop();
  speichern();
  anzeigen();
});

document.getElementById("reset").addEventListener("click", () => {
  daten.eintraege = [];
  speichern();
  anzeigen();
});

document.getElementById("datum").textContent =
  new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

// ---- Status: läuft es als App oder im Browser? ----
const alsApp = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
document.getElementById("status").textContent = alsApp
  ? "✅ Läuft als installierte App"
  : "🌐 Läuft im Browser – zum Home-Bildschirm hinzufügen!";

// ---- Service Worker registrieren (für Offline-Nutzung) ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

anzeigen();
