#define MyAppName "NomadicERP"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "NomadicERP Local"
#define MyAppExeName "Launch NomadicERP.bat"

[Setup]
AppId={{7C338A7A-3429-41C5-8FB1-9CB027F56C51}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=.
OutputBaseFilename=NomadicERP_Setup
SetupIconFile=NomadicERP.ico
UninstallDisplayIcon={app}\NomadicERP.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "CivilERP_Setup.iss,NomadicERP_Setup.iss,CivilERP_Setup.exe,NomadicERP_Setup.exe,Build NomadicERP Installer.bat,BUILD_INSTALLER.txt,data\*,backups\*,reports\*"

[Dirs]
Name: "{app}\data"
Name: "{app}\backups"
Name: "{app}\reports"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\NomadicERP.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\NomadicERP.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: postinstall skipifsilent nowait
