// DESC Skripty pro naplnění stránky trasami

// hlavní div pro obsah přeměníme na variable pro usnadnění psaní kódu
var seznamTras = document.getElementById("seznamTras");

// obsah div obsahuje placeholder text "Načítám trasy...", takže tímto ten text smažeme
seznamTras.innerHTML = "";


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
        var trasaWrapperDiv = document.createElement("div");
        trasaWrapperDiv.setAttribute("class", "trasaWrapper");
        seznamTras.appendChild(trasaWrapperDiv);
    
        // ITEM vytvoření hlavního container divu pro trasu
        var trasaDiv = document.createElement("div");
        trasaDiv.setAttribute("class", "trasaContainer");
            if (typtrasy[i].new === true) {
                trasaDiv.classList.add("new");
            }
        trasaWrapperDiv.appendChild(trasaDiv);
    
        // ITEM vytvoření a href wrapper odkazu na trasu, do kterého se pak bude vkládat většina ostatních sub-divů
        var trasaUrlDiv = document.createElement("a");
        trasaUrlDiv.setAttribute("class", "trasaUrlContainer");
            // vložení rozdílného url podle toho, jestli je web zobrazen na desktopu nebo na mobilu
            if (detekceMobilu.matches) {
                var trasaUrlLink = typtrasy[i].urlmobile;
            } else {
                var trasaUrlLink = typtrasy[i].urldesktop;
            }
        trasaUrlDiv.href = trasaUrlLink;
        trasaUrlDiv.target = "_blank";
        trasaDiv.appendChild(trasaUrlDiv);
    
        // ITEM vytvoření a naplnění sub-divu pro km
        var kmDiv = document.createElement("div");
        kmDiv.setAttribute("class", "kmContainer");
            // podmíněné formátování barvy podle délky trasy (zvlášť conditions pro cyklo a pěší)
            var pocetDni = typtrasy[i].kmpd.length;
            if (slozka == "cyklo") {
                if (typtrasy[i].multiday === true) {
                    kmDiv.classList.add("multi");
                    kmDiv.classList.add(`days${pocetDni}`);
                } else {
                    if (typtrasy[i].km < 30) {kmDiv.classList.add("short");}
                    if (typtrasy[i].km >= 30 && typtrasy[i].km < 40) {kmDiv.classList.add("medium");}
                    if (typtrasy[i].km >= 40 && typtrasy[i].km < 50) {kmDiv.classList.add("long");}
                    if (typtrasy[i].km >= 50) {kmDiv.classList.add("longest");}
                }
            } else if (slozka == "pesi") {
                if (typtrasy[i].multiday === true) {
                    kmDiv.classList.add("multi");
                    kmDiv.classList.add(`days${pocetDni}`);
                } else {
                    if (typtrasy[i].km < 10) {kmDiv.classList.add("short");}
                    if (typtrasy[i].km >= 10 && typtrasy[i].km < 15) {kmDiv.classList.add("medium");}
                    if (typtrasy[i].km >= 15 && typtrasy[i].km < 20) {kmDiv.classList.add("long");}
                    if (typtrasy[i].km >= 20) {kmDiv.classList.add("longest");}
                }
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
            var pictureDiv = document.createElement("div");
            pictureDiv.setAttribute("class", "pictureContainer");
            var pictureDivSoubor = typtrasy[i].picture;
            var pictureDivCesta = `<img src="${slozka}/img/${pictureDivSoubor}.jpg" alt="" loading="lazy">`;
            pictureDiv.innerHTML = pictureDivCesta;
            trasaUrlDiv.appendChild(pictureDiv);
        }
    
        // ITEM vytvoření a naplnění sub-divu pro název
        var nazevDiv = document.createElement("div");
        nazevDiv.setAttribute("class", "nazevContainer");
        nazevDiv.innerHTML = typtrasy[i].nazev;
        trasaUrlDiv.appendChild(nazevDiv);
    
        // ITEM vytvoření a naplnění sub-divu pro region
        var regionDiv = document.createElement("div");
        regionDiv.setAttribute("class", "regionContainer");
        regionDiv.innerHTML = typtrasy[i].region;
        trasaUrlDiv.appendChild(regionDiv);

        // ITEM vytvoření a naplnění sub-divu pro autory tras
        // container div pro ikonky s autory trasy
        var authorsDiv = document.createElement("div");
        authorsDiv.setAttribute("class", "authorsContainer");
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
            var gpxContainerDiv = document.createElement("div");
            gpxContainerDiv.setAttribute("class", "pcGPXcontainer");
            trasaDiv.appendChild(gpxContainerDiv);
            // anchor tag uvnitř gpx containeru utvářející odkaz samotného tlačítka
            var gpxAnchorTag = document.createElement("a");
            gpxAnchorTag.setAttribute("class", "pcGPXanchor");
            gpxAnchorTag.href = typtrasy[i].urlmobile;
            gpxAnchorTag.target = "_blank";
            gpxAnchorTag.innerHTML = '<img src="img/pcgpx.svg" alt="GPX">';
            gpxContainerDiv.appendChild(gpxAnchorTag);
        }

        // ITEM podmíněné vytvoření tlačítka pro otevírání/zavírání infoboxu
        // toto tlačítko se vygeneruje jen pokud má infobox dané trasy vůbec nějaký obsah
        // ale u vícedenních tras se vytvoří infobox vždy, protože do něj pak budou dynamicky doplněny informace o denních kilometrech a zastávkách
        if (typtrasy[i].infobox === "" && typtrasy[i].multiday === false) {
            // zde prázdné místo, tzn. že když nemá trasa textový obsah pro infobox, nevytvoří se ani žádné tlačítko
        } else {
            // vytvořit infobox
            var infoboxDiv = document.createElement("div");
            infoboxDiv.setAttribute("class", "infoboxContainer");
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
                    let trip = "";
                    if (slozka == "cyklo") {
                        if (typtrasy[i].kmpd[d] < 30) { trip = "short" }
                        if (typtrasy[i].kmpd[d] >= 30 && typtrasy[i].kmpd[d] < 40) { trip = "medium" }
                        if (typtrasy[i].kmpd[d] >= 40 && typtrasy[i].kmpd[d] < 50) { trip = "long" }
                        if (typtrasy[i].kmpd[d] >= 50) { trip = "longest" }
                    } else if (slozka == "pesi") {
                        if (typtrasy[i].kmpd[d] < 10) { trip = "short" }
                        if (typtrasy[i].kmpd[d] >= 10 && typtrasy[i].kmpd[d] < 15) { trip = "medium" }
                        if (typtrasy[i].kmpd[d] >= 15 && typtrasy[i].kmpd[d] < 20) { trip = "long" }
                        if (typtrasy[i].kmpd[d] >= 20) { trip = "longest" }
                    }
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
            var infoButtonWrapper = document.createElement("div");
            infoButtonWrapper.setAttribute("class", "infoButtonContainer");
            trasaDiv.appendChild(infoButtonWrapper);
            // toto je vložený div, který slouží jako grafické znázornění toho buttonu
            var infoButtonIcon = document.createElement("div");
            infoButtonIcon.setAttribute("class", "infoButtonVisual");
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
    .then((typtrasy) => { naplnitHTML(typtrasy); spustitFiltry(); })
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
