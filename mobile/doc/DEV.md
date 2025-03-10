# DocSchool Mobile - vývojářská dokumentace

Tento dokument definuje standardy pro vývoj a implementaci a popisuje některé části již zavedeného kódu.

## Komponenty

Vlastní komponenty, pokud jsou používány na více místech, by měly být umístěny do `components/Common.tsx` a poté v případě potřeby importovány.

Pro definici "klikatelných" komponent se používá výhradně `<TouchableOpacity>`.

## Navigace

Mezi obrazovkami se naviguje pomocnými funkcemi `navigate()` a `navigateWithHistory()` z `constants/Common.ts`, které přijímají koncový uzel jako parametr (např. `navigate('login')`).

Při použití varianty s historií se v hlavičce zobrazí šipka zpět, kterou se lze prokliknout na předchozí obrazovku.

## Styly

Definice spojené se vzhledem aplikace, pokud jsou používány na více místech, by měly být umístěny do `constants/Common.ts` a poté v případě potřeby importovány.

Proměnná `colors` je vyhrazena pro definice barev.
