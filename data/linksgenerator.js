// hlavní div pro obsah přeměníme na variable pro usnadnění psaní kódu
var obsahStranky = document.getElementById("obsahStranky");


// naplníme hlavní obsahový div stránky jednotlivými divy s odkazy
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
    var linksHeaderImg = "url(\"img/links-" + kategorieName + ".svg\")";
    linksHeader.style.backgroundImage = linksHeaderImg;
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
            var linkName = linkObject.linktext;
            var linkUrl = linkObject.linkurl;

            // vytvořit odstavec, do něj a-href odkaz a naplnit ho textem a url adresou
            var linkOdstavec = document.createElement("p");
            var link = document.createElement("a");
            link.innerHTML = linkName;
            link.href = linkUrl;
            link.target = "_blank";
            linkOdstavec.appendChild(link);
            linksBody.appendChild(linkOdstavec);
        }

}
