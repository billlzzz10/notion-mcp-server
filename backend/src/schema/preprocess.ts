export const preprocessJson = (val: any) =>
  typeof val === "string" ? JSON.parse(val) : val;
