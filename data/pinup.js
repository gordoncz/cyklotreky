// DESC Generátor pinup girls na PC

// automatický generátor pro pinup girls obrázky na pozadí titulní stránky, provede se jen při zobrazení na PC
// na mobilech se z důvodu úspory přenosu dat a také úspory místa na monitoru pinup girls nebudou zobrazovat

// NOTE zde stačí vložit číslo, kolik je celkem pinup souborů ve složce
var celkemPinup = 47;


// definování variable pro div ID "panelPinup" na stránce, kam se bude obrázek vkládat
var pinupDiv = document.getElementById("panelPinup");

// na začátku vytvořit prázdný array, kam se následně budou automaticky vkládat jednotlivé pinup položky
var pinupPool = [];

// ITEM naplnění array daty
// na tomto místě se kód postará o naplnění výše definovaného prázdného array příslušnými daty
// počet vložených pinup záznamů do array se řídí číslem, které je definované výše v rámci var celkemPinup
if (celkemPinup > 9) {
    // tento if blok se spustí, pokud je počet pinup souborů ve složce větší než 9
    for(i = 1; i < 10; i++) {
        pinupPool.push(`pinup0${i}`);
    }
    for(i = 10; i < (celkemPinup + 1); i++) {
        pinupPool.push(`pinup${i}`);
    }
} else {
    // tento else blok se spustí jen tehdy, pokud je počet pinup souborů ve složce menší nebo roven 9
    for(i = 1; i < (celkemPinup + 1); i++) {
        pinupPool.push(`pinup0${i}`);
    }
}

// ITEM funkce generátoru pinup girls
function generatePinup() {

    // pokud je web zobrazen na mobilu, žádný background-image se nepřidá a funkce se hned ukončí
    if (detekceMobilu.matches) {
        return;
    } else {

        // vygenerování náhodného čísla od 0 do pinupPool.length-1
        // to vybere číslo pro index v rámci výše definovaného array
        // a to index číslo pak určí, který string (obrázek) se z array vybere pro background-image
        var randomNumber = Math.floor(Math.random() * pinupPool.length);

        // variable pro celou složenou adresu toho náhodně zvoleného obrázku ve formátu CSS
        var pinupLocationCss = "url('pinup/" + pinupPool[randomNumber] + ".jpg')";

        // výsledek funkce bude ten finální generovaný string
        return pinupLocationCss;
    }
}

// finální přidání vygenerovaného obrázku do html kódu divu panelPinup
pinupDiv.style.backgroundImage = generatePinup();
