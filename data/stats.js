// DESC Skripty pro zobrazování statistik tras


/* ================================================================================================================================== */
/* CHAPTER úvodní variables */
/* ================================================================================================================================== */


// generický div pro obsah stránky
var page = document.getElementById("obsahStrankyStats");
// prázdné variables pro typy tras, které se naplní následně JSON daty
// důležité je, aby byly zde a tím pádem měly global scope
var cyklotrasy;
var pesitrasy;
// stejné pro ovládací/přepínací prvky stránky
// také musí být deklarované (prázdné) zde jako global, pak jsou v rámci hlavní funkce změněny na odpovídající DOM objekty...
// ...a tím, že jsou deklarované už zde jako global, tak hodnoty z funkce se propíšou do global scope...
// ...což umožní poslední funkci (pro přepínání obsahu stránky), aby s těmito DOM objekty mohla vůbec pracovat
var tlacitkoStatsSouhrn;
var tlacitkoStatsCyklo;
var tlacitkoStatsPesi;
var souhrnPage;
var cykloPage;
var pesiPage;
// speciální arrays s HTML objekty pro přepínání záložek s koláčovými a sloupcovými grafy
var cykloKolace = [];
var pesiKolace = [];
var cykloGrafy = [];
var pesiGrafy = [];
// svg ikonka pro ranking (která pak bude vybarvovaná přes CSS)
// class "rank" je jen generický default, který je pak nutné nahradit vlastní classou (prostřednictvím String.replace metody)
var rankingStar =
`
<svg class="rank" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px"
	 height="16px" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">
<path d="M8.935,13.015c-0.514-0.357-1.354-0.357-1.869,0l-3.31,2.303c-0.514,0.357-0.786,0.16-0.605-0.439
	l1.167-3.859c0.181-0.6-0.079-1.399-0.578-1.777L0.529,6.806C0.03,6.428,0.134,6.108,0.76,6.095l4.032-0.082
	C5.417,6,6.098,5.506,6.303,4.915l1.324-3.808c0.206-0.591,0.542-0.591,0.748,0l1.324,3.808C9.904,5.506,10.584,6,11.21,6.013
	l4.03,0.082c0.626,0.013,0.729,0.333,0.23,0.711l-3.212,2.435c-0.499,0.378-0.759,1.178-0.578,1.777l1.168,3.859
	c0.181,0.6-0.092,0.797-0.605,0.439L8.935,13.015z"/>
</svg>
`
var ranks = ["rankGold", "rankSilver", "rankBronze"];

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER asynchronní část pro načtení dat cyklo a pěších tras SOUČASNĚ */
/* ================================================================================================================================== */


// funkce pro načtení odpovídajících JSON dat podle toho, co dostane jako argument z funkce pod ní
var loadData = async (typDat) => {
    // načte asynchronně data z odpovídajícího JSON souboru podle typu tras, které dostane tato funkce jako argument
    let data = await fetch(`data/content/${typDat}.json`);
    // zachycení případného erroru při stahování json souboru
    if (data.status !== 200) { throw new Error("chyba při načítání dat"); }
    // parsování z Promise do JSON formatu
    let dataJSON = await data.json();
    // a výstup z funkce
    return dataJSON;
}

// v rámci této funkce se spustí načtení JSON dat pro oba typy tras, a to asynchronně
var collectData = async () => {
    // zde se pustí obě funkce pro načtení JSON dat SOUČASNĚ z obou typů tras
    // tzn. nemusí načítání pěších tras čekat, až se načtou cyklotrasy, tak jak to bylo před zavedením async
    let bike = loadData("cyklo");
    let trek = loadData("pesi");
    // zde kód počká, až se načtou oba dva json soubory komplet a teprve poté bude pokračovat dál
    // což je přesně to, co je potřeba, aby celý zbytek kódu fungoval správně
    // Promise.all vrací nikoliv Promise, ale rovnou Array, takže se následně nemusí následně vůbec parsovat z Promise do JSON
    var allData = await Promise.all([bike, trek]);
    // tudíž v dalším kroku jednotlivé části arraye lze vzít a přiřadit příslušným typům tras rovnou
    // tím se změní hodnoty do té doby prázdných global variable a bude možné s nimi dále pracovat v kódu
    cyklotrasy = allData[0];
    pesitrasy = allData[1];
}

// zde se spustí celá async část nahoře (pro načtení JSONů) a jakmile doběhne, tak díky .then method se následně pustí zbytek kódu
collectData()
    .then(() => { processData(); })
    // zachycení případného erroru při načítání JSON dat
    .catch((err) => { console.log(err); page.innerHTML = "chyba při načítání dat"; });

// !CHAPTER



/* ================================================================================================================================== */
/* hlavní funkce pro naplnění obsahu HTML stránky (DOM objekty) načtenými daty tras a jejich vykreslení */
/* ================================================================================================================================== */


