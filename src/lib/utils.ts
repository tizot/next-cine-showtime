import { intlFormat } from 'date-fns';
import { toSeconds, type Duration } from 'iso8601-duration';

export function formatDate(date: Date) {
  return intlFormat(
    date,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Paris' },
    { locale: 'fr-FR' },
  );
}

export function formatDuration(duration: Duration, withSeconds = false) {
  const totalSeconds = toSeconds(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - 3600 * hours) / 60);
  const seconds = totalSeconds - 60 * minutes - 3600 * hours;
  if (withSeconds && seconds !== 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m`;
}
