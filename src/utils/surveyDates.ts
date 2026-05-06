function withOffsetDays(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

export function isoDaysFromNow(days: number) {
  const date = withOffsetDays(days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shortDateDaysAgo(days: number) {
  return withOffsetDays(-days).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
  });
}
