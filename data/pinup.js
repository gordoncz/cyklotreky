// DESC Generátor pinup girls na PC

// automatický generátor pro pinup girls obrázky na pozadí titulní stránky, provede se jen při zobrazení na PC
// na mobilech se z důvodu úspory přenosu dat a také úspory místa na monitoru pinup girls nebudou zobrazovat

// NOTE zde stačí vložit číslo, kolik je celkem pinup souborů ve složce
var celkemPinup = 47;



// =========================================================================================================
// CHAPTER definice základních variables
// =========================================================================================================


// definování variable pro div ID "panelPinup" na stránce, kam se bude obrázek vkládat
var pinupDiv = document.getElementById("panelPinup");

// HTML elementy pro akční tlačítka
var pinupBtnGallery = document.getElementById("pinupBtnGallery");
var pinupButtons = document.getElementById("pinupButtons");
var pinupBtnNew = document.getElementById("pinupBtnNew");
var pinupBtnLock = document.getElementById("pinupBtnLock");
var pinupBtnUnlock = document.getElementById("pinupBtnUnlock");

// pinup gallery wrapper div
var pinupGalleryWrapper = document.getElementById("pinupGalleryWrapper");
// speciální variable na zajištění, aby se při každém otevření tohoto wrapperu nepřidávaly miniatury znovu a znovu
var pinupGalleryLoaded = false;

// !CHAPTER



// =========================================================================================================
// CHAPTER naplnění dat pro stránku
// =========================================================================================================


// SUB která tlačítka budou zobrazená při načtení stránky...
// nejdřív všechna skrýt...
pinupBtnGallery.style.display = "none";
pinupBtnNew.style.display = "none";
pinupBtnLock.style.display = "none";
pinupBtnUnlock.style.display = "none";
// potom naplnit tlačítka SVG ikonkami (pomocí JS, aby bylo zajištěno, že toto bude provedeno jen na PC a ne na mobilech)
if (detekceMobilu.matches) {
    // nic neprovádět, pokud je stránka zobrazená na mobilu
} else {
    // pro PC naplnit funkční tlačítka ikonkami SVG
    pinupBtnGallery.innerHTML = `<img src="img/pinup-button-gallery.svg" alt="galerie" title="vybrat pinup girl z galerie">`;
    pinupBtnNew.innerHTML = `<img src="img/pinup-button-random.svg" alt="náhodně" title="vybrat náhodně další pinup girl">`;
    pinupBtnLock.innerHTML = `<img src="img/pinup-button-unlocked.svg" alt="uzamknout" title="uzamknout aktuální pinup girl\n(pro načtení i při příštím spuštění prohlížeče)">`;
    pinupBtnUnlock.innerHTML = `<img src="img/pinup-button-locked.svg" alt="odemknout" title="tuto pinup girl máte uzamčenou\n(klikněte pro odemknutí)">`;
}
// ...nakonec odkrýt jen ta, která mají být vidět
if (localStorage.getItem('gczCT7pinupLocal')) {
    pinupBtnUnlock.style.display = "inline-block";
} else {
    pinupBtnGallery.style.display = "inline-block";
    pinupBtnNew.style.display = "inline-block";
    pinupBtnLock.style.display = "inline-block";
}

// SUB pinup data array
// na začátku vytvořit prázdný array, kam se následně budou automaticky vkládat jednotlivé pinup položky
var pinupPool = [];

// naplnění array daty
// na tomto místě se kód postará o naplnění výše definovaného prázdného array příslušnými daty
// počet vložených pinup záznamů do array se řídí číslem, které je definované výše v rámci var celkemPinup
if (celkemPinup > 9) {
    // tento if blok se spustí, pokud je počet pinup souborů ve složce větší než 9
    for(i = 1; i < 10; i++) {
        pinupPool.push(`pinup0${i}`);
    }
    for(i = 10; i < (celkemPinup + 1); i++) {
        pinupPool.push(`pinup${i}`);
    }
} else {
    // tento else blok se spustí jen tehdy, pokud je počet pinup souborů ve složce menší nebo roven 9
    for(i = 1; i < (celkemPinup + 1); i++) {
        pinupPool.push(`pinup0${i}`);
    }
}

