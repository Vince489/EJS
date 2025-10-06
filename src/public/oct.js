// Octree Quantization Algorithm
self.onmessage = function (e) {
  const { imageData, paletteSize } = e.data;
  const quantizedImageData = octreeQuantization(imageData, paletteSize);
  self.postMessage(quantizedImageData);
};

// Octree Node Class
class OctreeNode {
  constructor() {
    this.children = new Array(8).fill(null);
    this.isLeaf = false;
    this.pixelCount = 0;
    this.redSum = 0;
    this.greenSum = 0;
    this.blueSum = 0;
    this.red = 0;
    this.green = 0;
    this.blue = 0;
  }
}

// Octree Quantization Function
function octreeQuantization(imageData, paletteSize) {
  const { data, width, height } = imageData;
  const octree = new Octree(paletteSize);

  // Add all pixels to the octree
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    octree.addColor(r, g, b);
  }

  // Reduce the octree to the desired palette size
  octree.reduce();

  // Quantize the image using the octree
  const outputImageData = new ImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [newR, newG, newB] = octree.getQuantizedColor(r, g, b);

    outputImageData.data[i] = newR;
    outputImageData.data[i + 1] = newG;
    outputImageData.data[i + 2] = newB;
    outputImageData.data[i + 3] = 255; // Alpha channel
  }

  return outputImageData;
}

// Octree Class
class Octree {
  constructor(maxColors) {
    this.root = new OctreeNode();
    this.maxColors = maxColors;
    this.leafCount = 0;
    this.reducible = new Array(8).fill(null).map(() => []);
  }

  // Add a color to the octree
  addColor(r, g, b) {
    const index = this.getColorIndex(r, g, b, 0);
    this._addColor(this.root, r, g, b, index, 0);
  }

  _addColor(node, r, g, b, index, level) {
    if (node.isLeaf) {
      node.pixelCount++;
      node.redSum += r;
      node.greenSum += g;
      node.blueSum += b;
    } else {
      const childIndex = (index >> (7 - level)) & 0x7;
      if (!node.children[childIndex]) {
        node.children[childIndex] = new OctreeNode();
        if (level === 7) {
          node.children[childIndex].isLeaf = true;
          this.leafCount++;
        } else {
          this.reducible[level].push(node.children[childIndex]);
        }
      }
      this._addColor(node.children[childIndex], r, g, b, index, level + 1);
    }
  }

  // Reduce the octree to the desired number of colors
  reduce() {
    while (this.leafCount > this.maxColors) {
      let level = 6;
      while (level >= 0 && this.reducible[level].length === 0) {
        level--;
      }
      if (level < 0) break;

      const node = this.reducible[level].pop();
      this._mergeNodes(node);
      this.leafCount--;
    }
  }

  _mergeNodes(node) {
    for (let i = 0; i < 8; i++) {
      if (node.children[i]) {
        node.pixelCount += node.children[i].pixelCount;
        node.redSum += node.children[i].redSum;
        node.greenSum += node.children[i].greenSum;
        node.blueSum += node.children[i].blueSum;
        node.children[i] = null;
      }
    }
    node.isLeaf = true;
    node.red = Math.round(node.redSum / node.pixelCount);
    node.green = Math.round(node.greenSum / node.pixelCount);
    node.blue = Math.round(node.blueSum / node.pixelCount);
  }

  // Get the quantized color for a given RGB value
  getQuantizedColor(r, g, b) {
    const index = this.getColorIndex(r, g, b, 0);
    return this._getQuantizedColor(this.root, r, g, b, index, 0);
  }

  _getQuantizedColor(node, r, g, b, index, level) {
    if (node.isLeaf) {
      return [node.red, node.green, node.blue];
    } else {
      const childIndex = (index >> (7 - level)) & 0x7;
      if (node.children[childIndex]) {
        return this._getQuantizedColor(node.children[childIndex], r, g, b, index, level + 1);
      } else {
        return [node.red, node.green, node.blue];
      }
    }
  }

  // Get the index for a color at a given level
  getColorIndex(r, g, b, level) {
    let index = 0;
    const mask = 0x80 >> level;
    if (r & mask) index |= 0x4;
    if (g & mask) index |= 0x2;
    if (b & mask) index |= 0x1;
    return index;
  }
}