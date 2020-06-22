// definování variables pro hlavní elementy na stránce
var trasy = document.getElementById("seznamTras");
var trasa = trasy.getElementsByClassName("trasaWrapper");
var pocitadloDiv = document.getElementById("pocitadloTras");


// funkce pro filtrování tras podle jejich délky
function filterByDistance(x) {

    // nejprve je nutné smazat délkový filtr ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrDelka");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "all") {
        // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
        countTracks();
        return;
    }

    // pak se nastaví variable delka podle toho, co za volbu je vybráno v dropdown
    for (i = 0; i < trasa.length; i++) {
        if (x == "S") {
            var delka = trasa[i].getElementsByClassName("short")[0];
        } else if (x == "M") {
            var delka = trasa[i].getElementsByClassName("medium")[0];
        } else if (x == "L") {
            var delka = trasa[i].getElementsByClassName("long")[0];
        } else if (x == "XL") {
            var delka = trasa[i].getElementsByClassName("longest")[0];
        } else if (x == "MD") {
            var delka = trasa[i].getElementsByClassName("multi")[0];
        }

        // a zde se nastaví skrývací class pro všechny trasy, jejichž délka NEodpovídá výběru v dropdown
        if (delka == undefined) {
            trasa[i].classList.add("filtrDelka");
        }

    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// funkce pro filtrování tras podle regionu
function filterByRegion(x) {

    // nejprve je nutné smazat regionální filtr ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrRegion");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "all") {
        // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
        countTracks();
        return;
    }

    for (i = 0; i < trasa.length; i++) {
        var lokalita = trasa[i].getElementsByClassName("regionContainer")[0];
        var lokalitaText = lokalita.innerText;

        // a zde se nastaví skrývací class pro všechny trasy, jejichž region NEodpovídá výběru v dropdown
        if (lokalitaText != x) {
            trasa[i].classList.add("filtrRegion");
        }

    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// funkce zobrazení jen neabsolvovaných tras
function filterByKnown() {
    var checkbox = document.getElementById("onlyUnknown");

    for (i = 0; i < trasa.length; i++) {
        var known = trasa[i].getElementsByClassName("known")[0];

        // pokud je checkbox zaškrtnutý, tak skryje každou trasu[i], která nemá v žádném sub-divu class "known"
        if ((checkbox.checked == true) && (known != undefined)) {
            trasa[i].classList.add("filtrKnown");
        }

        if (checkbox.checked == false) {
            trasa[i].classList.remove("filtrKnown");
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// funkce zobrazení jen nově přidaných tras
function filterByNew() {
    var checkbox = document.getElementById("onlyNew");

    for (i = 0; i < trasa.length; i++) {
        var newTrack = trasa[i].getElementsByClassName("new")[0];

        // pokud trasa[i] nemá v sub-divu classu "new", tak ji skryje při zaškrtnutí checkboxu
        if ((checkbox.checked == true) && (newTrack == undefined)) {
            trasa[i].classList.add("filtrNew");
        }

        if (checkbox.checked == false) {
            trasa[i].classList.remove("filtrNew");
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// funkce vyhledávání/filtrování tras podle názvu
function filterByName() {
    var input = document.getElementById("hledatNazev");
    var filter = input.value.toLowerCase();
    var filterNorm = filter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (i = 0; i < trasa.length; i++) {
        var nazev = trasa[i].getElementsByClassName("nazevContainer")[0];
        var nazevText = nazev.innerText;

        // pokud v trase[i] v textu sub-divu pro název najde text zadaný do input pole na stránce, pak tu trasu zobrazí
        // pokud tam ten textový string nenajde, tak trasu skryje
        if (nazevText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filterNorm) > -1) {
            trasa[i].classList.remove("filtrNazev");
        } else {
            trasa[i].classList.add("filtrNazev");
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// funkce pro reset textového vyhledávacího pole
function resetTextu() {
    // nejdřív nastaví hodnotu textového pole na prázdné
    // a potom pustí filtrovací funkci, která vše synchronizuje se zobrazenými trasami na stránce
    document.getElementById("hledatNazev").value = "";
    filterByName();
}

// funkce pro výpočet počtu aktuálně zobrazených tras a zobrazení tohoto čísla na stránce
function countTracks() {
    // variable, do níž se zapíše počet tras, které nemají žádný skrývací filtr (tj. ty, které jsou aktuálně vidět na stránce)
    var trasyZobrazeno = document.querySelectorAll(".trasaWrapper:not(.filtrDelka):not(.filtrRegion):not(.filtrKnown):not(.filtrNew):not(.filtrNazev)").length

    // funkce vezme hodnotu této variable a vloží ji jako obsah divu počítadla na stránce
    pocitadloDiv.innerText = trasyZobrazeno;
}

// funkce pro reset všech filtrů do defaultu
function resetFilters() {
    // reset dropdown filtrů
    // nejdřív se nastaví hodnota dropdown na "all"
    // a potom se pustí na to navázaná filtrovací funkce, což zařídí elegantní reset daného filtru
    document.getElementById("podleDelky").value = "all";
    filterByDistance("all");
    document.getElementById("podleRegionu").value = "all";
    filterByRegion("all");

    // reset zatržítek
    // nejdřív se nastaví zatržítko na "off"
    // a potom se pustí na to navázaná filtrovací funkce, což zařídí elegantní reset daného filtru
    document.getElementById("onlyUnknown").checked = false;
    filterByKnown();
    document.getElementById("onlyNew").checked = false;
    filterByNew();

    // reset textového vyhledávání
    // podobně jako předchozí dva případy...
    // nejdřív nastaví hodnotu textového pole na prázdné
    // a potom pustí filtrovací funkci, která vše synchronizuje se zobrazenými trasami na stránce
    document.getElementById("hledatNazev").value = "";
    filterByName();

    // a pro jistotu ještě jednou na konci pustí funkci pro spočítání zobrazených tras
    countTracks();
}

// toto spustí funkci pro výpočet počtu zobrazených tras hned při načtení stránky
countTracks();
