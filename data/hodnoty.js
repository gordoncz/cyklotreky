// DESC Variables s hodnotami pro délky tras a regiony

// ITEM pomocné generické funkce dostupné pro ostatní skripty
// generická funkce na vytvoření html div elementu a přiřazení className
function createDiv(htmlClass) {
    let div = document.createElement("div");
    div.setAttribute("class", htmlClass);
    return div;
}
// generická funkce na vytvoření anchor elementu s _blank target a className
function createAnchor(htmlClass, link) {
    let anchor = document.createElement("a");
    anchor.setAttribute("class", htmlClass);
    anchor.href = link;
    anchor.target = "_blank";
    return anchor;
}

// ITEM listener funkce pro posouvání obsahu stránky při onFocus textového filtru
var textovyFiltr = document.getElementById("hledatNazev");
var detekceMobiluNastojato = window.matchMedia("(max-width: 572px)");

// musí být splněny dvě podmínky současně, aby se kód aplikoval - musí jít o mobil a musí existovat DOM element textového filtru na stránce
if (detekceMobilu.matches && textovyFiltr) {
    // onFocus funkce zajišťující posun obsahu stránky při onFocus textového filtru
    function focusOnTextFilter() {
        let textovyFiltrBox = textovyFiltr.getBoundingClientRect();
        // settimeout (i když je jen 0) zajišťuje, že odskrollování se provede až jako poslední věc (tzn. až po aktualizaci seznamu tras)
        setTimeout(() => {
            window.scrollBy(window.scrollX, textovyFiltrBox.top - 70);
        }, 0);
    }

    function checkForFocusConditions(e) {
        // dodatečný dynamický checking, zda je aktuální šířka obrazovky max 572px (reaguje na změny, tj. např. na otáčení obrazovky)
        if (e.matches) {
            // přidělení onFocus metody na textový filtr
            textovyFiltr.addEventListener("click", focusOnTextFilter);
        } else {
            textovyFiltr.removeEventListener("click", focusOnTextFilter);
        }
    }

    // dynamická detekce změny rozlišení šířky obrazovky (např. při otočení mobilu nebo změny velikosti okna prohlížeče atd.)
    detekceMobiluNastojato.addEventListener("change", checkForFocusConditions);
    // nutná aktivace checking skriptu při načtení stránky (bez toho to nepojede)
    checkForFocusConditions(detekceMobiluNastojato);
}


// speciální variables pro hodnotu "všechny" (pro délky i regiony) uvnitř dropdown menus
var vsechnyID = "all";
var vsechnyName = "všechny";

// ITEM variables pro délky tras
// musí spolu sedět následující dva arraye!!!
var delkyIDs = [
    "S",
    "M",
    "L",
    "XL",
    "MD",
    "MD2",
    "MD3",
    "MD4",
    "MD5"
];
var delkyNames = [
    "krátké",
    "střední",
    "dlouhé",
    "extra dlouhé",
    "vícedenní",
    "vícedenní (2 dny)",
    "vícedenní (3 dny)",
    "vícedenní (4 dny)",
    "vícedenní (5 dnů)"
];

var delkyCSS = [
    "short",
    "medium",
    "long",
    "longest",
    "multi"
];

// ITEM pomocná funkce pro určení kategorie délky jednodenních tras pro potřeby skriptů
// díky tomu, že je tato funkce externalizovaná sem, je pak možné měnit kategorie délek tras jen zde na jediném místě
function delkaTrasy(typ, delka) {
    // argumenty: typ trasy - string (cyklo / pesi) a delka trasy - number
    let kategorie = "";
    if (typ == "cyklo") {
        if (delka < 30) { kategorie = delkyCSS[0] }
        if (delka >= 30 && delka < 40) { kategorie = delkyCSS[1] }
        if (delka >= 40 && delka < 50) { kategorie = delkyCSS[2] }
        if (delka >= 50) { kategorie = delkyCSS[3] }
    } else if (typ == "pesi") {
        if (delka < 10) { kategorie = delkyCSS[0] }
        if (delka >= 10 && delka < 15) { kategorie = delkyCSS[1] }
        if (delka >= 15 && delka < 20) { kategorie = delkyCSS[2] }
        if (delka >= 20) { kategorie = delkyCSS[3] }
    }
    // kategorie - string, použitelný jako className například
    return kategorie;
}

// ITEM array s regiony
var regiony = [
    "Beskydy",
    "Bílé Karpaty",
    "Brněnsko",
    "Brno",
    "Haná",
    "Jeseníky",
    "Jižní Čechy",
    "Jižní Morava",
    "Krkonoše",
    "Krušnohoří",
    "Orlické hory",
    "Polabí",
    "Rakousko",
    "Slezsko",
    "Slovensko",
    "Střední Čechy",
    "Svitavsko",
    "Šumava",
    "Vysočina",
    "Východní Čechy",
    "Západní Čechy"
];

// ITEM object se jmény autorů tras
var authorsNames = {
    k: "authorK",
    v: "authorV",
    d: "authorD"
}
