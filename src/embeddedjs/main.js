import Poco from "commodetto/Poco";
/*import parseBMF from "commodetto/parseBMF";
import parseRLE from "commodetto/parseRLE";*/
import places from "places";

/*function getFont(name, size) {
    const font = parseBMF(new Resource(`${name}-${size}.fnt`));
    font.bitmap = parseRLE(new Resource(`${name}-${size}-alpha.bm4`));
    return font;
}*/

const render = new Poco(screen);

// Fonts
const DMIFont = new render.Font("Gothic-Regular", 30)
//getFont("Transit-Board-Regular", 30); // was new render.Font originally
const auxFont = new render.Font("Gothic-Bold", 24);

// Colors
const black = render.makeColor(0, 0, 0);
const gray  = render.makeColor(80, 80, 80);
const orang = render.makeColor(210, 150, 30);
const white = render.makeColor(255, 255, 255);

// Day and month names for date formatting
const DAYS = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
const MONTHS = ["I", "II", "III", "IV", "V", "VI",
                "VII", "VIII", "IX", "X", "XI", "XII"];

// test fields
const testSign = [
  {"shortName":"19","tripHeadsign":"Kelenföld vasútállomás M","countdown":2,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":5,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Kamaraerdei Ifj. Park","countdown":12,"standArrow":"↗"},
  {"shortName":"19","tripHeadsign":"Bécsi út / Vörösvári út","countdown":15,"standArrow":"↗"},
  {"shortName":"19","tripHeadsign":"Kelenföld vasútállomás M","countdown":22,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":25,"standArrow":"↗"},
  {"shortName":"41","tripHeadsign":"Bécsi út / Vörösvári út","countdown":45,"standArrow":"↗"},
  {"shortName":"M2","tripHeadsign":"Déli pályaudvar","countdown":1,"standArrow":"↑"}
];
const chosenSpot="BATYI0";

function draw(event) {
  const now = event.date;

  render.begin();
  //render.fillRectangle(black, 0, 0, render.width, render.height);
  render.fillRectangle(gray, 20, 40, render.width-20-20, render.height-40-40);

  // Format time as HH:MM
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;

  /* legacy time renderer
  // Center the time vertically (shifted up slightly to make room for date)
  let timeWidth = render.getTextWidth(timeStr, auxFont);
  render.drawText(timeStr, timeFont, white,
    (render.width - timeWidth) / 2,
    (render.height / 2) - timeFont.height + 5);*/

  // Format date (now also time) as "YYYY. MRoman. DD. DName HH:MM"
  const dayName = DAYS[now.getDay()];
  const monthName = MONTHS[now.getMonth()];
  const dateStr = `${String(now.getYear()).padStart(4, "0")}. ${monthName}. ${String(now.getDate()).padStart(2, "0")}. ${dayName} ${timeStr}`;

  // Draw datetime below the departure board
  let dateWidth = render.getTextWidth(dateStr, auxFont);
  render.drawText(dateStr, auxFont, white,
    (render.width - dateWidth - 20),
    (render.height - 30)
  );

  // next: other fixed gubbins
  render.drawText(places[chosenSpot]['parentName'], auxFont, white,
    (20),
    (render.height - 30)
  );

  render.end();
}

// Update every minute (fires immediately when registered)
watch.addEventListener("secondchange", draw);
