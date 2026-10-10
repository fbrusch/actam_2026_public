# Notebooks on the site

Every notebook (`.ipynb`) the site publishes gets its own page. Some notebooks can also run in the visitor's browser.

## What a visitor sees

| | Trusted notebooks | Other notebooks |
|---|---|---|
| Examples | lesson reference notebooks, notebooks from class | student submissions, anything from elsewhere |
| **Read** the page: markdown, formulas, highlighted code | ✓ | ✓ |
| **Download** the `.ipynb` | ✓ | ✓ |
| **Open in the browser** (JupyterLite) | ✓ | — |
| Outputs (sounds, plots) | made by the visitor, running the cells | — (submissions have their audio on the submissions page) |

We never run notebooks to produce their outputs. A page shows the notebook as it is written.

## The files

| File | What it does |
|---|---|
| `catalog.mjs` | **The list of trusted notebooks.** Edit it to make a notebook runnable. |
| `publish.mjs` | Called by `site/build.mjs`. Finds every `.ipynb` in `dist/`, builds JupyterLite, writes the pages. |
| `view.mjs` | The page component: one notebook in, one HTML page out. |
| `lite.mjs` | Builds JupyterLite into `dist/lite/` with the trusted notebooks. |

Where things end up:

```text
dist/lesson-05/class-notebook.ipynb         the file (already copied by build.mjs)
dist/lesson-05/class-notebook/index.html    its page: read, download, open
dist/lite/                                  JupyterLite, with the trusted notebooks
```

A page lives next to its notebook, so links go to `lesson-05/class-notebook/`, not to the `.ipynb`.

## Common tasks

- **Publish a new notebook.**
  1. Copy it into `dist/` in `site/build.mjs`, like the others. It gets a read-only page automatically.
  2. If we wrote it, add it to `catalog.mjs` to make it runnable.
  3. Link its page from `site/index.html`.
- **Make a student notebook runnable.** Ask for a review first. Then add it to `catalog.mjs` with the `sha256` of the reviewed file:

  ```sh
  shasum -a 256 dist/lesson-04/submissions/notebooks/group-03.ipynb
  ```

  If the file changes later, the build prints a warning and publishes it read-only again.
- **Build without JupyterLite.** For a quick check use `SKIP_LITE=1 npm run build`. Pages are still written, without "Open in the browser".

## Safety

Trust is decided by `catalog.mjs`, never by what a file contains.

- **Read-only pages never run anything.** Each page sends a Content-Security-Policy that forbids every script. In untrusted notebooks:
  - raw HTML is shown as text;
  - images are dropped, so a page cannot load anything from elsewhere;
  - `javascript:` links are refused;
  - formulas go through KaTeX with `trust: false`.
- **Code runs only in JupyterLite, and only for trusted notebooks.** It runs in the visitor's browser, inside the browser's sandbox, with the site's origin. That is why notebooks from outside are not runnable unless reviewed and pinned.

## Requirements

- **markdown-it, shiki and KaTeX** come with Slidev, already in `node_modules`.
- **JupyterLite** is built with `uvx` (from [uv](https://docs.astral.sh/uv/)), at the versions pinned in `lite.mjs`. The first build downloads them.
- **Pyodide** is loaded by the visitor's browser from the jsDelivr CDN.
