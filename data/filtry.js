// toto je speciální iniciační funkce, která se spustí až potom, co async funkce načte všechny trasy z JSON souboru
// do té doby totiž nejsou skriptem vygenerované HTML elementy, které se následně přiřazují těmto variables
// takže pokud by byly variables deklarované s hodnotami mimo funkci, tak by se tak stalo ještě předtím, než vůbec dané HTML elementy vzniknou
// proto je nutné takovéto kostrbaté řešení, kdy se uvnitř funkce deklarují variables bez "var", aby z nich vznikly "implicit global variables"...
// ...čímž je možné je pak použít v dalších funkcích jako kdyby to byly klasické globální variables
function spustitFiltry() {
    // definování variables pro hlavní elementy na stránce
    trasy = document.getElementById("seznamTras");
    trasa = trasy.getElementsByClassName("trasaWrapper");
    celkemTras = trasa.length;
    pocitadloDiv = document.getElementById("pocitadloTras");

    // variables pro rendering kružnice do správného divu na stránce
    kruhDiv = document.getElementById('pocitadloKruh');
    kruznice = kruhDiv.getContext('2d');

    // průměr kružnice (v px) je jen pro potřeby následného výpočtu x,y souřadnic středu kruhu
    // ve skutečnosti musí být průměr kružnice definovaný přímo v html tagu <canvas> na stránce jako čtverec o stranách x=px, y=px
    // takže toto číslo je jen kopie hodnot z html tagu
    prumerKruznice = 60;
    // poloměr kružnice je pak logicky polovina průměru
    polomerKruznice = prumerKruznice / 2;
    // a souřadnice x a y pro střed kružnice jsou tedy stejně vzdálené od bodu wrapper divu x=0,y=0 (position: absolute) jako poloměr kružnice
    stredX = polomerKruznice;
    stredY = polomerKruznice;

    // toto spustí funkci pro výpočet počtu zobrazených tras při načtení stránky
    countTracks();
}


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

    // výpočet procenta zobrazených tras z celkového počtu (zaokrouhleno na celé číslo)
    var procentoTras = Math.round(trasyZobrazeno / celkemTras * 100);
    // převod tohoto procenta na stupně (*3,6), zarovnání na "sever" (-90), zaokrouhlení na celé číslo
    // a toto číslo (variable) nám potom dá potřebnou souřadnici "x" pro výpočet konečného stupně vykreslení kruhu
    // (příklady: 0% == -90° / 1% == -86° / 25% == 0° / 50% == 90° / 75% == 180° / 100% == 270°)
    var konecKruhu = Math.round(procentoTras * 3.6 - 90);
    // console.log(procentoTras + "% / " + konecKruhu);
    // spuštění funkce pro re-rendering kružnice, aby se zobrazil oblouk xx° podle podílu aktuálně zobrazených tras
    vykresleniKruznice(konecKruhu);

    // tento IF zajistí, že při vyfiltrování 0 tras (tj. žádná nebude na stránce zobrazena)
    // se jako pozadí stránky objeví buď text (pro mobily) nebo malý EasterEgg obrázek pinup girl (pro PC)
    // rozlišení zobrazení mobil vs. PC se provádí už přes CSS
    if (pocitadloDiv.innerText == 0) {
        trasy.classList.add("noTracks");
    } else {
        trasy.classList.remove("noTracks");
    }
}

// renderování kruhu okolo počtu tras podle toho, jaký je poměr zobrazených vs. celkových tras (parametr "x" převzatý z funkce countTracks)
function vykresleniKruznice(x) {
    // helper funkce umožňující používání stupňů pro definici rozsahu kruhu
    // protože nativně pracuje canvas pro kružnice asi v radianech
    function toRadians(deg) {
        return deg * Math.PI / 180
    }

    // nutnost před re-renderingem vyčistit <canvas> od předchozí renderované kružnice
    // jinak by byly problémy se zobrazením nové kružnice
    // method je clearRect(x,y,width,height), kde x,y jsou souřadnice počátečního bodu <canvas>, odkud se začne mazat
    // a width a height jsou horizontální a vertikální vzdálenosti od počátečního bodu <canvas>
    // což dohromady definuje obdélník oblasti z <canvas>, která se bude mazat
    kruznice.clearRect(0, 0, prumerKruznice, prumerKruznice);

    // barva výplně renderované kružnice ("#0a7fe2" odpovídá --themeColor)
    kruznice.fillStyle = "#0a7fe2";
    // samotný rendering kružnice v rámci <canvas> elementu
    kruznice.beginPath();
    // začátek od středu souřadnic, které jsme definovali v předchozích variables
    kruznice.moveTo(stredX, stredY);
    // renderování oblouku ze středových souřadnic
    // o vzdálenosti odpovídající poloměru kružnice
    // z bodu "sever" (-90°, protože 0° je defaultně "východ")
    // do bodu "x" podle počtu stupňů vypočtených z kalkulace poměru zobrazených vs. celkových tras
    kruznice.arc(stredX, stredY, polomerKruznice, toRadians(-90), toRadians(x));
    // pak finální čára opět do středu souřadnic
    kruznice.lineTo(stredX, stredY);
    // technické uzavření Path
    kruznice.closePath();
    // vyplnění definovanou barvou, aby to nebyla jen Path, ale Object
    kruznice.fill();

    // pozn: další kružnice či jiný prvek v tom stejném <canvas> tagu lze renderovat opakováním stejných methods na stejné variable "kruznice", jen s jinými parametry
    // takže by to bylo znovu to stejné od kruznice.fillStyle až po kruznice.fill();
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
