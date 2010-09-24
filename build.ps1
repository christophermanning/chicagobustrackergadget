# Windows Powershell 2.0
# To allow running powershell scripts: set-executionpolicy remotesigned

$Directory = Get-Item .
$ZipFilePath = $Directory.FullName + "\" + $Directory.Name + ".zip"
$BuildFileName =  $Directory.Name + ".gadget"

# Check if build already exists
if (test-path $BuildFileName) {
  echo "Build File " + $BuildFileName + " Already Exists"
  return
}

# Create .tmp
Copy-Item src .tmp -recurse

# Remove svn folders from .tmp
Get-ChildItem .tmp -recurse -force -include .svn | foreach -process {Remove-Item $_.FullName -force -recurse}

# Zip .tmp Contents
set-content $ZipFilePath ("PK" + [char]5 + [char]6 + ("$([char]0)" * 18)) 
$ZipFile = (new-object -com shell.application).NameSpace($ZipFilePath) 
dir .tmp | foreach {$ZipFile.CopyHere($_.fullname);Start-sleep -milliseconds 500} 

# Renames Item
Rename-Item $ZipFilePath $BuildFileName

# Delete .tmp Resources
Remove-Item .tmp -recurse -force
