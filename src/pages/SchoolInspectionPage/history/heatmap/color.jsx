


function smoothColor(value, thresholdValue, goodWhenLower = true) {
  // If goodWhenLower is false, invert the ratio so "good" means higher values.
  let perc = value / thresholdValue;
  if (!goodWhenLower) perc = 1 / Math.max(1e-9, perc); // avoid div-by-zero

  return percentageToColor(perc);
}

function percentageToColor(percentage) {
  // allowed domain:
  const maxCap = 1.5;
  percentage = Math.max(0, Math.min(maxCap, percentage));

  // If percentage <= 1: GREEN (at 0) -> GREY (at 1)
  if (percentage <= 1) {
    const t = Math.pow(percentage, 4); // adjust exponent to tune curve
    // Hue moves from green (120) toward 0, but saturation goes 70% -> 0%,
    // lightness goes 47% -> 88% so final is desaturated grey.
    const hue = 120 * (1 - t);           // 120 -> 0 (optional, mostly ignored when sat=0)
    const saturation = 70 * (1 - t);     // 70% -> 0%
    const lightness = 47 + (88 - 47) * t; // 47% -> 88%
    return `hsl(${Math.round(hue)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
  }

  // If percentage > 1: GREY (at 1) -> RED (at maxCap)
  const t2 = (percentage - 1) / (maxCap - 1); // 0 -> 1 as percentage goes 1 -> maxCap
  const hue = 0;                             // red
  const saturation = 0 + 70 * t2;            // 0% -> 70%
  const lightness = 88 + (47 - 88) * t2;     // 88% -> 47%
  return `hsl(${hue}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
}


export default smoothColor