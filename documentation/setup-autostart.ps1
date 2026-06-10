# ICT Support Desk - Auto-Start Setup Script
# This script automates the Task Scheduler setup for auto-start on boot
# Run this as Administrator

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ICT Support Desk - Auto-Start Configuration" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Get project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScriptPath = Join-Path $projectRoot "start-server.bat"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host "Start Script: $startScriptPath" -ForegroundColor Yellow
Write-Host ""

# Verify start script exists
if (-not (Test-Path $startScriptPath)) {
    Write-Host "ERROR: start-server.bat not found at $startScriptPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Start script found" -ForegroundColor Green
Write-Host ""

# Define task properties
$taskName = "ICT Support Desk - Auto-Start"
$taskDescription = "Automatically starts ICT Support Desk application on system startup"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Found existing task: $taskName" -ForegroundColor Yellow
    $response = Read-Host "Do you want to replace it? (y/n)"
    
    if ($response -eq "y") {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "✓ Task removed" -ForegroundColor Green
    } else {
        Write-Host "Keeping existing task" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 0
    }
}

Write-Host ""
Write-Host "Creating new scheduled task..." -ForegroundColor Cyan
Write-Host ""

# Create task trigger (At Startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create task action
$action = New-ScheduledTaskAction `
    -Execute $startScriptPath `
    -WorkingDirectory $projectRoot

# Create task settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::FromHours(0)) `
    -RunOnlyIfNetworkAvailable:$false `
    -RestartCount 3 `
    -RestartInterval ([TimeSpan]::FromMinutes(5))

# Create principal (run with highest privileges)
$principal = New-ScheduledTaskPrincipal `
    -UserId (Get-LocalUser $env:USERNAME).SID `
    -LogonType ServiceAccount `
    -RunLevel Highest

# Register the task
try {
    $task = Register-ScheduledTask `
        -TaskName $taskName `
        -Description $taskDescription `
        -Trigger $trigger `
        -Action $action `
        -Principal $principal `
        -Settings $settings `
        -Force

    Write-Host "✓ Task created successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "  Name:        $($task.TaskName)" -ForegroundColor White
    Write-Host "  Enabled:     $($task.Enabled)" -ForegroundColor White
    Write-Host "  Trigger:     At Startup" -ForegroundColor White
    Write-Host "  Script:      $startScriptPath" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ✅ AUTO-START CONFIGURATION COMPLETE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What happens next:" -ForegroundColor Yellow
Write-Host "  1. When you restart your PC, the application will start automatically"
Write-Host "  2. A command window will open for the backend server"
Write-Host "  3. A command window will open for the frontend server"
Write-Host "  4. After ~10 seconds, both will be ready"
Write-Host "  5. Access the app at: http://ict.local:3000"
Write-Host ""
Write-Host "To verify the task:" -ForegroundColor Yellow
Write-Host "  1. Open Task Scheduler (Win+R -> taskschd.msc)"
Write-Host "  2. Look for 'ICT Support Desk - Auto-Start' in the task list"
Write-Host "  3. Right-click -> Properties to modify or disable"
Write-Host ""
Write-Host "To manually test the auto-start:" -ForegroundColor Yellow
Write-Host "  1. Open Task Scheduler"
Write-Host "  2. Find the task in the list"
Write-Host "  3. Right-click -> Run"
Write-Host ""

Read-Host "Press Enter to exit"
