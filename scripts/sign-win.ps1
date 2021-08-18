#!/

$ErrorActionPreference = "Stop"

# Get our file
$file = -join($pwd, "/", $args[0]);

# Throw error if file does not exist
if (!(Test-Path "$file"))
{
  throw "$file does not exist"
}

# Verify we have the envvars we need
if ([string]::IsNullOrEmpty($env:WINDOZE_CERT_PASSWORD))
{
  throw "WINDOZE_CERT_PASSWORD needs to be set with your p12 password!"
}

# Get some things for cert opts
$temp_dir = $env:TMP
$cert_path = "$temp_dir\lando.windoze.p12"
$cert_password = $env:WINDOZE_CERT_PASSWORD
$signtool = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\x64\signtool.exe"

# Decode and dump to temp file
If (!(Test-Path $cert_path))
{
  throw "Expected cert at $cert_path. Try running import-win-certs.ps1 first!"
}

# Sign and verify
Write-Output "Trying to sign the $file binary with $signtool..."
& $signtool sign -f "$cert_path" -p "$cert_password" -fd sha256 -tr "http://timestamp.comodoca.com/?td=sha256" -td sha256 -as -v "$file"
Write-Output "Verifying Lando binary has been signed with the signtool..."
& $signtool verify -pa -v "$file"
