# 🎬 StreamPlatform

### Sistema Avanzato di Gestione Contenuti Multimediali con Analytics

Una piattaforma full-stack completa per la gestione di contenuti streaming (film e serie TV) con sistema di valutazioni utenti, statistiche in tempo reale e pipeline di aggregazione MongoDB ottimizzate.

---

## Caratteristiche

#### Gestione Contenuti
- ✅ **CRUD completo** per contenuti multimediali
- ✅ **Informazioni dettagliate**: titolo, anno, durata, genere, cast, descrizione
- ✅ **Ricerca avanzata**: full-text search, filtri per genere e attore
- ✅ **Validazione** robusta con Joi
- ✅ **Paginazione** efficiente

#### Sistema di Valutazioni
- ✅ **Rating 1-5 stelle** con commenti
- ✅ **Aggiornamento automatico** statistiche contenuti
- ✅ **Vincolo di unicità** (1 valutazione per utente/contenuto)
- ✅ **Storico completo** valutazioni
- ✅ **Denormalizzazione** per performance ottimali

#### Analytics e Reportistica
- ✅ **Dashboard KPI** in tempo reale
- ✅ **Pipeline di eccellenza**: contenuti con rating ≥ 4.5 e ≥ 100 recensioni
- ✅ **Statistiche per genere**: aggregazioni avanzate
- ✅ **Top attori** in contenuti di qualità
- ✅ **Trend temporali** valutazioni
- ✅ **Grafici interattivi** con Chart.js

## Caratteristiche Tecniche

#### Backend
- 🔹 **Architettura a layer**: Repository → Service → Controller
- 🔹 **Pattern**: Repository Pattern, Service Layer, DTO
- 🔹 **Validazione centralizzata** con Joi
- 🔹 **Error handling** globale
- 🔹 **Logging strutturato** con Winston
- 🔹 **Rate limiting** e sicurezza (Helmet, CORS)
- 🔹 **Compression** automatica risposte
- 🔹 **Indexing strategico** MongoDB

#### Frontend
- 🔹 **React 18** con hooks moderni
- 🔹 **Vite** per build ultrarapidi
- 🔹 **Tailwind CSS** per UI responsive
- 🔹 **React Router** per SPA navigation
- 🔹 **Axios** con interceptors
- 🔹 **React Hot Toast** per notifiche
- 🔹 **Chart.js** per visualizzazioni

---

## Stack Tecnologico

### Backend
| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18+ | Web framework |
| **MongoDB** | 6+ | Database NoSQL |
| **Mongoose** | 8+ | ODM per MongoDB |
| **Joi** | 17+ | Validazione dati |
| **Winston** | 3.11+ | Logging |
| **Helmet** | 7+ | Sicurezza HTTP headers |
| **Morgan** | 1.10+ | HTTP request logger |

### Frontend
| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **React** | 18. 2+ | UI library |
| **Vite** | 5+ | Build tool |
| **React Router** | 6. 20+ | Routing |
| **Tailwind CSS** | 3.3+ | CSS framework |
| **Axios** | 1.6+ | HTTP client |
| **Chart.js** | 4.4+ | Grafici |
| **React Icons** | 4.12+ | Icon library |

### Tools
- **@faker-js/faker**: Generazione dati realistici
- **Nodemon**: Auto-reload development
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

---

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** ≥ 18.0. 0 ([Download](https://nodejs.org))
- **MongoDB** ≥ 6.0 ([Download](https://www.mongodb.com/try/download/community))
- **npm** ≥ 9.0.0 (incluso con Node.js)
- **Git** (opzionale, per clonare il repo)

---

## Installazione

```bash
# 1. Clona o scarica il progetto
git clone https://github.com/your-username/streamplatform.git
cd streamplatform

# 2. Esegui lo script
./setup.ps1
```

Lo script **automaticamente**:
- ✅ Verifica prerequisiti (Node.js, MongoDB)
- ✅ Installa dipendenze backend e frontend
- ✅ Crea file `. env` con configurazioni di default
- ✅ Configura database e crea indici ottimizzati
- ✅ (Opzionale) Genera 500 contenuti e 5000 valutazioni
- ✅ (Opzionale) Avvia l'applicazione

---

### Struttura

```
streamplatform/
├── backend/
│   ├── src/
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routes
│   │   ├── validators/        # Joi validation schemas
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utilities (logger)
│   │   ├── scripts/           # Setup & seed scripts
│   │   └── server.js          # Entry point
│   ├── logs/                  # Application logs
│   ├── package.json
│   ├── .env. example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ... 
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ContentList.jsx
│   │   │   ├── ContentDetail. jsx
│   │   │   ├── ContentForm.jsx
│   │   │   ├── Ratings.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/          # API client
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss. config.js
│
├── setup.ps1                   # Setup automatico
├── README.md
├── LICENSE
└── .gitignore
```

---

##  Anteprima

### Setup + Avvio del Progetto
![](images/anteprima.gif)

---

##  Funzionalità

##### Dashboard
- Visualizza KPI (totale contenuti, valutazioni, media globale)
- Grafici distribuzione voti
- Top 10 contenuti più votati
- Ultime valutazioni

##### Gestione Contenuti
- **Lista**: Visualizza tutti i contenuti con filtri e ordinamento
- **Ricerca**: Full-text search per titolo/descrizione
- **Filtri**: Per genere, attore
- **Crea**: Aggiungi nuovo film/serie
- **Modifica**: Aggiorna informazioni esistenti
- **Elimina**: Rimuovi contenuto

##### Dettaglio Contenuto
- Informazioni complete
- Rating medio e numero recensioni
- Lista valutazioni utenti
- Aggiungi nuova valutazione

##### Analytics
- **Pipeline di Eccellenza**: Contenuti rating ≥ 4.5 con ≥ 100 recensioni
- **Statistiche per Genere**: Grafici e tabelle
- **Top Attori**: Attori più presenti in contenuti di qualità
- **Contenuti Popolari**: Ordinati per numero recensioni

---

## Autore

- Jhoseph Baskara

## Licenza

Questo progetto è rilasciato sotto licenza MIT.  
Consulta il file [`LICENSE`](LICENSE) per maggiori dettagli.
