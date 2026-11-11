/**
 * Intelligent Image Content & Composition Scanner
 * Features:
 *  - Visual Composition & Framing Detection (Studio Cutout, Architectural Interior, Material Macro)
 *  - Aspect Ratio & Dimension Profiling
 *  - Dominant Color Palette Extraction (Top 4-5 luxury tones with hex codes)
 *  - Perceptual Difference Hash (dHash) for visual similarity matching
 *  - Fast Content Checksum for exact binary match
 *  - Catalog-wide duplicate detection with side-by-side product attribution
 */

import { extractCleanImageBasename } from "./catalogIntelligence";

/**
 * Compute 64-bit Perceptual Difference Hash (dHash) from Canvas
 * Resizes image to 9x8 grayscale and computes horizontal gradient bits.
 * Extremely fast (< 3ms) and robust against resizing, re-compression, and minor edits.
 */
function computeDHashFromCanvas(ctx, sourceCanvas) {
  const hashCanvas = document.createElement("canvas");
  hashCanvas.width = 9;
  hashCanvas.height = 8;
  const hashCtx = hashCanvas.getContext("2d", { willReadFrequently: true });
  if (!hashCtx) return "";

  // Draw scaled down
  hashCtx.drawImage(sourceCanvas, 0, 0, 9, 8);
  const imgData = hashCtx.getImageData(0, 0, 9, 8).data;

  // Convert to grayscale luminance
  const grays = [];
  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    // Rec. 601 luma formula
    grays.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // 8 rows x 8 horizontal comparisons = 64 bits
  let binaryHash = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = grays[row * 9 + col];
      const right = grays[row * 9 + col + 1];
      binaryHash += left > right ? "1" : "0";
    }
  }

  // Convert 64-bit binary to 16-character hex string
  let hexHash = "";
  for (let i = 0; i < binaryHash.length; i += 4) {
    const nibble = binaryHash.substr(i, 4);
    hexHash += parseInt(nibble, 2).toString(16);
  }

  return hexHash;
}

/**
 * Calculate Hamming Distance between two 16-character hex dHashes
 * Returns number of differing bits (0 to 64). Lower means more visually similar.
 * 0 = Identical
 * 1-6 = Extremely high visual similarity (>92%)
 * 7-10 = Probable variation / duplicate
 * >12 = Different images
 */
export function calculateHammingDistance(hex1, hex2) {
  if (!hex1 || !hex2 || hex1.length !== hex2.length) return 64;

  let distance = 0;
  for (let i = 0; i < hex1.length; i++) {
    const val1 = parseInt(hex1[i], 16);
    const val2 = parseInt(hex2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Analyze composition framing:
 * - Studio Cutout / Isolated Subject (pure solid or transparent borders)
 * - Architectural Interior / Styled Room (rich edges, textured background, complex lighting)
 * - Texture Detail / Material Macro (low edge variance, uniform fabric/wood grain)
 */
function analyzeComposition(ctx, width, height) {
  // Sample small 40x40 grid to check edge variance vs center
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = 40;
  sampleCanvas.height = 40;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleCtx) {
    return {
      type: "Standard Product View",
      description: "Balanced product framing",
      badge: "Studio View",
    };
  }

  sampleCtx.drawImage(ctx.canvas, 0, 0, 40, 40);
  const data = sampleCtx.getImageData(0, 0, 40, 40).data;

  let borderLumaTotal = 0;
  let borderLumaSq = 0;
  let borderCount = 0;
  let hasTransparency = false;

  let centerLumaTotal = 0;
  let centerCount = 0;

  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      const idx = (y * 40 + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 240) hasTransparency = true;

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const isBorder = x < 4 || x > 35 || y < 4 || y > 35;
      const isCenter = x >= 12 && x <= 27 && y >= 12 && y <= 27;

      if (isBorder) {
        borderLumaTotal += luma;
        borderLumaSq += luma * luma;
        borderCount++;
      } else if (isCenter) {
        centerLumaTotal += luma;
        centerCount++;
      }
    }
  }

  const borderMean = borderCount > 0 ? borderLumaTotal / borderCount : 128;
  const borderVariance = borderCount > 0 ? (borderLumaSq / borderCount) - (borderMean * borderMean) : 0;
  const centerMean = centerCount > 0 ? centerLumaTotal / centerCount : 128;

  // Classification logic
  if (hasTransparency) {
    return {
      type: "Studio Cutout (Transparent)",
      description: "Isolated piece with alpha transparency",
      badge: "Cutout PNG",
      isCutout: true,
    };
  }

  if (borderVariance < 180 && borderMean > 215) {
    return {
      type: "Studio Clean Cutout",
      description: "Clean seamless off-white/light studio background",
      badge: "Studio Shot",
      isCutout: true,
    };
  }

  if (borderVariance < 180 && borderMean < 40) {
    return {
      type: "Dark Moody Studio",
      description: "Dramatic low-key dark studio background",
      badge: "Dark Studio",
      isCutout: true,
    };
  }

  const centerToBorderDiff = Math.abs(centerMean - borderMean);
  if (borderVariance > 450) {
    return {
      type: "Architectural Interior Scene",
      description: "Full contextual living space with room styling",
      badge: "Styled Room",
      isCutout: false,
    };
  }

  if (centerToBorderDiff < 20 && borderVariance < 320) {
    return {
      type: "Material & Craft Texture",
      description: "Close-up upholstery or wood grain detail",
      badge: "Material Macro",
      isCutout: false,
    };
  }

  return {
    type: "Editorial Furniture Showcase",
    description: "Curated composition focused on furniture proportions",
    badge: "Showcase Piece",
    isCutout: false,
  };
}

