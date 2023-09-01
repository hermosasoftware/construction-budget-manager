export const parseCurrentPageItems = (
  results: any[],
  page: number,
  pageLength: number,
) => {
  let start = page * pageLength;
  let end = start + pageLength;
  if (!results) return [];
  return results.slice(start, end);
};

export var delayTimer: any;

export const debounceLoader = (action: Function, timer = 500) => {
  clearTimeout(delayTimer);
  delayTimer = setTimeout(() => {
    action();
  }, timer);
};
