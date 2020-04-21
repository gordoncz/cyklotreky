// generator pro pinup girls, provede se jen při zobrazení na PC
// na mobilech se z důvodu úspory přenosu dat a také úspory místa na monitoru pinup girls nebudou zobrazovat

// definování variable pro div ID "panelPinup" na stránce, kam se bude obrázek vkládat
var pinupDiv = document.getElementById("panelPinup");

// zde vložit názvy jednotlivých souborů obrázků ve složce s pinup girls
var pinupPool = [
    "pinup01",
    "pinup02",
    "pinup03",
    "pinup04",
    "pinup05",
    "pinup06",
    "pinup07",
    "pinup08",
    "pinup09",
    "pinup10",
    "pinup11",
    "pinup12",
    "pinup13",
    "pinup14",
    "pinup15",
    "pinup16",
    "pinup17",
    "pinup18",
    "pinup19",
    "pinup20",
    "pinup21",
    "pinup22"
]

function generatePinup() {

    // pokud je web zobrazen na mobilu, žádný background-image se nepřidá a funkce se hned ukončí
    if (detekceMobilu.matches) {
        return;
    } else {

        // vygenerování náhodného čísla od 0 do pinupPool.length-1
        // to vybere číslo pro index v rámci výše definovaného array
        // a to index číslo pak určí, který string (obrázek) se z array vybere pro background-image
        var randomNumber = Math.floor (Math.random() * pinupPool.length);

        // variable pro celou složenou adresu toho náhodně zvoleného obrázku ve formátu CSS
        var pinupLocationCss = "url('pinup/" + pinupPool[randomNumber] + ".jpg')";

        // výsledek funkce bude ten finální generovaný string
        return pinupLocationCss;
    }
}

// finální přidání vygenerovaného obrázku do html kódu divu panelPinup
pinupDiv.style.backgroundImage = generatePinup();
