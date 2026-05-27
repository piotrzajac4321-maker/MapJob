# skills-mode.ps1 - switch active Claude Code skill set for MapJob
#
# Usage:
#   .\skills-mode.ps1                      show current state
#   .\skills-mode.ps1 init                 one-time setup (migrate skills/ -> skills-vault/)
#   .\skills-mode.ps1 off                  disable all skills (max token savings)
#   .\skills-mode.ps1 reklama              activate one category
#   .\skills-mode.ps1 security dev         activate multiple
#
# Categories: reklama, security, dev, qa
# After switching: restart Claude Code to pick up the new skill set.
# New skills: drop them into skills-vault/<category>/ then re-run mode.

[CmdletBinding()]
param(
  [Parameter(Position=0, ValueFromRemainingArguments=$true)]
  [string[]]$Mode
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = $PSScriptRoot
$SkillsDir = Join-Path $ProjectRoot '.claude\skills'
$VaultDir  = Join-Path $ProjectRoot '.claude\skills-vault'

# Skill -> category mapping (edit if you reorganize)
$Mapping = [ordered]@{
  'mapjob-ad-image-prompts'      = 'reklama'
  'mapjob-ad-video-prompts'      = 'reklama'
  'mapjob-b2b-outreach-prep'     = 'reklama'
  'mapjob-phone-sales'           = 'reklama'
  'mapjob-cv-writer'             = 'reklama'

  'mapjob-admin-privesc'         = 'security'
  'mapjob-auth-flow-test'        = 'security'
  'mapjob-chat-security'         = 'security'
  'mapjob-edge-fn-audit'         = 'security'
  'mapjob-geolocation-privacy'   = 'security'
  'mapjob-payload-fuzzer'        = 'security'
  'mapjob-rate-limit-probe'      = 'security'
  'mapjob-rls-audit'             = 'security'
  'mapjob-security-headers'      = 'security'
  'mapjob-storage-security'      = 'security'
  'mapjob-stripe-test'           = 'security'
  'mapjob-xss-scan'              = 'security'

  'frontend-design'              = 'dev'
  'mapjob-cv-builder-ui'         = 'dev'
  'mapjob-ui-design'             = 'dev'

  'mapjob-pwa-offline-test'      = 'qa'
  'mapjob-regression-smoke'      = 'qa'
}

function Test-IsJunction {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $false }
  $item = Get-Item $Path -Force
  return ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -eq [System.IO.FileAttributes]::ReparsePoint
}

function Remove-LinkOrFolder {
  param([string]$Path)
  if (Test-IsJunction $Path) {
    [System.IO.Directory]::Delete($Path, $false)
  } else {
    Remove-Item -Recurse -Force $Path
  }
}

function Clear-Skills {
  if (-not (Test-Path $SkillsDir)) {
    New-Item -ItemType Directory -Path $SkillsDir | Out-Null
    return
  }
  Get-ChildItem -Path $SkillsDir -Directory -Force | ForEach-Object {
    Remove-LinkOrFolder $_.FullName
  }
}

function Show-Status {
  Write-Host ""
  Write-Host "=== Active skills (in $SkillsDir) ===" -ForegroundColor Cyan
  if (Test-Path $SkillsDir) {
    $items = Get-ChildItem -Path $SkillsDir -Directory -Force -ErrorAction SilentlyContinue
    if (-not $items -or $items.Count -eq 0) {
      Write-Host "  (none - all skills disabled)" -ForegroundColor DarkGray
    } else {
      foreach ($item in $items) {
        $marker = if (Test-IsJunction $item.FullName) { '->' } else { '  ' }
        Write-Host "  $marker $($item.Name)"
      }
    }
  } else {
    Write-Host "  (skills/ folder missing - run 'init')" -ForegroundColor Yellow
  }

  Write-Host ""
  Write-Host "=== Vault categories (in $VaultDir) ===" -ForegroundColor Cyan
  if (Test-Path $VaultDir) {
    Get-ChildItem -Path $VaultDir -Directory | ForEach-Object {
      $count = (Get-ChildItem -Path $_.FullName -Directory -ErrorAction SilentlyContinue).Count
      Write-Host ("  {0,-15} ({1} skills)" -f $_.Name, $count)
    }
  } else {
    Write-Host "  (no vault - run 'init' to migrate)" -ForegroundColor Yellow
  }
  Write-Host ""
}

function Invoke-Init {
  if (Test-Path $VaultDir) {
    Write-Host "Vault already exists at $VaultDir - skipping migration." -ForegroundColor Yellow
    return
  }

  Write-Host "Creating vault at $VaultDir..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Path $VaultDir | Out-Null

  $categories = $Mapping.Values | Select-Object -Unique
  foreach ($cat in $categories) {
    New-Item -ItemType Directory -Path (Join-Path $VaultDir $cat) | Out-Null
  }
  New-Item -ItemType Directory -Path (Join-Path $VaultDir 'uncategorized') -ErrorAction SilentlyContinue | Out-Null

  if (Test-Path $SkillsDir) {
    $skills = Get-ChildItem -Path $SkillsDir -Directory
    foreach ($skill in $skills) {
      $cat = $Mapping[$skill.Name]
      if (-not $cat) { $cat = 'uncategorized' }
      $dest = Join-Path (Join-Path $VaultDir $cat) $skill.Name
      Write-Host "  $($skill.Name) -> $cat/" -ForegroundColor Green
      Move-Item -Path $skill.FullName -Destination $dest
    }
  }

  Write-Host ""
  Write-Host "Migration complete. skills/ is now empty (= 0 skill tokens loaded)." -ForegroundColor Green
  Write-Host "Run '.\skills-mode.ps1 <category>' to activate a set."
}

function Set-Activation {
  param([string[]]$Cats)

  if (-not (Test-Path $VaultDir)) {
    Write-Host "Vault not found. Run '.\skills-mode.ps1 init' first." -ForegroundColor Red
    return
  }

  Clear-Skills

  foreach ($cat in $Cats) {
    $catDir = Join-Path $VaultDir $cat
    if (-not (Test-Path $catDir)) {
      $available = (Get-ChildItem $VaultDir -Directory).Name -join ', '
      Write-Warning "Category '$cat' not found. Available: $available"
      continue
    }
    Get-ChildItem -Path $catDir -Directory | ForEach-Object {
      $linkPath = Join-Path $SkillsDir $_.Name
      Write-Host "  -> $($_.Name)" -ForegroundColor Green
      New-Item -ItemType Junction -Path $linkPath -Target $_.FullName | Out-Null
    }
  }

  Write-Host ""
  Write-Host "Done. Restart Claude Code to load new skill set." -ForegroundColor Cyan
}

# --- main ---

if (-not $Mode -or $Mode.Count -eq 0 -or $Mode[0] -eq 'status') {
  Show-Status
  exit 0
}

switch ($Mode[0]) {
  'init' { Invoke-Init; Show-Status; exit 0 }
  'off'  { Clear-Skills; Write-Host "All skills disabled. Restart Claude Code." -ForegroundColor Cyan; exit 0 }
  default { Set-Activation -Cats $Mode }
}
