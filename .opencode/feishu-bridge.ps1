param(
  [ValidateSet("start", "stop", "restart", "status")]
  [string]$Action = "status"
)

$bridgeJs = "C:\Users\胖丁会唱歌\AppData\Roaming\npm\node_modules\opencode-feishu-bridge\bin\opencode-feishu-start.js"
$logDir = "$env:TEMP"
$logFile = "$logDir\feishu-bridge.log"
$errFile = "$logDir\feishu-bridge.err"
$pidFile = "$logDir\feishu-bridge.pid"

function Get-BridgeProcess {
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "opencode-feishu-start"
  }
}

switch ($Action) {
  "start" {
    $existing = Get-BridgeProcess
    if ($existing) {
      Write-Host "Feishu bridge 已在运行 (PID: $($existing.ProcessId))"
      return
    }
    $job = Start-Process -FilePath "node" -ArgumentList $bridgeJs -WindowStyle Hidden -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $errFile
    $job.Id | Set-Content -Path $pidFile
    Write-Host "Feishu bridge 已启动 (PID: $($job.Id))"
    Write-Host "日志: $logFile"
    Write-Host "错误: $errFile"
  }
  "stop" {
    $proc = Get-BridgeProcess
    if ($proc) {
      Stop-Process -Id $proc.ProcessId -Force
      Write-Host "Feishu bridge 已停止"
    } else {
      Write-Host "Feishu bridge 未运行"
    }
    if (Test-Path $pidFile) { Remove-Item $pidFile }
  }
  "restart" {
    & $PSCommandPath stop
    Start-Sleep -Seconds 2
    & $PSCommandPath start
  }
  "status" {
    $proc = Get-BridgeProcess
    if ($proc) {
      Write-Host "Feishu bridge 运行中 (PID: $($proc.ProcessId))"
      if (Test-Path $logFile) {
        Write-Host "日志 ($((Get-Item $logFile).Length / 1KB -as [int]) KB): $logFile"
      }
    } else {
      Write-Host "Feishu bridge 未运行"
      Write-Host "启动:  .\feishu-bridge.ps1 start"
    }
  }
}
