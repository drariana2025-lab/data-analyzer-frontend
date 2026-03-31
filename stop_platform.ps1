# Скрипт остановки Платформы Аналитики
Write-Host "Остановка работы бэкенда и фронтенда..." -ForegroundColor Yellow

# Принудительное закрытие всех процессов Python и Node
taskkill /F /IM python.exe /T 2>$null
taskkill /F /IM node.exe /T 2>$null

Write-Host "Платформа успешно остановлена! Все скрытые процессы закрыты." -ForegroundColor Green
Start-Sleep -Seconds 3
