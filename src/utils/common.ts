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
