
function smoothColor(value, thresholdValue, goodWhenLower = true) {
  // If goodWhenLower is false, invert the ratio so good means higher values

  let perc = value / thresholdValue;
  if (!goodWhenLower) perc = 1 / Math.max(1e-9, perc); // avoid div by zero

  return percentageToColor(perc);
}

function percentageToColor(percentage) {

  const maxCap = 1.5;
  percentage = Math.max(0, Math.min(maxCap, percentage));

  if (percentage <= 1) {
    const t = Math.pow(percentage, 4);
    // Hue moves from green (120) toward 0.
    const hue = 120 * (1 - t);
    const saturation = 70 * (1 - t);
    const lightness = 47 + (88 - 47) * t;
    return `hsl(${Math.round(hue)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
  }

  const t2 = (percentage - 1) / (maxCap - 1);
  const hue = 0;
  const saturation = 0 + 70 * t2;
  const lightness = 88 + (47 - 88) * t2;
  return `hsl(${hue}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
}


export default smoothColor