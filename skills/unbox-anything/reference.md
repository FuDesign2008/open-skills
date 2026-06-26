# unbox-anything — Reference

Exhaustive reference material for the `unbox-anything` skill. The main [SKILL.md](SKILL.md) is the lean decision document you run on every file; **read this file only when SKILL.md points you here** — usually because type detection is ambiguous, a command is missing, or you need the exact magic bytes for an unusual format.

## Table of Contents

1. [Full format × tool × platform matrix](#full-matrix)
2. [Tool install commands (per platform)](#tool-installs)
3. [Magic numbers (type detection)](#magic-numbers)
4. [Per-format edge cases](#edge-cases)
5. [Chain recipes (the famous ones)](#chain-recipes)

---

## Full Matrix

The authoritative table. Category letters (A–E) match the workflows in SKILL.md.

| Format | Underlying structure | Category | Primary tool | macOS | Linux | Windows | Notes |
|--------|----------------------|----------|--------------|-------|-------|---------|-------|
| `.zip` | ZIP | A | `7z` / `bsdtar` / `unzip` | ✅ brew p7zip / preinstalled bsdtar | ✅ apt p7zip-full / preinstalled unzip | ✅ winget 7zip | Universal |
| `.7z` | 7z LZMA | A | `7z` | ✅ | ✅ | ✅ | Native to 7z |
| `.tar` | tar | A | `7z` / `bsdtar` | ✅ | ✅ | ✅ | No compression |
| `.tar.gz` / `.tgz` | gzip'd tar | A | `7z` / `bsdtar` | ✅ | ✅ | ✅ | |
| `.tar.bz2` | bzip2'd tar | A | `7z` / `bsdtar` | ✅ | ✅ | ✅ | |
| `.tar.xz` | xz'd tar | A | `7z` / `bsdtar` | ✅ | ✅ | ✅ | |
| `.gz` / `.bz2` / `.xz` | single-stream | A | `7z` / `gunzip` | ✅ | ✅ | ✅ | Decompresses one file |
| `.zst` | Zstandard | A | `7z` (v21+) / `bsdtar` / `unzstd` | ✅ | ✅ | ✅ | Needs recent 7z |
| `.lz4` | LZ4 | A | `unar` / `lz4` | ⚠️ brew unar | ⚠️ apt unar / liblz4-tool | ⚠️ manual | Not in 7z; use unar |
| `.rar` | RAR (proprietary) | A | `unar` | ✅ brew unar | ✅ apt unar | ✅ official Unarchiver | 7z is read-only; use unar for RAR5 |
| `.cab` | MS Cabinet | A | `7z` / `bsdtar` | ✅ | ✅ | ✅ | |
| `.docx` `.xlsx` `.pptx` | OOXML (ZIP) | B | `7z` | ✅ | ✅ | ✅ | Structured XML inside |
| `.jar` `.war` `.ear` | ZIP | B | `7z` | ✅ | ✅ | ✅ | Java packages |
| `.apk` `.aab` | ZIP | B | `7z` | ✅ | ✅ | ✅ | AndroidManifest.xml inside |
| `.ipa` | ZIP | B | `7z` | ✅ | ✅ | ✅ | iOS app bundle |
| `.whl` `.egg` | ZIP | B | `7z` | ✅ | ✅ | ✅ | Python packages |
| `.deb` | ar + tar.gz + control | C | `7z` / `dpkg-deb` | ✅ | ✅ native | ✅ | Native on Debian |
| `.rpm` | cpio + payload | C | `7z` / `rpm2cpio\|cpio` | ✅ | ✅ native | ✅ | Native on RPM distros |
| `.msi` | MSI/OLE compound | C | `7z` (as cab) | ✅ | ✅ | ✅ native msiexec | Treat as archive |
| `.iso` | ISO 9660 / UDF | D | `7z` / `bsdtar` | ✅ | ✅ | ✅ | Disk image |
| `.exe` (NSIS) | Nullsoft installer | D | `7z` | ✅ | ✅ | ✅ | `file` → "Nullsoft Installation" |
| `.exe` (Inno Setup) | Inno installer | D | `innoextract` | ⚠️ brew innoextract | ⚠️ apt innoextract | ⚠️ scoop innoextract | Cleaner than 7z for Inno |
| `.exe` (MSI-wrapped) | MSI in PE wrapper | D/C | `7z` then treat inner as MSI | ✅ | ✅ | ✅ | Recurse on inner .msi |
| `.exe` (self-extracting ZIP) | ZIP stub | A/B | `7z` / `unzip` | ✅ | ✅ | ✅ | `file` → "Zip archive" or PE w/ SFX |
| `.dmg` | UDIF / NDIF | D | macOS `hdiutil` / others `7z` | ✅ native | ⚠️ 7z (UDZO ok, UDIF fail) | ⚠️ 7z (weak) | Always `-nobrowse -readonly` |
| `.pkg` (macOS) | xar → Payload (gz cpio) | E | `xar` + `cpio` / `7z` | ✅ native | ✅ | ✅ | Chain step |
| `.asar` | Electron archive | E | `npx @electron/asar` | ✅ | ✅ | ✅ | Reached via recursion usually |

✅ = supported, ⚠️ = needs on-demand install or has caveats.

---

## Tool Installs

### `7z` / p7zip (primary — covers ~80%)

```bash
# macOS
brew install p7zip
# Debian / Ubuntu
sudo apt install p7zip-full
# Fedora / RHEL
sudo dnf install p7zip p7zip-plugins
# Windows
winget install 7zip.7zip
#   or
choco install 7zip
```

Verify: `7z | head -3` (prints version banner).

### `unar` (The Unarchiver CLI — for RAR and odd formats)

```bash
# macOS
brew install unar
# Debian / Ubuntu
sudo apt install unar
# Fedora
sudo dnf install unar
# Windows — download from https://theunarchiver.com/ or:
choco install unarchiver
```

### `bsdtar` / libarchive (zero-dependency fallback on macOS)

macOS ships `bsdtar` as the default `tar` — no install needed. On Linux:

```bash
sudo apt install libarchive-tools   # Debian
sudo dnf install bsdtar              # Fedora
```

### `innoextract` (Inno Setup installers only)

```bash
# macOS
brew install innoextract
# Debian / Ubuntu
sudo apt install innoextract
# Arch
sudo pacman -S innoextract
# Windows
scoop install innoextract
#   or download from https://constexpr.org/innoextract/
```

### `xar` + `cpio` (macOS `.pkg` chain)

- macOS: **pre-installed** (`xar` and `cpio` are system binaries).
- Linux: `sudo apt install xar cpio` / `sudo dnf install xar cpio`.
- Windows: `choco install xar` or use `7z` (handles xar archives directly in newer versions).

### Node.js + `@electron/asar` (`.asar` chain)

Requires Node.js (verify: `node -v`).

```bash
# One-off, no global install:
npx @electron/asar extract <input.asar> <outdir>
# Or install globally for repeated use:
npm install -g @electron/asar
```

Node.js install: `brew install node` (macOS) / `sudo apt install nodejs` (Debian) / `winget install OpenJS.NodeJS` (Windows).

### `hdiutil` (macOS `.dmg`)

Pre-installed on macOS only. No install needed; no Linux/Windows equivalent (use `7z` there with caveats — see matrix).

---

## Magic Numbers

When `file` is unsure, match the first bytes (hex) of the input. Read them with `xxd -l 16 "<input>"` or `od -A x -t x1z -v "<input>" | head -1`.

| Format | Offset | Bytes (hex) | ASCII | Notes |
|--------|--------|-------------|-------|-------|
| ZIP (and all ZIP-based: docx/xlsx/jar/apk/whl/ipa/war/egg/aab) | 0 | `50 4B 03 04` | `PK\x03\x04` | Also empty/singleton zip; spanned zips use `50 4B 07 08` |
| 7z | 0 | `37 7A BC AF 27 1C` | `7z\xBC\xAF\x27\x1C` | |
| gzip / `.gz` / `.tar.gz` | 0 | `1F 8B` | `\x1F\x8B` | |
| bzip2 / `.bz2` | 0 | `42 5A 68` | `BZh` | |
| xz / `.xz` | 0 | `FD 37 7A 58 5A 00` | `\xFD7zXZ\x00` | |
| Zstandard / `.zst` | 0 | `28 B5 2F FD` | `(\xB5/\xFD` | |
| LZ4 frame | 0 | `04 22 4D 18` | `\x04\"M\x18` | |
| RAR v4 | 0 | `52 61 72 21 1A 07 00` | `Rar!\x1A\x07\x00` | |
| RAR v5 | 0 | `52 61 72 21 1A 07 01 00` | `Rar!\x1A\x07\x01\x00` | |
| tar (ustar) | 257 | `75 73 74 61 72` | `ustar` | At offset 257, not 0 |
| ISO 9660 | 32769 | `43 44 30 30 31` | `CD001` | At offset 0x8001 |
| CAB | 0 | `4D 53 43 46` | `MSCF` | |
| Debian `.deb` | 0 | `21 3C 61 72 63 68 3E` | `!<arch>` | |
| RPM | 0 | `ED AB EE DB` | `\xED\xAB\xEE\xDB` | |
| NSIS installer | 0 | `EF BE AD DE` ... or near EOF | "Nullsoft.NV" near EOF | PE wrapper; check `file` output |
| Inno Setup | near EOF | `7A 7A` ... `Inno Setup` | `z\x7A` + "Inno Setup" signature near EOF | Use `innoextract -l` to confirm |
| DMG (UDIF) | 0 | `78 01` (koly trailer at EOF) | "koly" at EOF (offset -512) | UDIF trailer is at end of file |
| xar (`.pkg`) | 0 | `78 61 72 21` | `xar!` | |
| asar | 0 | `04 00 00 00` then a size header | (binary, 4-byte LE size) | Detect by `.asar` extension + JSON-like header; `npx @electron/asar list <f>` confirms |
| MSI / OLE compound | 0 | `D0 CF 11 E0 A1 B1 1A E1` | `\xD0\xCF\x11\xE0...` | Legacy Office too — out of scope for content extraction |
| PE32 (`.exe` Windows binary) | 0 | `4D 5A` | `MZ` | Only tells you it's a PE; installer type needs further probing |

---

## Edge Cases

- **`.exe` that is actually a self-extracting ZIP.** Magic bytes start with `MZ` (PE header), but inside there's a ZIP stub. `7z l` will list zip contents; treat as category A.
- **Multi-volume archives** (`.part01.rar`, `.z01`, `.001`). Concatenate or point `unar`/`7z` at the first volume; they follow the rest automatically.
- **`.deb` with `.lzma` or `.zst` payload.** Older debs use gzip, newer ones use zstd. `7z` handles both; if `dpkg-deb` fails on zstd payload, install `zstd` or use `7z`.
- **Password-protected ZIP entries (not the whole archive).** `7z l -slt` shows `Encrypted = +` per entry; some entries may be encrypted while others aren't. Skip encrypted entries rather than failing the whole extraction.
- **`.apk` with resources.arsc.** This is a binary resource table, not human-readable. Note in manifest that `aapt2 dump` (Android SDK) is needed for full inspection — out of scope for unpacking.
- **Symbolic links in tarballs.** `7z`/`bsdtar` materialize them as links by default; the cycle guard in step 5 protects against malicious symlink loops.
- **`.tar.zst` and `.tar.lz4`.** Combined extensions — `bsdtar` handles them in one pass; with plain `7z` you may need to decompress then untar in two steps.
- **`.dmg` with APFS or sparseimage.** `7z` cannot read these; only `hdiutil` works (macOS-only). Report this honestly on Linux/Windows.

---

## Chain Recipes

The two famous chains that motivated this skill. Reproduce them by hand if recursion ever fails.

### Electron installer → JS source

The inspiration case (a Youdao Cloud Note installer). Four hops:

```bash
# Hop 1: NSIS exe → inner payload
7z x "App-1.2.3.exe" -oApp-1-2-3-exe-unboxed -y
# Hop 2: payload 7z → Electron runtime
7z x "App-1-2-3-exe-unboxed/\$PLUGINSDIR/app-64.7z" -oApp-1-2-3-exe-unboxed/app -y
# Hop 3: detect app.asar in app/resources/
# Hop 4: asar → readable JS source
npx @electron/asar extract "App-1-2-3-exe-unboxed/app/resources/app.asar" App-1-2-3-exe-unboxed/app-src
```

Note the `\$PLUGINSDIR` shell-escaping. The unbox-anything pipeline does all four hops automatically via step 5 recursion.

### macOS `.pkg` → payload files

```bash
# Hop 1: xar unpack
7z x "Thing.pkg" -oThing-pkg-unboxed -y     # or: xar -xf Thing.pkg -C Thing-pkg-unboxed
# Hop 2: Payload is cpio, optionally gzip'd — naming and compression both vary.
#   - 7z may extract the payload as "Payload~" (with tilde), not "Payload".
#   - Some pkgs (e.g. Microsoft Office) ship raw cpio, others gzip-wrap it.
cd Thing-pkg-unboxed
PAYLOAD=$(find . -maxdepth 1 -iname "Payload*" -type f | head -1)
case "$(file "$PAYLOAD")" in
  *gzip*) gunzip -c "$PAYLOAD" | cpio -idmv ;;
  *cpio*) cpio -idmv < "$PAYLOAD" ;;
esac
rm -f "$PAYLOAD"   # optional cleanup
```

The payload directory now contains the install-time file tree (e.g. `Applications/Thing.app/...`).

---

## When This Reference Is Not Enough

- **Encrypted formats with no known password** — out of scope; do not attempt brute force.
- **Binaries that need to run to unpack** (AppImage, some self-extractors) — Iron Rule 1 forbids; use a sandbox.
- **Custom/proprietary formats** not in the matrix — report the magic bytes to the user and ask, do not guess.
