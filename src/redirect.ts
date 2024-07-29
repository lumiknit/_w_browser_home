/**
 * Open a new tab and history to back
 */
export const openInNewTabAndBack = (url: string): boolean => {
  const w = window.open(url, "_blank");
  if (!w) return false;
  w.focus();
  window.history.back();
  return true;
};

/**
 * Check if query param 'n=*' exists and open a new tab and history to back
 */
export const openInNewTabAndBackIfN = (): boolean | void => {
  const url = new URL(window.location.href);
  if (url.searchParams.get("n") !== null) {
    return openInNewTabAndBack(window.document.location.href.split("?")[0]);
  }
};
