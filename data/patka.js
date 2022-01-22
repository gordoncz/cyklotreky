// DESC Skripty pro patičku každé stránky

// hlavní wrapper div pro patičku stránky
var patkaStranky = document.getElementById("patkaStranky");

// ITEM zjištění, který je aktuálně rok, aby se tento mohl dynamicky přidat do copyright info
var datum = new Date();
var tentoRok = datum.getFullYear();

// ITEM silueta loga Cyklotreky
var logoBW = '<img src="img/logo-small-bw.svg" alt="-">';

// ITEM div pro obsahové informace v patičce
// aktuálně zobrazené info je rok vzniku verze 1.0, mini-logo v B&W verzi a aktuální rok podle systémového času
var copyright = document.createElement("div");
copyright.setAttribute("class", "patkaInfo");
copyright.innerHTML = "2014" + logoBW + tentoRok;
patkaStranky.appendChild(copyright);