function processData() {

    /* ================================================================================================================================== */
    /* CHAPTER interní výpočty, jejichž výsledky se pak budou moct použít při vykreslování jednotlivých elementů na html stránce */
    /* ================================================================================================================================== */


    /* -------------------------------------------------------- */
    /* SUB elementární výpočty počtů tras v databázi */


    // počet cyklotras
    var pocetCyklo = cyklotrasy.length;
    // počet pěších tras
    var pocetPesich = pesitrasy.length;
    // počet tras celkem v celé databázi (cyklo a pěší dohromady)
    var pocetCelkem = pocetCyklo + pocetPesich;

    // výpočet počtu dosud neabsolvovaných / již známých / nových tras
    function zname_neabsolvovane_nove_Trasy(typTras, typDat, condition) {
        let x = 0;
        for (i = 0; i < typTras.length; i++) {
            if (typTras[i][typDat] == condition) {
                x++;
            }
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var neabsolvovaneCyklo = zname_neabsolvovane_nove_Trasy(cyklotrasy, "known", false);
    var neabsolvovanePesi = zname_neabsolvovane_nove_Trasy(pesitrasy, "known", false);
    var neabsolvovaneCelkem = neabsolvovaneCyklo + neabsolvovanePesi;

    var znameCyklo = zname_neabsolvovane_nove_Trasy(cyklotrasy, "known", true);
    var znamePesi = zname_neabsolvovane_nove_Trasy(pesitrasy, "known", true);
    var znameCelkem = znameCyklo + znamePesi;

    var noveCyklo = zname_neabsolvovane_nove_Trasy(cyklotrasy, "new", true);
    var novePesi = zname_neabsolvovane_nove_Trasy(pesitrasy, "new", true);
    var noveCelkem = noveCyklo + novePesi;

    // výpočet celkového počtu km tras
    function celkemKmTrasy(typ) {
        let x = 0;
        for (i = 0; i < typ.length; i++) {
            x = x + typ[i].km;
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var celkemKmCyklo = celkemKmTrasy(cyklotrasy);
    var celkemKmPesi = celkemKmTrasy(pesitrasy);
    var celkemKmCelkem = celkemKmCyklo + celkemKmPesi;

    // výpočet celkového počtu dní tras
    function celkemDniTrasy(typ) {
        let x = 0;
        for (i = 0; i < typ.length; i++) {
            x = x + typ[i].kmpd.length;
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var celkemDniCyklo = celkemDniTrasy(cyklotrasy);
    var celkemDniPesi = celkemDniTrasy(pesitrasy);
    var celkemDniCelkem = celkemDniCyklo + celkemDniPesi;


    /* -------------------------------------------------------- */
    /* SUB nejkratší a nejdelší trasy */


    // variables, ze kterých budou NOVÉ array(s) pro nejkratší a nejdelší trasy
    // (tento nový array bude vždy složený jen z jednodenních/vícedenních tras)
    var jednodenniCyklo = cyklotrasy.filter(arr => !arr.multiday);
    var vicedenniCyklo = cyklotrasy.filter(arr => arr.multiday);
    var jednodenniPesi = pesitrasy.filter(arr => !arr.multiday);
    var vicedenniPesi = pesitrasy.filter(arr => arr.multiday);

    // funkce pro výběr vždy TOP 3 z arrays výše
    function nejkratsiTop3(array) {
        return [
            {"value": array[0].km, "name": array[0].nazev},
            {"value": array[1].km, "name": array[1].nazev},
            {"value": array[2].km, "name": array[2].nazev}
        ]
    }
    function nejdelsiTop3(array) {
        return [
            {"value": array[array.length - 1].km, "name": array[array.length - 1].nazev},
            {"value": array[array.length - 2].km, "name": array[array.length - 2].nazev},
            {"value": array[array.length - 3].km, "name": array[array.length - 3].nazev}
        ]
    }

    // zde z array(s) výše vyjmeme vždy 3 objekty podle kritéria, které zrovna hodnotíme
    // POZOR: POČÍTÁ SE S TÍM, ŽE JIŽ PŮVODNÍ ARRAY(S) JSOU OBĚ IMPLICITNĚ SPRÁVNĚ SEŘAZENÉ PODLE POČTU KM!!!
    // (pokud ne, nebudou kódy zde fungovat správně)

    // nej- cyklotrasy (název a km)
    var nejkratsiJednoCyklo = nejkratsiTop3(jednodenniCyklo);
    var nejdelsiJednoCyklo = nejdelsiTop3(jednodenniCyklo);
    var nejkratsiViceCyklo = nejkratsiTop3(vicedenniCyklo);
    var nejdelsiViceCyklo = nejdelsiTop3(vicedenniCyklo);
    // nej- pěší trasy (název a km)
    var nejkratsiJednoPesi = nejkratsiTop3(jednodenniPesi);
    var nejdelsiJednoPesi = nejdelsiTop3(jednodenniPesi);
    var nejkratsiVicePesi = nejkratsiTop3(vicedenniPesi);
    var nejdelsiVicePesi = nejdelsiTop3(vicedenniPesi);


    /* -------------------------------------------------------- */
    /* SUB počty tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyCykloRegiony = new Array;
    var poctyPesiRegiony = new Array;

    // funkce pro výpočet počtu cyklo a pěších tras v každém regionu
    function vypocetRegiony(typTras, region) {
        let x = 0;
        for (i = 0; i < typTras.length; i++) {
            if (typTras[i].region == region) {
                x++;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyCykloRegiony.push({"value": vypocetRegiony(cyklotrasy, regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyPesiRegiony.push({"value": vypocetRegiony(pesitrasy, regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů tras v regionech (od nejvíce po nejméně)
    poctyCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB počty dosud neabsolvovaných / již známých tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyUnknownCykloRegiony = new Array;
    var poctyUnknownPesiRegiony = new Array;

    var poctyKnownCykloRegiony = new Array;
    var poctyKnownPesiRegiony = new Array;

    // funkce pro výpočet počtu dosud neabsolvovaných cyklotras v každém regionu
    function vypocet_known_unknown_Regiony(typTras, region, condition) {
        let x = 0;
        for (i = 0; i < typTras.length; i++) {
            if ((typTras[i].region == region) && (typTras[i].known == condition)) {
                x++;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet dosud neabsolvovaných cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyUnknownCykloRegiony.push({"value": vypocet_known_unknown_Regiony(cyklotrasy, regiony[e], false), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyUnknownPesiRegiony.push({"value": vypocet_known_unknown_Regiony(pesitrasy, regiony[e], false), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů dosud neabsolvovaných tras v regionech (od nejvíce po nejméně)
    poctyUnknownCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyUnknownPesiRegiony.sort(function(a,b) {return b.value - a.value});


    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet již známých cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyKnownCykloRegiony.push({"value": vypocet_known_unknown_Regiony(cyklotrasy, regiony[e], true), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyKnownPesiRegiony.push({"value": vypocet_known_unknown_Regiony(pesitrasy, regiony[e], true), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů již známých tras v regionech (od nejvíce po nejméně)
    poctyKnownCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyKnownPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB počty km tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyKmCykloRegiony = new Array;
    var poctyKmPesiRegiony = new Array;

    // funkce pro výpočet počtu km cyklotras v každém regionu
    function vypocetKmRegiony(typTras, region) {
        let x = 0;
        for (i = 0; i < typTras.length; i++) {
            if (typTras[i].region == region) {
                x = x + typTras[i].km;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet km cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyKmCykloRegiony.push({"value": vypocetKmRegiony(cyklotrasy, regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyKmPesiRegiony.push({"value": vypocetKmRegiony(pesitrasy, regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů km tras v regionech (od nejvíce po nejméně)
    poctyKmCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyKmPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB počty dní tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyDniCykloRegiony = new Array;
    var poctyDniPesiRegiony = new Array;

    // funkce pro výpočet počtu dní cyklotras v každém regionu
    function vypocetDniRegiony(typTras, region) {
        let x = 0;
        for (i = 0; i < typTras.length; i++) {
            if (typTras[i].region == region) {
                x = x + typTras[i].kmpd.length;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet dní cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyDniCykloRegiony.push({"value": vypocetDniRegiony(cyklotrasy, regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyDniPesiRegiony.push({"value": vypocetDniRegiony(pesitrasy, regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů dní tras v regionech (od nejvíce po nejméně)
    poctyDniCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyDniPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB podíl tras podle jejich délky */


    // definování prázdných (s úvodní hodnotou 0) variables pro počty jednotlivých tras
    // jejich hodnoty pak naplní následující dva for loopy...
    var cykloShort = 0, cykloMedium = 0, cykloLong = 0, cykloLongest = 0, cykloMulti = 0;
    var pesiShort = 0, pesiMedium = 0, pesiLong = 0, pesiLongest = 0, pesiMulti = 0;

    // for loop pro incremental přidávání hodnot do jednotlivých variables podle délky cyklotras
    // výsledkem bude, že tyto variables tak budou mít taková čísla, kolik je tras v dané kategorii
    for (i = 0; i < cyklotrasy.length; i++) {
        if (cyklotrasy[i].multiday === true) {
            cykloMulti++;
        } else {
            // určování kategorie délky trasy bylo externalizováno do následující funkce delkaTrasy() v "hodnoty.js"
            let delka = delkaTrasy("cyklo", cyklotrasy[i].km);
            if (delka == delkyCSS[0]) {cykloShort++;}
            if (delka == delkyCSS[1]) {cykloMedium++;}
            if (delka == delkyCSS[2]) {cykloLong++;}
            if (delka == delkyCSS[3]) {cykloLongest++;}
        }
    }
    // to stejné pro pěší trasy
    for (i = 0; i < pesitrasy.length; i++) {
        if (pesitrasy[i].multiday === true) {
            pesiMulti++;
        } else {
            // určování kategorie délky trasy bylo externalizováno do následující funkce delkaTrasy() v "hodnoty.js"
            let delka = delkaTrasy("pesi", pesitrasy[i].km);
            if (delka == delkyCSS[0]) {pesiShort++;}
            if (delka == delkyCSS[1]) {pesiMedium++;}
            if (delka == delkyCSS[2]) {pesiLong++;}
            if (delka == delkyCSS[3]) {pesiLongest++;}
        }
    }

    // zachycení počtu vícedenních tras pro potřeby výpočtů v dalším grafu
    // (aby absolutní hodnota nebyla ztracena přepisem na procenta níže)
    var pocetCykloMulti = cykloMulti;
    var pocetPesiMulti = pesiMulti;

    // zde budou variables přepsány znovu, a to z absolutních čísel na čísla odpovídající procentům z celku
    cykloShort = cykloShort / pocetCyklo * 100;
    cykloMedium = cykloMedium / pocetCyklo * 100;
    cykloLong = cykloLong / pocetCyklo * 100;
    cykloLongest = cykloLongest / pocetCyklo * 100;
    cykloMulti = cykloMulti / pocetCyklo * 100;
    // to samé pro pěší
    pesiShort = pesiShort / pocetPesich * 100;
    pesiMedium = pesiMedium / pocetPesich * 100;
    pesiLong = pesiLong / pocetPesich * 100;
    pesiLongest = pesiLongest / pocetPesich * 100;
    pesiMulti = pesiMulti / pocetPesich * 100;


    /* -------------------------------------------------------- */
    /* SUB podíl jen vícedenních tras podle počtu dní */


    // definování prázdných (s úvodní hodnotou 0) variables pro počty jednotlivých tras
    // jejich hodnoty pak naplní následující dva for loopy...
    var cykloMulti2 = 0, cykloMulti3 = 0, cykloMulti4 = 0, cykloMulti5 = 0;
    var pesiMulti2 = 0, pesiMulti3 = 0, pesiMulti4 = 0, pesiMulti5 = 0;

    // for loop pro incremental přidávání hodnot do jednotlivých variables podle dní cyklotras
    // výsledkem bude, že tyto variables tak budou mít taková čísla, kolik je tras v dané kategorii
    for (i = 0; i < cyklotrasy.length; i++) {
        if (cyklotrasy[i].multiday === true) {
            // prochází hlavní datový array s trasami
            // a pokud je daná trasa vícedenní, tak použije následující conditional (alternativa k if statement)
            cyklotrasy[i].kmpd.length === 2 && cykloMulti2++;
            cyklotrasy[i].kmpd.length === 3 && cykloMulti3++;
            cyklotrasy[i].kmpd.length === 4 && cykloMulti4++;
            cyklotrasy[i].kmpd.length === 5 && cykloMulti5++;
        }
    }
    // to stejné pro pěší trasy
    for (i = 0; i < pesitrasy.length; i++) {
        if (pesitrasy[i].multiday === true) {
            // prochází hlavní datový array s trasami
            // a pokud je daná trasa vícedenní, tak použije následující conditional (alternativa k if statement)
            pesitrasy[i].kmpd.length === 2 && pesiMulti2++;
            pesitrasy[i].kmpd.length === 3 && pesiMulti3++;
            pesitrasy[i].kmpd.length === 4 && pesiMulti4++;
            pesitrasy[i].kmpd.length === 5 && pesiMulti5++;
        }
    }

    // zde budou variables přepsány znovu, a to z absolutních čísel na čísla odpovídající procentům z celku
    cykloMulti2 = cykloMulti2 / pocetCykloMulti * 100;
    cykloMulti3 = cykloMulti3 / pocetCykloMulti * 100;
    cykloMulti4 = cykloMulti4 / pocetCykloMulti * 100;
    cykloMulti5 = cykloMulti5 / pocetCykloMulti * 100;
    // to samé pro pěší
    pesiMulti2 = pesiMulti2 / pocetPesiMulti * 100;
    pesiMulti3 = pesiMulti3 / pocetPesiMulti * 100;
    pesiMulti4 = pesiMulti4 / pocetPesiMulti * 100;
    pesiMulti5 = pesiMulti5 / pocetPesiMulti * 100;


    /* -------------------------------------------------------- */
    /* SUB podíl známých vs. neabsolvovaných tras */


    // re-definování příslušných variables jako procentuálních podílů z celku
    // nejsou potřeba žádné funkce ani loopy, protože variables byly definovány už výše v rámci elementárních výpočtů
    var neabsolvovaneCykloPodil = neabsolvovaneCyklo / pocetCyklo * 100;
    var neabsolvovanePesiPodil = neabsolvovanePesi / pocetPesich * 100;
    var znameCykloPodil = znameCyklo / pocetCyklo * 100;
    var znamePesiPodil = znamePesi / pocetPesich * 100;


    /* -------------------------------------------------------- */
    /* SUB podíl tras podle jejich spoluautorů */


    // definování prázdných (s úvodní hodnotou 0) variables pro počty jednotlivých tras
    // jejich hodnoty pak naplní následující dva for loopy...
    var cykloAutorK = 0, cykloAutorV = 0, cykloAutorD = 0;
    var pesiAutorK = 0, pesiAutorV = 0, pesiAutorD = 0;

    // for loop pro incremental přidávání hodnot do jednotlivých variables podle spoluautorství cyklotras
    // výsledkem bude, že tyto variables tak budou mít taková čísla, kolik je tras v dané kategorii
    for (i = 0; i < cyklotrasy.length; i++) {
        cyklotrasy[i].authors.includes("k") && cykloAutorK++;
        cyklotrasy[i].authors.includes("v") && cykloAutorV++;
        cyklotrasy[i].authors.includes("d") && cykloAutorD++;
    }
    // to stejné pro pěší trasy
    for (i = 0; i < pesitrasy.length; i++) {
        pesitrasy[i].authors.includes("k") && pesiAutorK++;
        pesitrasy[i].authors.includes("v") && pesiAutorV++;
        pesitrasy[i].authors.includes("d") && pesiAutorD++;
    }

    // celkové součty, které budou sloužit pro výpočet procentuálního podílu níže
    var cykloAutori = cykloAutorK + cykloAutorV + cykloAutorD;
    var pesiAutori = pesiAutorK + pesiAutorV + pesiAutorD;

    // zde budou variables přepsány znovu, a to z absolutních čísel na čísla odpovídající procentům z celku
    cykloAutorK = cykloAutorK / cykloAutori * 100;
    cykloAutorV = cykloAutorV / cykloAutori * 100;
    cykloAutorD = cykloAutorD / cykloAutori * 100;
    // to samé pro pěší
    pesiAutorK = pesiAutorK / pesiAutori * 100;
    pesiAutorV = pesiAutorV / pesiAutori * 100;
    pesiAutorD = pesiAutorD / pesiAutori * 100;

    // !CHAPTER



    /* ================================================================================================================================== */
    /* CHAPTER samotné vykreslování jednotlivých elementů na html stránce */
    /* ================================================================================================================================== */


    /* -------------------------------------------------------- */
    /* SUB variables */


    // přepínací tlačítka
    tlacitkoStatsSouhrn = document.getElementById("tlacitkoStatsSouhrn");
    tlacitkoStatsCyklo = document.getElementById("tlacitkoStatsCyklo");
    tlacitkoStatsPesi = document.getElementById("tlacitkoStatsPesi");

    // odstavec s "loading textem"
    var loading = document.getElementById("loading");

    // main div pro "celkový souhrn"
    souhrnPage = document.createElement("div");
    souhrnPage.setAttribute("id", "statsSouhrnMain");
    souhrnPage.style.display = "none";
    souhrnPage.innerHTML = "<h2>Celkový přehled databáze</h2>";
    page.appendChild(souhrnPage);

    // main div pro "cyklo statistiky"
    cykloPage = document.createElement("div");
    cykloPage.setAttribute("id", "statsCykloMain");
    cykloPage.style.display = "none";
    cykloPage.innerHTML = "<h2>Statistika cyklotras v databázi</h2>";
    page.appendChild(cykloPage);

    // main div pro "pěší statistiky"
    pesiPage = document.createElement("div");
    pesiPage.setAttribute("id", "statsPesiMain");
    pesiPage.style.display = "none";
    pesiPage.innerHTML = "<h2>Statistika pěších tras v databázi</h2>";
    page.appendChild(pesiPage);


    /* -------------------------------------------------------- */
    /* SUB sekce: celkový souhrn/přehled */


    // nutno zde vytvořit práznou variable pro stats wrapper, aby se předešlo undefined errorům ve funkcích níže
    var statsAmountsWrapper;

    // funkce pro vytvoření nadpisů jednotlivých pod-oddílů
    function pododdilNadpis(podstranka, text) {
        var pododdil = document.createElement("h4");
        pododdil.innerHTML = text;
        podstranka.appendChild(pododdil);
    }

    // funkce pro vytvoření jednotlivých položek se souhrnnými daty
    function tvorbaSouhrnItem(popis, hodnota) {
        var statsAmountsContainer = createDiv("statsAmountsContainer");
        var statsAmountsPopisek = createDiv("statsAmountsPopisek");
        statsAmountsPopisek.innerHTML = popis;
        statsAmountsContainer.appendChild(statsAmountsPopisek);
        var statsAmountsVysledek = createDiv("statsAmountsVysledek");
        statsAmountsVysledek.innerHTML = hodnota;
        statsAmountsContainer.appendChild(statsAmountsVysledek);
        statsAmountsWrapper.appendChild(statsAmountsContainer);
    }

    // funkce pro vytvoření wrapperu pro jednotlivé položky výše
    function tvorbaSouhrnWrapper(cyklo, pesi, celkem) {
        // function call, kterým dynamicky naplníme jednotlivé položky pro souhrnná data
        // každý function call pustí do funkce jiná vstupní data (parameters)
        // a to zajistí tvorbu více položek, každou s jinou statistikou
        // POZN: pořadí function calls po sobě zde potom vytváří stejné pořadí html elementů na stránce
        statsAmountsWrapper = createDiv("statsAmountsWrapper");
        tvorbaSouhrnItem("cyklo", cyklo);
        tvorbaSouhrnItem("pěší", pesi);
        tvorbaSouhrnItem("celkem", celkem);
        // zde se vždy zabalí celá jedna sekce do speciálního wrapperu
        // který pak umožní flex zobrazení
        souhrnPage.appendChild(statsAmountsWrapper);
    }

    // zde se spustí jednotlivé funkce po sobě
    pododdilNadpis(souhrnPage, "Počet tras v databázi");
    tvorbaSouhrnWrapper(pocetCyklo, pocetPesich, pocetCelkem);

    pododdilNadpis(souhrnPage, "Již známé trasy");
    tvorbaSouhrnWrapper(znameCyklo, znamePesi, znameCelkem);

    pododdilNadpis(souhrnPage, "Dosud neabsolvované trasy k dispozici");
    tvorbaSouhrnWrapper(neabsolvovaneCyklo, neabsolvovanePesi, neabsolvovaneCelkem);

    pododdilNadpis(souhrnPage, "Nově přidané trasy");
    tvorbaSouhrnWrapper(noveCyklo, novePesi, noveCelkem);

    pododdilNadpis(souhrnPage, "Počet kilometrů tras v databázi");
    tvorbaSouhrnWrapper(celkemKmCyklo, celkemKmPesi, celkemKmCelkem);

    pododdilNadpis(souhrnPage, "Počet dní tras v databázi");
    tvorbaSouhrnWrapper(celkemDniCyklo, celkemDniPesi, celkemDniCelkem);


    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Rekordní trasy";
    souhrnPage.appendChild(nadpis);

    // prázdná variable opět pro zabránění undefined errorům
    var recordsWrapper;

    // druhá funkce pro vytvoření jednotlivých položek se souhrnnými daty
    // tentokrát zaměřená na nejkratší a nejdelší trasy
    function tvorbaSouhrnRecordsItem(popis, array, jednotky) {
        // vytvořit container Div s popiskem
        var statsRecordsContainer = createDiv("statsRecordsContainer");
        var statsRecordsPopisek = createDiv("statsRecordsPopisek");
        statsRecordsPopisek.innerHTML = popis;
        statsRecordsContainer.appendChild(statsRecordsPopisek);
        // while loop vloží 3 nej trasy do containeru
        let i = 0;
        while (i < 3) {
            // speciální check na lepší češtinu pro počet tras (aby nezobrazovalo text ""...1 tras", ale "1 trasa" apod.)
            if (jednotky == "tras" && array[i].value == 1) {
                jednotky = "trasa";
            } else if (jednotky == "tras" && array[i].value < 5) {
                jednotky = "trasy";
            } else {
                // pokud je počet tras v regionu 5 a více, tak ponechá variable "jednotky" ve formě String: "tras"
                // není nutné řešit případnou persistenci hodnoty variable z předchozí iterace loopu...
                // ...protože v regionech jsou trasy seřazeny od nejvíce po nejméně...
                // ...tudíž není možné, aby po např. čísle 3 následovalo číslo 7 atd. až do konce loopu
            }
            // samotný loop
            var statsRecordsVysledek = createDiv("statsRecordsVysledek");
            var rank = rankingStar.replace("rank", ranks[i]);
            statsRecordsVysledek.innerHTML = rank + array[i].name + " (" + array[i].value + " " + jednotky + ")";
            statsRecordsContainer.appendChild(statsRecordsVysledek);
            i++;
        }
        recordsWrapper.appendChild(statsRecordsContainer);
    }

    // funkce na tvorbu wrapperu pro oddíly z funkce výše
    function tvorbaSouhrnRecordsWrapper(cyklo, pesi, pocetCeho) {
        recordsWrapper = createDiv("recordsWrapper");
        tvorbaSouhrnRecordsItem("cyklo", cyklo, pocetCeho);
        tvorbaSouhrnRecordsItem("pěší", pesi, pocetCeho);
        souhrnPage.appendChild(recordsWrapper);
    }

    // a opět function call(s)
    // nejprve pro rekordní trasy...
    pododdilNadpis(souhrnPage, "Nejkratší jednodenní trasy");
    tvorbaSouhrnRecordsWrapper(nejkratsiJednoCyklo, nejkratsiJednoPesi, "km");

    pododdilNadpis(souhrnPage, "Nejdelší jednodenní trasy");
    tvorbaSouhrnRecordsWrapper(nejdelsiJednoCyklo, nejdelsiJednoPesi, "km");

    pododdilNadpis(souhrnPage, "Nejkratší vícedenní trasy");
    tvorbaSouhrnRecordsWrapper(nejkratsiViceCyklo, nejkratsiVicePesi, "km");

    pododdilNadpis(souhrnPage, "Nejdelší vícedenní trasy");
    tvorbaSouhrnRecordsWrapper(nejdelsiViceCyklo, nejdelsiVicePesi, "km");


    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Rekordní regiony";
    souhrnPage.appendChild(nadpis);

    // ...potom také pro rekordní regiony
    pododdilNadpis(souhrnPage, "Regiony s nejvíce trasami");
    tvorbaSouhrnRecordsWrapper(poctyCykloRegiony, poctyPesiRegiony, "tras");

    pododdilNadpis(souhrnPage, "Kde máme nejvíce ještě neabsolvovaných tras k dispozici");
    tvorbaSouhrnRecordsWrapper(poctyUnknownCykloRegiony, poctyUnknownPesiRegiony, "tras");

    pododdilNadpis(souhrnPage, "Kde máme nejvíce již známých tras");
    tvorbaSouhrnRecordsWrapper(poctyKnownCykloRegiony, poctyKnownPesiRegiony, "tras");


    /* -------------------------------------------------------- */
    /* SUB koláčový graf pro počty tras podle délky a vysvětlivky ke koláčovému grafu */


    // funkce na dynamické vytváření wrapper divu a přidělení příslušného ID
    function tvorbaKolacWrapperu(podstranka, id) {
        let kolacWrapper = document.createElement("div");
        kolacWrapper.setAttribute("id", `${id}`);
        kolacWrapper.style.display = "none";
        // updatovat globální array o zde nově definovaný HTML objekt
        id.startsWith("cyklo") ? cykloKolace.push(kolacWrapper) : pesiKolace.push(kolacWrapper);
        podstranka.appendChild(kolacWrapper);
    }

    // funkce pro vytvoření nadpisů jednotlivých pod-sekcí
    function podsekceKolacNadpis(wrapperDiv, text) {
        // lokalizovat wrapperDiv pro následné umístění obsahu
        var umisteni = document.getElementById(wrapperDiv);
        var pododdil = document.createElement("h4");
        pododdil.innerHTML = text;
        umisteni.appendChild(pododdil);
    }

    // funkce na tvorbu koláčového grafu o jednotlivých segmentech pro každou kategorii délky tras
    function tvorbaKolacGraf(wrapperDiv, vysece, barvy) {
        // wrapper div
        var umisteni = document.getElementById(wrapperDiv);
        var kolacDiv = createDiv("kolacWrapper");
        umisteni.appendChild(kolacDiv);
        // canvas
        var kolacCanvas = document.createElement("canvas");
        kolacCanvas.setAttribute("class", "kolacovyGrafCyklo");
        // atributy width a height musí být zapsané přímo jako html tagy a ne style.width/height
        // přes stylopisy (ani inline) totiž nefunguje změna defaultního poměru stran canvasu 2:1
        // pro mobilní displeje bude koláč menší než na PC
        if (detekceMobilu.matches) {
            kolacCanvas.setAttribute("width", "300px");
            kolacCanvas.setAttribute("height", "300px");
        } else {
            kolacCanvas.setAttribute("width", "460px");
            kolacCanvas.setAttribute("height", "460px");
        }
        var kolac = kolacCanvas.getContext("2d");
        kolacDiv.appendChild(kolacCanvas);

        // parametry koláčového grafu
        if (detekceMobilu.matches) {
            var kolacPrumer = 300;
        } else {
            var kolacPrumer = 460;
        }
        var kolacPolomer = kolacPrumer / 2;
        var cX = kolacPolomer;
        var cY = kolacPolomer;

        // rozšířený převodník absolutních hodnot počtu tras na stupně kružnice
        // a následně pak i stupňů na nativní radiány
        function toRadians(procenta) {
            var deg = (procenta * 3.6) - 90;
            return deg * Math.PI / 180;
        }

        // arrays, se kterými bude pracovat následující loop na tvorbu koláčového grafu
        // CSS hash barvy jednotlivých délek tras (short, medium, long, longest a multi)
        // jsou passed-in jako array "barvy"
        // hraniční úhly jednotlivých výsečí v koláči (s převzatými hodnotami v argumentech funkce)
        // jsou passed-in jako array "vysece"
        // počáteční hodnoty variables zodpovídající za úhel výseče, které bude následující for loop postupně měnit při každé iteraci
        var a = 0, b = 0;

        // v následujícím loopu musí číslo "X" v deklaraci "k < X" souhlasit s array.length pro "barvy" a "vysece"
        // protože to bude určovat počet výsečí v koláčovém grafu, tak aby tam byly reprezentovány všechny typy tras
        for (let i = 0; i < vysece.length; i++) {
            // každá výseč musí začínat tam, kde končí ta před ní (proto následující přepočty variables "a" a "b")
            // pokud by tam ty součty nebyly, počítalo by to výchozí pozici jen podle procent a ne jejich vzájemného vztahu
            // což by pak akorát způsobilo, že největší procenta by překryla ta menší a ne, že by na sebe navazovala, jak mají
            a = b;
            b = a + vysece[i];
            kolac.fillStyle = barvy[i];
            kolac.beginPath();
            kolac.moveTo(cX, cY);
            kolac.arc(cX, cY, kolacPolomer, toRadians(a), toRadians(b));
            kolac.lineTo(cX, cY);
            kolac.closePath();
            kolac.fill();
        }

        // pozn: další kružnice či jiný prvek v tom stejném <canvas> tagu lze renderovat opakováním stejných methods na stejné variable "kruznice", jen s jinými parametry
        // takže by to bylo znovu to stejné od kruznice.fillStyle až po kruznice.fill();
    }


    // vytvoření divu pro vysvětlivky ke koláčovému grafu (aby někde byla zobrazena přesná procenta k těm různým délkám tras)
    function tvorbaKolacVysvetlivky(wrapperDiv, footnotesKategorieData, footnotesKategorieNazvy, footnotesBarvyJakoClassCSS) {
        // wrapper div
        var umisteni = document.getElementById(wrapperDiv);
        var kolacNotes = createDiv("kolacVysvetlivky");
        umisteni.appendChild(kolacNotes);
        // jednotlivé kategorie vysvětlivek tras převzaté z argumentů k funkci jako array(s) "footnotes..."
        // následně se tyto jednotlivé kategorie uplatní v loopu
        for (let i = 0; i < footnotesKategorieData.length; i++) {
            // container div pro každou vysvětlivku zvlášť
            var kolacNotesContainer = createDiv("kolacNotesContainer");
            kolacNotes.appendChild(kolacNotesContainer);
            // vysvětlivka - délková kategorie tras
            var kolacNotesKategorie = createDiv("kolacNotesKategorie");
            kolacNotesContainer.appendChild(kolacNotesKategorie);
            // vysvětlivka - délková kategorie procentní podíl
            var kolacNotesProcenta = createDiv("kolacNotesProcenta");
            kolacNotesContainer.appendChild(kolacNotesProcenta);

            // zaokrouhlení procentuálního podílu na celá čísla
            var procentaZaokrouhleno = Math.round(footnotesKategorieData[i]);

            // a naplnění výše vytvořených divů odpovídajícími daty
            kolacNotesKategorie.innerHTML = footnotesKategorieNazvy[i];
            kolacNotesProcenta.innerHTML = `${procentaZaokrouhleno}%`;
            kolacNotesContainer.classList.add(footnotesBarvyJakoClassCSS[i]);
        }

    }


    // vytvoření wrapperDivů pro přepínací tlačítka
    var cykloKolaceButtons = document.createElement("div");
    cykloKolaceButtons.setAttribute("id", "cykloKolaceButtons");
    cykloPage.appendChild(cykloKolaceButtons);

    var pesiKolaceButtons = document.createElement("div");
    pesiKolaceButtons.setAttribute("id", "pesiKolaceButtons");
    pesiPage.appendChild(pesiKolaceButtons);

    // spuštění funkce na generování koláčového grafu
    // vždy pro cyklo a pro pěší

    // podíly tras podle délky

    // speciální array pro hash barvy kategorií délek tras pro canvas fill (nelze použít CSS class, protože ta je pro background)
    var delkyColors = ["#144a14", "#875807", "#a23604", "#710606", "#13264d"];
    // cyklo
    tvorbaKolacWrapperu(cykloPage, "cykloKolacDelky");
    podsekceKolacNadpis("cykloKolacDelky", "Podíl cyklotras podle jejich délky");
    tvorbaKolacGraf(
        "cykloKolacDelky",
        [cykloShort, cykloMedium, cykloLong, cykloLongest, cykloMulti],
        delkyColors
    );
    tvorbaKolacVysvetlivky(
        "cykloKolacDelky",
        [cykloShort, cykloMedium, cykloLong, cykloLongest, cykloMulti],
        delkyNames,
        delkyCSS
    );
    // pěší
    tvorbaKolacWrapperu(pesiPage, "pesiKolacDelky");
    podsekceKolacNadpis("pesiKolacDelky", "Podíl pěších tras podle jejich délky");
    tvorbaKolacGraf(
        "pesiKolacDelky",
        [pesiShort, pesiMedium, pesiLong, pesiLongest, pesiMulti],
        delkyColors
    );
    tvorbaKolacVysvetlivky(
        "pesiKolacDelky",
        [pesiShort, pesiMedium, pesiLong, pesiLongest, pesiMulti],
        delkyNames,
        delkyCSS
    );

    // podíly jen vícedenních tras podle počtu dní

    // speciální arrays pro použití jako argumentů ve function calls níže
    var multiNames = ["dvoudenní", "třídenní", "čtyřdenní", "pětidenní"];
    var multiColors = ["#1a3995", "#4b1797", "#791377", "#9f1241"];
    var multiClassesCSS = ["multi2", "multi3", "multi4", "multi5"];
    // cyklo
    tvorbaKolacWrapperu(cykloPage, "cykloKolacMulti");
    podsekceKolacNadpis("cykloKolacMulti", "Podíl vícedenních cyklotras podle počtu dní");
    tvorbaKolacGraf(
        "cykloKolacMulti",
        [cykloMulti2, cykloMulti3, cykloMulti4, cykloMulti5],
        multiColors
    );
    tvorbaKolacVysvetlivky(
        "cykloKolacMulti",
        [cykloMulti2, cykloMulti3, cykloMulti4, cykloMulti5],
        multiNames,
        multiClassesCSS
    );
    // pěší
    tvorbaKolacWrapperu(pesiPage, "pesiKolacMulti");
    podsekceKolacNadpis("pesiKolacMulti", "Podíl vícedenních pěších tras podle počtu dní");
    tvorbaKolacGraf(
        "pesiKolacMulti",
        [pesiMulti2, pesiMulti3, pesiMulti4, pesiMulti5],
        multiColors
    );
    tvorbaKolacVysvetlivky(
        "pesiKolacMulti",
        [pesiMulti2, pesiMulti3, pesiMulti4, pesiMulti5],
        multiNames,
        multiClassesCSS
    );

    // podíly neabsolvovaných vs. známých tras

    // speciální arrays pro použití jako argumentů ve function calls níže
    var knownNames = ["neabsolvované", "známé"];
    var knownColors = ["#005688", "#19685c"];
    var knownClassesCSS = ["neabsolvovane", "zname"];
    // cyklo
    tvorbaKolacWrapperu(cykloPage, "cykloKolacKnown");
    podsekceKolacNadpis("cykloKolacKnown", "Podíl neabsolvovaných vs. známých cyklotras");
    tvorbaKolacGraf(
        "cykloKolacKnown",
        [neabsolvovaneCykloPodil, znameCykloPodil],
        knownColors
    );
    tvorbaKolacVysvetlivky(
        "cykloKolacKnown",
        [neabsolvovaneCykloPodil, znameCykloPodil],
        knownNames,
        knownClassesCSS
    );
    // pěší
    tvorbaKolacWrapperu(pesiPage, "pesiKolacKnown");
    podsekceKolacNadpis("pesiKolacKnown", "Podíl neabsolvovaných vs. známých pěších tras");
    tvorbaKolacGraf(
        "pesiKolacKnown",
        [neabsolvovanePesiPodil, znamePesiPodil],
        knownColors
    );
    tvorbaKolacVysvetlivky(
        "pesiKolacKnown",
        [neabsolvovanePesiPodil, znamePesiPodil],
        knownNames,
        knownClassesCSS
    );

    // podíly tras podle spoluautorství

    // speciální arrays pro použití jako argumentů ve function calls níže
    var autorstviNames = ["autor K", "autor V", "autor D"];
    var autorstviColors = ["#ea284e", "#37B978", "#EA7649"];
    var autorstviClassesCSS = ["autorstviK", "autorstviV", "autorstviD"];
    // cyklo
    tvorbaKolacWrapperu(cykloPage, "cykloKolacAutorstvi");
    podsekceKolacNadpis("cykloKolacAutorstvi", "Relativní podíl spoluautorství na cyklotrasách");
    tvorbaKolacGraf(
        "cykloKolacAutorstvi",
        [cykloAutorK, cykloAutorV, cykloAutorD],
        autorstviColors
    );
    tvorbaKolacVysvetlivky(
        "cykloKolacAutorstvi",
        [cykloAutorK, cykloAutorV, cykloAutorD],
        autorstviNames,
        autorstviClassesCSS
    );
    // pěší
    tvorbaKolacWrapperu(pesiPage, "pesiKolacAutorstvi");
    podsekceKolacNadpis("pesiKolacAutorstvi", "Relativní podíl spoluautorství na pěších trasách");
    tvorbaKolacGraf(
        "pesiKolacAutorstvi",
        [pesiAutorK, pesiAutorV, pesiAutorD],
        autorstviColors
    );
    tvorbaKolacVysvetlivky(
        "pesiKolacAutorstvi",
        [pesiAutorK, pesiAutorV, pesiAutorD],
        autorstviNames,
        autorstviClassesCSS
    );


    // naplnění wrapperDivů samotnými přepínacími tlačítky
    // cyklo
    for (const kolacKategorie of cykloKolace) {
        let btn = document.createElement("div");
        btn.setAttribute("id", kolacKategorie.id + 'Btn');
        btn.setAttribute("onclick", `prepnoutCykloKolac("${kolacKategorie.id}")`);
        let stub = kolacKategorie.id.slice(5);
        btn.innerHTML = `<img src="img/tabs-${stub}.svg" alt="${stub}">`;
        cykloKolaceButtons.appendChild(btn);
    }
    // pěší
    for (const kolacKategorie of pesiKolace) {
        let btn = document.createElement("div");
        btn.setAttribute("id", kolacKategorie.id + 'Btn');
        btn.setAttribute("onclick", `prepnoutPesiKolac("${kolacKategorie.id}")`);
        let stub = kolacKategorie.id.slice(4);
        btn.innerHTML = `<img src="img/tabs-${stub}.svg" alt="${stub}">`;
        pesiKolaceButtons.appendChild(btn);
    }

    // odkrýt první kategorie grafů (jak pro cyklo tak pěší)
    cykloKolace[0].style.display = "block";
    pesiKolace[0].style.display = "block";
    // plus vyznačit příslušná přepínací tlačítka jako aktivní
    var initBtnCykloKolac = document.getElementById("cykloKolacDelkyBtn");
    initBtnCykloKolac.classList.add("kolacActive");
    var initBtnPesiKolac = document.getElementById("pesiKolacDelkyBtn");
    initBtnPesiKolac.classList.add("kolacActive");


    /* -------------------------------------------------------- */
    /* SUB sloupcový graf pro počty tras podle regionů */


    // funkce na dynamické vytváření wrapper divu a přidělení příslušného ID
    function tvorbaGrafWrapperu(podstranka, id) {
        let grafWrapper = document.createElement("div");
        grafWrapper.setAttribute("id", `${id}`);
        grafWrapper.style.display = "none";
        // updatovat globální array o zde nově definovaný HTML objekt
        id.startsWith("cyklo") ? cykloGrafy.push(grafWrapper) : pesiGrafy.push(grafWrapper);
        podstranka.appendChild(grafWrapper);
    }

    // funkce pro vytvoření nadpisů jednotlivých pod-sekcí
    function podsekceGrafNadpis(wrapperDiv, text) {
        // lokalizovat wrapperDiv pro následné umístění obsahu
        var umisteni = document.getElementById(wrapperDiv);
        var pododdil = document.createElement("h4");
        pododdil.innerHTML = text;
        umisteni.appendChild(pododdil);
    }

    // funkce pro dynamické vytváření sloupcového grafu
    // s velikostí sloupců odpovídající počtu tras v daném regionu
    function tvorbaRegionsGraf(wrapperDiv, typTras) {
        // lokalizovat wrapperDiv pro následné umístění obsahu
        var umisteni = document.getElementById(wrapperDiv);
        // vytvořit container div obalující celý graf
        var pageRegionsGraf = createDiv("pageRegionsGraf");
        umisteni.appendChild(pageRegionsGraf);

        for (i = 0; i < typTras.length; i++) {
            // speciální variable pro určení velikosti sloupce v grafu pro každý region zvlášť
            var grafBarSizeValue = Math.round(typTras[i].value / typTras[0].value * 100);
            var grafBarSizeString = `${grafBarSizeValue}%`
            
            // potom jeden div pro každý řádek (jeden řádek pro každý region)
            var pageRegionsRow = createDiv("pageRegionsRow");
            pageRegionsGraf.appendChild(pageRegionsRow);
            // a do řádku jednotlivé sub-divy (pro název regionu, počet tras v regionu a div znázorňující ten sloupec grafu)
            var pageRegionsText = createDiv("pageRegionsText");
            if (i < 3) {
                var rank = rankingStar.replace("rank", ranks[i]);
                pageRegionsText.innerHTML = `${rank}${i + 1}. ${typTras[i].name}`;
            } else {
                pageRegionsText.innerHTML = `${i + 1}. ${typTras[i].name}`;
            }
            pageRegionsRow.appendChild(pageRegionsText);
            var pageRegionsNo = createDiv("pageRegionsNo");
            pageRegionsNo.innerHTML = typTras[i].value;
            pageRegionsRow.appendChild(pageRegionsNo);
            var pageRegionsBarWrap = createDiv("pageRegionsBarWrap");
            pageRegionsRow.appendChild(pageRegionsBarWrap);
            var pageRegionsBar = createDiv("pageRegionsBar");
            pageRegionsBar.style.width = grafBarSizeString;
            pageRegionsBarWrap.appendChild(pageRegionsBar);
        }

    }

    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Statistika cyklotras podle regionů";
    cykloPage.appendChild(nadpis);

    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Statistika pěších tras podle regionů";
    pesiPage.appendChild(nadpis);

    // vytvoření wrapperDivů pro přepínací tlačítka
    var cykloGrafyButtons = document.createElement("div");
    cykloGrafyButtons.setAttribute("id", "cykloGrafyButtons");
    cykloPage.appendChild(cykloGrafyButtons);

    var pesiGrafyButtons = document.createElement("div");
    pesiGrafyButtons.setAttribute("id", "pesiGrafyButtons");
    pesiPage.appendChild(pesiGrafyButtons);

    // spuštění funkce na generování grafu
    // vždy pro cyklo a pro pěší
    // počet tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafTrasy");
    podsekceGrafNadpis("cykloGrafTrasy", "Počet cyklotras v jednotlivých regionech");
    tvorbaRegionsGraf("cykloGrafTrasy", poctyCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafTrasy");
    podsekceGrafNadpis("pesiGrafTrasy", "Počet pěších tras v jednotlivých regionech");
    tvorbaRegionsGraf("pesiGrafTrasy", poctyPesiRegiony);
    // počet již známých tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafKnown");
    podsekceGrafNadpis("cykloGrafKnown", "Počet již známých cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafKnown", poctyKnownCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafKnown");
    podsekceGrafNadpis("pesiGrafKnown", "Počet již známých pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafKnown", poctyKnownPesiRegiony);
    // počet dosud neabsolvovaných tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafUnknown");
    podsekceGrafNadpis("cykloGrafUnknown", "Počet dosud neabsolvovaných cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafUnknown", poctyUnknownCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafUnknown");
    podsekceGrafNadpis("pesiGrafUnknown", "Počet dosud neabsolvovaných pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafUnknown", poctyUnknownPesiRegiony);
    // počet km tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafKm");
    podsekceGrafNadpis("cykloGrafKm", "Počet kilometrů cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafKm", poctyKmCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafKm");
    podsekceGrafNadpis("pesiGrafKm", "Počet kilometrů pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafKm", poctyKmPesiRegiony);
    // počet dní tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafDny");
    podsekceGrafNadpis("cykloGrafDny", "Počet dní cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafDny", poctyDniCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafDny");
    podsekceGrafNadpis("pesiGrafDny", "Počet dní pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafDny", poctyDniPesiRegiony);

    // naplnění wrapperDivů samotnými přepínacími tlačítky
    // cyklo
    for (const grafKategorie of cykloGrafy) {
        let btn = document.createElement("div");
        btn.setAttribute("id", grafKategorie.id + 'Btn');
        btn.setAttribute("onclick", `prepnoutCykloGraf("${grafKategorie.id}")`);
        let stub = grafKategorie.id.slice(5);
        btn.innerHTML = `<img src="img/tabs-${stub}.svg" alt="${stub}">`;
        cykloGrafyButtons.appendChild(btn);
    }
    // pěší
    for (const grafKategorie of pesiGrafy) {
        let btn = document.createElement("div");
        btn.setAttribute("id", grafKategorie.id + 'Btn');
        btn.setAttribute("onclick", `prepnoutPesiGraf("${grafKategorie.id}")`);
        let stub = grafKategorie.id.slice(4);
        btn.innerHTML = `<img src="img/tabs-${stub}.svg" alt="${stub}">`;
        pesiGrafyButtons.appendChild(btn);
    }

    // odkrýt první kategorie grafů (jak pro cyklo tak pěší)
    cykloGrafy[0].style.display = "block";
    pesiGrafy[0].style.display = "block";
    // plus vyznačit příslušná přepínací tlačítka jako aktivní
    var initBtnCyklo = document.getElementById("cykloGrafTrasyBtn");
    initBtnCyklo.classList.add("grafActive");
    var initBtnPesi = document.getElementById("pesiGrafTrasyBtn");
    initBtnPesi.classList.add("grafActive");


    // po kompletním načtení obsahu stránky skrýt "loading" text
    loading.style.display = "none";
    // a zobrazit sekci "celkový souhrn"
    souhrnPage.style.display = "block";
    // a nastylovat tlačítko pro souhrn
    tlacitkoStatsSouhrn.classList.add("tlacitkoAktivni");

}

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER finální přepínání viditelnosti html elementů pomocí tlačítek */
/* ================================================================================================================================== */


// funkce přepínající jednotlivé kategorie koláčových grafů na stránkách s cyklo a pěšími statistikami
// cyklo
function prepnoutCykloKolac(x) {
    // identifikace tlačítka
    let button = document.getElementById(`${x}Btn`);
    for (const kolacKategorie of cykloKolace) {
        let deselectBtn = document.getElementById(`${kolacKategorie.id}Btn`);
        deselectBtn.classList.remove("kolacActive");
        kolacKategorie.style.display = "none";
        if (x == kolacKategorie.id) {
            kolacKategorie.style.display = "block";
            button.classList.add("kolacActive");
        }
    }
}
// pěší
function prepnoutPesiKolac(x) {
    // identifikace tlačítka
    let button = document.getElementById(`${x}Btn`);
    for (const kolacKategorie of pesiKolace) {
        let deselectBtn = document.getElementById(`${kolacKategorie.id}Btn`);
        deselectBtn.classList.remove("kolacActive");
        kolacKategorie.style.display = "none";
        if (x == kolacKategorie.id) {
            kolacKategorie.style.display = "block";
            button.classList.add("kolacActive");
        }
    }
}

// funkce přepínající jednotlivé kategorie grafů na stránkách s cyklo a pěšími statistikami
// cyklo
function prepnoutCykloGraf(x) {
    // identifikace tlačítka
    let button = document.getElementById(`${x}Btn`);
    for (const grafKategorie of cykloGrafy) {
        let deselectBtn = document.getElementById(`${grafKategorie.id}Btn`);
        deselectBtn.classList.remove("grafActive");
        grafKategorie.style.display = "none";
        if (x == grafKategorie.id) {
            grafKategorie.style.display = "block";
            button.classList.add("grafActive");
        }
    }
}
// pěší
function prepnoutPesiGraf(x) {
    // identifikace tlačítka
    let button = document.getElementById(`${x}Btn`);
    for (const grafKategorie of pesiGrafy) {
        let deselectBtn = document.getElementById(`${grafKategorie.id}Btn`);
        deselectBtn.classList.remove("grafActive");
        grafKategorie.style.display = "none";
        if (x == grafKategorie.id) {
            grafKategorie.style.display = "block";
            button.classList.add("grafActive");
        }
    }
}

// funkce zajišťující zobrazování/skrývání odpovídajících částí stránky po kliknutí na přepínací tlačítka
// tato funkce se pouští právě klikáním na tlačítka na html stránce
function prepnutiStats(x) {
    // pro detekci stisknutí odpovídajícího tlačítka je praktičtější použít switch statement než 3x if
    switch (x) {
        case "tlacitkoStatsSouhrn":
            // skrytí a zobrazení prvků stránky
            cykloPage.style.display = "none";
            pesiPage.style.display = "none";
            souhrnPage.style.display = "block";
            // přestylování samotných tlačítek
            tlacitkoStatsCyklo.classList.remove("tlacitkoAktivni");
            tlacitkoStatsPesi.classList.remove("tlacitkoAktivni");
            tlacitkoStatsSouhrn.classList.add("tlacitkoAktivni");
            break;
        case "tlacitkoStatsCyklo":
            // skrytí a zobrazení prvků stránky
            souhrnPage.style.display = "none";
            pesiPage.style.display = "none";
            cykloPage.style.display = "block";
            // přestylování samotných tlačítek
            tlacitkoStatsSouhrn.classList.remove("tlacitkoAktivni");
            tlacitkoStatsPesi.classList.remove("tlacitkoAktivni");
            tlacitkoStatsCyklo.classList.add("tlacitkoAktivni");
            break;
        case "tlacitkoStatsPesi":
            // skrytí a zobrazení prvků stránky
            souhrnPage.style.display = "none";
            cykloPage.style.display = "none";
            pesiPage.style.display = "block";
            // přestylování samotných tlačítek
            tlacitkoStatsSouhrn.classList.remove("tlacitkoAktivni");
            tlacitkoStatsCyklo.classList.remove("tlacitkoAktivni");
            tlacitkoStatsPesi.classList.add("tlacitkoAktivni");
            break;
    }
}

// !CHAPTER
