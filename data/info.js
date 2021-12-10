// DESC Skripty pro stránku informace.html

/* ================================================================================================================================== */
// CHAPTER základní variables
/* ================================================================================================================================== */


// hlavní obsahový div na stránce
var stranka = document.getElementById("obsahStrankyClassic");
// odstavec pro vkládání textu Murphyho zákonů
var murphyLawQuote = document.getElementById("murphyLawQuote");
// wrapper div pro changelog text
var changelogWrapper = document.getElementById("changelogWrapper");
// wrapper div pro tipy a triky
var tipsWrapper = document.getElementById("tipsWrapper");
// global array objekt, kde budou uloženy key-value pairs pro potřebné zpárování tlačítek a obsahu jednotlivých tipů a triků
var tipsPairs = [];

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER sekce načítání changelogu updatů */
/* ================================================================================================================================== */


// načtení jsonu pro changelog
const changelog = async () => {
    var fileRaw = await fetch("data/content/changelog.json");
    if (fileRaw.status !== 200) { throw new Error("chyba při načítání dat"); }
    var fileJson = await fileRaw.json();
    return fileJson;
}

// naplnění changelog divu daty z jsonu
function naplnitChangelog(updates) {
    for (i = 0; i < updates.length; i++) {
        var updateContainer = document.createElement("div");
        updateContainer.classList.add("changelogContainer");
        updateContainer.classList.add("invisible");
        var updateNo = document.createElement("div");
        updateNo.classList.add("changelogVerze");
        updateNo.innerHTML = updates[i].verze;
        updateContainer.appendChild(updateNo);
        var updateDatum = document.createElement("div");
        updateDatum.classList.add("changelogDatum");
        updateDatum.innerHTML = updates[i].datum;
        updateContainer.appendChild(updateDatum);
        var updateSummary = document.createElement("div");
        updateSummary.classList.add("changelogSummary");
        updateSummary.innerHTML = updates[i].summary;
        updateContainer.appendChild(updateSummary);
        var updateText = document.createElement("div");
        updateText.classList.add("changelogText");
        var updateList = document.createElement("ul");
        var updateItems = updates[i].detaily;

        updateItems.forEach((item) => {
            var updateItem = document.createElement("li");
            updateItem.innerHTML = item;
            updateList.appendChild(updateItem);
        });

        updateText.appendChild(updateList);
        updateContainer.appendChild(updateText);
        changelogWrapper.appendChild(updateContainer);
    }

    var loading = document.getElementById("loadingChangelog");
    loading.remove();

    var newestUpdate = document.querySelector(".changelogContainer");
    newestUpdate.classList.remove("invisible");

    var olderUpdatesButton = document.createElement("div");
    olderUpdatesButton.id ="starsiUpdatyTlacitko";
    olderUpdatesButton.setAttribute("onclick", "zobrazitStarsiUpdaty(this)");
    olderUpdatesButton.innerHTML = "zobrazit dřívější updaty";
    changelogWrapper.appendChild(olderUpdatesButton);
}

// funkce zajišťující odkrytí starších updatů (defaultně je totiž zobrazený jen ten poslední nejnovější update)
function zobrazitStarsiUpdaty(tlacitko) {
    var starsiUpdaty = document.querySelectorAll(".changelogContainer.invisible");

    starsiUpdaty.forEach((item) => {
        item.classList.remove("invisible");
    });

    // var tlacitko = document.getElementById("starsiUpdatyTlacitko");
    tlacitko.remove();
}

// spustit načtení json souboru pro changelog
// a potom naplnění divu na stránce těmito načtenými daty
changelog()
    .then((fileJson) => { naplnitChangelog(fileJson); })
    .catch((err) => { console.log(err); changelogWrapper.innerHTML = "chyba při načítání dat"; });

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER sekce tipy a triky */
/* ================================================================================================================================== */


// načtení json array s tipy a triky
const howTo = async () => {
    var fileRaw = await fetch("data/content/howto.json");
    if (fileRaw.status !== 200) { throw new Error("chyba při načítání dat"); }
    var fileJson = await fileRaw.json();
    return fileJson;
}

