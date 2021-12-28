// DESC skript zodpovědný za načítání obsahu k jednotlivým reginům, na které se klikne v SVG mapě

/* ================================================================================================================================== */
/* CHAPTER základní variables */
/* ================================================================================================================================== */


var page = document.getElementById('obsahStrankyClassic');
// prázdná variable "dataRegionu", která se potom naplní JSON daty pro regiony
var dataRegionu;

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER asynchronní část pro načtení dat cyklo a pěších tras SOUČASNĚ */
/* ================================================================================================================================== */


// funkce pro načtení JSON pro regiony
var loadData = async () => {
    // načte asynchronně data z odpovídajícího JSON souboru podle typu tras, které dostane tato funkce jako argument
    let data = await fetch('data/content/regiony.json');
    // zachycení případného erroru při stahování json souboru
    if (data.status !== 200) { throw new Error("chyba při načítání dat"); }
    // parsování z Promise do JSON formatu
    let dataJSON = await data.json();
    // a výstup z funkce
    return dataJSON;
}

// zde se spustí horní async část (pro načtení JSONů) a jakmile doběhne, tak díky .then method se následně pustí zbytek kódu
loadData()
.then((data) => { dataRegionu = data; nacistRegion('reset-to-region-home'); })
// zachycení případného erroru při načítání JSON dat
.catch((err) => { console.log(err); page.innerHTML = "chyba při načítání dat"; });

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER funkce starající se o vyplnění HTML elementů daty pro regiony podle toho, na který region se přepne */
/* ================================================================================================================================== */


// naplnění obsahu stránky daty pro homepage regionů z JSON souboru
function naplnitHTMLHome() {
    // nadpis
    var nazev = document.createElement("h2");
    nazev.innerText = "Regiony";
    page.appendChild(nazev);

    // stručné info o klikatelné mapě
    var summary = document.createElement("p");
    summary.innerHTML = `Výběrem regionu v klikatelné mapě nahoře si zobrazíte podrobnosti o daném regionu`;
    page.appendChild(summary);

    // odkaz na rastrový obrázek s mapou (staré zobrazení)
    var info = document.createElement("p");
    info.innerHTML = `<span style="color: gray;">Hranice regionů v turistické mapě:</span><br><a href="img/mapa-regionu.jpg" target="_blank">Obrázek s mapou</a>`;
    page.appendChild(info);
}

