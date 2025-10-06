// LAB Conversion Functions
function rgbToXyz([r, g, b]) {
  r /= 255; g /= 255; b /= 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  return [
      (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
      (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
      (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100
  ];
}

function xyzToLab([x, y, z]) {
  const refX = 95.047, refY = 100.000, refZ = 108.883;

  x /= refX; y /= refY; z /= refZ;

  x = x > 0.008856 ? Math.cbrt(x) : (x * 7.787) + (16 / 116);
  y = y > 0.008856 ? Math.cbrt(y) : (y * 7.787) + (16 / 116);
  z = z > 0.008856 ? Math.cbrt(z) : (z * 7.787) + (16 / 116);

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function rgbToLab(rgb) {
  return xyzToLab(rgbToXyz(rgb));
}

function euclideanDistance(lab1, lab2) {
  return Math.sqrt(
      Math.pow(lab1[0] - lab2[0], 2) +
      Math.pow(lab1[1] - lab2[1], 2) +
      Math.pow(lab1[2] - lab2[2], 2)
  );
}

function findClosestPaletteColor(pixel, paletteLab) {
  const pixelLab = rgbToLab(pixel);
  let closestColor = null;
  let minDistance = Infinity;

  for (const [i, labColor] of paletteLab.entries()) {
      const distance = euclideanDistance(pixelLab, labColor);
      if (distance < minDistance) {
          minDistance = distance;
          closestColor = i;
      }
  }
  return closestColor;
}

// Worker Message Handling
self.addEventListener('message', (event) => {
  const { imageData, palette } = event.data;
  const { data, width, height } = imageData;

  // Convert the palette to LAB
  const paletteLab = palette.map(rgbToLab);

  // Quantize the image
  for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];

      const closestIndex = findClosestPaletteColor([r, g, b], paletteLab);
      const [newR, newG, newB] = palette[closestIndex];

      data[i] = newR; // Red
      data[i + 1] = newG; // Green
      data[i + 2] = newB; // Blue
  }

  // Send back the quantized image
  self.postMessage(imageData);
});