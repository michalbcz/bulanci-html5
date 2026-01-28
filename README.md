bulanci-html5
==============

Pokus o hru velice podobnou z minulosti znamym bulankum.
Hra pro 2 hrace na jednom PC, kde jeden se snazi sestrelit druheho.
Hrac ktery ma vice "killu" vyhrava.
Jeden hrac se ovlada pomoci WASD + mezernik. Druhy pomoci sipek + enter.
Hra detekuje kolize hracu (+ resi i kolize pri nahodnem respawnu). Casovy
limit je stanoven na 90 s. Po skonceni limitu je zobrazen vysledek hry.


## DEMO
* [http://mychalvlcek.github.io/bulanci-html5/](http://mychalvlcek.github.io/bulanci-html5/)

## MULTIPLAYER (NOVÉ!)
Nyní podporuje online multiplayer pro 2-4 hráče pomocí WebRTC!

### Jak hrát online:
1. Otevřete hru na [GitHub Pages](http://mychalvlcek.github.io/bulanci-html5/)
2. Klikněte na tlačítko **"Multiplayer"**
3. **Vytvoření hry:**
   - Pokud vytváříte novou hru, automaticky se vygeneruje unikátní odkaz
   - Zkopírujte tento odkaz a sdílejte ho s přáteli (max 3 další hráči)
4. **Připojení do hry:**
   - Otevřete odkaz od hostitele
   - Automaticky se připojíte do lobby
5. **Start hry:**
   - Všichni hráči musí kliknout na tlačítko "Ready"
   - Když jsou všichni připraveni, začne odpočet 3-2-1 a hra startuje
6. **Ovládání:**
   - Každý hráč ovládá svého Buláňka pomocí WASD + mezerník nebo šipky + Enter

### Technické detaily:
- Používá **WebRTC** pro peer-to-peer komunikaci
- **PeerJS** jako signaling služba (veřejná, bez vlastního serveru)
- Hostováno čistě přes GitHub Pages / jsDelivr
- Synchronizace hry probíhá každých 50ms
- Podporuje 2-4 hráče současně

## POPIS FUNKCNOSTI
Objektu `Game` predam canvas, do ktereho se hra bude vykreslovat, 
nactu veskere zdroje (obrazky) a pote spustim hru.
Spusteni hry spociva ve vygenerovani mapy (pozadi) a hracu (nahodne na mapu).
Spusti se hlavni smycka hry, ktera odchytava vstup z klavesnice a ten
zpracovava a prekresluje hru.

* hra pro 2 hrace na jednom PC (local multiplayer)
* **online multiplayer pro 2-4 hráče přes WebRTC**
* **vlastní avatary hráčů (upload nebo kamera)**
* pohyb obou hracu zaroven (vice stisklych klaves najednou) na obrazovce
* strely + odchytavani kolizi kulek
* nahodny spawn na mape
* kolize hracu mezi sebou
* "responzivni" canvas (prekreslovani hracu a HUDu pri zmene velikosti okna/rozliseni)

je zde samozrejme prostor pro dalsi vychytavky:

## TODO & POSSIBLE FEATURES
* strelba skrz 1 okraj obrazovky (mohlo by rapidne zvysit zabavnost hry :), ale i jeji slozitost a neprehlednost :( )
* barevnost bulanku (multi images vs. [one image](http://www.html5canvastutorials.com/advanced/html5-canvas-invert-image-colors-tutorial/))
* animace pohybu bulanku pres image sprite
* lepsi stin bulanku
* ~~kolize (hracu mezi sebou)~~
* ~~online sitova hra~~
* ~~vlastni avatar (upload nebo kamera)~~
* zpresnit hitbox
* nahodne prekazky na mape
* offline app (manifest)
* nastaveni (klavesy, atd)
* ruzne zbrane (ruzne rychle kulky, kadence, velikost zasobniku, ..)
* tournament mode
* editor levelu
* ..

## INSTALACE
* unzip & doubleclick ``` index.html ``` (spusteni ve webovem prohlizeci)
* Pro multiplayer je třeba spustit přes HTTP server (např. `python3 -m http.server` nebo hostovat na GitHub Pages)
