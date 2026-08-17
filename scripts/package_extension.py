from __future__ import annotations

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def main() -> None:
    repository = Path(__file__).resolve().parents[1]
    extension = (repository / "extension").resolve()
    package_directory = (repository / "packages").resolve()
    manifest = json.loads((extension / "manifest.json").read_text(encoding="utf-8"))
    version = str(manifest["version"])
    target = (package_directory / f"live-asmr-studio-v{version}.zip").resolve()

    if target.parent != package_directory:
        raise RuntimeError("Package target escaped the packages directory.")

    package_directory.mkdir(parents=True, exist_ok=True)

    excluded = {
        Path("assets/icons/icon-source-1024.png"),
    }
    with ZipFile(target, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for source in sorted(extension.rglob("*")):
            if not source.is_file():
                continue
            relative = source.relative_to(extension)
            if relative in excluded or "__pycache__" in relative.parts:
                continue
            archive.write(source, relative.as_posix())

    with ZipFile(target) as archive:
        names = set(archive.namelist())
        packaged_manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
        if packaged_manifest.get("version") != version:
            raise RuntimeError("Packaged manifest version does not match the source.")
        required = {"PRIVACY.md", "SUPPORT.md", "assets/icons/icon128.png"}
        missing = sorted(required - names)
        if missing:
            raise RuntimeError(f"Package is missing required files: {missing}")
        if "assets/icons/icon-source-1024.png" in names:
            raise RuntimeError("Package contains the unoptimized source icon.")

    print(f"PACKAGE={target}")
    print(f"VERSION={version}")
    print(f"BYTES={target.stat().st_size}")
    print(f"ENTRIES={len(names)}")


if __name__ == "__main__":
    main()
