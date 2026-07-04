#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh — Student Management System
# Run from the directory where you want the project folder created.
# Usage: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # exit immediately on any error

PROJECT="student-management-system"

echo ""
echo "🚀  Creating project: $PROJECT"
echo "─────────────────────────────────────────────────────────────"

# ── 0. Create root ────────────────────────────────────────────────────────────
mkdir -p "$PROJECT"
cd "$PROJECT"

# ── 1. docs/ ──────────────────────────────────────────────────────────────────
echo "📄  Creating docs/"
mkdir -p docs
touch docs/01_erd_documentation.md
touch docs/02_uml_class_documentation.md
touch docs/03_use_cases.md
touch docs/04_agile_backlog.md
touch docs/05_api_reference.md

# ── 2. design/ ────────────────────────────────────────────────────────────────
echo "🎨  Creating design/"
mkdir -p design/stitch-exports/student
mkdir -p design/stitch-exports/driver
touch design/DESIGN.md

# ── 3. Frontend — Vite + React + TypeScript ───────────────────────────────────
echo "⚛️   Scaffolding frontend with Vite (React + TypeScript)..."
npm create vite@latest frontend -- --template react-ts

cd frontend
echo "📦  Installing frontend dependencies..."
npm install

echo "📦  Installing Tailwind CSS..."
npm install -D tailwindcss @tailwindcss/vite

echo "📦  Installing routing, HTTP, and state..."
npm install react-router-dom axios @tanstack/react-query zustand

echo "📦  Installing UI utilities..."
npm install clsx lucide-react

echo "🗂️   Creating frontend src/ folder structure..."

# theme/
mkdir -p src/theme
touch src/theme/colors.ts
touch src/theme/typography.ts
touch src/theme/spacing.ts
touch src/theme/tokens.css
touch src/theme/index.ts

# assets/
mkdir -p src/assets

# components/
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/ui

# features/
mkdir -p src/features/auth
mkdir -p src/features/courses
mkdir -p src/features/enrollments
mkdir -p src/features/payments
mkdir -p src/features/rides
mkdir -p src/features/services

# hooks/
mkdir -p src/hooks

# lib/
mkdir -p src/lib

# pages/
mkdir -p src/pages/admin
mkdir -p src/pages/driver
mkdir -p src/pages/student

# routes/
mkdir -p src/routes

# services/ (API layer)
mkdir -p src/services

# store/ (Zustand)
mkdir -p src/store

cd ..   # back to project root

# ── 4. Backend — .NET Clean Architecture ──────────────────────────────────────
echo "🔷  Scaffolding .NET backend (Clean Architecture)..."
mkdir -p backend

cd backend

# Create the solution
dotnet new sln -n StudentManagement

# ── 4a. Domain (no dependencies) ─────────────────────────────────────────────
dotnet new classlib -n StudentManagement.Domain -f net10.0
mkdir -p StudentManagement.Domain/Entities
mkdir -p StudentManagement.Domain/Enums
rm -f StudentManagement.Domain/Class1.cs
dotnet sln StudentManagement.sln add StudentManagement.Domain/StudentManagement.Domain.csproj

# ── 4b. Application (depends on Domain) ──────────────────────────────────────
dotnet new classlib -n StudentManagement.Application -f net10.0
mkdir -p StudentManagement.Application/DTOs
mkdir -p StudentManagement.Application/Interfaces
mkdir -p StudentManagement.Application/Mappings
mkdir -p StudentManagement.Application/Services
mkdir -p StudentManagement.Application/Validators
rm -f StudentManagement.Application/Class1.cs
dotnet sln StudentManagement.sln add StudentManagement.Application/StudentManagement.Application.csproj

# Reference Domain from Application
dotnet add StudentManagement.Application/StudentManagement.Application.csproj \
  reference StudentManagement.Domain/StudentManagement.Domain.csproj

