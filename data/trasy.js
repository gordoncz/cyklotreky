// DESC Skripty pro naplnění stránky trasami

// hlavní div pro obsah přeměníme na variable pro usnadnění psaní kódu
var seznamTras = document.getElementById("seznamTras");


// SUB načíst data tras ze správného JSON souboru podle typu (cyklo/pěší)
// pozn. nově je s uvedením async funkce rozlišeno mezi cyklo a pěšími trasami už jen podle globální variable "slozka"...
// ...která je deklarovaná s odpovídající hodnotou v příslušném HTML souboru
var nacistTrasy = async () => {
    // načíst ten JSON soubor, který odpovídá nastavenému typu tras v parent HTML souboru
    var data = await fetch(`data/content/${slozka}.json`);
    // zachycení případného erroru při stahování json souboru
    if (data.status !== 200) { throw new Error("chyba při načítání dat"); }
    // zde se JSON naparsuje do arraye a vloží do "typtrasy" variable pro další použití
    var typtrasy = await data.json();
    // a nakonec výstup z funkce bude právě obsah JSONu zabalený v obecné variable "typtrasy", která se použije dále v kódu
    return typtrasy;
}


// SUB zde se vytvoří nová náplň hlavního divu pro obsah stránky (s divy pro jednotlivé trasy)
function naplnitHTML(typtrasy) {
    for (i = 0; i < typtrasy.length; i++) {

        // ITEM celý wrapper div (i vč. infoboxu)
        var trasaWrapperDiv = createDiv("trasaWrapper");
        seznamTras.appendChild(trasaWrapperDiv);
    
        // ITEM vytvoření hlavního container divu pro trasu
        var trasaDiv = createDiv("trasaContainer");
            if (typtrasy[i].new === true) {
                trasaDiv.classList.add("new");
            }
        trasaWrapperDiv.appendChild(trasaDiv);
    
        // ITEM vytvoření a href wrapper odkazu na trasu, do kterého se pak bude vkládat většina ostatních sub-divů
        // vložení rozdílného url podle toho, jestli je web zobrazen na desktopu nebo na mobilu (pomocí ternary operator)
        var trasaUrlLink = detekceMobilu.matches ? typtrasy[i].urlmobile : typtrasy[i].urldesktop;
        var trasaUrlDiv = createAnchor("trasaUrlContainer", trasaUrlLink);
        trasaDiv.appendChild(trasaUrlDiv);
    
        // ITEM vytvoření a naplnění sub-divu pro km
        var kmDiv = createDiv("kmContainer");
            // podmíněné formátování barvy podle délky trasy (zvlášť conditions pro cyklo a pěší)
            var pocetDni = typtrasy[i].kmpd.length;
            if (typtrasy[i].multiday === true) {
                kmDiv.classList.add("multi");
                kmDiv.classList.add(`days${pocetDni}`);
            } else {
                // určování kategorie délky trasy bylo externalizováno do následující funkce delkaTrasy() v "hodnoty.js"
                let kategorie = delkaTrasy(slozka, typtrasy[i].km);
                kmDiv.classList.add(kategorie);
            }
            // dodatečný barevný filtr pro již známé trasy
            if (typtrasy[i].known === true) {
                kmDiv.classList.add("known");
            }
        kmDiv.innerHTML = typtrasy[i].km;
        trasaUrlDiv.appendChild(kmDiv);
    
        // ITEM vytvoření a naplnění sub-divu pro obrázek
        if (detekceMobilu.matches) {
            // pokud je zobrazeno na mobilu, skript přeskočí generování divů pro obrázky
            // takže se ani nebudou na mobilu načítat a ušetří jak místo na obrazovce, tak datové přenosy
        } else {
            var pictureDiv = createDiv("pictureContainer");
            pictureDiv.innerHTML = `<img src="${slozka}/img/${typtrasy[i].picture}.jpg" alt="" loading="lazy">`;
            trasaUrlDiv.appendChild(pictureDiv);
        }
    
        // ITEM vytvoření a naplnění sub-divu pro název
        var nazevDiv = createDiv("nazevContainer");
        nazevDiv.innerHTML = typtrasy[i].nazev;
        trasaUrlDiv.appendChild(nazevDiv);
    
        // ITEM vytvoření a naplnění sub-divu pro region
        var regionDiv = createDiv("regionContainer");
        regionDiv.innerHTML = typtrasy[i].region;
        trasaUrlDiv.appendChild(regionDiv);

        // ITEM vytvoření a naplnění sub-divu pro autory tras
        // container div pro ikonky s autory trasy
        var authorsDiv = createDiv("authorsContainer");
        trasaUrlDiv.appendChild(authorsDiv);
        // vložení jednotlivých ikonek autorů podle toho, kdo je uveden u dané trasy v json datech
        // autoři tras jsou array, takže dané operace se musí provést vždy pro každého autora v array u každé trasy
        // vše by mělo být ve stejném pořadí, v jakém jsou autoři uvedeni v json datech
        var authorsArr = typtrasy[i].authors;
        var authorIcons = "";
        authorsArr.forEach(author => {
            // vložení vizuální ikonky pro autora do divu trasy na stránce
            var authorIcon = `<img src="img/autor-${author}.svg" width="18px" height="18px" alt="${author}">`;
            authorIcons = authorIcons + authorIcon;
            authorsDiv.innerHTML = authorIcons;
            // vložení reference na autora ve formě className value pro container element trasy (pro potřeby filtrů)
            authorsDiv.classList.add(authorsNames[author]);
        });

        // ITEM vytvoření a naplnění sub-divu pro GPX tlačítko na PC (zobrazování onhover v místě přes obrázky)
        if (detekceMobilu.matches) {
            // pokud je zobrazeno na mobilu, skript přeskočí generování divů pro GPX tlačítka
            // takže se ani nebudou na mobilu načítat (protože tam nejsou ani potřeba a ani by se neměly kde zobrazit)
        } else {
            // vytvořit container div pro gpx tlačítko (jako přesný wrapper pro anchor tag uvnitř nadřazeného gridu, aby anchor nepřetékal)
            var gpxContainerDiv = createDiv("pcGPXcontainer");
            trasaDiv.appendChild(gpxContainerDiv);
            // anchor tag uvnitř gpx containeru utvářející odkaz samotného tlačítka
            var gpxAnchorTag = createAnchor("pcGPXanchor", typtrasy[i].urlmobile);
            gpxAnchorTag.innerHTML = '<img src="img/pcgpx.svg" alt="GPX">';
            gpxContainerDiv.appendChild(gpxAnchorTag);
        }

        // ITEM vytvoření sub-divu pro skrytý odkaz na trasu ve formátu Plánovače na mobilech (překrývající sub-div s kilometry)
        // následující if statement zajistí, že tento sub-div bude generovaný jen pro mobily a na PC vůbec nebude (rozbil by tam strukturu divů)
        if (detekceMobilu.matches) {
            // vytvořit container div (jako přesný wrapper pro anchor tag uvnitř nadřazeného gridu, aby anchor nepřetékal)
            var mobilPlanovacContainerDiv = createDiv("mobilPlanovacContainer");
            trasaDiv.appendChild(mobilPlanovacContainerDiv);
            // anchor tag uvnitř containeru utvářející odkaz samotného tlačítka
            var mobilPlanovacAnchorTag = createAnchor("mobilPlanovacAnchor", typtrasy[i].urldesktop);
            mobilPlanovacContainerDiv.appendChild(mobilPlanovacAnchorTag);
        }

        // ITEM podmíněné vytvoření tlačítka pro otevírání/zavírání infoboxu
        // toto tlačítko se vygeneruje jen pokud má infobox dané trasy vůbec nějaký obsah
        // ale u vícedenních tras se vytvoří infobox vždy, protože do něj pak budou dynamicky doplněny informace o denních kilometrech a zastávkách
        if (typtrasy[i].infobox === "" && typtrasy[i].multiday === false) {
            // zde prázdné místo, tzn. že když nemá trasa textový obsah pro infobox, nevytvoří se ani žádné tlačítko
        } else {
            // vytvořit infobox
            var infoboxDiv = createDiv("infoboxContainer");
            trasaWrapperDiv.appendChild(infoboxDiv);
            // přiřadit každému infoboxu unikátní ID
            var iboxID = "ibox" + i;
            infoboxDiv.setAttribute("id", iboxID);
            // skrýt
            infoboxDiv.style.display = "none";
            // naplnit infobox textem (v případě jednodenní trasy v něm jsou pouze manuálně psané informace)
            // v případě vícedenních tras jde o spojení textových manuálně psaných informací a procedurálně generovaných dat pro jednotlivé dny
            if (typtrasy[i].multiday === false) {
                infoboxDiv.innerHTML = typtrasy[i].infobox;
            } else if (typtrasy[i].multiday === true) {
                // kontrolní součet, zda sedí počet dní v kmpd s počtem zastávek ve stops u každé trasy
                // počet stops musí být o logicky vždy jednu víc než počet kmpd
                if (typtrasy[i].stops.length !== (typtrasy[i].kmpd.length + 1)) {
                    throw new Error("nesedí denní kilometry a zastávky u trasy: " + typtrasy[i].nazev);
                }
                // dynamicky vygenerovaný obsah denních kilometrů a zastávek
                var infoboxInfo = typtrasy[i].infobox;
                if (pocetDni < 5) { var dny = "dny" }
                if (pocetDni >= 5) { var dny = "dnů" }
                var multidayNadpis = `<p class="ibMultiday">Trasa je na ${pocetDni} ${dny}:`;
                var dailiesStart = '<div class="mdDailies">';
                var dailies = "";
                for (let d = 0; d < pocetDni; d++) {
                    // určování kategorie délky trasy bylo externalizováno do následující funkce delkaTrasy() v "hodnoty.js"
                    let trip = delkaTrasy(slozka, typtrasy[i].kmpd[d]);
                    let newStop = `<p class="mdStop">${typtrasy[i].stops[d]}</p>`;
                    let newKm = `<p class="mdKm ${trip}">${typtrasy[i].kmpd[d]} km</p>`;
                    dailies = dailies + newStop + newKm;
                }
                let lastStop = `<p class="mdStop">${typtrasy[i].stops[pocetDni]}</p>`;
                dailies = dailies + lastStop;
                var dailiesEnd = '</div>';
                var ibMultiContent = infoboxInfo + multidayNadpis + dailiesStart + dailies + dailiesEnd;
                infoboxDiv.innerHTML = ibMultiContent;
            }

            // toto je div pro klikatelnou oblast (aby byla větší než samotná ikona kvůli přístupnosti na mobilech)
            var infoButtonWrapper = createDiv("infoButtonContainer");
            trasaDiv.appendChild(infoButtonWrapper);
            // toto je vložený div, který slouží jako grafické znázornění toho buttonu
            var infoButtonIcon = createDiv("infoButtonVisual");
            infoButtonWrapper.appendChild(infoButtonIcon);
            infoButtonIcon.innerHTML = "info";
    
            // finální přidání funkcionality pro tlačítko
            var btnID = "showInfobox('" + iboxID + "')";
            infoButtonWrapper.setAttribute("onclick", btnID);
        }
    }
}


// SUB spuštění async funkce pro načtení JSON souboru s daty pro trasy
nacistTrasy()
    // pokud se json data načtou v pořádku, spustí se callback funkce a v ní postupně dvě klasické funkce pro naplnění obsahu stránky a pak pro iniciaci filtrů
    // musí být v tomto pořadí, jinak se filtry nedokáží iniciovat korektně
    .then((typtrasy) => { seznamTras.innerHTML = ""; naplnitHTML(typtrasy); spustitFiltry(); })
    // pokud se json data nenačtou, vypíše tato catch funkce error zprávu do hlavního divu stránky
    .catch((err) => { console.log(err); seznamTras.innerHTML = "chyba při načítání dat"; });


// SUB funkce na odkrývání a skrývání infoboxu podle unikátního ID
// (aby se jedním tlačítkem neovládaly všechny infoboxy, ale jen ten příslušný k dané trase)
function showInfobox(x) {
    var ibox = document.getElementById(x);
    if (ibox.style.display === "none") {
        ibox.style.display = "block";
    } else {
        ibox.style.display = "none";
    }
}
