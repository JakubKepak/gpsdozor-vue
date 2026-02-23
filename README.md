# GPSDozor — Fleet Management Dashboard

Nasazeno na https://gpsdozor-vue.vercel.app/

## Pro koho a proč

Appka je postavená pro fleet managery malých a středních firem, kteří potřebují mít přehled o vozovém parku na jednom místě.

## AI nástroje a workflow

Celý projekt vznikl v párové spolupráci s Claude Code. K prvotnímu návrhu jsem použil Figmu a její AI tooling.

Pro práci používám převážne skilly a commandy. Workflow je následující:
Planning - implementace - review - commit.
Nepodceňuji fázi planingu. Čím lépe a přesněji je specifikovaný a rozpadnutý plán na jednotlivé kroky, tím přesnější je pak výsledek implementace. Před každým commitem je spuštěn code-review agent.

V samotné appce je pak použito Gemini 2.5 Flash pro AI chat a AI analýzu. Je tam použitý free plán, takže jen 20 requestů za den.

## Na co jsem narazil

CORS - vyřešeno vercel edge funkcí. Dalo by se vyřešit i jednoduchým BE, vercel edge funkce mi přišla v tomhle případě elegantnější. Lokálně nastavením proxy ve vite.

## Co bych udělal s víc času

V rámci ukázky práce jsem nepoužil všechny endpointy. Chybí implementace úpravy stavu vozidla, změny tankovacích karet.
