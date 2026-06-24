export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  
  if (num < 1000) {
    return Math.floor(num).toString();
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const i = Math.floor(Math.log10(num) / 3);
  
  if (i >= suffixes.length) {
    return num.toExponential(2);
  }
  
  const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
  // remove trailing .00 if needed
  return `${formatted.replace(/\.00$/, '')}${suffixes[i]}`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}
