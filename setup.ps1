# StreamPlatform - Setup Automatico per Windows

# Configurazione console
$Host.UI.RawUI.WindowTitle = "StreamPlatform Setup"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "         StreamPlatform - Setup Automatico (Windows)       " -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

# Funzioni helper
function Print-Info { 
    param($message)
    Write-Host "[INFO] $message" -ForegroundColor Cyan 
}

function Print-Success { 
    param($message)
    Write-Host "[OK] $message" -ForegroundColor Green 
}

function Print-Error { 
    param($message)
    Write-Host "[ERROR] $message" -ForegroundColor Red 
}

function Print-Warning { 
    param($message)
    Write-Host "[WARN] $message" -ForegroundColor Yellow 
}

function Print-Step {
    param($step, $total, $message)
    Write-Host "[Step $step/$total] $message" -ForegroundColor Magenta
}

# Verifica prerequisiti
Print-Info "Verifica prerequisiti..."
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v
    $nodeVersionNumber = $nodeVersion. Substring(1). Split('.')[0]
    
    if ([int]$nodeVersionNumber -lt 18) {
        Print-Error "Node.js >= 18.x richiesto. Versione attuale: $nodeVersion"
        Write-Host "Download da https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
    
    Print-Success "Node.js $nodeVersion trovato"
} catch {
    Print-Error "Node.js non trovato!"
    Write-Host "Installa Node.js >= 18. x da https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Print-Success "npm v$npmVersion trovato"
} catch {
    Print-Error "npm non trovato!"
    exit 1
}

# Check MongoDB (opzionale)
try {
    $null = mongosh --version 2>&1
    Print-Success "MongoDB trovato"
} catch {
    Print-Warning "MongoDB non trovato localmente"
    Write-Host ""
    Write-Host "Opzioni:" -ForegroundColor Yellow
    Write-Host "  1. Installa MongoDB Community da mongodb.com"
    Write-Host "  2. Usa MongoDB Atlas (cloud)"
    Write-Host "  3. Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    Write-Host ""
    
    $continue = Read-Host "Continuare comunque? (y/n)"
    if ($continue -ne "y") {
        Print-Error "Setup annullato"
        exit 1
    }
}

Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# SETUP BACKEND
Print-Step 1 6 "Installazione dipendenze Backend"
Write-Host ""

if (!(Test-Path "backend")) {
    Print-Error "Directory 'backend' non trovata!"
    exit 1
}

Set-Location backend

if (!(Test-Path "package.json")) {
    Print-Error "package.json non trovato in backend/"
    Set-Location ..
    exit 1
}

Print-Info "Installazione dipendenze npm..."
npm install

if ($LASTEXITCODE -ne 0) {
    Print-Error "Errore installazione dipendenze backend"
    Set-Location ..
    exit 1
}

Print-Success "Dipendenze backend installate"
Write-Host ""

# Creazione . env backend
Print-Step 2 6 "Configurazione ambiente Backend"
Write-Host ""

if (Test-Path ".env") {
    Print-Warning "File . env gia esistente, non sovrascritto"
} else {
    Print-Info "Creazione file . env..."
    
    $envContent = "PORT=5000`nNODE_ENV=development`nMONGODB_URI=mongodb://localhost:27017/streamplatform`nLOG_LEVEL=info`nFRONTEND_URL=http://localhost:5173"
    
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Print-Success "File .env backend creato"
}

Write-Host ""

# Setup Database
Print-Step 3 6 "Setup Database e Indici"
Write-Host ""

Print-Info "Creazione collections e indici MongoDB..."
try {
    npm run setup:db
    Print-Success "Database configurato con successo"
} catch {
    Print-Warning "Errore setup database (potrebbe essere gia configurato)"
}

Write-Host ""

Set-Location ..

# SETUP FRONTEND
Print-Step 4 6 "Installazione dipendenze Frontend"
Write-Host ""

if (!(Test-Path "frontend")) {
    Print-Error "Directory 'frontend' non trovata!"
    exit 1
}

Set-Location frontend

if (!(Test-Path "package.json")) {
    Print-Error "package.json non trovato in frontend/"
    Set-Location ..
    exit 1
}

