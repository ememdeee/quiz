/** Short ids for pages and answers inside a quiz. They never change, so old responses keep pointing at the right page. */
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";

export const ID_LENGTH = 10;

/** 10 characters from A-Z a-z 0-9 _ - (64 symbols, so every random byte maps evenly). `random` is only for tests. */
export function newId(random: (bytes: Uint8Array) => Uint8Array = (bytes) => crypto.getRandomValues(bytes)): string {
  const bytes = random(new Uint8Array(ID_LENGTH));
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte & 63];
  return id;
}
