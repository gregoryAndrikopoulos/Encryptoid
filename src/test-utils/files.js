export function makeTxtFile(name = "sample.txt", content = "hello") {
  return new File([content], name, { type: "text/plain" });
}
export function makeEmptyTxt(name = "empty.txt") {
  return new File([""], name, { type: "text/plain" });
}
export function makeOtherFile(name = "image.png") {
  return new File(["xx"], name, { type: "image/png" });
}
export function makeEncTxtFile(name = "cipher.enc.txt", content = "cipher") {
  return new File([content], name, { type: "text/plain" });
}
export function makeEmptyEncTxt(name = "empty.enc.txt") {
  return new File([""], name, { type: "text/plain" });
}
