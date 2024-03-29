﻿# Vefforritun 2 - Hópverkefni 1
---
## Uppsetning og notkun

* `git clone https://github.com/goh12/vef2-2018-h1.git`
* `npm install`
* Búa til gagnagrunn með schema sem gefið er í verkefni.
* `npm run seedDB` (notar process.env.DATABASE_URL)
* npm start


### HEROKU APP: https://vefforritun2-ggf-h1-2018.herokuapp.com/
### HEROKU GIT: https://git.heroku.com/vefforritun2-ggf-h1-2018.git

---
## Dæmi um köll í vefþjónustu
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
  pagingoffset: 0
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

```
  POST /register
  request_body:
  {
	"username": "kalli",
	"password": "123123",
	"name": "kalli Hressi"
  }
```

```
  POST /login
  request_body:
  {
  	"username": "kalli",
  	"password": "123123"
  }
```

```
  GET /users
  HEADER:
    paginglimit: 10
    pagingoffset: 0
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
```

```
  GET /users/me
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
```

```
  PATCH /users/me
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
    request_body:
  {
  	"name": "Jón Hressi",
  	"password": "123123"
  }
```

```
  POST /users/me/read
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
    {
    	"bookid": "5",
    	"userrating": 5,
    	"userreview": "wow, very good book"
    }
```

```
  GET /users/me/read
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
    paginglimit: 10
    pagingoffset: 0
```

```
  GET /users/1/read
  HEADER:
    Content-Type: application/json
    Authorization: bearer {user's token}
    paginglimit: 10
    pagingoffset: 0
```

```
  POST /users/me/profile
  HEADER:
    Authorization: bearer {user's token}
  request_body: multipart/form-data
    FILE | 'profile' | <imagepath>
```

```
  DELETE /users/me/read/6
  HEADER:
    Authorization: bearer {user's token}
```
---
## Höfundar
Gunnar Thor Örnólfsson - gto3@hi.is

Guðmundur Óskar Halldórsson - goh12@hi.is

Frosti Grétarsson - frg17@hi.is