# ── 4c. Infrastructure (depends on Application + Domain) ─────────────────────
dotnet new classlib -n StudentManagement.Infrastructure -f net10.0
mkdir -p StudentManagement.Infrastructure/Data/Configurations
mkdir -p StudentManagement.Infrastructure/Data/Migrations
mkdir -p StudentManagement.Infrastructure/Repositories
rm -f StudentManagement.Infrastructure/Class1.cs
dotnet sln StudentManagement.sln add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj

dotnet add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj \
  reference StudentManagement.Application/StudentManagement.Application.csproj
dotnet add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj \
  reference StudentManagement.Domain/StudentManagement.Domain.csproj

# ── 4d. API (depends on all layers) ──────────────────────────────────────────
dotnet new webapi -n StudentManagement.API -f net10.0 --no-openapi
mkdir -p StudentManagement.API/Controllers
mkdir -p StudentManagement.API/Middleware
dotnet sln StudentManagement.sln add StudentManagement.API/StudentManagement.API.csproj

dotnet add StudentManagement.API/StudentManagement.API.csproj \
  reference StudentManagement.Application/StudentManagement.Application.csproj
dotnet add StudentManagement.API/StudentManagement.API.csproj \
  reference StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj
dotnet add StudentManagement.API/StudentManagement.API.csproj \
  reference StudentManagement.Domain/StudentManagement.Domain.csproj

# ── 4e. NuGet packages ────────────────────────────────────────────────────────
echo "📦  Installing NuGet packages..."

# Infrastructure: EF Core + MSSQL
dotnet add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj \
  package Microsoft.EntityFrameworkCore
dotnet add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj \
  package Microsoft.EntityFrameworkCore.SqlServer
dotnet add StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj \
  package Microsoft.EntityFrameworkCore.Design

# Application: FluentValidation + AutoMapper
dotnet add StudentManagement.Application/StudentManagement.Application.csproj \
  package FluentValidation
dotnet add StudentManagement.Application/StudentManagement.Application.csproj \
  package AutoMapper

# API: JWT Auth + Swagger
dotnet add StudentManagement.API/StudentManagement.API.csproj \
  package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add StudentManagement.API/StudentManagement.API.csproj \
  package Swashbuckle.AspNetCore

# EF tools (for running migrations from CLI)
dotnet add StudentManagement.API/StudentManagement.API.csproj \
  package Microsoft.EntityFrameworkCore.Design

cd ..   # back to project root

# ── 5. Root .gitignore ────────────────────────────────────────────────────────
echo "📝  Writing .gitignore..."
cat > .gitignore << 'EOF'
# ── Node ──────────────────────────────────────────────────────────────────────
node_modules/
dist/
.env
.env.local
.env.*.local

# ── .NET ──────────────────────────────────────────────────────────────────────
backend/**/bin/
backend/**/obj/
backend/**/*.user
backend/**/.vs/
*.suo
*.ncrunch*

# ── macOS ─────────────────────────────────────────────────────────────────────
.DS_Store
.AppleDouble
.LSOverride

# ── IDE ───────────────────────────────────────────────────────────────────────
.vscode/
.idea/
*.swp
EOF

# ── 6. Root README ────────────────────────────────────────────────────────────
cat > README.md << 'EOF'
# Student Management System

## Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** .NET 10 Web API — Clean Architecture
- **Database:** Microsoft SQL Server (MSSQL)
- **ORM:** Entity Framework Core

## Structure
```
.
├── docs/        # ERD, UML, Use Cases, Backlog, API Reference
├── design/      # DESIGN.md tokens, Stitch exports
├── frontend/    # React app
└── backend/     # .NET solution (Domain / Application / Infrastructure / API)
```

## Getting started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet restore
dotnet run --project StudentManagement.API
```
EOF

# ── 7. Done — print tree ──────────────────────────────────────────────────────
echo ""
echo "─────────────────────────────────────────────────────────────"
echo "✅  Done! Project created at: $(pwd)"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Print tree if available, otherwise fallback to find
if command -v tree &> /dev/null; then
  tree -L 4 --dirsfirst -I "node_modules|bin|obj"
else
  find . -not -path "*/node_modules/*" -not -path "*/bin/*" -not -path "*/obj/*" \
    | sort | sed 's|[^/]*/|  |g'
fi