// naplnění obsahu stránky daty pro region z JSON souboru
function naplnitHTMLRegionem(regionNazev) {
    for (let i = 0; i < dataRegionu.length; i++) {
        // skript se spustí jen pro vybraný region a vyplní do stránky příslušná json data v html formátu
        if (dataRegionu[i].nazev == regionNazev) {

            // nadpis
            var nazev = document.createElement("h2");
            nazev.innerText = dataRegionu[i].nazev;
            page.appendChild(nazev);

            // popis, stručná charakteristika regionu
            var popis = document.createElement("p");
            popis.innerText = dataRegionu[i].popis;
            page.appendChild(popis);

            // shrnutí dopravní dostupnosti do regionu
            var panelContainer = document.createElement("div");
            panelContainer.setAttribute("class", "regionyDetailsContainer");
            var panelHeader = document.createElement("div");
            panelHeader.setAttribute("class", "regionyDetailsPopisek");
            panelHeader.innerHTML = "<h4>Dopravní dostupnost</h4>";
            panelContainer.appendChild(panelHeader);
            var starRating = document.createElement("div");
            starRating.setAttribute("class", "regionyDetailsGrafika");
            // vykreslení počtu plných hvězdiček podle ratingu v json souboru
            var fullstar = `<span class="starRating-${dataRegionu[i].transportRating}">&#9733</span>`;
            var fullstars = fullstar.repeat(dataRegionu[i].transportRating);
            // doplnění prázdných hvězdiček do plného počtu pěti celkem
            var emptystar = `<span class="starRatingFiller">&#9734</span>`;
            var emptystars = emptystar.repeat(5 - dataRegionu[i].transportRating);
            var rating = fullstars + emptystars;
            starRating.innerHTML = rating;
            panelContainer.appendChild(starRating);
            var panelDesc = document.createElement("div");
            panelDesc.setAttribute("class", "regionyDetailsPodrobnosti");
            panelDesc.innerText = dataRegionu[i].transportDesc;
            panelContainer.appendChild(panelDesc);
            page.appendChild(panelContainer);

            // vhodnost pro cyklovýlety
            var panelContainer = document.createElement("div");
            panelContainer.setAttribute("class", "regionyDetailsContainer");
            var panelHeader = document.createElement("div");
            panelHeader.setAttribute("class", "regionyDetailsPopisek");
            panelHeader.innerHTML = "<h4>Vhodnost pro cyklovýlety</h4>";
            panelContainer.appendChild(panelHeader);
            var starRating = document.createElement("div");
            starRating.setAttribute("class", "regionyDetailsGrafika");
            // vykreslení počtu plných hvězdiček podle ratingu v json souboru
            var fullstar = `<span class="starRating-${dataRegionu[i].cykloRating}">&#9733</span>`;
            var fullstars = fullstar.repeat(dataRegionu[i].cykloRating);
            // doplnění prázdných hvězdiček do plného počtu pěti celkem
            var emptystar = `<span class="starRatingFiller">&#9734</span>`;
            var emptystars = emptystar.repeat(5 - dataRegionu[i].cykloRating);
            var rating = fullstars + emptystars;
            starRating.innerHTML = rating;
            panelContainer.appendChild(starRating);
            var panelDesc = document.createElement("div");
            panelDesc.setAttribute("class", "regionyDetailsPodrobnosti");
            panelDesc.innerHTML = '<span style="color: gray;">doporučené délky tras:</span>';
            panelContainer.appendChild(panelDesc);
            // speciální div pro štítky (tagy) doporučených délek tras v regionu
            var panelTags = document.createElement("div");
            panelTags.setAttribute("class", "regionyDetailsTagy");
            // přečíst array s doporučenými délkami tras a podle toho přiřadit z default arrays text jednotlivých tagů
            for (const typ of dataRegionu[i].cykloTypes) {
                let tag = document.createElement("div");
                tag.setAttribute("class", "tagDiv");
                let index = delkyIDs.indexOf(typ);
                // console.log pro případný error, když nebude délka trasy v json array odpovídat žádné standartní délce tras (např. kvůli překlepu)
                if (index < 0) { page.innerHTML = `POZOR: Špatná délka tras v JSONu pro region: ${dataRegionu[i].nazev}`; }
                // přiřazení barvy pozadí tagu podle délky tras, kterou daný tag reprezentuje
                switch (index) {
                    case 0:
                        tag.classList.add("short");
                        break;
                    case 1:
                        tag.classList.add("medium");
                        break;
                    case 2:
                        tag.classList.add("long");
                        break;
                    case 3:
                        tag.classList.add("longest");
                        break;
                    case 4:
                        tag.classList.add("multi");
                        break;
                    default:
                        break;
                }
                tag.innerText = delkyNames[index];
                panelTags.appendChild(tag);
            }
            panelContainer.appendChild(panelTags);
            page.appendChild(panelContainer);

            // vhodnost pro pěší treky
            var panelContainer = document.createElement("div");
            panelContainer.setAttribute("class", "regionyDetailsContainer");
            var panelHeader = document.createElement("div");
            panelHeader.setAttribute("class", "regionyDetailsPopisek");
            panelHeader.innerHTML = "<h4>Vhodnost pro pěší treky</h4>";
            panelContainer.appendChild(panelHeader);
            var starRating = document.createElement("div");
            starRating.setAttribute("class", "regionyDetailsGrafika");
            // vykreslení počtu plných hvězdiček podle ratingu v json souboru
            var fullstar = `<span class="starRating-${dataRegionu[i].pesiRating}">&#9733</span>`;
            var fullstars = fullstar.repeat(dataRegionu[i].pesiRating);
            // doplnění prázdných hvězdiček do plného počtu pěti celkem
            var emptystar = `<span class="starRatingFiller">&#9734</span>`;
            var emptystars = emptystar.repeat(5 - dataRegionu[i].pesiRating);
            var rating = fullstars + emptystars;
            starRating.innerHTML = rating;
            panelContainer.appendChild(starRating);
            var panelDesc = document.createElement("div");
            panelDesc.setAttribute("class", "regionyDetailsPodrobnosti");
            panelDesc.innerHTML = '<span style="color: gray;">doporučené délky tras:</span>';
            panelContainer.appendChild(panelDesc);
            // speciální div pro štítky (tagy) doporučených délek tras v regionu
            var panelTags = document.createElement("div");
            panelTags.setAttribute("class", "regionyDetailsTagy");
            // přečíst array s doporučenými délkami tras a podle toho přiřadit z default arrays text jednotlivých tagů
            for (const typ of dataRegionu[i].pesiTypes) {
                let tag = document.createElement("div");
                tag.setAttribute("class", "tagDiv");
                let index = delkyIDs.indexOf(typ);
                // console.log pro případný error, když nebude délka trasy v json array odpovídat žádné standartní délce tras (např. kvůli překlepu)
                if (index < 0) { page.innerHTML = `POZOR: Špatná délka tras v JSONu pro region: ${dataRegionu[i].nazev}`; }
                // přiřazení barvy pozadí tagu podle délky tras, kterou daný tag reprezentuje
                switch (index) {
                    case 0:
                        tag.classList.add("short");
                        break;
                    case 1:
                        tag.classList.add("medium");
                        break;
                    case 2:
                        tag.classList.add("long");
                        break;
                    case 3:
                        tag.classList.add("longest");
                        break;
                    case 4:
                        tag.classList.add("multi");
                        break;
                    default:
                        break;
                }
                tag.innerText = delkyNames[index];
                panelTags.appendChild(tag);
            }
            panelContainer.appendChild(panelTags);
            page.appendChild(panelContainer);

            // zajímavosti v regionu
            var panelContainer = document.createElement("div");
            panelContainer.setAttribute("class", "regionyDetailsContainer");
            var panelHeader = document.createElement("div");
            panelHeader.setAttribute("class", "regionyDetailsPopisek");
            panelHeader.innerHTML = "<h4>Zajímavosti</h4>";
            panelContainer.appendChild(panelHeader);
            var poisLink = document.createElement("div");
            poisLink.setAttribute("class", "regionyDetailsGrafika");
            poisLink.innerHTML = `<a href="${dataRegionu[i].pois}" target="_blank"><img src="../img/dev-mapy.svg" alt="zajímavosti v regionu"></a>`;
            panelContainer.appendChild(poisLink);
            var panelDesc = document.createElement("div");
            panelDesc.setAttribute("class", "regionyDetailsPodrobnosti");
            panelDesc.innerHTML = '<span style="color: gray;">Odkaz na seznam různých zajímavostí v regionu pro inspiraci při plánování nových tras</span>';
            panelContainer.appendChild(panelDesc);
            page.appendChild(panelContainer);

            // jakmile je daný region nalezen, skript se provede jen pro tento region
            // a na konci této iterace se loop přeruší, aby nepokračoval zbytečně dál pro další regiony
            break;
        }
    }
}