// funkce pro naplnění obsahu divu pro tipy a triky
function naplnitHowTo(tipy) {
    // for loop projde každý jednotlivý Object uvnitř master Array v jsonu
    for (i = 0; i < tipy.length; i++) {
        // název (Key) každé individuální kategorie (Object)
        var temaNazev = Object.keys(tipy[i])[0];
        // obsah (Array) v rámci každé kategorie
        var temaArr = Object.values(tipy[i])[0];

        // vytvořit container div pro každou kategorii/téma tipů a triků
        var container = document.createElement("div");
        container.id = `tips${temaNazev}`;
        container.style.display = "none";
        tipsWrapper.appendChild(container);
        // prázdný odrážkový seznam (jeden pro každou kategorii), do kterého pak přijdou jednotlivé položky obsahu
        var ul = document.createElement("ul");

        // for loop pro naplnění seznamu jednotlivými odrážkami z Array v kategorii v json souboru
        for (x = 0; x < temaArr.length; x++) {
            var li = document.createElement("li");
            li.innerHTML = temaArr[x];
            ul.appendChild(li);
        }

        // vložit seznam do container divu
        container.appendChild(ul);
        // vložit container div do wrapper divu
        tipsWrapper.appendChild(container);

        // updatovat global Array-Object obsahující key-value pairs pro následné fungování skriptů pro přepínání viditelnosti divů s obsahem
        // jako Key hodnota v Objektu se nastaví id value html tagu tlačítka
        // jako Value hodnota v Objektu se nastaví id value html tagu divu s obsahem
        var obj = {};
        obj[`tipsTab${temaNazev}`] = `tips${temaNazev}`;
        tipsPairs.push(obj);
    }

    // po naplnění všech container divů obsahem z jsonu už lze skrýt loading zprávu
    var loading = document.getElementById("loadingTips");
    loading.remove();

    // po kompletním načtení dat je ještě nutné spustit poprvé funkci přepnutí záložek
    // což zajistí zobrazení obsahu divu pod první záložkou tipsTabCyklotreky
    // následně se tato přepínací funkce bude spouštět už jen na kliknutí na záložky
    tipsPrepnuti("tipsTabCyklotreky");
}

// spustit načtení json souboru s tipy a triky
// a potom naplnění divu na stránce těmito načtenými daty
howTo()
    .then((fileJson) => { test = fileJson; naplnitHowTo(fileJson); })
    .catch((err) => { console.log(err); tipsWrapper.innerHTML = "chyba při načítání dat"; });


// funkce pro dynamicky generované přepínání viditelnosti jednotlivých záložek/kategorií s tipy a triky
// kde argument x je převzaté id z div tagu záložky/tlačítka na html stránce
function tipsPrepnuti(x) {
    // for loop prohledá global array object, aby zjistil, kde přesně je match
    for (i = 0; i < tipsPairs.length; i++) {
        // sleduje se match hodnoty x (tj. id přeneseného html tagu tlačítka) s Key hodnotou objektu
        // pokud se neshodují, tak se element skryje přes inline style.display = none v html tagu
        // pokud už tato hodnota v html tagu je, tak jen zůstane takto
        if (x !== Object.keys(tipsPairs[i])[0]) {
            var button = document.getElementById(Object.keys(tipsPairs[i])[0]);
            var hide = document.getElementById(Object.values(tipsPairs[i])[0]);
            hide.style.display = "none";
            button.classList.remove("tabActive");
        } else {
            // v opačném případě (pokud se hodnoty shodují), tak se příslušný obsahový div naopak zobrazí
            // díky tomu se vždy zobrazí ten obsahový div, jehož id má match na id tlačítka v rámci global array/objektu
            var button = document.getElementById(Object.keys(tipsPairs[i])[0]);
            var show = document.getElementById(Object.values(tipsPairs[i])[0]);
            show.style.display = "block";
            button.classList.add("tabActive");
        }
    }
}

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER sekce Murphyho zákony */
/* ================================================================================================================================== */


// načtení json array s Murphyho zákony
const murphy = async () => {
    var fileRaw = await fetch("data/content/murphy.json");
    if (fileRaw.status !== 200) { throw new Error("Co se může pokazit, to se pokazí."); }
    var fileJson = await fileRaw.json();
    return fileJson;
}

// funkce pro vyparsování Murphyho zákonů z json array a zobrazení náhodně generovaného citátu v definovaném odstavci na stránce
function zobrazitMurphyLaw(laws) {
    // vygenerování náhodného čísla od 0 do pinupPool.length-1
    // to vybere číslo pro index v rámci výše definovaného array
    var random = Math.floor(Math.random() * laws.length);

    // a nakonec se na základě takto náhodně vygenerovaného čísla vybere jeden z citátů v array
    // a vloží se jako textový obsah do definovaného odstavce
    murphyLawQuote.innerText = laws[random];
}

// spustit načtení json souboru s Murphyho zákony
// a potom naplnění odstavce na stránce těmito načtenými daty
murphy()
    .then((fileJson) => { zobrazitMurphyLaw(fileJson); })
    .catch((err) => { console.log(err); murphyLawQuote.innerText = "Co se může pokazit, to se pokazí."; });

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER tlačítko pro zobrazení textového bloku informací k Cyklotrekům */
/* ================================================================================================================================== */


// funkce zajišťující odkrytí textového bloku informací k Cyklotrekům
function zobrazitInfo(btn) {
    // najít textový blok
    var info = document.querySelector(".popisContainer.invisible");
    // odkrýt jej
    info.classList.remove("invisible");
    // a odstranit ze stránky tlačítko
    btn.remove();
}

// !CHAPTER
