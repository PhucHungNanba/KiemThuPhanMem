#!/usr/bin/env pwsh
# Demo script để chạy performance tests

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   MERN Ecommerce - Performance Test Demo" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra K6 đã cài chưa
Write-Host "[1/4] Checking K6 installation..." -ForegroundColor Yellow
try {
    $k6Version = k6 version 2>&1
    Write-Host "✅ K6 is installed: $k6Version" -ForegroundColor Green
} catch {
    Write-Host "❌ K6 is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install K6:" -ForegroundColor Yellow
    Write-Host "  Windows (Chocolatey): choco install k6" -ForegroundColor White
    Write-Host "  Windows (MSI): https://dl.k6.io/msi/k6-latest-amd64.msi" -ForegroundColor White
    Write-Host "  macOS: brew install k6" -ForegroundColor White
    Write-Host "  Linux: sudo apt-get install k6" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[2/4] Checking if backend server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/products" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend server is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend server is not running on port 8080" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    
    # Start backend in background
    $backendPath = Join-Path $PSScriptRoot "backend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $backendPath -NoNewWindow
    
    Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/products" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Backend server started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start backend server" -ForegroundColor Red
        Write-Host "Please start backend manually: cd backend && npm start" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "[3/4] Available Performance Tests:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Load Test       - 100-300 concurrent users (5 min)" -ForegroundColor White
Write-Host "  2. Stress Test     - Up to 500 users (9 min)" -ForegroundColor White
Write-Host "  3. Spike Test      - Sudden traffic surge (2.5 min)" -ForegroundColor White
Write-Host "  4. Run All Tests   - Complete performance suite" -ForegroundColor White
Write-Host "  5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select test to run (1-5)"

Write-Host ""
Write-Host "[4/4] Running performance test..." -ForegroundColor Yellow
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"

switch ($choice) {
    "1" {
        Write-Host "🚀 Running Load Test (100-300 users)..." -ForegroundColor Cyan
        k6 run "$backendPath\tests\performance\load-test.js"
    }
    "2" {
        Write-Host "🚀 Running Stress Test (up to 500 users)..." -ForegroundColor Cyan
        k6 run "$backendPath\tests\performance\stress-test.js"
    }
    "3" {
        Write-Host "🚀 Running Spike Test..." -ForegroundColor Cyan
        k6 run "$backendPath\tests\performance\spike-test.js"
    }
    "4" {
        Write-Host "🚀 Running All Performance Tests..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1/3 - Load Test" -ForegroundColor Yellow
        k6 run "$backendPath\tests\performance\load-test.js"
        Write-Host ""
        Write-Host "2/3 - Stress Test" -ForegroundColor Yellow
        k6 run "$backendPath\tests\performance\stress-test.js"
        Write-Host ""
        Write-Host "3/3 - Spike Test" -ForegroundColor Yellow
        k6 run "$backendPath\tests\performance\spike-test.js"
    }
    "5" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Performance Test Completed!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reports generated:" -ForegroundColor Green
Write-Host "  - performance-summary.json" -ForegroundColor White
Write-Host "  - performance-report.html" -ForegroundColor White
Write-Host ""
