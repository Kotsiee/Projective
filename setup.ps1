# ===============================================
# 🚀 PROJECTIVE MONOREPO SETUP SCRIPT (PowerShell)
# ===============================================

# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Creating Projective folder structure..." -ForegroundColor Cyan

# Root
New-Item -ItemType Directory -Force -Path "projective" | Out-Null
Set-Location "projective"

# 1. Top Level
mkdir "apps"
mkdir "packages"
mkdir "db"
mkdir "supabase"
mkdir "infra"
mkdir "docs"
mkdir "scripts"

# Core configs
New-Item -ItemType File -Force -Path ".env.example", "README.md", "LICENSE", "deno.json", "import_map.json" | Out-Null

# 2. Fresh App
mkdir "apps\web\routes"
mkdir "apps\web\routes\(public)"
mkdir "apps\web\routes\(auth)"
mkdir "apps\web\routes\(dashboard)"
mkdir "apps\web\routes\api\v1"
mkdir "apps\web\islands"
mkdir "apps\web\components"
mkdir "apps\web\features"
mkdir "apps\web\server"
mkdir "apps\web\services"
mkdir "apps\web\styles"
mkdir "apps\web\types"
mkdir "apps\web\tests"
mkdir "apps\web\static"

# Example placeholder
"import { Handlers } from '$fresh/server.ts';" | Out-File "apps\web\routes\_app.tsx"
"export default function App() { return <div>Projective App</div> }" | Add-Content "apps\web\routes\_app.tsx"

# 3. Shared Packages
mkdir "packages\ui"
mkdir "packages\lib"
mkdir "packages\sdk"
mkdir "packages\wasm"
mkdir "packages\wasm\image_ops"

"// Shared UI components" | Out-File "packages\ui\README.md"
"// Shared TypeScript utilities" | Out-File "packages\lib\README.md"
"// Typed SDK client" | Out-File "packages\sdk\README.md"
"// Rust crate placeholder" | Out-File "packages\wasm\image_ops\README.md"

# 4. Database
mkdir "db\migrations"
mkdir "db\policies"
mkdir "db\functions"
mkdir "db\views"
mkdir "db\seeds"
mkdir "db\scripts"

# Policy schema subfolders
mkdir "db\policies\org"
mkdir "db\policies\projects"
mkdir "db\policies\comms"
mkdir "db\policies\finance"
mkdir "db\policies\marketplace"
mkdir "db\policies\storage"

# Example files
New-Item -ItemType File -Path "db\migrations\0001_init_schemas.sql", "db\migrations\0002_org_tables.sql", "db\migrations\0003_projects_tables.sql", "db\migrations\0009_rls_enable.sql" | Out-Null
"-- Example RLS policy" | Out-File "db\policies\org\attachments.sql"
"-- Example SQL function" | Out-File "db\functions\auth_project_or_dm_participant.sql"
"-- Example materialized view" | Out-File "db\views\analytics_earnings_by_stage_mv.sql"

# Scripts
"#!/bin/bash" | Out-File "db\scripts\dump.sh" -Encoding utf8
Copy-Item "db\scripts\dump.sh" "db\scripts\restore.sh" -Force
Copy-Item "db\scripts\dump.sh" "db\scripts\diff.sh" -Force

# 5. Supabase Config
mkdir "supabase\config"
mkdir "supabase\storage-rules"
mkdir "supabase\edge-functions"

"# Supabase config placeholder" | Out-File "supabase\config\README.md"
"# Storage rules placeholder" | Out-File "supabase\storage-rules\README.md"
"# Edge functions placeholder" | Out-File "supabase\edge-functions\README.md"

# 6. Infra
mkdir "infra\deno"
mkdir "infra\cf"
mkdir "infra\stripe"
mkdir "infra\github"

"# Deno deploy config" | Out-File "infra\deno\README.md"
"# Cloudflare worker setup" | Out-File "infra\cf\README.md"
"# Stripe webhook tools" | Out-File "infra\stripe\README.md"
"# GitHub Actions workflows" | Out-File "infra\github\README.md"

# 7. Docs
mkdir "docs\architecture"
mkdir "docs\api"
mkdir "docs\product"

"# Architecture Decision Records" | Out-File "docs\architecture\README.md"
"# API documentation" | Out-File "docs\api\README.md"
"# Product documentation" | Out-File "docs\product\README.md"

# 8. Scripts & Tasks
"#!/bin/bash" | Out-File "scripts\setup.sh"
"#!/bin/bash" | Out-File "scripts\dev.sh"
"#!/bin/bash" | Out-File "scripts\test.sh"

# 9. Deno Config
@'
{
  "tasks": {
    "dev": "deno task -q _dev",
    "_dev": "deno run -A --watch=routes,islands,components apps/web/main.ts",
    "test": "deno test -A --fail-fast",
    "fmt": "deno fmt",
    "lint": "deno lint"
  }
}
'@ | Out-File "deno.json" -Encoding utf8

# 10. Import Map
@'
{
  "imports": {
    "@/": "./apps/web/",
    "@ui/": "./packages/ui/",
    "@lib/": "./packages/lib/",
    "@sdk/": "./packages/sdk/"
  }
}
'@ | Out-File "import_map.json" -Encoding utf8

# 11. Initialize Git
git init | Out-Null
"node_modules/
.env
supabase/.branches/
dist/
coverage/" | Out-File ".gitignore" -Encoding utf8
git add .
git commit -m "chore: initial monorepo scaffold" | Out-Null

Write-Host ""
Write-Host "✅ Projective monorepo created successfully!" -ForegroundColor Green
Write-Host "Open in VS Code with: code ." -ForegroundColor Cyan
