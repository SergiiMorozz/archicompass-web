export function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function polishCountLabel(count: number, one: string, few: string, many: string) {
  const absolute = Math.abs(count);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  const form = absolute === 1
    ? one
    : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
      ? few
      : many;
  return `${count} ${form}`;
}