// SUB pinup gallery wrapper div
// hned na začátku skrýt celý wrapper div (aby při načtení stránky nezakrýval pinup girl)
pinupGalleryWrapper.style.display = "none";
// vytvořit a vložit vnitřní flex container
var pinupGalleryContainer = document.createElement("div");
pinupGalleryContainer.setAttribute("id", "pinupGalleryContainer");
pinupGalleryWrapper.appendChild(pinupGalleryContainer);
// zavírací tlačítko galerie (kdyby si uživatel rozmyslel manuální výběr pinup girl)
var pinupGalleryCloseButton = document.createElement("div");
pinupGalleryCloseButton.setAttribute("id", "pinupGalleryCloseButton");
pinupGalleryCloseButton.setAttribute("onclick", "closePinupGallery()");
pinupGalleryCloseButton.innerHTML = "&#10006;";
pinupGalleryWrapper.appendChild(pinupGalleryCloseButton);

// !CHAPTER



// =========================================================================================================
// CHAPTER funkce pro tlačítka a generování pinupu
// =========================================================================================================


// SUB funkce generátoru pinup girls
function generatePinup() {

    // ITEM pokud je web zobrazen na mobilu, žádný background-image se nepřidá a funkce se hned ukončí
    if (detekceMobilu.matches) {
        return;
    } else {

        let pinupLocationCss = "";

        if (localStorage.getItem('gczCT7pinupLocal')) {
            // ITEM kontrola localStorage, jestli je v něm uložena nějaká pinup girl
            // jestli v localStorage už je záznam, pak se nastaví pinup girl podle něj
            var lGirl = localStorage.getItem('gczCT7pinupLocal');

            // variable pro celou složenou adresu toho náhodně zvoleného obrázku ve formátu CSS
            pinupLocationCss = `url("pinup/${lGirl}.jpg")`;

        } else if (sessionStorage.getItem('gczCT7pinupSession')) {
            // ITEM kontrola sessionStorage, jestli už zde byla načtena nějaká pinup girl
            // jestli v sessionStorage už je záznam, pak se nastaví pinup girl podle něj
            var sGirl = sessionStorage.getItem('gczCT7pinupSession');

            // variable pro celou složenou adresu toho náhodně zvoleného obrázku ve formátu CSS
            pinupLocationCss = `url("pinup/${sGirl}.jpg")`;

        } else {
            // ITEM pokud v sessionStorage žádný záznam není, tak se vygeneruje náhodně z array a následně uloží do sessionStorage
            // vygenerování náhodného čísla od 0 do pinupPool.length-1
            // to vybere číslo pro index v rámci výše definovaného array
            // a to index číslo pak určí, který string (obrázek) se z array vybere pro background-image
            var randomNumber = Math.floor(Math.random() * pinupPool.length);

            // variable pro celou složenou adresu toho náhodně zvoleného obrázku ve formátu CSS
            pinupLocationCss = `url("pinup/${pinupPool[randomNumber]}.jpg")`;

            // uložit do sessionStorage pro případ reloadu
            sessionStorage.setItem('gczCT7pinupSession', pinupPool[randomNumber]);
        }
        
        // finální přidání vygenerovaného obrázku do html kódu divu panelPinup
        pinupDiv.style.backgroundImage = pinupLocationCss;
    }
}

// SUB funkce pro tlačítko na opětovné náhodné vygenerování nového pinup obrázku
function reloadWithNewPinup() {
    // nejprve je nutné smazat pinup ze sessionStorage
    sessionStorage.removeItem('gczCT7pinupSession');
    // a potom je možno spustit funkci pro vygenerování nové pinup girl
    generatePinup();
}

