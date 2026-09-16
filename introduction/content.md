---
theme: default
title: Advanced Coding Tools and Methodologies
info: ACTAM · 2026–2027
layout: default
class: dark
colorSchema: light
fonts:
  sans: Arial
  mono: Menlo
  provider: none
drawings:
  persist: false
transition: none
---

# Advanced Coding Tools and Methodologies

2026–2027

## How do we make computers do complex things?

A problem → a model → a program

<!--
Contenuto: La domanda introduce il problema centrale della lezione senza anticipare le definizioni. "Modello" resta da spiegare con un esempio concreto, a cui tornare quando presenterai linguaggi e astrazioni.
Presentazione: Chiedi agli studenti un esempio di software complesso prima di mostrare la sequenza. Usa le risposte per tornare sulle tre parole nel corso della lezione.
-->

---

# In this course

We will get to know some programming languages and the concepts they offer:

<v-clicks>

- expressiveness
- abstraction
- composition
- modeling
- more

</v-clicks>

<!--
Contenuto: La lista ora nomina espressività, astrazione, composizione e modellazione: sono obiettivi coerenti con la domanda iniziale. "More" resta da precisare; potresti aggiungere qui, o anticipare a voce, il legame con suono e musica.
Presentazione: Come seconda slide, la lista funziona da mappa del corso. Quattro concetti astratti di seguito sono molti: associane almeno uno a un esempio concreto prima di proseguire.
-->

---

# Why programming languages?

<v-clicks>

- Programming languages were born/invented to tell computers what to do
- Computers are in fact machines that are able to make many computations (arithetical/logical) in a brief time
- Turns out: there are a lot of things that interest us that can be broken down into simple computations.. Examples:
  - simulating physical systems
    - for playing!
    - for finding out what would happen in certain circumstances (e.g. will the bridge withstand the trucks passing by?)
    - to recreate their functioning while controlling them (e.g. think of a brain simulation! )
    - to create/generate sounds (for instance that of a bell chiming)

</v-clicks>

