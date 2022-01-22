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
    info.innerHTML = `<span class="poznamka">Hranice regionů v turistické mapě:</span><br><a href="img/mapa-regionu.jpg" target="_blank">Obrázek s mapou</a>`;
    page.appendChild(info);

    // vysvětlivky ke kategoriím délek tras
    // nadpis a podtitul
    var vysvetlivkyHeader = document.createElement("h4");
    vysvetlivkyHeader.innerText = "Vysvětlivky pro kategorie délek tras";
    page.appendChild(vysvetlivkyHeader);
    var vysvetlivkyPodtitul = document.createElement("p");
    vysvetlivkyPodtitul.innerText = "Do jaké kategorie spadají trasy podle počtu kilometrů jejich délky";
    vysvetlivkyPodtitul.classList.add("podtitul");
    page.appendChild(vysvetlivkyPodtitul);
    // wrapper div, který obalí celé vysvětlivky
    var vysvetlivkyWrapper = createDiv("vysvetlivkyWrapper");
    page.appendChild(vysvetlivkyWrapper);
    // úvodní řádek s popisky
    var vysvetlivkaCykloPopisek = createDiv("vysvetlivkaCykloPopisek");
    vysvetlivkaCykloPopisek.innerText = "cyklo";
    vysvetlivkyWrapper.appendChild(vysvetlivkaCykloPopisek);
    var vysvetlivkaKategoriePopisek = createDiv("vysvetlivkaKategoriePopisek");
    vysvetlivkaKategoriePopisek.innerText = "kategorie";
    vysvetlivkyWrapper.appendChild(vysvetlivkaKategoriePopisek);
    var vysvetlivkaPesiPopisek = createDiv("vysvetlivkaPesiPopisek");
    vysvetlivkaPesiPopisek.innerText = "pěší";
    vysvetlivkyWrapper.appendChild(vysvetlivkaPesiPopisek);
    // jednotlivé řádky s obsahem
    var cykloDelky = ["1 až 29 km", "30 až 39 km", "40 až 49 km", "50 km a více"];
    var pesiDelky = ["1 až 9 km", "10 až 14 km", "15 až 19 km", "20 km a více"];
    for (let i = 0; i < 4; i++) {
        var vysvetlivkaCyklo = createDiv("vysvetlivkaCyklo");
        vysvetlivkaCyklo.innerText = cykloDelky[i];
        vysvetlivkyWrapper.appendChild(vysvetlivkaCyklo);
        var vysvetlivkaKategorie = createDiv("vysvetlivkaKategorie");
        vysvetlivkaKategorie.innerText = delkyNames[i];
        vysvetlivkaKategorie.classList.add(delkyCSS[i]);
        vysvetlivkyWrapper.appendChild(vysvetlivkaKategorie);
        var vysvetlivkaPesi = createDiv("vysvetlivkaPesi");
        vysvetlivkaPesi.innerText = pesiDelky[i];
        vysvetlivkyWrapper.appendChild(vysvetlivkaPesi);
    }
    // poslední řádek k uzavření vysvětlivek
    var vysvetlivkyPatka = createDiv("vysvetlivkyPatka");
    vysvetlivkyPatka.innerText = "Ve vícedenních trasách jsou jednotlivé denní příděly kilometrů řazeny podle stejných kategorií";
    vysvetlivkyWrapper.appendChild(vysvetlivkyPatka);
}