Print-Info "Installazione dipendenze npm..."
npm install

if ($LASTEXITCODE -ne 0) {
    Print-Error "Errore installazione dipendenze frontend"
    Set-Location ..
    exit 1
}

Print-Success "Dipendenze frontend installate"
Write-Host ""

# Creazione .env frontend
Print-Step 5 6 "Configurazione ambiente Frontend"
Write-Host ""

if (Test-Path ".env") {
    Print-Warning "File .env gia esistente, non sovrascritto"
} else {
    Print-Info "Creazione file .env..."
    
    $envContent = "VITE_API_URL=http://localhost:5000/api"
    
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Print-Success "File . env frontend creato"
}

Write-Host ""

Set-Location ..

# SEEDER DATI
Print-Step 6 6 "Generazione dati di esempio"
Write-Host ""

Print-Info "Il seeder generera:"
Write-Host "  - 500 contenuti (film e serie TV)"
Write-Host "  - 5000 valutazioni distribuite realisticamente"
Write-Host "  - 200 utenti simulati"
Write-Host ""

$seedData = Read-Host "Vuoi generare i dati di esempio? (y/n)"

if ($seedData -eq "y") {
    Print-Info "Generazione dataset in corso..."
    Set-Location backend
    
    try {
        npm run seed
        Print-Success "Dataset generato con successo!"
    } catch {
        Print-Error "Errore generazione dati"
    }
    
    Set-Location ..
} else {
    Print-Warning "Generazione dati saltata"
}

Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# RIEPILOGO
Print-Success "Setup completato con successo!"
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "              Installazione Completata!                      " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Per avviare l'applicazione:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Opzione A: Avvio Automatico (2 finestre)" -ForegroundColor Yellow
Write-Host "  Premi 'A' per avviare automaticamente"
Write-Host ""
Write-Host "  Opzione M: Avvio Manuale" -ForegroundColor Yellow
Write-Host "  Terminale 1 - Backend:" -ForegroundColor White
Write-Host "    cd backend"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "  Terminale 2 - Frontend:" -ForegroundColor White
Write-Host "    cd frontend"
Write-Host "    npm run dev"
Write-Host ""

Write-Host "Una volta avviato, accedi a:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor Green
Write-Host "  Health:      http://localhost:5000/health" -ForegroundColor Green
Write-Host ""

# AVVIO AUTOMATICO
$startNow = Read-Host "Vuoi avviare l'applicazione ora? (a=auto, m=manuale, n=no)"

if ($startNow -eq "a" -or $startNow -eq "A") {
    Write-Host ""
    Print-Info "Avvio applicazione in modalita automatica..."
    Write-Host ""
    
    # Crea directory logs
    if (!(Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    # Avvia backend
    Print-Info "Avvio Backend (porta 5000)..."
    $backendPath = Join-Path $PWD "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"
    
    Start-Sleep -Seconds 4
    
    # Avvia frontend
    Print-Info "Avvio Frontend (porta 5173)..."
    $frontendPath = Join-Path $PWD "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Print-Success "Applicazione avviata!"
    Write-Host ""
    Print-Info "Apertura browser..."
    Start-Sleep -Seconds 2
    
    Start-Process "http://localhost:5173"
    
    Write-Host ""
    Write-Host "StreamPlatform e ora in esecuzione!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Suggerimenti:" -ForegroundColor Cyan
    Write-Host "  - Frontend: http://localhost:5173"
    Write-Host "  - Premi Ctrl+C nelle finestre dei server per fermarli"
    Write-Host ""
    
} elseif ($startNow -eq "m" -or $startNow -eq "M") {
    Write-Host ""
    Print-Info "Modalita manuale selezionata"
    Write-Host ""
    Write-Host "Apri 2 terminali PowerShell e esegui:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminale 1:" -ForegroundColor Cyan
    Write-Host "  cd backend"
    Write-Host "  npm run dev"
    Write-Host ""
    Write-Host "Terminale 2:" -ForegroundColor Cyan
    Write-Host "  cd frontend"
    Write-Host "  npm run dev"
    Write-Host ""
} else {
    Write-Host ""
    Print-Info "Puoi avviare l'applicazione in seguito con i comandi sopra"
    Write-Host ""
}