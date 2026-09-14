# Jira Wiki Markup — Reference

Notation below matches Jira's Wiki renderer (Server/DC Text Formatting / WikiRenderer help). Use these tables when composing wiki-rendered fields. Examples are generic (`example.com`, `PROJ-1234`).

This dialect is **not** GitHub Markdown and **not** Jira Cloud ADF.

## Headings

Place `hn.` at the start of a line (`n` is 1–6), then a space, then the title.

| Markup | Result |
|--------|--------|
| `h1. Largest heading` | Heading 1 |
| `h2. Heading 2` | Heading 2 |
| `h3. Heading 3` | Heading 3 |
| `h4. Heading 4` | Heading 4 |
| `h5. Heading 5` | Heading 5 |
| `h6. Smallest heading` | Heading 6 |

## Text effects

| Markup | Effect |
|--------|--------|
| `*bold*` | Bold |
| `_emphasis_` | Emphasis (italic) |
| `??citation??` | Citation |
| `-strikethrough-` | Strikethrough |
| `+underline+` | Underline |
| `^superscript^` | Superscript |
| `~subscript~` | Subscript |
| `{{monospaced}}` | Monospaced |
| `bq. quoted line` | Block quote (one paragraph) |

Multi-paragraph quote:

```
{quote}
First paragraph

Second paragraph
{quote}
```

Color (CSS color name or hex):

```
{color:red}
Look, red text
{color}
```

## Breaks and rules

The renderer usually infers paragraphs. Use these when you need explicit control.

| Markup | Effect |
|--------|--------|
| (blank line) | New paragraph |
| `\\` | Forced line break |
| `----` | Horizontal rule |
| `---` | Em dash (—) |
| `--` | En dash (–) |

## Links

| Markup | Effect |
|--------|--------|
| `[#anchor]` | Jump to `{anchor:anchor}` on the current page |
| `[^attachment.ext]` | Link to an attachment on the current issue |
| `[https://example.com]` | External URL (wrap in `[]` when you want a wiki link; a space must follow the URL if the next character is not part of it) |
| `[Example\|https://example.com]` | Aliased external link |
| `[mailto:user@example.com]` | Mailto link |
| `[file:///c:/temp/foo.txt]` | Local/UNC file (browser-dependent) |
| `{anchor:anchorname}` | Named anchor on the page |
| `[~username]` | Link to a Jira user profile |

## Lists

Lists must start in column 0. More `*` or `#` characters nest deeper. Mix `*#` and `#*` for nested mixed lists.

```
* bullet
** nested bullet
* another

- dash item
- dash item

# numbered
# numbered
#* bullet under number
# numbered

* bullet
*# number under bullet
* bullet
```

## Images and embedded media

| Markup | Effect |
|--------|--------|
| `!https://example.com/image.png!` | Remote image |
| `!attached-image.gif!` | Attachment image on the current issue |
| `!image.jpg\|thumbnail!` | Thumbnail (attachments only) |
| `!image.gif\|align=right, vspace=4!` | Image with comma-separated attributes |

Supported embed types (attachments): `.swf`, `.mov`, `.wma`/`.wmv`, `.rm`/`.ram`, `.mp3`. Size with `width` / `height`; remote embeds are typically blocked.

## Tables

A header row (double pipes) is required.

```
||Heading 1||Heading 2||Heading 3||
|col A1|col A2|col A3|
|col B1|col B2|col B3|
```

## Advanced formatting

### `{noformat}`

Preformatted block with **no** wiki highlighting. `{panel}` optional parameters also apply.

```
{noformat}
Preformatted text
 *not* bold
{noformat}
```

### `{panel}`

```
{panel}
text
{panel}

{panel:title=My title}
titled panel
{panel}

{panel:title=My title|borderStyle=dashed|borderColor=#ccc|titleBGColor=#F7D6C1|bgColor=#FFFFCE}
A paragraph inside a *panel*
even _other_ lines
{panel}
```

Parameters: `title`, `borderStyle`, `borderColor`, `borderWidth`, `bgColor`, `titleBGColor`.

### `{code}`

Syntax-highlighted block. Default language is Java. `{panel}` optional parameters also apply.

Named languages include: ActionScript, Ada, AppleScript, bash, C, C#, C++, CSS, Erlang, Go, Groovy, Haskell, HTML, JavaScript, JSON, Lua, Objc, Perl, PHP, Python, R, Ruby, Scala, SQL, Swift, VisualBasic, XML, YAML.

```
{code:title=Bar.java|borderStyle=solid}
// comments
public String getFoo()
{
    return foo;
}
{code}

{code:xml}
    <test>
        <another tag="attribute"/>
    </test>
{code}
```

## Escape and smileys

`\X` escapes special character `X` (for example `\{` so a brace is literal).

Smileys such as `:)` `:(` `:P` `:D` `;)` `(y)` `(n)` `(i)` `(/)` `(x)` `(!)` `(+)` `(-)` `(?)` become icons. Prefer words in engineering comments so the body stays readable in APIs and diffs.

## Canonical repair-comment skeleton

Hosts and `jira-status-writeback` fill the placeholders from the field map. Drop a line when the host marks that field N/A. Keep the Wiki shape (do not convert to Markdown).

```
h3. AI Auto-Fix Report

* *Fix Branch*: {branch}
* *Commit*: {commit}
* *PR/MR URL*: [{pr_label}|{pr_url}]
* *Root Cause*: {root_cause}
* *Fix Solution*: {fix_summary}
* *Files Changed*: {file_list}
* *Analysis / OpenSpec*: {extra}

Code has been merged to the target branch; please proceed with QA verification.

h4. Verification Scenarios

# *{scenario_name}*
Steps: {steps}
Expected: {expected}
```

Add further numbered `#` items for additional scenarios. If there is no PR URL, write the URL as plain text or omit the line.
