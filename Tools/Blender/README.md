# Blender automation test

Installed Blender: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` (5.2.2 LTS).

From the project root, run in PowerShell:

```powershell
.\Tools\Blender\run_test.ps1
```

The launcher uses `--background --factory-startup --python-exit-code 1 --python`.
Blender's graphical interface never opens. Factory startup ignores personal startup
settings for this process; it does not modify Blender or saved user preferences.
An alternative installation can be supplied with `-BlenderPath`.

The script clears the scene, builds a smooth UV sphere with a teal material,
camera and three area lights, then saves and renders with Cycles on the CPU.
Outputs are resolved relative to the script, independent of the working directory:

- `Assets/Test/Trinity_Headless_Test.blend`
- `Renders/Test/Trinity_Headless_Test.png` (640 by 640)

Rerunning replaces these test outputs. `References` is reserved for source references.
This setup generates only a smoke test, not game assets.
