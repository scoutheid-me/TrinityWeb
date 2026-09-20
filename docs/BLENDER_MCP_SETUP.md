# Blender MCP setup on Windows

Blender is installed and Trinity's headless exporter works. Blender MCP is not connected in this session, and uv/uvx were not found on PATH. These instructions do not install it automatically.

1. Install uv in PowerShell, then reopen PowerShell:

   ```powershell
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. Install the Blender add-on and register the MCP bridge:

   ```powershell
   uvx mcp-for-blender install-addon
   codex mcp add blender -- uvx mcp-for-blender
   ```

3. In Blender: Edit → Preferences → Add-ons → enable **Interface: MCP for Blender**. Press **N** in the viewport, open **MCP for Blender**, then **Start MCP Server**.
4. Restart Codex with Blender open. Ask Codex to inspect the scene to verify the connection.

If Codex cannot find uvx, use the executable path returned by `Get-Command uvx` as its MCP command. The package was renamed from blender-mcp to mcp-for-blender.

| Workflow | Purpose | Needs |
| --- | --- | --- |
| MCP | Inspect and refine a live Blender scene and viewport | Running Blender, add-on server, Codex MCP bridge |
| Headless | Repeatable scripted generation and batch GLB export | Blender executable and checked-in Python; no open viewport |

Both use the same Blender engine and can save the same .blend/.glb files. Keep both: MCP for interactive refinement, scripts for reproducible builds. Quality still depends on modeling, materials, animation and in-game validation.

Sources checked September 20, 2026: [upstream setup](https://github.com/ahujasid/mcp-for-blender), [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
