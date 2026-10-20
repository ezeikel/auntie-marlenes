// Only immutable font bytes are shared across requests; no I/O runs on import.
const fonts = new Map<string, Promise<ArrayBuffer>>();
export function getOgFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const key = `${family}:${weight}`;
  let font = fonts.get(key);
  if (!font) {
    font = (async () => {
      const response = await fetch(
        `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`,
      );
      if (!response.ok) throw new Error(`Font CSS returned ${response.status}`);
      const css = await response.text();
      const url = css.match(/url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
      if (!url) throw new Error(`Could not extract ${family} font URL`);
      const data = await fetch(url);
      if (!data.ok) throw new Error(`Font returned ${data.status}`);
      return data.arrayBuffer();
    })().catch((error) => {
      fonts.delete(key);
      throw error;
    });
    fonts.set(key, font);
  }
  return font;
}