<!--
Contenuto: Il passaggio dal calcolo agli scopi umani funziona. L'esempio del ponte è concreto; la simulazione del cervello apre invece un tema enorme. L'esempio sonoro collega bene il discorso al corso.
Presentazione: Qui ci sono molte frasi e sottolivelli. Mostrerei un solo caso (per esempio una forma d'onda o una simulazione musicale) e userei gli altri esempi a voce.
-->

---

# Programming at the native level

<v-clicks>

- Important feature: computers are _programmable_: you can tell them what to compute
- But natively, it is hard to program them: the parameters they expose are quite "low level"
  - (wait: "low" level compared to what? we'll find out)
- Ok what does it mean to program a computer at its "native" level?
  - (here we show some assembly? punch cards? circuit with jumpers?)
  - (in particular, circuit with jumper is interesting cause it's similar to how some synths are programmed. Here "difficulty" and "alienity" can serve an artistic purpose, somehow. Why?)

</v-clicks>

<!--
Contenuto: La tensione tra programmabilità e difficoltà è un buon motore narrativo. Conviene però distinguere i livelli: jumper, schede perforate e assembly sono modi diversi di programmare, non un unico "livello nativo". Il parallelo con i synth è promettente se lo rendi concreto.
Presentazione: Una foto o una breve dimostrazione di un solo oggetto sarebbe più efficace dell'elenco di possibilità. La domanda "che cosa rende difficile usarlo?" può guidare la discussione.
-->

---

# More expressive languages

So programming (i.e. determining the computation) of a computer at its native level is hard. So what?

<v-clicks>

- we (humans, computer science nerds) invented *other* forms of expression, that are *closer* to the natural language
- ok what does it mean to be closer to the natural language?
  - for one thing, to use symbols that somehow are closer to our language (e.g. written english)
  - (examples)

</v-clicks>

<!--
Contenuto: Qui introduci la maggiore leggibilità dei linguaggi. Tieni distinta questa proprietà dalla possibilità di costruire astrazioni, che arriva nella slide seguente.
Presentazione: Mostra una stessa istruzione in una forma vicina alla macchina e in una più leggibile; le domande possono guidare il confronto.
-->

---

# What is an abstraction?

<v-clicks>

- but there's another, more important aspect: languages with which we can create *abstractions*
- *abstractions* (ex "ab traho", to "pull out"?) means creating tools, concepts, that represent more complex/new systems in a more maneageable way
- (examples for languages, physics, math, *music*, whatever)
- with abstractions we can extend our language, and get to know/manage more complex concepts/things etc
- some would argue that most of our world is made of abstractions...
- example: a "note" in music is an abstraction that allows us to manage melodies without having to deal with frequencies, pitches, temperaments, etc

</v-clicks>

<!--
Contenuto: È il nucleo concettuale della lezione. L'esempio della nota è vicino agli studenti; preciserei che l'astrazione nasconde alcuni dettagli, senza farli sparire.
Presentazione: La slide ora è separata dalla leggibilità della sintassi. Mostra un esempio visibile di "dare un nome a un concetto" mentre fai apparire i punti.
-->

---
layout: center
---

# Abstractions over computation

Abstractions are super powerful! Programming languages have a special way of letting us create abstractions over computation!

<!--
Contenuto: La conclusione è giusta, ma "special way" resta astratto dopo la lunga preparazione. Un micro-esempio di funzione o strumento musicale creato con il codice darebbe sostanza alla promessa.
Presentazione: La frase singola può funzionare come pausa e punto di svolta. La renderei una tesi breve e memorabile, da lasciare sullo schermo mentre mostri l'esempio a voce.
-->

---

# Why learn programming languages now?

<v-clicks>

- up to 2/3 years ago, there was a very interesting answer: if you knew these tools, you were able to tell a computer what to do, and you were able to create nice artifacts (applications etc). And if you didn't know the languages, you couldn't!
- now as you know this is somehow less and less true: we have powerful tools that can receive descriptions of the program that we want in natural language, and do the programming for us

</v-clicks>

<!--
Contenuto: La domanda è molto attuale e può conquistare chi dubita dell'utilità di imparare a programmare. "Fino a 2/3 anni fa" rischia di datare presto la slide; inoltre il contrasto "prima potevi, ora no" è un po' netto: formulerei la questione come cambiamento del ruolo di chi programma.
Presentazione: Aprirei con la sola domanda e raccoglierei due risposte dagli studenti. Poi farei comparire i due punti, che restano lunghi e probabilmente funzionano meglio come racconto orale.
-->

---

# Other reasons to learn

<v-clicks>

- languages are a fundamental tool to _understand_ complex systems and phenomena. "You can delegate thinking, but you cannot delegate understanding"
- programming languages can be tool for artistic performance! Would pay a ticket to see a robot playing a perfect version of pink floyd's the wall? (here elaborate)
- progamming languages offer new tools for thinking, in the form of abstractions and way to compose them

</v-clicks>

<!--
Contenuto: Le tre ragioni sono forti, ma la prima e la terza si sovrappongono: capire sistemi e pensare con nuove astrazioni potrebbero essere collegate esplicitamente. L'esempio del robot rischia di evocare la riproduzione perfetta più che la performance dal vivo; chiarirei dove entrano scelta, improvvisazione e gesto umano. La citazione avrebbe bisogno di una fonte, se vuoi attribuirla.
Presentazione: Dare a ciascuna ragione un nome corto (capire, creare, esibirsi) renderebbe la slide leggibile. Il confronto robot/musicista può diventare una domanda al pubblico.
-->

---

# Live coding

(Here I show some live coding video)

- [Video 1](https://www.youtube.com/shorts/AJ7atBkisOU)
- [Video 2](https://www.youtube.com/watch?v=yY1FSsUV-8c)

<!--
Contenuto: Il video può trasformare l'idea di performance in un'esperienza concreta. Prima di mostrarlo, definirei che cosa chiedi di osservare: il codice, il suono, le decisioni in tempo reale o la relazione con il pubblico.
Presentazione: I link ora sono cliccabili, ma "Video 1" e "Video 2" non spiegano che cosa si vedrà. Sceglierei un estratto breve, con titolo e una domanda da discutere subito dopo.
-->

---

# Languages and tools

<v-clicks>

- we will learn/get to know some programming languages:
  - python
  - html/css
  - javascript
- we will learn what tools they offer us, and to do what
- we will learn how to build abstractions with them

</v-clicks>

<!--
Contenuto: Sarebbe utile associare a ogni linguaggio un risultato concreto che gli studenti realizzeranno. HTML e CSS andrebbero presentati come linguaggi per struttura e stile, distinguendoli dai linguaggi di programmazione in senso stretto.
Presentazione: Fai apparire prima i linguaggi, poi il tipo di strumenti concettuali che offrono. Gli esempi pratici possono restare a voce per ora.
-->

---

# Sound and music

<v-clicks>

- we will apply these tools/powers to sound and music
  - for instance, to create sounds/tracks etc
- we will do that starting from the lower digital abstraction level (samples), and then move up the abstraction ladder
- we will try to have fun and make music (and noise) on the way
- that's it!

</v-clicks>

<!--
Contenuto: Il percorso dal campione alle astrazioni è una buona promessa didattica. Potresti aggiungere un esempio di suono o brano che gli studenti saranno in grado di creare.
Presentazione: Una "scala" visiva dai campioni agli strumenti musicali farebbe percepire la progressione. Questa slide ora può funzionare come chiusura della panoramica del corso.
-->

---

# Logistics

There will be three instructors:

<v-clicks>

- Francesco Bruschi, myself: we will deal with python, sounds, etc
- Vincenzo Rana will show you how to use some specific language essentialy to build human interfaces
- Andrea Rizzini will help you with tools, practicing, exercising and a lot more

</v-clicks>

<!--
Contenuto: Presentare le persone e i loro ruoli aiuta a orientarsi. Specificare quali linguaggi o attività seguirà Vincenzo eviterebbe la formula vaga "some specific language"; potresti anche chiarire a chi rivolgersi per esercizi e supporto.
Presentazione: Tre nomi con foto e una breve competenza ciascuno sarebbero più facili da ricordare di tre frasi. Il titolo è ora pronto per la versione renderizzata.
-->

---

# Learning by doing

<v-clicks>

- there is a calendar and a site (link)
- We will devote substantial amount of time to try out/experiment with the concepts proposed in the classroom!
- At the end of each lesson (and also during them) I will propose to you little challenges, experiments, jam sessions. We want to put the human side of the experience front and foremost!

</v-clicks>

<!--
Contenuto: Chiudere sulle prove pratiche e sulle jam dà un'identità chiara al corso. Mancano ancora il link a calendario/sito e un'indicazione concreta di che cosa gli studenti faranno nella prima lezione.
Presentazione: Userei questa slide come invito all'azione: un primo mini-esperimento, più un link o QR code per le informazioni pratiche. Un finale concreto lascerebbe più energia di un elenco logistico.
-->
