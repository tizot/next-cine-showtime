import { toSeconds } from "iso8601-duration";

export const formatDuration = (duration, withSeconds = false) => {
  const totalSeconds = toSeconds(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - 3600 * hours) / 60);
  const seconds = totalSeconds - 60 * minutes - 3600 * hours;
  if (withSeconds && seconds !== 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m`;
};
