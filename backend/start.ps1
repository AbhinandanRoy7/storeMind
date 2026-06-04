python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Write-Host "Backend dependencies installed."
Start-Process -NoNewWindow -FilePath ".\venv\Scripts\uvicorn.exe" -ArgumentList "app.main:app", "--port", "8000"
Write-Host "Backend started on port 8000."
