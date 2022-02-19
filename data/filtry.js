// DESC Skripty pro filtry zobrazovaných tras

// =========================================================================================================
// CHAPTER naplnění dropdown menus v html stránce hodnotami pro délky tras a regiony
// =========================================================================================================


// naplnění dropdown pro délky tras
var delkyDropdown = document.getElementById("podleDelky");
// speciální první řádek s hodnotou "všechny"
delkyDropdown.appendChild(new Option(vsechnyName, vsechnyID));
// zbytek hodnot pro dropdown
for (let i = 0; i < delkyIDs.length; i++) {
    delkyDropdown.appendChild(new Option(delkyNames[i], delkyIDs[i]))
}

// naplnění dropdown pro regiony
var regionyDropdown = document.getElementById("podleRegionu");
// speciální první řádek s hodnotou "všechny"
regionyDropdown.appendChild(new Option(vsechnyName, vsechnyID));
// zbytek hodnot pro dropdown
regiony.forEach(region => {
    regionyDropdown.appendChild(new Option(region, region));
});

// !CHAPTER



// =========================================================================================================
// CHAPTER funkce pro jednotlivé filtry
// =========================================================================================================


// ITEM Iniciační funkce pro finální spuštění filtrů
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
    limitAuthorsToOnlyOriginal = false;

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

    // reset filtrů při načtení stránky
    resetFilters();
    // toto spustí funkci pro výpočet počtu zobrazených tras při načtení stránky
    countTracks();
}


// ITEM funkce pro filtrování tras podle jejich délky
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
            var delka = trasa[i].querySelectorAll(".kmContainer.short")[0];
        } else if (x == "M") {
            var delka = trasa[i].querySelectorAll(".kmContainer.medium")[0];
        } else if (x == "L") {
            var delka = trasa[i].querySelectorAll(".kmContainer.long")[0];
        } else if (x == "XL") {
            var delka = trasa[i].querySelectorAll(".kmContainer.longest")[0];
        } else if (x == "MD") {
            var delka = trasa[i].querySelectorAll(".kmContainer.multi")[0];
        } else if (x == "MD2") {
            var delka = trasa[i].querySelectorAll(".kmContainer.multi.days2")[0];
        } else if (x == "MD3") {
            var delka = trasa[i].querySelectorAll(".kmContainer.multi.days3")[0];
        } else if (x == "MD4") {
            var delka = trasa[i].querySelectorAll(".kmContainer.multi.days4")[0];
        } else if (x == "MD5") {
            var delka = trasa[i].querySelectorAll(".kmContainer.multi.days5")[0];
        }

        // a zde se nastaví skrývací class pro všechny trasy, jejichž délka NEodpovídá výběru v dropdown
        if (delka == undefined) {
            trasa[i].classList.add("filtrDelka");
        }

    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// ITEM funkce pro filtrování tras podle regionu
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

