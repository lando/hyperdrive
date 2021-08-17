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
if ([string]::IsNullOrEmpty($env:WINDOZE_CERT_DATA))
{
  throw "WINDOZE_CERT_DATA needs to be set with a base64 encoded p12!"
}
if ([string]::IsNullOrEmpty($env:WINDOZE_CERT_PASSWORD))
{
  throw "WINDOZE_CERT_PASSWORD needs to be set with your p12 password!"
}

# Get some things for cert opts
$cert_data = $env:WINDOZE_CERT_DATA
$cert_path = "$temp_dir\lando.windoze.p12"
$cert_password = $env:WINDOZE_CERT_PASSWORD
$cert_secure_password = $null
$signtool = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\x64\signtool.exe"
$temp_dir = $env:TMP

# Export certs
Write-Output "Cert detected!"
# Decode and dump to temp file
If (!(Test-Path $cert_path)) {
  Write-Output "Dumping cert to $cert_path..."
  $bytes = [Convert]::FromBase64String($cert_data)
  [IO.File]::WriteAllBytes($cert_path, $bytes)
}

# Verify the cert and password are good
Write-Output "Verifying cert is good to go..."
$cert_secure_password = ConvertTo-SecureString $cert_password -AsPlainText -Force
Import-PfxCertificate -FilePath "$cert_path" -Password $cert_secure_password -CertStoreLocation "Cert:\LocalMachine\My"
# If we get this far we should be good!
Write-Output "We can sign!"

# Sign and verify
Write-Output "Trying to sign the $file binary with $signtool..."
& $signtool sign -f "$cert_path" -p "$cert_password" -fd sha256 -tr "http://timestamp.comodoca.com/?td=sha256" -td sha256 -as -v "$file"
Write-Output "Verifying Lando binary has been signed with the signtool..."
& $signtool verify -pa -v "$file"