// SUB funkce pro tlačítko na "uzamčení" aktuálně zobrazené pinup girl do localStorage (aby se načetla opět tato i po zavření prohlížeče)
function lockCurrentPinup() {
    // nabere pinup girl ze sessionStorage (kde tou dobou je nějaká na 100%)
    var lGirl = sessionStorage.getItem('gczCT7pinupSession');
    // a tento údaj překlopí do localStorage
    localStorage.setItem('gczCT7pinupLocal', lGirl);
    // překlopit zobrazení tlačítek
    pinupBtnGallery.style.display = "none";
    pinupBtnNew.style.display = "none";
    pinupBtnLock.style.display = "none";
    pinupBtnUnlock.style.display = "inline-block";
}

// SUB funkce pro tlačítko na "odemčení" uložené pinup girl v localStorage (aby se po zavření prohlížeče mohla vygenerovat zase jiná)
function unlockCurrentPinup() {
    // pro případ, že by uživatel měl uzamknutý pinup, otevřel novou záložku prohlížeče, odemknul pinup, ale pak jej zase chtěl zamknout...
    // ...tak bez následujícího kódu by se pak pinup lock nastavil na "null" (protože s novou záložkou přichází sessionStorage prázdné)...
    // ...a při reloadu by pak byla v konzole chyba 404 na neexistující pinup obrázek a prázdné pozadí stránky...
    // ...proto je nutné při odemknutí fallbackovat localStorage do sessionStorage (jelikož s obsahem sessionStorage počítá následně lockCurrentPinup)
    var lGirl = localStorage.getItem('gczCT7pinupLocal');
    sessionStorage.setItem('gczCT7pinupSession', lGirl);
    // až potom odebrat pinup z localStorage
    localStorage.removeItem('gczCT7pinupLocal');
    // a překlopit zobrazení tlačítek
    pinupBtnGallery.style.display = "inline-block";
    pinupBtnNew.style.display = "inline-block";
    pinupBtnUnlock.style.display = "none";
    pinupBtnLock.style.display = "inline-block";
}

// SUB funkce pro otevření galerie pinup girls
function openPinupGallery() {
    // naplnit container div obrázky miniatur podle datového arraye pinup girls výše
    // if statement zajišťuje, aby vložení miniatur do container divu bylo provedeno pouze při prvním otevření galerie
    // jinak by se miniatury v galerii neustále množily dál a dál při každém novém otevření
    // přičemž pro miniatury nelze tento for loop provést v kódu dřív než v této funkci při otevření galerie...
    // ...protože jinak by se všechny obrázky stáhly ze serveru hned při načtení stránky, což není žádoucí
    if (!pinupGalleryLoaded) {
        for (let i = 0; i < pinupPool.length; i++) {
            let pinupGalleryItem = document.createElement("div");
            pinupGalleryItem.setAttribute("class", "pinupGalleryItem");
            pinupGalleryItem.innerHTML = `<img src="pinup/mini/${pinupPool[i]}.jpg" alt="${pinupPool[i]}" loading="lazy" onclick="selectPinup('${pinupPool[i]}')">`;
            pinupGalleryContainer.appendChild(pinupGalleryItem)
        }
        // nastavit tuto speciální globální variable na true (tj., že už byly miniatury načteny)
        pinupGalleryLoaded = true;
    }
    // odkrýt pinup galerii
    pinupGalleryWrapper.style.display = "block";
    // skrýt pinup tlačítka
    pinupButtons.classList.add("invisible");
}

// SUB funkce pro zavření galerie pinup girls
function closePinupGallery() {
    // skrýt pinup galerii
    pinupGalleryWrapper.style.display = "none";
    // znovu zobrazit pinup tlačítka
    pinupButtons.classList.remove("invisible");
}

// SUB funkce na výběr pinup girl kliknutím na miniaturu v galerii
function selectPinup(pinup) {
    // převést do sessionStorage pinup girl převzatou z onClick eventu
    sessionStorage.setItem('gczCT7pinupSession', pinup);
    // pustit funkci na nastavení background-image
    generatePinup();
    // a nakonec po tomto výběru pinup girl automaticky zavřít galerii
    closePinupGallery();
}

// spuštění funkce generátoru pinup girl pro backgroundImage při načtení stránky
generatePinup();

// !CHAPTER
