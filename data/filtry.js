// definování variables pro hlavní elementy na stránce
var trasy = document.getElementById("seznamTras");
var trasa = trasy.getElementsByClassName("trasaWrapper");


// funkce pro filtrování tras podle jejich délky
function filterByDistance(x) {

    // nejprve je nutné smazat délkový filtr ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrDelka");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "all") {
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

}

// funkce pro filtrování tras podle regionu
function filterByRegion(x) {

    // nejprve je nutné smazat regionální filtr ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrRegion");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "all") {
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
}

// funkce vyhledávání/filtrování tras podle názvu
function filterByName() {
    var input = document.getElementById("hledatNazev");
    var filter = input.value.toLowerCase();

    for (i = 0; i < trasa.length; i++) {
        var nazev = trasa[i].getElementsByClassName("nazevContainer")[0];
        var nazevText = nazev.innerText;

        // pokud v trase[i] v textu sub-divu pro název najde text zadaný do input pole na stránce, pak tu trasu zobrazí
        // pokud tam ten textový string nenajde, tak trasu skryje
        if (nazevText.toLowerCase().indexOf(filter) > -1) {
            trasa[i].style.display = "";
        } else {
            trasa[i].style.display = "none";
        }
    }
}
