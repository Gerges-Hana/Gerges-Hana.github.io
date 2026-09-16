# Builds a deploy-ready folder (dist-deploy) for static hosts like Cloudflare Pages or Netlify.
param(
    [switch]$Lite
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root "dist-deploy"
$maxFileBytes = 25MB

$essentialRootFiles = @("index.html", "project.html", "_redirects", "Full Stack PHP Laravel Developer.pdf")
$legacyRootFiles = @(
    "Borkan.html", "monazama.html", "mute.html", "Sales_Representative.html",
    "store.html", "ymama.html", "TodoList_Node_Quasar.html", "contact.php",
    "netlify.toml", "README.md", "uploade update"
)
$essentialImgFiles = @(
    "favicon.png", "favicon2.png", "apple-touch-icon.png", "gerges.png", "g logo.png"
)

function ShouldSkipFile {
    param(
        [System.IO.FileInfo]$File,
        [string]$RelativePath
    )

    if ($File.Length -gt $maxFileBytes) {
        return $true
    }

    if ($File.Extension -eq ".map") {
        return $true
    }

    if ($Lite) {
        if ($RelativePath -like "projects\*") {
            if ($RelativePath -notlike "projects\*\thumbs\*" -and $RelativePath -notlike "projects\*\medium\*") {
                return $true
            }
        }

        if ($RelativePath -like "assets\img\*") {
            $name = $File.Name
            if ($essentialImgFiles -contains $name) {
                return $false
            }
            if ($RelativePath -like "assets\img\assets\img\*") {
                return $false
            }
            return $true
        }
    }

    return $false
}

function Copy-DeployTree {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$RelativePrefix = ""
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null

    Get-ChildItem -Path $Source -Force | ForEach-Object {
        $relativePath = if ($RelativePrefix) { "$RelativePrefix\$($_.Name)" } else { $_.Name }
        $target = Join-Path $Destination $_.Name

        if ($_.PSIsContainer) {
            if ($Lite -and $relativePath -eq "assets\img") {
                Copy-LiteAssetsImg -Source $_.FullName -Destination $target
                return
            }

            if ($Lite -and $relativePath -eq "projects") {
                Copy-LiteProjects -Source $_.FullName -Destination $target
                return
            }

            Copy-DeployTree -Source $_.FullName -Destination $target -RelativePrefix $relativePath
            return
        }

        if (ShouldSkipFile -File $_ -RelativePath $relativePath) {
            if ($_.Length -gt $maxFileBytes) {
                Write-Warning ("Skipped large file ({0:N2} MB): {1}" -f ($_.Length / 1MB), $_.FullName)
            }
            return
        }

        Copy-Item -Path $_.FullName -Destination $target -Force
    }
}

function Copy-LiteProjects {
    param(
        [string]$Source,
        [string]$Destination
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null

    Get-ChildItem -Path $Source -Directory | ForEach-Object {
        $projectOut = Join-Path $Destination $_.Name
        New-Item -ItemType Directory -Path $projectOut -Force | Out-Null

        foreach ($sub in @("thumbs", "medium")) {
            $subSource = Join-Path $_.FullName $sub
            if (Test-Path $subSource) {
                Copy-DeployTree -Source $subSource -Destination (Join-Path $projectOut $sub) -RelativePrefix ("projects\{0}\{1}" -f $_.Name, $sub)
            }
        }
    }
}

function Copy-LiteAssetsImg {
    param(
        [string]$Source,
        [string]$Destination
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null

    Get-ChildItem -Path $Source -File | ForEach-Object {
        if ($essentialImgFiles -contains $_.Name -and $_.Length -le $maxFileBytes) {
            Copy-Item $_.FullName (Join-Path $Destination $_.Name) -Force
        }
    }

    $nested = Join-Path $Source "assets\img"
    if (Test-Path $nested) {
        $nestedOut = Join-Path $Destination "assets\img"
        New-Item -ItemType Directory -Path $nestedOut -Force | Out-Null
        Get-ChildItem -Path $nested -File | ForEach-Object {
            if ($_.Length -le $maxFileBytes) {
                Copy-Item $_.FullName (Join-Path $nestedOut $_.Name) -Force
            }
        }
    }
}

if (Test-Path $out) {
    Remove-Item $out -Recurse -Force
}

New-Item -ItemType Directory -Path $out | Out-Null

$excludeDirs = @(".git", "dist-deploy", "vendor", "scripts", "node_modules", "tools", "forms", "config")
$excludeFiles = @(
    ".gitignore",
    "composer.json",
    "composer.lock",
    "gerges.png",
    "gerges-portfolio-deploy.zip",
    "gerges-portfolio-lite.zip",
    "gerges-site.zip"
)

Get-ChildItem -Path $root -Force | ForEach-Object {
    if ($_.PSIsContainer) {
        if ($excludeDirs -contains $_.Name) {
            return
        }
        Copy-DeployTree -Source $_.FullName -Destination (Join-Path $out $_.Name) -RelativePrefix $_.Name
        return
    }

    if ($excludeFiles -contains $_.Name) {
        return
    }

    if ($Lite) {
        if ($legacyRootFiles -contains $_.Name) {
            return
        }
        if ($essentialRootFiles -notcontains $_.Name) {
            if ($_.Extension -in @(".pdf", ".html", ".php")) {
                return
            }
        }
    }

    if (ShouldSkipFile -File $_ -RelativePath $_.Name) {
        if ($_.Length -gt $maxFileBytes) {
            Write-Warning ("Skipped large file ({0:N2} MB): {1}" -f ($_.Length / 1MB), $_.FullName)
        }
        return
    }

    Copy-Item -Path $_.FullName -Destination (Join-Path $out $_.Name) -Force
}

$mailConfigOut = Join-Path $out "assets\js\mail.config.js"
$accessKey = $env:WEB3FORMS_ACCESS_KEY

if (-not $accessKey) {
    $localConfig = Join-Path $root "assets\js\mail.config.js"
    if (Test-Path $localConfig) {
        Copy-Item $localConfig $mailConfigOut -Force
    } else {
        Copy-Item (Join-Path $root "assets\js\mail.config.example.js") $mailConfigOut -Force
        Write-Warning "mail.config.js was not found. Using example file - set WEB3FORMS_ACCESS_KEY or edit assets/js/mail.config.js before deploy."
    }
} else {
    $mailContent = 'window.WEB3FORMS_ACCESS_KEY = "' + $accessKey + '";'
    Set-Content -Path $mailConfigOut -Value $mailContent -Encoding UTF8
}

$largeRemaining = Get-ChildItem $out -Recurse -File | Where-Object { $_.Length -gt $maxFileBytes }
if ($largeRemaining) {
    throw "Deploy folder still contains files larger than 25 MB."
}

$fileCount = (Get-ChildItem $out -Recurse -File).Count
$sizeMb = [math]::Round(((Get-ChildItem $out -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 2)
$modeLabel = if ($Lite) { "LITE (fast upload)" } else { "FULL" }

$zipPath = Join-Path $root "gerges-site.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem $out -Recurse -File | ForEach-Object {
        $entryName = $_.FullName.Substring($out.Length + 1).Replace("\", "/")
        if ($entryName -eq "gerges-site.zip") {
            return
        }
        [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName)
    }
} finally {
    $zip.Dispose()
}

$zipMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Host ("Deploy folder ready [{0}]: {1}" -f $modeLabel, $out)
Write-Host ("Files: {0} | Size: {1} MB" -f $fileCount, $sizeMb)
Write-Host ("Zip ready: {0} ({1} MB)" -f $zipPath, $zipMb)
Write-Host "Upload gerges-site.zip to Cloudflare Pages (recommended) or Netlify Drop."
