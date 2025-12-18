#!/usr/bin/env pwsh
# Demo script để chạy tất cả tests

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MERN Ecommerce Testing Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"

Write-Host "Test Suite Overview:" -ForegroundColor Yellow
Write-Host "  ✓ Unit Tests (with mocks)" -ForegroundColor White
Write-Host "  ✓ Boundary Value Analysis" -ForegroundColor White
Write-Host "  ✓ Equivalence Partitioning" -ForegroundColor White
Write-Host "  ✓ Integration Tests (API)" -ForegroundColor White
Write-Host "  ✓ E2E Use Case Tests" -ForegroundColor White
Write-Host "  ✓ Performance Tests (K6)" -ForegroundColor White
Write-Host ""

Write-Host "Select test type to run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Unit Tests Only" -ForegroundColor White
Write-Host "  2. Integration Tests" -ForegroundColor White
Write-Host "  3. E2E Tests" -ForegroundColor White
Write-Host "  4. All Backend Tests (Unit + Integration + E2E)" -ForegroundColor White
Write-Host "  5. Performance Tests (requires server running)" -ForegroundColor White
Write-Host "  6. View Test Coverage Report" -ForegroundColor White
Write-Host "  7. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-7)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "🧪 Running Unit Tests..." -ForegroundColor Cyan
        Write-Host "Testing: Auth, Product controllers with mocks" -ForegroundColor Gray
        Write-Host ""
        Set-Location $backendPath
        npm run test:unit
    }
    "2" {
        Write-Host "🔗 Running Integration Tests..." -ForegroundColor Cyan
        Write-Host "Testing: API endpoints with Black-Box techniques" -ForegroundColor Gray
        Write-Host ""
        Set-Location $backendPath
        npm run test:integration
    }
    "3" {
        Write-Host "🎬 Running E2E Tests..." -ForegroundColor Cyan
        Write-Host "Testing: Complete user journeys" -ForegroundColor Gray
        Write-Host ""
        Set-Location $backendPath
        npm run test:e2e
    }
    "4" {
        Write-Host "🚀 Running All Backend Tests..." -ForegroundColor Cyan
        Write-Host ""
        Set-Location $backendPath
        
        Write-Host "[1/3] Unit Tests" -ForegroundColor Yellow
        npm run test:unit
        
        Write-Host ""
        Write-Host "[2/3] Integration Tests" -ForegroundColor Yellow
        npm run test:integration
        
        Write-Host ""
        Write-Host "[3/3] E2E Tests" -ForegroundColor Yellow
        npm run test:e2e
        
        Write-Host ""
        Write-Host "✅ All backend tests completed!" -ForegroundColor Green
    }
    "5" {
        Write-Host "⚡ Running Performance Tests..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check if K6 is installed
        try {
            $null = k6 version 2>&1
        } catch {
            Write-Host "❌ K6 is not installed!" -ForegroundColor Red
            Write-Host "Install K6: choco install k6" -ForegroundColor Yellow
            exit 1
        }
        
        # Check if server is running
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:8080/products" -Method GET -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Server is running" -ForegroundColor Green
        } catch {
            Write-Host "❌ Server is not running on port 8080" -ForegroundColor Red
            Write-Host "Start server: cd backend && npm start" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host ""
        Write-Host "Running Load Test (100-300 concurrent users)..." -ForegroundColor Cyan
        k6 run "$backendPath\tests\performance\load-test.js"
    }
    "6" {
        Write-Host "📊 Opening Coverage Report..." -ForegroundColor Cyan
        
        $coveragePath = Join-Path $backendPath "coverage\lcov-report\index.html"
        
        if (Test-Path $coveragePath) {
            Write-Host "Opening: $coveragePath" -ForegroundColor Gray
            Start-Process $coveragePath
        } else {
            Write-Host "❌ Coverage report not found!" -ForegroundColor Red
            Write-Host "Run tests first to generate coverage report" -ForegroundColor Yellow
            Write-Host "  npm run test:unit" -ForegroundColor Gray
        }
    }
    "7" {
        Write-Host "👋 Goodbye!" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Testing Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Quick Stats:" -ForegroundColor Yellow
Write-Host "  - Test Type: Unit Tests with Mock Dependencies" -ForegroundColor White
Write-Host "  - Techniques: Boundary Value Analysis, Equivalence Partitioning" -ForegroundColor White
Write-Host "  - Coverage Report: backend/coverage/index.html" -ForegroundColor White
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review test results above" -ForegroundColor White
Write-Host "  2. Check coverage report: npm run test:unit" -ForegroundColor White
Write-Host "  3. Run performance tests: .\run-performance-tests.ps1" -ForegroundColor White
Write-Host ""
