// hlavní div pro obsah přeměníme na variable pro usnadnění psaní kódu
var seznamTras = document.getElementById("seznamTras");

// obsah div obsahuje placeholder text "Načítám trasy...", takže tímto ten text smažeme
seznamTras.innerHTML = "";



// zde se vytvoří nová náplň hlavního divu pro obsah stránky (s divy pro jednotlivé trasy)
for (i = 0; i < typtrasy.length; i++) {

    // celý wrapper div (i vč. infoboxu)
    var trasaWrapperDiv = document.createElement("div");
    trasaWrapperDiv.setAttribute("class", "trasaWrapper");
    seznamTras.appendChild(trasaWrapperDiv);

    // vytvoření hlavního container divu pro trasu
    var trasaDiv = document.createElement("div");
    trasaDiv.setAttribute("class", "trasaContainer");
        if (typtrasy[i].new === true) {
            trasaDiv.classList.add("new");
        }
    trasaWrapperDiv.appendChild(trasaDiv);

    // vytvoření a href wrapper odkazu na trasu, do kterého se pak bude vkládat většina ostatních sub-divů
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

    // vytvoření a naplnění sub-divu pro km
    var kmDiv = document.createElement("div");
    kmDiv.setAttribute("class", "kmContainer");
        // podmíněné formátování barvy podle délky trasy (zvlášť conditions pro cyklo a pěší)
        if (typtrasy == cyklotrasy) {
            if (typtrasy[i].multiday === true) {
                kmDiv.classList.add("multi");
            } else {
                if (typtrasy[i].km < 30) {kmDiv.classList.add("short");}
                if (typtrasy[i].km >= 30 && typtrasy[i].km < 40) {kmDiv.classList.add("medium");}
                if (typtrasy[i].km >= 40 && typtrasy[i].km < 50) {kmDiv.classList.add("long");}
                if (typtrasy[i].km >= 50) {kmDiv.classList.add("longest");}
            }
        } else if (typtrasy == pesitrasy) {
            if (typtrasy[i].multiday === true) {
                kmDiv.classList.add("multi");
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

    // vytvoření a naplnění sub-divu pro obrázek
    if (detekceMobilu.matches) {
        // pokud je zobrazeno na mobilu, skript přeskočí generování divů pro obrázky
        // takže se ani nebudou na mobilu načítat a ušetří jak místo na obrazovce, tak datové přenosy
    } else {
        var pictureDiv = document.createElement("div");
        pictureDiv.setAttribute("class", "pictureContainer");
        var pictureDivSoubor = typtrasy[i].picture;
        var pictureDivCesta = `<img src="${slozka}/img/${pictureDivSoubor}.jpg" alt="" loading="lazy">`;
        // var pictureDivCesta = "url(\"" + slozka + "/img/" + pictureDivSoubor + ".jpg\")";
        // pictureDiv.style.backgroundImage = pictureDivCesta;
        pictureDiv.innerHTML = pictureDivCesta;
        trasaUrlDiv.appendChild(pictureDiv);
    }

    // vytvoření a naplnění sub-divu pro název
    var nazevDiv = document.createElement("div");
    nazevDiv.setAttribute("class", "nazevContainer");
    nazevDiv.innerHTML = typtrasy[i].nazev;
    trasaUrlDiv.appendChild(nazevDiv);

    // vytvoření a naplnění sub-divu pro region
    var regionDiv = document.createElement("div");
    regionDiv.setAttribute("class", "regionContainer");
    regionDiv.innerHTML = typtrasy[i].region;
    trasaUrlDiv.appendChild(regionDiv);

    // podmíněné vytvoření tlačítka pro otevírání/zavírání infoboxu
    // toto tlačítko se vygeneruje jen pokud má infobox dané trasy vůbec nějaký obsah
    if (typtrasy[i].infobox === "") {
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
        // naplnit infobox textem
        infoboxDiv.innerHTML = typtrasy[i].infobox;

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

// funkce na odkrývání a skrývání infoboxu podle unikátního ID
// (aby se jedním tlačítkem neovládaly všechny infoboxy, ale jen ten příslušný k dané trase)
function showInfobox(x) {
    var ibox = document.getElementById(x);
    if (ibox.style.display === "none") {
        ibox.style.display = "block";
    } else {
        ibox.style.display = "none";
    }
}
