# Vefforritun 2 - Hópverkefni 1
---
## Uppsetning og notkun

* `git clone https://github.com/goh12/vef2-2018-h1.git`
* `npm install`
* Búa til gagnagrunn með gefnu schema
* `npm run seedDB`


* Upplýsingar um hvernig setja skuli upp verkefnið
- Hvernig gagnagrunnur og töflur eru settar upp
- Hvernig gögnum er komið inn í töflur

---
## Dæmi um köll í vefþjónustu
### Þarf líklegast að setja CURL köll hérna en ekki það sem er núna.
```
GET /books
HEADER:
  paginglimit: 10
  pagingoffset: 20
```
```
GET /books?search=butcher
HEADER:
  paginglimit: 10
  pagingoffset: 20
```

```
GET /books/:id
```

```
  POST /books
  request_body:
  {
    "title": "Frozen boiii",
    "isbn13": "8674958674632",
    "author": "Bruvh",
    "description": "Hellos",
    "category": "Hamburger helpers"
  }
```

```
  PATCH /books/:id
  request_body:
  {
    "title": "Frozen boiii 3",
    "isbn13": "8674958674634",
    "author": "Bruvh",
    "description": "Hellos",
    "category": "Hamburger helpers"
  }
```
```
  GET /categories
```

```
  POST /categories
  request_body:
  {
    "name": "Bara ehv"
  }
```

---
## Höfundar
Gunnar Thor Örnólfsson - gto3@hi.is

Guðmundur Óskar Halldórsson - goh12@hi.is

Frosti Grétarsson - frg17@hi.is
