// DESC Skripty pro odkazy.html

// hlavní div pro obsah přeměníme na variable pro usnadnění psaní kódu
var obsahStranky = document.getElementById("obsahStranky");


// ITEM async funkce pro načtení datového JSON souboru s jednotlivými odkazy
var nacistData = async () => {
    // stáhne json soubor, počká na dokončení stažení a potom přiřadí tento json do variable "data"
    var data = await fetch("data/content/odkazy.json");
    // zachycení případného erroru při stahování json souboru
    if (data.status !== 200) { throw new Error("chyba při načítání dat"); }
    // parsuje json do klasického array (asynchronně), počká a pak přiřadí tento array do variable "odkazy"
    var odkazy = await data.json();
    // a jako výsledek této async funkce vyhodí právě ten array ve variable "odkazy"...
    // ...aby pod touto variable mohl další kód dále pracovat
    return odkazy;
}


// ITEM naplníme hlavní obsahový div stránky jednotlivými divy s odkazy
// tato funkce se spustí až po úspěšném načtení json dat
// do argumentu "odkazy" převezme obsah variable "odkazy" (JSON data) a tato data pak vyparsuje do HTML obsahu
function naplnitHTML(odkazy) {
    for (i = 0; i < odkazy.length; i++) {

        // kategorie tras (což je každý ten array object "mapy", "idos" atd.)
        var kategorie = Object.keys(odkazy[i]);
        // jméno kategorie tras (což je to array object name před dvojtečkou ve formě string)
        var kategorieName = Object.keys(odkazy[i])[0];
    
        // vytvořit wrapper pro každou kategorii odkazů
        var linksWrapper = document.createElement("div");
        linksWrapper.setAttribute("class", "linksWrapper");
        obsahStranky.appendChild(linksWrapper);
    
        // do wrapperu vložit header, kde bude logo dané kategorie odkazů
        var linksHeader = document.createElement("div");
        linksHeader.setAttribute("class", "linksHeader");
        linksHeader.style.backgroundImage = "url(\"img/links-" + kategorieName + ".svg\")";
        linksWrapper.appendChild(linksHeader);
    
        // pod header vložit div, ve kterém budou jednotlivé odkazy
        var linksBody = document.createElement("div");
        linksBody.setAttribute("class", "linksBody");
        linksWrapper.appendChild(linksBody);
    
            // do linksBody vložit postupně jeden odkaz za druhým
            for (x = 0; x < odkazy[i][kategorie].length; x++) {
    
                // variables pro jméno a url každého odkazu
                // linkObject je každý object {} uvnitř každé kategorie array (jako "mapy", "idos" atd.)
                // a tento linkObject má v sobě vždy dvě name:value (text a url)
                var linkObject = odkazy[i][Object.keys(odkazy[i])][x];
    
                // vytvořit odstavec, do něj a-href odkaz a naplnit ho textem a url adresou
                var linkOdstavec = document.createElement("p");
                var link = document.createElement("a");
                link.innerHTML = linkObject.linktext;
                link.href = linkObject.linkurl;
                link.target = "_blank";
                linkOdstavec.appendChild(link);
                linksBody.appendChild(linkOdstavec);
            }
    
    }
}


// ITEM zde spustit async funkci na načtení datového json souboru
nacistData()
    // při úspěšném stažení json dat bude dále pracovat s json daty v rámci variable "odkazy"
    // poté, co se JSON soubor úspěšně načte, tak spustit zbytek kódu na naplnění obsahu html stránky těmito json daty
    // to znamená spustit funkci naplnitHTML() a jako argument do ní vložit právě tu variable "odkazy", která obsahuje json data pro další zpracování
    .then((odkazy) => { naplnitHTML(odkazy); })
    // pokud dojde k chybě při stahování json dat, tak zde metoda catch() tento error zachytí
    // vypíše případný error při načítání json dat do obsahu html stránky
    .catch((err) => { console.log(err); obsahStranky.innerHTML = "chyba při načítání dat"; });
