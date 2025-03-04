# DocSchool Mobile - vývojářská dokumentace

Tento dokument definuje standardy pro vývoj a implementaci a popisuje některé části již zavedeného kódu.

## Komponenty

Vlastní komponenty by měly být umístěny do `components/DocSchool.tsx` a poté v případě potřeby importovány.

Všechny komponenty v tomto souboru musí začínat "Doc", aby se předešlo konfliktům s již zavedenými komponentami (např. `DocButton` a `Button`).

Pro definici "klikatelných" komponent se používá výhradně `<TouchableOpacity>`.

## Navigace

Mezi obrazovkami se naviguje pomocnými funkcemi `navigate()` a `navigateWithHistory()` z `constants/functions.ts`, které přijímají koncový uzel jako parametr (např. `navigate('login')`).

Při použití varianty s historií se v hlavičce zobrazí šipka zpět, kterou se lze prokliknout na předchozí obrazovku.

## Styly

Definice spojené se vzhledem aplikace by měly být umístěny do `constants/Styles.ts` a poté v případě potřeby importovány.

Proměnná `classes` je vyhrazená pro definice stylů způsobem podobným CSS knihovnám (např. `bold`, `highlighted`, `container`). Proměnná `colors` je vyhrazena pro definice barev.

Pokud není možné pro nějakou část UI definovat styly pomocí `classes`, pak se styly ukládají do proměnné pojmenované po této části (např. `header` pro hlavičku).
