export function validateTxtFile(f) {
  if (!f) return { ok: false, error: "" };
  if (!/\.txt$/i.test(f.name))
    return { ok: false, error: "Only .txt files are supported" };
  if (f.size === 0)
    return { ok: false, error: "File is empty and cannot be processed" };
  return { ok: true };
}
