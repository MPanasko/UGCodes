[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/YHP28YxV)
# Zadanie: Ekologia

| Termin oddania | Punkty     |
|----------------|:-----------|
|  31.05.2024 23:00 |   20        |

--- 
Przekroczenie terminu o **n** zajęć wiąże się z karą:
- punkty uzyskania za realizację zadania są dzielone przez **2<sup>n</sup>**.

--- 
W katalogu `begin` znajduje się definicja świata, w którym rządzą następujące zasady:
* świat jest płaski i posiada wysokość i szerokość
* każdy organizm na świecie posiada: 
    * `power`: zwiększa się co jedną turę o 1; decyduje o sile organizmu
    * `initiative`: priorytet decyduje o  kolejności wykonania ruchu w ramach jednej tury
    * `position`: położenie w świecie
    * `liveLength`: liczba tur do końca życia
    * `powerToReproduce`: granica dolna siły, powyżej której może się rozmnażać; po rozmnożeniu traci połowę siły
    * `sign`: znak reprezentujący organizm w świecie
    * `world`: świat, w którym żyje organizm
* jedynymi organizmemi żyjącym na świecie jest trawa i owca.

## Ryś [6 pkt]
Bazując na definicji zwierzęcia dodać rysia, który posiada następujące atrubuty:
* `power = 6`
* `initiative = 5`
* `liveLength = 18`
* `powerToReproduce = 14`
* `sign = 'R'`


## Antylopa [6 pkt]
Dodać antylopę, która zachowuje się jak owca, z tym, że jeżeli w jej otoczeniu pojawi Ryś, to ucieka od niego o dwa pola (kierunek odwrotny do występowania rysia), jeżeli ucieczka nie jest możliwa, atakuje rysia.
* `power = 4`
* `initiative = 3`
* `liveLength = 11`
* `powerToReproduce = 5`
* `sign = 'A'`


## Plaga [4 pkt]
Dodaj możliwość włączenia trybu plagii, który powoduje skrócenie życia wszystkim organizmów o połowę. Plaga działa tylko dwie tury i nie powoduje zmian w dalszych pokoleniach organizów.

## Dodanie organizmu [4 pkt]
Zaimplementować możliwość dodania po dowolnej turze dowolnego nowego organizmu na dowolne wolne pole.

## Uwaga
Do każdej dodawanej nowej funkcjonalności napisać odpowiednie testy jednostkowe.

