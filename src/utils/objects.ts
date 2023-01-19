export const omit = (key: string, obj: any) => {
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

export const get = (key: string, obj: any) => {
  const { [key]: v } = obj;
  return v;
};
