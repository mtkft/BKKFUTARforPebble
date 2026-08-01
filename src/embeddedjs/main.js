import Poco from "commodetto/Poco";
import parseBMF from "commodetto/parseBMF";
import parseRLE from "commodetto/parseRLE";
import Message from "pebble/message";

const DEFAULT_SETTINGS = {
  showSeconds: false,
  chosenSpot: "CLARK0",
  choseBackFace: false
};

const places = {
  'CLARK0': {
    'parentID':'BKK_CS049785',
    'parentName':'Clark Ádám tér',
    'arrows': {
      'BKK_F00047':'',
      'BKK_F00048':'→',
      'BKK_049784':'↖',
      'BKK_049785':'↖',
      'BKK_F00049':'↗',
      'BKK_F00050':'↗',
      'BKK_009675':'↗',
      'BKK_009676':'↗'
    },
    'arrowsBack': {
      'BKK_F00047':'',
      'BKK_F00048':'←',
      'BKK_049784':'↘',
      'BKK_049785':'↘',
      'BKK_F00049':'↙',
      'BKK_F00050':'↙',
      'BKK_009675':'↙',
      'BKK_009676':'↙'
    },
  },
  'BATYI0': {
    'parentID':'BKK_CSF00065',
    'parentName': 'Batthyány tér M+H',
    'arrows': {
      'BKK_09001':'↑',
      'BKK_09001187':'↑',
      'BKK_09001188':'↑',
      'BKK_09001189':'↑',
      'BKK_F00062':'↑',
      'BKK_F00063':'↑',
      'BKK_F00057':'↗',
      'BKK_008750':'↗',
      'BKK_009629':'↗',
      'BKK_F00067':'→',
      'BKK_F00059':'↓',
      'BKK_071927':'↓',
      'BKK_F00066':'←',
      'BKK_F00065':'↖'
    },
    'arrowsBack': {
      'BKK_09001':'↓',
      'BKK_09001187':'↓',
      'BKK_09001188':'↓',
      'BKK_09001189':'↓',
      'BKK_F00062':'↓',
      'BKK_F00063':'↓',
      'BKK_F00057':'↙',
      'BKK_008750':'↙',
      'BKK_009629':'↙',
      'BKK_F00067':'←',
      'BKK_F00059':'↑',
      'BKK_071927':'↑',
      'BKK_F00066':'→',
      'BKK_F00065':'↘'
    }
  }
};

function loadSettings() {
  const stored = localStorage.getItem("settings");
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.log("Failed to parse settings");
    }
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

let settings = loadSettings();

function getFont(name, size) {
    const font = parseBMF(new Resource(`${name}-${size}.fnt`));
    font.bitmap = parseRLE(new Resource(`${name}-${size}-alpha.bm4`));
    return font;
}

const render = new Poco(screen);

// Fonts
const DMIFont = new render.Font("Gothic-Regular", 18);
const DMIFontXL = new render.Font("Gothic-Regular", 24);
//const DMIFont = getFont("transit-board", 18); // was new render.Font originally
const auxFont = new render.Font("Gothic-Bold", 18);

// Colors
const black = render.makeColor(0, 0, 0);
//const gray  = render.makeColor(80, 80, 80);
const orang = render.makeColor(255, 100, 0);
const white = render.makeColor(255, 255, 255);

// Day and month names for date formatting
const DAYS = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
/*const MONTHS = ["I", "II", "III", "IV", "V", "VI",
                "VII", "VIII", "IX", "X", "XI", "XII"];*/

// test fields
const testSign = [
  {"shortName":"M2","tripHeadsign":"Déli pályaudvar","countdown":1,"standArrow":"↑"},
  {"shortName":"19","tripHeadsign":"Kelenföld vasútállomás M","countdown":2,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":5,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Kamaraerdei Ifj. Park","countdown":12,"standArrow":"↗"},
  {"shortName":"19","tripHeadsign":"Bécsi út / Vörösvári út","countdown":15,"standArrow":"↗"},
  {"shortName":"19","tripHeadsign":"Kelenföld vasútállomás M","countdown":22,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":25,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":45,"standArrow":"↗"}
];

// precomputations to pass between the secondly and minutely updates
let flop = [];
let grayBox = {
  "top": 1.5*auxFont.height,
  "overTop": 0.25*auxFont.height,
  "height": render.height-(3*auxFont.height),
  "doubleRow": 2*DMIFont.height
};
let nD = 4;

