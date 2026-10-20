// D1 allows roughly 100 bound parameters per statement. Leave one spare.
const parameterBudget = 99;

/** Include generated/defaulted columns in columnsPerRow for Prisma createMany. */
export function chunkForD1<T>(
  rows: readonly T[],
  columnsPerRow: number,
  reservedParameters = 0,
): T[][] {
  if (
    !Number.isInteger(columnsPerRow) ||
    columnsPerRow < 1 ||
    !Number.isInteger(reservedParameters) ||
    reservedParameters < 0 ||
    columnsPerRow + reservedParameters > parameterBudget
  ) {
    throw new RangeError('D1 parameter budget cannot fit a row');
  }
  const size = Math.floor(
    (parameterBudget - reservedParameters) / columnsPerRow,
  );
  const chunks: T[][] = [];
  for (let offset = 0; offset < rows.length; offset += size) {
    chunks.push(rows.slice(offset, offset + size));
  }
  return chunks;
}