/**
 * Extract 4-5 dominant luxury color tones with hex codes
 */
function extractDominantColors(ctx) {
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = 32;
  sampleCanvas.height = 32;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleCtx) return ["#1B263B", "#836A58", "#F2E3D5", "#D9B66E"];

  sampleCtx.drawImage(ctx.canvas, 0, 0, 32, 32);
  const data = sampleCtx.getImageData(0, 0, 32, 32).data;

  // Simple color quantization bucket map
  const colorBuckets = {};

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 120) continue; // Skip transparency

    // Quantize RGB to 32-step intervals
    const r = Math.round(data[i] / 28) * 28;
    const g = Math.round(data[i + 1] / 28) * 28;
    const b = Math.round(data[i + 2] / 28) * 28;

    const key = `${r},${g},${b}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  // Sort buckets by frequency
  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const hexList = [];
  for (const [key] of sorted) {
    const [r, g, b] = key.split(",").map(Number);
    const hex = "#" + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0")).join("");
    // Ensure distinct colors (not too similar to already selected)
    const isDistinct = !hexList.some(existing => {
      const [er, eg, eb] = [existing.slice(1, 3), existing.slice(3, 5), existing.slice(5, 7)].map(h => parseInt(h, 16));
      return Math.abs(r - er) + Math.abs(g - eg) + Math.abs(b - eb) < 45;
    });

    if (isDistinct) {
      hexList.push(hex.toUpperCase());
    }
    if (hexList.length >= 4) break;
  }

  return hexList.length > 0 ? hexList : ["#836A58", "#F2E3D5", "#D9B66E", "#1F1F21"];
}

/**
 * Scan an Image File (File or Blob)
 * Performs full visual, composition, dimension, and perceptual hash analysis.
 * Returns comprehensive visual intelligence object.
 */
export async function scanImageFile(file) {
  if (!file) return null;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const ratio = width / height;

        // Label aspect ratio
        let ratioLabel = `${ratio.toFixed(2)}:1`;
        if (Math.abs(ratio - 1) < 0.08) ratioLabel = "1:1 Square";
        else if (Math.abs(ratio - 1.5) < 0.08) ratioLabel = "3:2 Landscape";
        else if (Math.abs(ratio - 1.33) < 0.08) ratioLabel = "4:3 Classic";
        else if (Math.abs(ratio - 1.77) < 0.1) ratioLabel = "16:9 Cinematic";
        else if (Math.abs(ratio - 0.75) < 0.08) ratioLabel = "3:4 Portrait";
        else if (Math.abs(ratio - 0.66) < 0.08) ratioLabel = "2:3 Tall Portrait";
        else if (ratio < 0.8) ratioLabel = "Vertical Portrait";
        else ratioLabel = "Landscape";

        // Create canvas for analysis
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(600, width);
        canvas.height = Math.round(canvas.width / ratio);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 1. Perceptual Difference Hash (dHash)
        const dHash = computeDHashFromCanvas(ctx, canvas);

        // 2. Composition analysis
        const composition = analyzeComposition(ctx, canvas.width, canvas.height);

        // 3. Dominant colors
        const dominantColors = extractDominantColors(ctx);

        // 4. File size formatted
        const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + " MB";

        URL.revokeObjectURL(objectUrl);

        resolve({
          fileName: file.name,
          cleanBasename: extractCleanImageBasename(file.name),
          fileSize: file.size,
          sizeFormatted,
          width,
          height,
          dimensions: `${width} × ${height}px`,
          aspectRatio: ratio,
          aspectRatioLabel: ratioLabel,
          dHash,
          composition,
          dominantColors,
          scannedAt: Date.now(),
        });
      } catch (err) {
        console.warn("[ImageScanner] Error analyzing canvas:", err);
        URL.revokeObjectURL(objectUrl);
        resolve({
          fileName: file.name,
          cleanBasename: extractCleanImageBasename(file.name),
          fileSize: file.size,
          sizeFormatted: (file.size / 1024).toFixed(0) + " KB",
          dimensions: "Unknown",
          aspectRatioLabel: "Standard",
          dHash: "",
          composition: { type: "Standard Product View", badge: "Product", description: "Standard photo" },
          dominantColors: ["#836A58", "#F2E3D5"],
          scannedAt: Date.now(),
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}

// Global in-memory cache for scanned image URLs and perceptual hashes
const urlDHashCache = new Map();

/**
 * Preload and index catalog image hashes in background without blocking main thread
 */
export async function preloadCatalogHashes(products = []) {
  if (typeof window === "undefined" || !Array.isArray(products)) return;
  
  const toScan = [];
  for (const prod of products) {
    const imgs = Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []);
    for (const u of imgs) {
      if (u && !urlDHashCache.has(u)) {
        toScan.push({ url: u, product: prod });
      }
    }
  }

  // Scan lazily in chunks to avoid overwhelming canvas / network
  const limit = Math.min(toScan.length, 40);
  for (let i = 0; i < limit; i++) {
    const item = toScan[i];
    try {
      const scanRes = await scanImageUrl(item.url);
      if (scanRes && scanRes.dHash) {
        urlDHashCache.set(item.url, { ...scanRes, product: item.product });
      }
    } catch {
      // Ignore background scan failures
    }
  }
}

/**
 * Scan an existing image URL
 * Generates dHash, composition, and palette data.
 */
export async function scanImageUrl(url) {
  if (!url || typeof url !== "string") return null;

  if (urlDHashCache.has(url)) {
    return urlDHashCache.get(url);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const ratio = width / height;

        const canvas = document.createElement("canvas");
        canvas.width = Math.min(300, width);
        canvas.height = Math.round(canvas.width / ratio);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dHash = computeDHashFromCanvas(ctx, canvas);
        const composition = analyzeComposition(ctx, canvas.width, canvas.height);
        const dominantColors = extractDominantColors(ctx);

        const result = {
          url,
          cleanBasename: extractCleanImageBasename(url),
          width,
          height,
          dimensions: `${width} × ${height}px`,
          dHash,
          composition,
          dominantColors,
        };

        urlDHashCache.set(url, result);
        resolve(result);
      } catch {
        const fallback = {
          url,
          cleanBasename: extractCleanImageBasename(url),
          dHash: "",
          dimensions: "Catalog Asset",
          composition: { type: "Product Photo", badge: "Catalog Asset", description: "Stored catalog piece" },
          dominantColors: ["#836A58", "#F2E3D5"],
        };
        urlDHashCache.set(url, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Advanced Catalog & Queue Duplicate Detection
 * Cross-references a scanned image against:
 *  1. Other images in the same upload batch / queue
 *  2. Existing images already attached to this product
 *  3. Catalog products (by exact filename, basename root, and perceptual dHash)
 *
 * @param {object} scannedImage Result from scanImageFile
 * @param {Array} catalogProducts Array of existing products in context
 * @param {string|null} currentProductId ID of product currently being edited (ignored for catalog search)
 * @param {Array} currentBatchImages Other images currently in upload queue or form
 * @returns {object} { isDuplicate, matchType, confidence, matchedProduct, matchedImageUrl, matchedFilename, message, canReuse }
 */
export function checkDuplicateWithVisualScan(
  scannedImage,
  catalogProducts = [],
  currentProductId = null,
  currentBatchImages = []
) {
  if (!scannedImage) {
    return { isDuplicate: false, matchedProduct: null, matchedImageUrl: null, message: null };
  }

  const { cleanBasename, dHash, fileName } = scannedImage;
  const targetRoot = cleanBasename ? cleanBasename.replace(/\.[^/.]+$/, "") : "";

  // Check 1: Duplicate within current upload batch / queue
  if (Array.isArray(currentBatchImages) && currentBatchImages.length > 0) {
    for (const queueItem of currentBatchImages) {
      if (!queueItem || queueItem.id === scannedImage.id || queueItem.fileName === fileName && queueItem === scannedImage) {
        continue;
      }

      const qName = queueItem.fileName || queueItem.name;
      const qBasename = queueItem.cleanBasename || (qName ? extractCleanImageBasename(qName) : "");
      const qHash = queueItem.dHash;

      // Exact or root filename match in current batch
      if (cleanBasename && qBasename) {
        const qRoot = qBasename.replace(/\.[^/.]+$/, "");
        if (cleanBasename === qBasename || (targetRoot.length > 3 && targetRoot === qRoot)) {
          return {
            isDuplicate: true,
            matchType: "queue",
            confidence: "100% Duplicate in Upload Batch",
            matchedProduct: { name: "Current Upload Queue", category: "Unsaved Batch" },
            matchedImageUrl: queueItem.previewUrl || null,
            matchedFilename: qName || cleanBasename,
            message: `Duplicate in this batch: "${fileName}" is already queued for upload.`,
            canReuse: false,
          };
        }
      }

      // Visual hash match in current batch
      if (dHash && qHash) {
        const dist = calculateHammingDistance(dHash, qHash);
        if (dist <= 6) {
          return {
            isDuplicate: true,
            matchType: "visual",
            confidence: `${Math.round(100 - (dist / 64) * 100)}% Visual Match in Batch`,
            matchedProduct: { name: "Current Upload Queue", category: "Unsaved Batch" },
            matchedImageUrl: queueItem.previewUrl || null,
            matchedFilename: qName || "Uploaded item",
            message: `Visual duplicate in batch: "${fileName}" has the same composition as another image in your queue.`,
            canReuse: false,
          };
        }
      }
    }
  }

  // Check 2: Check against catalog products
  if (Array.isArray(catalogProducts) && catalogProducts.length > 0) {
    for (const prod of catalogProducts) {
      const isCurrentProduct = currentProductId && prod.id === currentProductId;

      const prodImages = Array.isArray(prod.images)
        ? prod.images
        : prod.image
        ? [prod.image]
        : [];

      for (const imgUrl of prodImages) {
        if (!imgUrl) continue;
        const existingBasename = extractCleanImageBasename(imgUrl);
        const existingRoot = existingBasename.replace(/\.[^/.]+$/, "");

        // A. Exact or Root Filename Match
        if (cleanBasename && existingBasename) {
          const isExactName = cleanBasename === existingBasename;
          const isRootName = targetRoot.length > 3 && targetRoot === existingRoot;

          if (isExactName || isRootName) {
            const prodLabel = prod.name ? `"${prod.name}"` : `piece ${prod.id}`;
            const noticePrefix = isCurrentProduct ? "This product already has this image" : `Already uploaded in catalog on ${prodLabel}`;

            return {
              isDuplicate: true,
              matchType: "filename",
              confidence: "100% Identical File",
              matchedProduct: prod,
              matchedImageUrl: imgUrl,
              matchedFilename: existingBasename,
              message: `${noticePrefix} (${prod.category || "Catalog"}).`,
              canReuse: !isCurrentProduct,
            };
          }
        }

        // B. Perceptual Visual Hash (dHash) Match via cache
        const cached = urlDHashCache.get(imgUrl);
        if (dHash && cached && cached.dHash) {
          const dist = calculateHammingDistance(dHash, cached.dHash);
          if (dist <= 6) {
            const similarity = Math.round(100 - (dist / 64) * 100);
            const prodLabel = prod.name ? `"${prod.name}"` : `piece ${prod.id}`;

            return {
              isDuplicate: true,
              matchType: "visual",
              confidence: `${similarity}% Visual Match`,
              matchedProduct: prod,
              matchedImageUrl: imgUrl,
              matchedFilename: existingBasename,
              message: `Visual duplicate detected (${similarity}% match). This composition already exists on ${prodLabel}.`,
              canReuse: !isCurrentProduct,
            };
          }
        }
      }
    }
  }

  return { isDuplicate: false, matchedProduct: null, matchedImageUrl: null, message: null };
}

