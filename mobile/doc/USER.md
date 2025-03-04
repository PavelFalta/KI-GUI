# DocSchool Mobile - uživatelská dokumentace

Tento dokument definuje, jak má aplikace vypadat a jak se má chovat z uživatelského hlediska.

## Uvítání

Pokud je uživatel odhlášen nebo otevřel aplikaci poprvé, zobrazí se mu uvítací obrazovka.

Ta obsahuje grafiku/uvítací zprávu a tlačítko, kterým se lze prokliknout na přihlašovací obrazovku.

V hlavičce je název projektu (DocSchool).

## Přihlášení

Přihlašovací obrazovka obsahuje políčka pro jméno a heslo společně s tlačítkem pro přihlášení.

Pokud přihlášení proběhne úspěšně, potom je uživatel přesměrován na přehled kurzů. Pokud selže, bude vypsáno chybové hlášení.

V hlavičce je šipka zpět, tz. uživatel se může vrátit na uvítací obrazovku.

## Přehled kurzů

Přehled je realizován formou dlaždic pod sebou, které by měly být oproti pozadí vyzdviženy o trochu světlejší barvou.

Každá dlaždice zobrazuje název a postup formou progress baru.

Pokud je v kurzu úkol čekající na potvrzení, potom je u přehledu zobrazen status "pending approval". Pokud jsou všechny úkoly v kurzu splněny, potom je zobrazen status "finished".

V hlavičce vpravo je ozubené kolo pro prokliknutí se do nastavení.

## Konkrétní kurz

Název kurzu je zobrazen v hlavičce společně se šipkou zpátky.

Jednotlivé úkoly jsou vypsány pod sebou, očíslovány a odděleny horizontální čárou. Ty, které byly splněny, jsou zobrazeny proškrtnuté a o něco tmavší barvou.

U právě aktivního úkolu je navíc tlačítko pro žádost o potvrzení. Po kliknutí by tlačítko mělo být deaktivováno (ztmavne a nejde na něj kliknout) a jeho popisek uvádí "pending approval".

## Nastavení

Nastavení obsahuje minimálně možnost odhlásit se z aplikace, která uživatele odhlásí a vrátí zpět na uvítací obrazovku.

V hlavičce je šipka zpět.