// pomocná funkce na vyplnění obsahu panelu s hvězdičkami ratingu
// tj. dopravní dostupnost a vhodnost pro cyklo / pěší výlety
function vyplnitRatingPanel(nadpis, jsonRating, jsonDesc, tagsObj = null) {
    // POZN: tagsObj je objekt obsahující array dat s tagy tras z JSONu, plus název regionu pro případný error v datech
    // ale např. v případě dopravy žádné tagy tras v panelu nejsou, takže ani nejsou poslány jako argument do této funkce (proto default = null)
    var panelContainer = createDiv("regionyDetailsContainer");
    var panelHeader = createDiv("regionyDetailsPopisek");
    panelHeader.innerHTML = `<h4>${nadpis}</h4>`;
    panelContainer.appendChild(panelHeader);
    var starRating = createDiv("regionyDetailsGrafika");
    // vykreslení počtu plných hvězdiček podle ratingu v json souboru
    var fullstar = `<span class="starRating-${jsonRating}">&#9733</span>`;
    var fullstars = fullstar.repeat(jsonRating);
    // doplnění prázdných hvězdiček do plného počtu pěti celkem
    var emptystar = `<span class="starRatingFiller">&#9734</span>`;
    var emptystars = emptystar.repeat(5 - jsonRating);
    var rating = fullstars + emptystars;
    starRating.innerHTML = rating;
    panelContainer.appendChild(starRating);
    var panelDesc = createDiv("regionyDetailsPodrobnosti");
    panelDesc.innerHTML = jsonDesc;
    panelContainer.appendChild(panelDesc);
        // podmíněná část pro přiřazení tagů délek tras (jen pokud přijde jako argument do funkce)
        if (tagsObj !== null) {
            // speciální div pro štítky (tagy) doporučených délek tras v regionu
            var panelTags = createDiv("regionyDetailsTagy");
            // přečíst array s doporučenými délkami tras a podle toho přiřadit z default arrays text jednotlivých tagů
            for (const item of tagsObj.tagArr) {
                let tag = createDiv("tagDiv");
                let index = delkyIDs.indexOf(item);
                // console.log pro případný error, když nebude délka trasy v json array odpovídat žádné standartní délce tras (např. kvůli překlepu)
                if (index < 0) { page.innerHTML = `POZOR: Špatná délka tras v JSONu pro region: ${tagsObj.tagErrName}`; }
                // přiřazení barvy pozadí tagu podle délky tras, kterou daný tag reprezentuje
                switch (index) {
                    case 0:
                        tag.classList.add(delkyCSS[0]);
                        break;
                    case 1:
                        tag.classList.add(delkyCSS[1]);
                        break;
                    case 2:
                        tag.classList.add(delkyCSS[2]);
                        break;
                    case 3:
                        tag.classList.add(delkyCSS[3]);
                        break;
                    case 4:
                        tag.classList.add(delkyCSS[4]);
                        break;
                    default:
                        break;
                }
                tag.innerText = delkyNames[index];
                panelTags.appendChild(tag);
            }
            panelContainer.appendChild(panelTags);
        }
    page.appendChild(panelContainer);
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
            vyplnitRatingPanel("Dopravní dostupnost", dataRegionu[i].transportRating, dataRegionu[i].transportDesc);

            // vhodnost pro cyklovýlety
            vyplnitRatingPanel(
                "Vhodnost pro cyklovýlety", 
                dataRegionu[i].cykloRating, 
                '<span class="poznamka">doporučené délky tras:</span>', 
                {tagArr: dataRegionu[i].cykloTypes, tagErrName: dataRegionu[i].nazev}
                );

            // vhodnost pro pěší treky
            vyplnitRatingPanel(
                "Vhodnost pro pěší treky", 
                dataRegionu[i].pesiRating, 
                '<span class="poznamka">doporučené délky tras:</span>', 
                {tagArr: dataRegionu[i].pesiTypes, tagErrName: dataRegionu[i].nazev}
                );

            // zajímavosti v regionu
            var panelContainer = createDiv("regionyDetailsContainer");
            var panelHeader = createDiv("regionyDetailsPopisek");
            panelHeader.innerHTML = "<h4>Zajímavosti</h4>";
            panelContainer.appendChild(panelHeader);
            var poisLink = createDiv("regionyDetailsGrafika");
            poisLink.innerHTML = `<a href="${dataRegionu[i].pois}" target="_blank"><img src="img/dev-mapy.svg" alt="zajímavosti v regionu"></a>`;
            panelContainer.appendChild(poisLink);
            var panelDesc = createDiv("regionyDetailsPodrobnosti");
            panelDesc.innerHTML = '<span class="poznamka">Odkaz na seznam různých zajímavostí v regionu pro inspiraci při plánování nových tras</span>';
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
