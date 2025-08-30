# Notebook Merging Feature

This document outlines the functionality and technical details of the notebook merging feature.

## How to Use

1.  Navigate to the "Notebook Management" page.
2.  In the "Notebook List", you will see checkboxes next to each notebook name.
3.  Select two or more notebooks you wish to merge by clicking their checkboxes.
4.  Once you select more than one notebook, a "Merge Selected" button will appear below the list.
5.  Click the "Merge Selected" button.
6.  A confirmation dialog will appear, warning you that the non-primary notebooks will be deleted. Confirm to proceed.

## Merge Process

### Primary Notebook

The **first notebook you select** in the list is considered the **Primary Notebook**. The merged content will be saved into this notebook, and its name will be preserved.

### Source Notebooks

All other selected notebooks are considered **Source Notebooks**. Their content will be merged into the Primary Notebook, and they will be **deleted** after the merge is successfully completed.

## Conflict Resolution

During the merge, the `context` (the list of words) of each notebook is combined.

- **Duplicate Words**: A word is considered a duplicate if its `jp_word` property is identical to a word already included from the Primary Notebook or another, previously processed Source Notebook.
- **Resolution Rule**: If a duplicate word is found, it is **ignored**. The version of the word from the Primary Notebook (or the one that was processed first) is always kept. No data is overwritten or combined from the duplicate entry.

## Outcome

- The Primary Notebook's `context` is updated with the new, de-duplicated list of words.
- All Source Notebooks are permanently deleted.
- The UI will refresh, and the merged Primary Notebook will be selected.

???