// ITEM funkce zobrazení jen neabsolvovaných tras
function filterByKnown(x) {
    // nejprve je nutné smazat filtr ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrKnown");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "onlyUnknownKnown") {
        // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
        countTracks();
        return;
    }


    switch (x) {
        case "onlyUnknown":
            for (i = 0; i < trasa.length; i++) {
                var known = trasa[i].getElementsByClassName("known")[0];

                // pokud je kliknuto na volbu "Dosud neabsolvované trasy"
                // tak se skryjí všechny trasy s class "known" v html tagu
                if (known != undefined) {
                    trasa[i].classList.add("filtrKnown");
                }
            }
            break;
        case "onlyKnown":
            for (i = 0; i < trasa.length; i++) {
                var known = trasa[i].getElementsByClassName("known")[0];

                // pokud je kliknuto na volbu "Již známé trasy"
                // tak se skryjí všechny trasy, které class "known" v html tagu nemají
                if (known == undefined) {
                    trasa[i].classList.add("filtrKnown");
                }
            }
            break;
        default:
            console.log("neznámý input pro filtr neabsolvovaných/známých tras");
            break;
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// ITEM funkce zobrazení jen nově přidaných tras
function filterByNew() {
    var checkboxNew = document.getElementById("onlyNew");

    for (i = 0; i < trasa.length; i++) {
        var newTrack = trasa[i].getElementsByClassName("new")[0];

        // pokud trasa[i] nemá v sub-divu classu "new", tak ji skryje při zaškrtnutí checkboxu
        if ((checkboxNew.checked == true) && (newTrack == undefined)) {
            trasa[i].classList.add("filtrNew");
        }

        if (checkboxNew.checked == false) {
            trasa[i].classList.remove("filtrNew");
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// ITEM funkce pro filtrování tras podle jejich autorů
function filterByAuthors(x) {

    // nejprve je nutné smazat filtr autorů ze všech tras, kde mohl být uplatněn předchozí volbou
    for (i = 0; i < trasa.length; i++) {
        trasa[i].classList.remove("filtrAuthors");
    }

    // zde se funkce ukončí, aby se dále neuplatňoval filtr na žádnou z tras, pokud mají být zobrazeny všechny
    if (x == "onlyAuthorAny") {
        // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
        countTracks();
        return;
    }

    // kontrola, jestli je nastavené omezení pro zobrazování pouze originálních autorů tras
    if (limitAuthorsToOnlyOriginal) {
        // pak se nastaví variable autor podle toho, co za volbu se zvolí v inputu
        for (i = 0; i < trasa.length; i++) {
            // speciální variable pro detekci, kdo je uvedený jako autor na prvním místě u dané trasy (tj. jako originální autor)
            let y = trasa[i].getElementsByClassName("authorsContainer")[0].classList.item(1);
            // a také na začátku každého loop iteration je nutné resetovat variable autor (aby pak správně filtrovala trasy)
            var autor = undefined;

            if (x == "onlyAuthorK" && y == "authorK") {
                var autor = trasa[i].getElementsByClassName("authorK")[0];
            } else if (x == "onlyAuthorV" && y == "authorV") {
                var autor = trasa[i].getElementsByClassName("authorV")[0];
            } else if (x == "onlyAuthorD" && y == "authorD") {
                var autor = trasa[i].getElementsByClassName("authorD")[0];
            }

            // a zde se nastaví skrývací class pro všechny trasy, jejichž délka NEodpovídá výběru výše
            if (autor == undefined) {
                trasa[i].classList.add("filtrAuthors");
            }
        }
    } else {
        // pak se nastaví variable autor podle toho, co za volbu se zvolí v inputu
        for (i = 0; i < trasa.length; i++) {
            if (x == "onlyAuthorK") {
                var autor = trasa[i].getElementsByClassName("authorK")[0];
            } else if (x == "onlyAuthorV") {
                var autor = trasa[i].getElementsByClassName("authorV")[0];
            } else if (x == "onlyAuthorD") {
                var autor = trasa[i].getElementsByClassName("authorD")[0];
            }

            // a zde se nastaví skrývací class pro všechny trasy, jejichž délka NEodpovídá výběru výše
            if (autor == undefined) {
                trasa[i].classList.add("filtrAuthors");
            }
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// ITEM funkce pro zatržítko, které kontroluje/nastavuje filtrování striktně jen pro originální autory tras
function filterByOriginalAuthor() {
    var originalCheckbox = document.getElementById("originalAuthor");

    if (document.getElementById("onlyAuthorAny").checked) {
        var preservedAuthor = "onlyAuthorAny";
    } else if (document.getElementById("onlyAuthorK").checked) {
        var preservedAuthor = "onlyAuthorK";
    } else if (document.getElementById("onlyAuthorV").checked) {
        var preservedAuthor = "onlyAuthorV";
    } else if (document.getElementById("onlyAuthorD").checked) {
        var preservedAuthor = "onlyAuthorD";
    }

    if (originalCheckbox.checked == true) {
        limitAuthorsToOnlyOriginal = true;
    }

    if (originalCheckbox.checked == false) {
        limitAuthorsToOnlyOriginal = false;
    }

    // po nastavení zatržítka je nutné spustit znovu funkci pro filtrování podle autorů
    // aby se mohlo aktualizovat zobrazení na stránce
    filterByAuthors(preservedAuthor);
}

// ITEM funkce pro filtrování tras, na kterých lze využít jízdenky IDS JMK...
// ...ale jen plně (oboje jak do startu, tak z cíle trasy)...
// ...trasy s možností využití IDS JMK částečně (buď do startu nebo z cíle trasy, ale ne oboje) budou mít sice ikonku, ale ne filtr
function filterByIDSJMK() {
    var checkboxIDSJMK = document.getElementById("onlyIDSJMK");

    for (i = 0; i < trasa.length; i++) {
        var fullIDSJMK = trasa[i].getElementsByClassName("idsjmk2")[0];

        // pokud trasa[i] nemá v sub-divu classu "idsjmk2" (plné využití IDS JMK), tak ji skryje při zaškrtnutí checkboxu
        if ((checkboxIDSJMK.checked == true) && (fullIDSJMK == undefined)) {
            trasa[i].classList.add("filtrIDSJMK");
        }

        if (checkboxIDSJMK.checked == false) {
            trasa[i].classList.remove("filtrIDSJMK");
        }
    }

    // vždy po aplikování filtru znovu spustit funkci na přepočet čísla v počítadle zobrazených tras
    countTracks();
}

// ITEM funkce vyhledávání/filtrování tras podle názvu
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

// ITEM funkce pro reset textového vyhledávacího pole
function resetTextu() {
    // nejdřív nastaví hodnotu textového pole na prázdné
    // a potom pustí filtrovací funkci, která vše synchronizuje se zobrazenými trasami na stránce
    document.getElementById("hledatNazev").value = "";
    filterByName();
}

// ITEM funkce pro výpočet počtu aktuálně zobrazených tras a zobrazení tohoto čísla na stránce
function countTracks() {
    // variable, do níž se zapíše počet tras, které nemají žádný skrývací filtr (tj. ty, které jsou aktuálně vidět na stránce)
    var trasyZobrazeno = document.querySelectorAll(".trasaWrapper:not(.filtrDelka):not(.filtrRegion):not(.filtrKnown):not(.filtrNew):not(.filtrNazev):not(.filtrAuthors):not(.filtrIDSJMK)").length

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

// ITEM renderování kruhu okolo počtu tras podle toho, jaký je poměr zobrazených vs. celkových tras (parametr "x" převzatý z funkce countTracks)
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

// ITEM funkce pro reset všech filtrů do defaultu
function resetFilters() {
    // reset dropdown filtrů
    // nejdřív se nastaví hodnota dropdown na "all"
    // a potom se pustí na to navázaná filtrovací funkce, což zařídí elegantní reset daného filtru
    document.getElementById("podleDelky").value = "all";
    filterByDistance("all");
    document.getElementById("podleRegionu").value = "all";
    filterByRegion("all");

    // reset radio buttons togglů
    document.getElementById("onlyUnknownKnown").checked = true;
    filterByKnown("onlyUnknownKnown");
    document.getElementById("onlyAuthorAny").checked = true;
    filterByAuthors("onlyAuthorAny");

    // reset zatržítek
    // nejdřív se nastaví zatržítko na "off"
    // a potom se pustí na to navázaná filtrovací funkce, což zařídí elegantní reset daného filtru
    document.getElementById("onlyNew").checked = false;
    filterByNew();
    document.getElementById("originalAuthor").checked = false;
    filterByOriginalAuthor();
    document.getElementById("onlyIDSJMK").checked = false;
    filterByIDSJMK();

    // reset textového vyhledávání
    // podobně jako předchozí dva případy...
    // nejdřív nastaví hodnotu textového pole na prázdné
    // a potom pustí filtrovací funkci, která vše synchronizuje se zobrazenými trasami na stránce
    document.getElementById("hledatNazev").value = "";
    filterByName();

    // a pro jistotu ještě jednou na konci pustí funkci pro spočítání zobrazených tras
    countTracks();
}

// !CHAPTER
