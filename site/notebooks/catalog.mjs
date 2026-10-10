// Which notebooks visitors may run in their browser.
//
// Every .ipynb the site publishes gets a read-only page (see publish.mjs).
// Only the notebooks listed here also get "Open in the browser", which runs
// them with JupyterLite. They are notebooks we wrote ourselves.
//
// Everything else, such as student submissions or files from elsewhere,
// stays read-only. Trust comes from this list only, never from the content
// of a file.
//
// `path` is where the notebook is published, relative to the site root.
// `title` is shown on its page, after the lesson in the breadcrumb.
// To make an outside notebook runnable after reviewing it, add an entry with
// the `sha256` of the reviewed file: if the file changes, it falls back to
// read-only until it is reviewed again.

export const TRUSTED = [
  { path: 'lesson-01/notebook.ipynb', title: 'Reference notebook' },
  { path: 'lesson-02/notebook.ipynb', title: 'Reference notebook' },
  { path: 'lesson-03/notebook.ipynb', title: 'Reference notebook' },
  { path: 'lesson-04/notebook.ipynb', title: 'Reference notebook' },
  { path: 'lesson-05/notebook.ipynb', title: 'Reference notebook' },
  { path: 'lesson-05/class-notebook.ipynb', title: 'Notebook from class' },
  // Example of a reviewed outside notebook, pinned to its content:
  // { path: 'lesson-04/submissions/notebooks/group-03.ipynb', title: 'Group 03', sha256: '…' },
]
