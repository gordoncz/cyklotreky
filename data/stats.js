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
// speciální arrays s HTML objekty pro přepínání záložek s grafy
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

    // výpočet počtu dosud neabsolvovaných tras (s vloženým parametrem do funkce podle typu tras)
    function neabsolvovaneTrasy(typ) {
        let x = 0;
        for (i = 0; i < typ.length; i++) {
            if (typ[i].known == false) {
                x++;
            }
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var neabsolvovaneCyklo = neabsolvovaneTrasy(cyklotrasy);
    var neabsolvovanePesi = neabsolvovaneTrasy(pesitrasy);
    var neabsolvovaneCelkem = neabsolvovaneCyklo + neabsolvovanePesi;

    // výpočet počtu již známých tras (s vloženým parametrem do funkce podle typu tras)
    function znameTrasy(typ) {
        let x = 0;
        for (i = 0; i < typ.length; i++) {
            if (typ[i].known == true) {
                x++;
            }
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var znameCyklo = znameTrasy(cyklotrasy);
    var znamePesi = znameTrasy(pesitrasy);
    var znameCelkem = znameCyklo + znamePesi;

    // obdobný výpočet pro nově přidané trasy
    function noveTrasy(typ) {
        let x = 0;
        for (i = 0; i < typ.length; i++) {
            if (typ[i].new) {
                x++;
            }
        }
        return x;
    }

    // zde se do variables převedou výsledky výpočtu z funkce výše již právě podle typu tras
    var noveCyklo = noveTrasy(cyklotrasy);
    var novePesi = noveTrasy(pesitrasy);
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


    // funkce sloužící pro Array.filter() "method" níže
    // (k tomu, aby se podle zadaných parametrů ve funkci vytvořil NOVÝ array jen s těmi objekty z původní array, které zadanou podmínku splňují)
    function pouzeJednodenni(arr) {
        // vybrat jen objekty z array, které nejsou vícedenní
        return arr.multiday === false;
    }

    function pouzeVicedenni(arr) {
        // vybrat jen objekty z array, které jsou vícedenní
        return arr.multiday === true;
    }

    // variables, ze kterých budou NOVÉ array(s) pro nejkratší a nejdelší trasy
    // (tento nový array bude vždy složený jen z jednodenních/vícedenních tras)
    var jednodenniCyklo = cyklotrasy.filter(pouzeJednodenni);
    var vicedenniCyklo = cyklotrasy.filter(pouzeVicedenni);
    var jednodenniPesi = pesitrasy.filter(pouzeJednodenni);
    var vicedenniPesi = pesitrasy.filter(pouzeVicedenni);

    // zde z array(s) výše vyjmeme vždy 3 objekty podle kritéria, které zrovna hodnotíme
    // POZOR: POČÍTÁ SE S TÍM, ŽE JIŽ PŮVODNÍ ARRAY(S) JSOU OBĚ IMPLICITNĚ SPRÁVNĚ SEŘAZENÉ PODLE POČTU KM!!!
    // (pokud ne, nebudou kódy zde fungovat správně)
    // nej- cyklotrasy (název a km)
    var nejkratsiJednoCyklo = [
        {"value": jednodenniCyklo[0].km, "name": jednodenniCyklo[0].nazev},
        {"value": jednodenniCyklo[1].km, "name": jednodenniCyklo[1].nazev},
        {"value": jednodenniCyklo[2].km, "name": jednodenniCyklo[2].nazev}
    ]
    var nejdelsiJednoCyklo = [
        {"value": jednodenniCyklo[jednodenniCyklo.length - 1].km, "name": jednodenniCyklo[jednodenniCyklo.length - 1].nazev},
        {"value": jednodenniCyklo[jednodenniCyklo.length - 2].km, "name": jednodenniCyklo[jednodenniCyklo.length - 2].nazev},
        {"value": jednodenniCyklo[jednodenniCyklo.length - 3].km, "name": jednodenniCyklo[jednodenniCyklo.length - 3].nazev}
    ];
    var nejkratsiViceCyklo = [
        {"value": vicedenniCyklo[0].km, "name": vicedenniCyklo[0].nazev},
        {"value": vicedenniCyklo[1].km, "name": vicedenniCyklo[1].nazev},
        {"value": vicedenniCyklo[2].km, "name": vicedenniCyklo[2].nazev}
    ];
    var nejdelsiViceCyklo = [
        {"value": vicedenniCyklo[vicedenniCyklo.length - 1].km, "name": vicedenniCyklo[vicedenniCyklo.length - 1].nazev},
        {"value": vicedenniCyklo[vicedenniCyklo.length - 2].km, "name": vicedenniCyklo[vicedenniCyklo.length - 2].nazev},
        {"value": vicedenniCyklo[vicedenniCyklo.length - 3].km, "name": vicedenniCyklo[vicedenniCyklo.length - 3].nazev}
    ];
    // nej- pěší trasy (název a km)
    var nejkratsiJednoPesi = [
        {"value": jednodenniPesi[0].km, "name": jednodenniPesi[0].nazev},
        {"value": jednodenniPesi[1].km, "name": jednodenniPesi[1].nazev},
        {"value": jednodenniPesi[2].km, "name": jednodenniPesi[2].nazev}
    ];
    var nejdelsiJednoPesi = [
        {"value": jednodenniPesi[jednodenniPesi.length - 1].km, "name": jednodenniPesi[jednodenniPesi.length - 1].nazev},
        {"value": jednodenniPesi[jednodenniPesi.length - 2].km, "name": jednodenniPesi[jednodenniPesi.length - 2].nazev},
        {"value": jednodenniPesi[jednodenniPesi.length - 3].km, "name": jednodenniPesi[jednodenniPesi.length - 3].nazev}
    ];
    var nejkratsiVicePesi = [
        {"value": vicedenniPesi[0].km, "name": vicedenniPesi[0].nazev},
        {"value": vicedenniPesi[1].km, "name": vicedenniPesi[1].nazev},
        {"value": vicedenniPesi[2].km, "name": vicedenniPesi[2].nazev}
    ];
    var nejdelsiVicePesi = [
        {"value": vicedenniPesi[vicedenniPesi.length - 1].km, "name": vicedenniPesi[vicedenniPesi.length - 1].nazev},
        {"value": vicedenniPesi[vicedenniPesi.length - 2].km, "name": vicedenniPesi[vicedenniPesi.length - 2].nazev},
        {"value": vicedenniPesi[vicedenniPesi.length - 3].km, "name": vicedenniPesi[vicedenniPesi.length - 3].nazev}
    ];


    /* -------------------------------------------------------- */
    /* SUB počty tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyCykloRegiony = new Array;
    var poctyPesiRegiony = new Array;

    // funkce pro výpočet počtu cyklotras v každém regionu
    function vypocetCykloRegiony(region) {
        let x = 0;
        for (i = 0; i < cyklotrasy.length; i++) {
            if (cyklotrasy[i].region == region) {
                x++;
            }
        }
        return x;
    }
    // to samé pro pěší trasy
    function vypocetPesiRegiony(region) {
        let x = 0;
        for (i = 0; i < pesitrasy.length; i++) {
            if (pesitrasy[i].region == region) {
                x++;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyCykloRegiony.push({"value": vypocetCykloRegiony(regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyPesiRegiony.push({"value": vypocetPesiRegiony(regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů tras v regionech (od nejvíce po nejméně)
    poctyCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB počty dosud neabsolvovaných tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyUnknownCykloRegiony = new Array;
    var poctyUnknownPesiRegiony = new Array;

    // funkce pro výpočet počtu dosud neabsolvovaných cyklotras v každém regionu
    function vypocetUnknownCykloRegiony(region) {
        let x = 0;
        for (i = 0; i < cyklotrasy.length; i++) {
            if ((cyklotrasy[i].region == region) && (cyklotrasy[i].known == false)) {
                x++;
            }
        }
        return x;
    }
    // to samé pro pěší trasy
    function vypocetUnknownPesiRegiony(region) {
        let x = 0;
        for (i = 0; i < pesitrasy.length; i++) {
            if ((pesitrasy[i].region == region) && (pesitrasy[i].known == false)) {
                x++;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet dosud neabsolvovaných cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyUnknownCykloRegiony.push({"value": vypocetUnknownCykloRegiony(regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyUnknownPesiRegiony.push({"value": vypocetUnknownPesiRegiony(regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů dosud neabsolvovaných tras v regionech (od nejvíce po nejméně)
    poctyUnknownCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyUnknownPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB počty již známých tras v regionech */


    // vytvořit nový Array, který bude sloužit pro tabulku/graf s počtem tras pro jednotlivé regiony
    var poctyKnownCykloRegiony = new Array;
    var poctyKnownPesiRegiony = new Array;

    // funkce pro výpočet počtu již známých cyklotras v každém regionu
    function vypocetKnownCykloRegiony(region) {
        let x = 0;
        for (i = 0; i < cyklotrasy.length; i++) {
            if ((cyklotrasy[i].region == region) && (cyklotrasy[i].known == true)) {
                x++;
            }
        }
        return x;
    }
    // to samé pro pěší trasy
    function vypocetKnownPesiRegiony(region) {
        let x = 0;
        for (i = 0; i < pesitrasy.length; i++) {
            if ((pesitrasy[i].region == region) && (pesitrasy[i].known == true)) {
                x++;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet již známých cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyKnownCykloRegiony.push({"value": vypocetKnownCykloRegiony(regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyKnownPesiRegiony.push({"value": vypocetKnownPesiRegiony(regiony[e]), "name": regiony[e]});
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
    function vypocetKmCykloRegiony(region) {
        let x = 0;
        for (i = 0; i < cyklotrasy.length; i++) {
            if (cyklotrasy[i].region == region) {
                x = x + cyklotrasy[i].km;
            }
        }
        return x;
    }
    // to samé pro pěší trasy
    function vypocetKmPesiRegiony(region) {
        let x = 0;
        for (i = 0; i < pesitrasy.length; i++) {
            if (pesitrasy[i].region == region) {
                x = x + pesitrasy[i].km;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet km cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyKmCykloRegiony.push({"value": vypocetKmCykloRegiony(regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyKmPesiRegiony.push({"value": vypocetKmPesiRegiony(regiony[e]), "name": regiony[e]});
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
    function vypocetDniCykloRegiony(region) {
        let x = 0;
        for (i = 0; i < cyklotrasy.length; i++) {
            if (cyklotrasy[i].region == region) {
                x = x + cyklotrasy[i].kmpd.length;
            }
        }
        return x;
    }
    // to samé pro pěší trasy
    function vypocetDniPesiRegiony(region) {
        let x = 0;
        for (i = 0; i < pesitrasy.length; i++) {
            if (pesitrasy[i].region == region) {
                x = x + pesitrasy[i].kmpd.length;
            }
        }
        return x;
    }

    // for loop, který prochází array s regiony v samostatném souboru "hodnoty.js"
    // a pro každý region spočítá počet dní cyklotras z originálního array
    for (e = 0; e < regiony.length; e++) {
        poctyDniCykloRegiony.push({"value": vypocetDniCykloRegiony(regiony[e]), "name": regiony[e]});
    }
    // to samé pro pěší trasy
    for (e = 0; e < regiony.length; e++) {
        poctyDniPesiRegiony.push({"value": vypocetDniPesiRegiony(regiony[e]), "name": regiony[e]});
    }

    // seřadit tyto Array(s) podle počtů dní tras v regionech (od nejvíce po nejméně)
    poctyDniCykloRegiony.sort(function(a,b) {return b.value - a.value});
    poctyDniPesiRegiony.sort(function(a,b) {return b.value - a.value});


    /* -------------------------------------------------------- */
    /* SUB podíl tras podle jejich délky */


    // definování prázdných (s úvodní hodnotou 0) variables pro počty jednotlivých délek tras
    // jejich hodnoty pak naplní následující dva for loopy...
    var cykloShort = 0, cykloMedium = 0, cykloLong = 0, cykloLongest = 0, cykloMulti = 0;
    var pesiShort = 0, pesiMedium = 0, pesiLong = 0, pesiLongest = 0, pesiMulti = 0;

    // for loop pro incremental přidávání hodnot do jednotlivých variables podle délky cyklotras
    // výsledkem bude, že tyto variables tak budou mít taková čísla, kolik je tras v dané kategorii
    for (i = 0; i < cyklotrasy.length; i++) {
        if (cyklotrasy[i].multiday === true) {
            cykloMulti++;
        } else {
            if (cyklotrasy[i].km < 30) {cykloShort++;}
            if (cyklotrasy[i].km >= 30 && cyklotrasy[i].km < 40) {cykloMedium++;}
            if (cyklotrasy[i].km >= 40 && cyklotrasy[i].km < 50) {cykloLong++;}
            if (cyklotrasy[i].km >= 50) {cykloLongest++;}
        }
    }
    // to stejné pro pěší trasy
    for (i = 0; i < pesitrasy.length; i++) {
        if (pesitrasy[i].multiday === true) {
            pesiMulti++;
        } else {
            if (pesitrasy[i].km < 10) {pesiShort++;}
            if (pesitrasy[i].km >= 10 && pesitrasy[i].km < 15) {pesiMedium++;}
            if (pesitrasy[i].km >= 15 && pesitrasy[i].km < 20) {pesiLong++;}
            if (pesitrasy[i].km >= 20) {pesiLongest++;}
        }
    }

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


    // funkce pro vytvoření nadpisů jednotlivých pod-oddílů
    function pododdilNadpis(podstranka, text) {
        var pododdil = document.createElement("h4");
        pododdil.innerHTML = text;
        podstranka.appendChild(pododdil);
    }

    // funkce pro vytvoření jednotlivých položek se souhrnnými daty
    function tvorbaSouhrnItem(popis, hodnota) {
        var statsAmountsContainer = document.createElement("div");
        statsAmountsContainer.setAttribute("class", "statsAmountsContainer");
        var statsAmountsPopisek = document.createElement("div");
        statsAmountsPopisek.setAttribute("class", "statsAmountsPopisek");
        statsAmountsPopisek.innerHTML = popis;
        statsAmountsContainer.appendChild(statsAmountsPopisek);
        var statsAmountsVysledek = document.createElement("div");
        statsAmountsVysledek.setAttribute("class", "statsAmountsVysledek");
        statsAmountsVysledek.innerHTML = hodnota;
        statsAmountsContainer.appendChild(statsAmountsVysledek);
        statsAmountsWrapper.appendChild(statsAmountsContainer);
    }

    // function call, kterým dynamicky naplníme jednotlivé položky pro souhrnná data
    // každý function call pustí do funkce jiná vstupní data (parameters)
    // a to zajistí tvorbu více položek, každou s jinou statistikou
    // POZN: pořadí function calls po sobě zde potom vytváří stejné pořadí html elementů na stránce
    pododdilNadpis(souhrnPage, "Počet tras v databázi");
    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    tvorbaSouhrnItem("cyklo", pocetCyklo);
    tvorbaSouhrnItem("pěší", pocetPesich);
    tvorbaSouhrnItem("celkem", pocetCelkem);
    // zde se vždy zabalí celá jedna sekce do speciálního wrapperu
    // který pak umožní flex zobrazení
    souhrnPage.appendChild(statsAmountsWrapper);

    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    pododdilNadpis(souhrnPage, "Dosud neabsolvované trasy k dispozici");
    tvorbaSouhrnItem("cyklo", neabsolvovaneCyklo);
    tvorbaSouhrnItem("pěší", neabsolvovanePesi);
    tvorbaSouhrnItem("celkem", neabsolvovaneCelkem);
    souhrnPage.appendChild(statsAmountsWrapper);

    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    pododdilNadpis(souhrnPage, "Již známé trasy");
    tvorbaSouhrnItem("cyklo", znameCyklo);
    tvorbaSouhrnItem("pěší", znamePesi);
    tvorbaSouhrnItem("celkem", znameCelkem);
    souhrnPage.appendChild(statsAmountsWrapper);

    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    pododdilNadpis(souhrnPage, "Nově přidané trasy");
    tvorbaSouhrnItem("cyklo", noveCyklo);
    tvorbaSouhrnItem("pěší", novePesi);
    tvorbaSouhrnItem("celkem", noveCelkem);
    souhrnPage.appendChild(statsAmountsWrapper);

    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    pododdilNadpis(souhrnPage, "Počet kilometrů tras v databázi");
    tvorbaSouhrnItem("cyklo", celkemKmCyklo);
    tvorbaSouhrnItem("pěší", celkemKmPesi);
    tvorbaSouhrnItem("celkem", celkemKmCelkem);
    souhrnPage.appendChild(statsAmountsWrapper);

    var statsAmountsWrapper = document.createElement("div");
    statsAmountsWrapper.setAttribute("class", "statsAmountsWrapper");
    pododdilNadpis(souhrnPage, "Počet dní tras v databázi");
    tvorbaSouhrnItem("cyklo", celkemDniCyklo);
    tvorbaSouhrnItem("pěší", celkemDniPesi);
    tvorbaSouhrnItem("celkem", celkemDniCelkem);
    souhrnPage.appendChild(statsAmountsWrapper);

    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Rekordní trasy";
    souhrnPage.appendChild(nadpis);

    // druhá funkce pro vytvoření jednotlivých položek se souhrnnými daty
    // tentokrát zaměřená na nejkratší a nejdelší trasy
    function tvorbaSouhrnRecordsItem(popis, array, jednotky) {
        // vytvořit container Div s popiskem
        var statsRecordsContainer = document.createElement("div");
        statsRecordsContainer.setAttribute("class", "statsRecordsContainer");
        var statsRecordsPopisek = document.createElement("div");
        statsRecordsPopisek.setAttribute("class", "statsRecordsPopisek");
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
            var statsRecordsVysledek = document.createElement("div");
            statsRecordsVysledek.setAttribute("class", "statsRecordsVysledek");
            var rank = rankingStar.replace("rank", ranks[i]);
            statsRecordsVysledek.innerHTML = rank + array[i].name + " (" + array[i].value + " " + jednotky + ")";
            statsRecordsContainer.appendChild(statsRecordsVysledek);
            i++;
        }
        recordsWrapper.appendChild(statsRecordsContainer);
    }

    // a opět function call(s)
    // nejprve pro rekordní trasy...
    pododdilNadpis(souhrnPage, "Nejkratší jednodenní trasy");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", nejkratsiJednoCyklo, "km");
    tvorbaSouhrnRecordsItem("pěší", nejkratsiJednoPesi, "km");
    souhrnPage.appendChild(recordsWrapper);

    pododdilNadpis(souhrnPage, "Nejdelší jednodenní trasy");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", nejdelsiJednoCyklo, "km");
    tvorbaSouhrnRecordsItem("pěší", nejdelsiJednoPesi, "km");
    souhrnPage.appendChild(recordsWrapper);

    pododdilNadpis(souhrnPage, "Nejkratší vícedenní trasy");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", nejkratsiViceCyklo, "km");
    tvorbaSouhrnRecordsItem("pěší", nejkratsiVicePesi, "km");
    souhrnPage.appendChild(recordsWrapper);

    pododdilNadpis(souhrnPage, "Nejdelší vícedenní trasy");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", nejdelsiViceCyklo, "km");
    tvorbaSouhrnRecordsItem("pěší", nejdelsiVicePesi, "km");
    souhrnPage.appendChild(recordsWrapper);

    // další velký nadpis pro lepší vizuální oddělení sekce
    var nadpis = document.createElement("h2");
    nadpis.innerText = "Rekordní regiony";
    souhrnPage.appendChild(nadpis);

    // ...potom také pro rekordní regiony
    pododdilNadpis(souhrnPage, "Regiony s nejvíce trasami");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", poctyCykloRegiony, "tras");
    tvorbaSouhrnRecordsItem("pěší", poctyPesiRegiony, "tras");
    souhrnPage.appendChild(recordsWrapper);

    pododdilNadpis(souhrnPage, "Kde máme nejvíce ještě neabsolvovaných tras k dispozici");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", poctyUnknownCykloRegiony, "tras");
    tvorbaSouhrnRecordsItem("pěší", poctyUnknownPesiRegiony, "tras");
    souhrnPage.appendChild(recordsWrapper);

    pododdilNadpis(souhrnPage, "Kde máme nejvíce již známých tras");
    var recordsWrapper = document.createElement("div");
    recordsWrapper.setAttribute("class", "recordsWrapper");
    tvorbaSouhrnRecordsItem("cyklo", poctyKnownCykloRegiony, "tras");
    tvorbaSouhrnRecordsItem("pěší", poctyKnownPesiRegiony, "tras");
    souhrnPage.appendChild(recordsWrapper);


    /* -------------------------------------------------------- */
    /* SUB koláčový graf pro počty tras podle délky */


    // funkce na tvorbu koláčového grafu o jednotlivých segmentech pro každou kategorii délky tras
    function tvorbaKolacGraf(misto, S, M, L, XL, MD) {
        // wrapper div
        var kolacDiv = document.createElement("div");
        kolacDiv.setAttribute("class", "kolacWrapper");
        misto.appendChild(kolacDiv);
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

        // každá výseč musí začínat tam, kde končí ta před ní (proto ty součty v parametrech pro toRadians() funkce)
        // pokud by tam ty součty nebyly, počítalo by to výchozí pozici jen podle procent a ne jejich vzájemného vztahu
        // což by pak akorát způsobilo, že největší procenta by překryla ta menší a ne, že by na sebe navazovala, jak mají
        // první výseč koláčového grafu (pro krátké trasy)
        kolac.fillStyle = "#144a14"; /* short */
        kolac.beginPath();
        kolac.moveTo(cX, cY);
        // první výseč bude z 0% (přepočteno == -90°) do procentní hodnoty podílu krátkých tras (cykloShort) atd. atd.
        kolac.arc(cX, cY, kolacPolomer, toRadians(0), toRadians(S));
        kolac.lineTo(cX, cY);
        kolac.closePath();
        kolac.fill();
        // druhá výseč koláčového grafu (pro střední trasy)
        kolac.fillStyle = "#875807"; /* medium */
        kolac.beginPath();
        kolac.moveTo(cX, cY);
        kolac.arc(cX, cY, kolacPolomer, toRadians(S), toRadians(S + M));
        kolac.lineTo(cX, cY);
        kolac.closePath();
        kolac.fill();
        // třetí výseč koláčového grafu (pro dlouhé trasy)
        kolac.fillStyle = "#a23604"; /* long */
        kolac.beginPath();
        kolac.moveTo(cX, cY);
        kolac.arc(cX, cY, kolacPolomer, toRadians(S + M), toRadians(S + M + L));
        kolac.lineTo(cX, cY);
        kolac.closePath();
        kolac.fill();
        // čtvrtá výseč koláčového grafu (pro extra dlouhé trasy)
        kolac.fillStyle = "#710606"; /* longest */
        kolac.beginPath();
        kolac.moveTo(cX, cY);
        kolac.arc(cX, cY, kolacPolomer, toRadians(S + M + L), toRadians(S + M + L + XL));
        kolac.lineTo(cX, cY);
        kolac.closePath();
        kolac.fill();
        // pátá výseč koláčového grafu (pro vícedenní trasy)
        kolac.fillStyle = "#13264d"; /* multi */
        kolac.beginPath();
        kolac.moveTo(cX, cY);
        kolac.arc(cX, cY, kolacPolomer, toRadians(S + M + L + XL), toRadians(S + M + L + XL + MD));
        kolac.lineTo(cX, cY);
        kolac.closePath();
        kolac.fill();

        // pozn: další kružnice či jiný prvek v tom stejném <canvas> tagu lze renderovat opakováním stejných methods na stejné variable "kruznice", jen s jinými parametry
        // takže by to bylo znovu to stejné od kruznice.fillStyle až po kruznice.fill();
    }

    // function call na vygenerování koláčového grafu
    pododdilNadpis(cykloPage, "Podíl cyklotras podle jejich délky");
    tvorbaKolacGraf(cykloPage, cykloShort, cykloMedium, cykloLong, cykloLongest, cykloMulti);
    pododdilNadpis(pesiPage, "Podíl pěších tras podle jejich délky");
    tvorbaKolacGraf(pesiPage, pesiShort, pesiMedium, pesiLong, pesiLongest, pesiMulti);


    /* -------------------------------------------------------- */
    /* SUB vysvětlivky ke koláčovému grafu */


    // wrapper div pro celé vysvětlivky (první pro cyklotrasy)
    var kolacNotes = document.createElement("div");
    kolacNotes.setAttribute("class", "kolacVysvetlivky");
    cykloPage.appendChild(kolacNotes);

    // vytvoření divu pro vysvětlivky ke koláčovému grafu (aby někde byla zobrazena přesná procenta k těm různým délkám tras)
    // nejdříve pro cyklotrasy
    function tvorbaKolacVysvetlivkyCyklo(delka) {
        // container div pro každou vysvětlivku zvlášť
        var kolacNotesContainer = document.createElement("div");
        kolacNotesContainer.setAttribute("class", "kolacNotesContainer");
        kolacNotes.appendChild(kolacNotesContainer);
        // vysvětlivka - délková kategorie tras
        var kolacNotesKategorie = document.createElement("div");
        kolacNotesKategorie.setAttribute("class", "kolacNotesKategorie");
        kolacNotesContainer.appendChild(kolacNotesKategorie);
        // vysvětlivka - délková kategorie procentní podíl
        var kolacNotesProcenta = document.createElement("div");
        kolacNotesProcenta.setAttribute("class", "kolacNotesProcenta");
        kolacNotesContainer.appendChild(kolacNotesProcenta);

        // zaokrouhlení procentuálního podílu na celá čísla
        var delkaZaokrouhleno = Math.round(delka);

        // a naplnění výše vytvořených divů odpovídajícími daty
        if (delka == cykloShort) {
            kolacNotesKategorie.innerHTML = "krátké";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("short");
        }
        if (delka == cykloMedium) {
            kolacNotesKategorie.innerHTML = "střední";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("medium");
        }
        if (delka == cykloLong) {
            kolacNotesKategorie.innerHTML = "dlouhé";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("long");
        }
        if (delka == cykloLongest) {
            kolacNotesKategorie.innerHTML = "extra dlouhé";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("longest");
        }
        if (delka == cykloMulti) {
            kolacNotesKategorie.innerHTML = "vícedenní";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("multi");
        }

    }

    // function call pro každou délku tras zvlášť
    tvorbaKolacVysvetlivkyCyklo(cykloShort);
    tvorbaKolacVysvetlivkyCyklo(cykloMedium);
    tvorbaKolacVysvetlivkyCyklo(cykloLong);
    tvorbaKolacVysvetlivkyCyklo(cykloLongest);
    tvorbaKolacVysvetlivkyCyklo(cykloMulti);

    // wrapper div pro celé vysvětlivky (znovu pro pěší trasy)
    var kolacNotes = document.createElement("div");
    kolacNotes.setAttribute("class", "kolacVysvetlivky");
    pesiPage.appendChild(kolacNotes);

    // vytvoření divu pro vysvětlivky ke koláčovému grafu (aby někde byla zobrazena přesná procenta k těm různým délkám tras)
    // a následně i pro pěší trasy
    function tvorbaKolacVysvetlivkyPesi(delka) {
        // container div pro každou vysvětlivku zvlášť
        var kolacNotesContainer = document.createElement("div");
        kolacNotesContainer.setAttribute("class", "kolacNotesContainer");
        kolacNotes.appendChild(kolacNotesContainer);
        // vysvětlivka - délková kategorie tras
        var kolacNotesKategorie = document.createElement("div");
        kolacNotesKategorie.setAttribute("class", "kolacNotesKategorie");
        kolacNotesContainer.appendChild(kolacNotesKategorie);
        // vysvětlivka - délková kategorie procentní podíl
        var kolacNotesProcenta = document.createElement("div");
        kolacNotesProcenta.setAttribute("class", "kolacNotesProcenta");
        kolacNotesContainer.appendChild(kolacNotesProcenta);

        // zaokrouhlení procentuálního podílu na celá čísla
        var delkaZaokrouhleno = Math.round(delka);

        // a naplnění výše vytvořených divů odpovídajícími daty
        if (delka == pesiShort) {
            kolacNotesKategorie.innerHTML = "krátké";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("short");
        }
        if (delka == pesiMedium) {
            kolacNotesKategorie.innerHTML = "střední";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("medium");
        }
        if (delka == pesiLong) {
            kolacNotesKategorie.innerHTML = "dlouhé";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("long");
        }
        if (delka == pesiLongest) {
            kolacNotesKategorie.innerHTML = "extra dlouhé";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("longest");
        }
        if (delka == pesiMulti) {
            kolacNotesKategorie.innerHTML = "vícedenní";
            kolacNotesProcenta.innerHTML = `${delkaZaokrouhleno}%`;
            kolacNotesContainer.classList.add("multi");
        }

    }

    // function call pro každou délku tras zvlášť
    tvorbaKolacVysvetlivkyPesi(pesiShort);
    tvorbaKolacVysvetlivkyPesi(pesiMedium);
    tvorbaKolacVysvetlivkyPesi(pesiLong);
    tvorbaKolacVysvetlivkyPesi(pesiLongest);
    tvorbaKolacVysvetlivkyPesi(pesiMulti);


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
    function podsekceNadpis(wrapperDiv, text) {
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
        var pageRegionsGraf = document.createElement("div");
        pageRegionsGraf.setAttribute("class", "pageRegionsGraf");
        umisteni.appendChild(pageRegionsGraf);

        for (i = 0; i < typTras.length; i++) {
            // speciální variable pro určení velikosti sloupce v grafu pro každý region zvlášť
            var grafBarSizeValue = Math.round(typTras[i].value / typTras[0].value * 100);
            var grafBarSizeString = `${grafBarSizeValue}%`
            
            // potom jeden div pro každý řádek (jeden řádek pro každý region)
            var pageRegionsRow = document.createElement("div");
            pageRegionsRow.setAttribute("class", "pageRegionsRow");
            pageRegionsGraf.appendChild(pageRegionsRow);
            // a do řádku jednotlivé sub-divy (pro název regionu, počet tras v regionu a div znázorňující ten sloupec grafu)
            var pageRegionsText = document.createElement("div");
            pageRegionsText.setAttribute("class", "pageRegionsText");
            if (i < 3) {
                var rank = rankingStar.replace("rank", ranks[i]);
                pageRegionsText.innerHTML = `${rank}${i + 1}. ${typTras[i].name}`;
            } else {
                pageRegionsText.innerHTML = `${i + 1}. ${typTras[i].name}`;
            }
            pageRegionsRow.appendChild(pageRegionsText);
            var pageRegionsNo = document.createElement("div");
            pageRegionsNo.setAttribute("class", "pageRegionsNo");
            pageRegionsNo.innerHTML = typTras[i].value;
            pageRegionsRow.appendChild(pageRegionsNo);
            var pageRegionsBarWrap = document.createElement("div");
            pageRegionsBarWrap.setAttribute("class", "pageRegionsBarWrap");
            pageRegionsRow.appendChild(pageRegionsBarWrap);
            var pageRegionsBar = document.createElement("div");
            pageRegionsBar.setAttribute("class", "pageRegionsBar");
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
    // zvlášť pro cyklo a pro pěší
    // počet tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafTrasy");
    podsekceNadpis("cykloGrafTrasy", "Počet cyklotras v jednotlivých regionech");
    tvorbaRegionsGraf("cykloGrafTrasy", poctyCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafTrasy");
    podsekceNadpis("pesiGrafTrasy", "Počet pěších tras v jednotlivých regionech");
    tvorbaRegionsGraf("pesiGrafTrasy", poctyPesiRegiony);
    // počet dosud neabsolvovaných tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafUnknown");
    podsekceNadpis("cykloGrafUnknown", "Počet dosud neabsolvovaných cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafUnknown", poctyUnknownCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafUnknown");
    podsekceNadpis("pesiGrafUnknown", "Počet dosud neabsolvovaných pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafUnknown", poctyUnknownPesiRegiony);
    // počet již známých tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafKnown");
    podsekceNadpis("cykloGrafKnown", "Počet již známých cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafKnown", poctyKnownCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafKnown");
    podsekceNadpis("pesiGrafKnown", "Počet již známých pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafKnown", poctyKnownPesiRegiony);
    // počet km tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafKm");
    podsekceNadpis("cykloGrafKm", "Počet kilometrů cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafKm", poctyKmCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafKm");
    podsekceNadpis("pesiGrafKm", "Počet kilometrů pěších tras v regionech");
    tvorbaRegionsGraf("pesiGrafKm", poctyKmPesiRegiony);
    // počet dní tras
    tvorbaGrafWrapperu(cykloPage, "cykloGrafDny");
    podsekceNadpis("cykloGrafDny", "Počet dní cyklotras v regionech");
    tvorbaRegionsGraf("cykloGrafDny", poctyDniCykloRegiony);
    tvorbaGrafWrapperu(pesiPage, "pesiGrafDny");
    podsekceNadpis("pesiGrafDny", "Počet dní pěších tras v regionech");
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