// !CHAPTER



/* ================================================================================================================================== */
/* CHAPTER přepínání viditelnosti html elementů pomocí klikání na svg mapu */
/* ================================================================================================================================== */


// function parameter "id" přichází z svg mapy regionů jako id daného polygonu "region_#" nebo "reset-to-region-home"
// toto # je tedy nutné nejdříve naparsovat a zobrazit dana k odpovídajícímu regionu podle čísla, které určuje pořadí regionu v array pro regiony
function nacistRegion(id) {
    // odznačit všechny SVG regiony
    var regs = document.querySelectorAll("#mapa-regionu > *");
    for (let i = 0; i < regs.length; i++) {
        regs[i].classList.remove("selectedSVGRegion");
    }
    // následně se správně označí zvolený region na mapě
    var reg = document.getElementById(id);
    reg.classList.add("selectedSVGRegion");
    // pak se vymaže content stránky, aby v ní nezůstala data po předchozím regionu
    page.innerHTML = "";

    // speciální if pro resetovací tlačítko regionů
    if (id == 'reset-to-region-home') {
        // pokud je stisknuto resetovací tlačítko pro regiony, pustí se trochu jiný skript
        naplnitHTMLHome();
    } else if (id.startsWith('region_')) {
        // zde se již vybírají jednotlivé regiony z svg mapy
        // nejdřív je nutné z # id vyparsovat příslušný region v array a podle toho vybrat ten stejný v json datech
        var regNumArr = id.split('_');
        var regNum = Number(regNumArr[1]);
        var regName = regiony[regNum];
        // spustit funkci na naplnění contentu stránky json daty pro daný region
        naplnitHTMLRegionem(regName);
    } else {
        page.innerHTML = "neznámý region";
    }
}

// !CHAPTER