function flip() {
  // static test
  /*flop = [{"shortName":"*","tripHeadsign":`MÁKOS TÉSZTA KFT.
PEBBLE FUTÁR TESZTÜZEM
áéíóöőúüűÁÉÍÓÖŐÚÜŰ`,"countdown":1,"standArrow":""}];*/
  // halfway proper board flipping test
  // how many departures to grab is precomputed above
  flop = testSign.slice(0,nD);
}

function drawDisplay(event) {
  const now = event.date;

  if (!settings.showSeconds) flip();
  
  render.begin();
  render.fillRectangle(black, 0, 0, render.width, render.height);
  /*render.fillRectangle(gray, grayBox['overTop'], grayBox['top'],
    render.width-2*grayBox['overTop'], render.height - 2*grayBox['top']);*/

  // recompute sizing stuff
  grayBox['height'] = render.height-2*grayBox['top'];
  grayBox['doubleRow'] = 2*DMIFont.height;
  nD = (grayBox['height'] - DMIFontXL.height)/grayBox['doubleRow'];

  // next: other fixed gubbins
  // you have basically 23 cap letters wide without even switching to Transit Board font; strongly consider two lines per entry (rt#,min,arrow on one row,
  // headsign below. still small for the headsign tbr but we shall ball i think)
  // on which note, revisit this heading later
  render.drawText("Járat", auxFont, white,
    grayBox['overTop'],//20,
    grayBox['overTop']
  );

  const auxTopRight = "Indulás";
  let auxTopRightWidth = render.getTextWidth(auxTopRight, auxFont);
  render.drawText("Indulás", auxFont, white,
    (render.width - auxTopRightWidth - grayBox['overTop']),// - 20),
    grayBox['overTop']
  );

  render.drawText(places[settings.chosenSpot]['parentName'], auxFont, white,
    grayBox['overTop'],//20,
    (render.height - 1.25*auxFont.height)
  );

  // Format date (now also time) as "YYYY. MRoman. DD. DName HH:MM"
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = settings.showSeconds ? `:${String(now.getSeconds()).padStart(2, "0")}` : "";
  const dayName = DAYS[now.getDay()];
  //const monthName = MONTHS[now.getMonth()]; // numeric month is better for digital displaying, it seems to me
  const infoStr = `${String(now.getFullYear())}. ${String(now.getMonth()).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}. ${dayName} ${hours}:${minutes}${seconds}`;

  // Draw datetime below the departure board
  let infoWidth = render.getTextWidth(infoStr, DMIFontXL);
  render.drawText(infoStr, DMIFontXL, orang,
    (render.width - infoWidth - grayBox['overTop']),// - 20),
    (render.height - grayBox['top'] - DMIFontXL.height)
  );

  // sign rows
  for (let n = 0; n < flop.length; n++) {
    // left corner and displaced-downward middle
    render.drawText(`${flop[n]['shortName']}
${flop[n]['tripHeadsign']}`, DMIFont, orang,
      grayBox['overTop'],//20,
      grayBox['top']+n*grayBox['doubleRow']
    );
    // right corner
    let rowRC = `${String(flop[n]['countdown'])}'`;//${flop[n]['standArrow']}`;
    let rcWidth = render.getTextWidth(rowRC, DMIFont);
    render.drawText(rowRC, DMIFont, orang,
      (render.width - rcWidth - grayBox['overTop']),// - 20),
      grayBox['top']+n*grayBox['doubleRow']
    );
  }

  render.end();
}

function patchEvents() {
  if (settings.showSeconds) {
    watch.removeEventListener("secondchange", drawDisplay);
    watch.removeEventListener("minutechange", drawDisplay);
    watch.removeEventListener("minutechange", flip);
    watch.addEventListener("secondchange", drawDisplay);
    watch.addEventListener("minutechange", flip);
  } else {
    watch.removeEventListener("secondchange", drawDisplay);
    watch.removeEventListener("minutechange", drawDisplay);
    watch.removeEventListener("minutechange", flip);
    watch.addEventListener("minutechange", drawDisplay); // drawDisplay will trip flip() for itself every minute for order reasons
  }
}

patchEvents();

// messaging
const message = new Message({
  keys: ["showSeconds","chosenSpot","choseBackFace"],
  onReadable() {
    const msg = this.read();

    const shS = msg.get("showSeconds");
    if (shS !== undefined) {
      settings.showSeconds = (shS === 1);
    }
    const spot = msg.get("chosenSpot");
    if (spot !== undefined) {
      settings.chosenSpot = spot;
    }
    const bf = msg.get("choseBackFace");
    if (bf !== undefined) {
      settings.choseBackFace = (bf === 1);
    }

    saveSettings();
    patchEvents();
    drawDisplay();
  }
});