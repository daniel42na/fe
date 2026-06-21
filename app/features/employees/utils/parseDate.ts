// Parses a German `dd.mm.yyyy` date string into a timestamp for sorting.
// Returns NaN when the input is not a well-formed date string.
export const parseDate = (value: string): number => {
  const [day, month, year] = value.split(".");
  if (!day || !month || !year) {
    return Number.NaN;
  }

  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};
