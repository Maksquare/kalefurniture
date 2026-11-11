/**
 * Catalog Intelligence & Validation Utilities
 * Handles:
 *  - Product code sequence gap detection (e.g. KSF001, KKC001, KKC002)
 *  - Duplicate product name & code detection
 *  - Duplicate image detection across single and bulk uploads
 *  - High-performance, weighted multi-attribute product search
 */

// Category prefix mappings for Ethiopian furniture catalog
export const CATEGORY_DEFAULT_PREFIXES = {
  "Living Room": "KSF",     // Kal Sofa / Living Room
  "living-room": "KSF",
  "Kitchen Cabinet": "KKC", // Kal Kitchen Cabinet
  "kitchen-cabinet": "KKC",
  "Dining Room": "KDN",     // Kal Dining Room
  "Dining Area": "KDN",
  "dining-room": "KDN",
  "Bedroom": "KBD",         // Kal Bedroom / Bed
  "bedroom": "KBD",
  "Home Office": "KHO",     // Kal Home Office
  "home-office": "KHO",
  "Coffee Table": "KCT",    // Kal Coffee Table
  "Chair": "KCH",           // Kal Accent Chair
};

/**
 * Extract clean filename from URL or File
 * e.g. "https://example.com/uploads/1712345678-modern-sofa.jpg" -> "modern-sofa.jpg"
 * e.g. "uploads/products/KKC001.png" -> "kkc001.png"
 */
export function extractCleanImageBasename(imageRef) {
  if (!imageRef) return "";
  let name = "";
  if (typeof imageRef === "string") {
    // Strip query parameters
    const cleanUrl = imageRef.split("?")[0];
    const rawFilename = cleanUrl.split("/").pop() || "";
    name = decodeURIComponent(rawFilename);
  } else if (imageRef && typeof imageRef === "object" && imageRef.name) {
    name = imageRef.name;
  }

  // Remove common timestamp/random prefixes like "1712345678-" or "upload-xyz-"
  name = name.toLowerCase().trim();
  const withoutTimestamp = name.replace(/^(\d{10,14}|file-\d+|upload-\d+)[-_]/, "");
  return withoutTimestamp;
}

/**
 * Check if an image is already uploaded or used by any product in the catalog
 * @param {File|string} fileOrUrl 
 * @param {Array} existingProducts 
 * @param {string|null} currentProductId 
 * @returns {object} { isDuplicate, matchedProduct, matchedImageUrl, message }
 */
export function checkImageDuplicate(fileOrUrl, existingProducts = [], currentProductId = null) {
  if (!fileOrUrl || !Array.isArray(existingProducts) || existingProducts.length === 0) {
    return { isDuplicate: false, matchedProduct: null, matchedImageUrl: null, message: null };
  }

  const targetBasename = extractCleanImageBasename(fileOrUrl);
  if (!targetBasename || targetBasename.length < 3) {
    return { isDuplicate: false, matchedProduct: null, matchedImageUrl: null, message: null };
  }

  // Check against all products (excluding the product currently being edited)
  for (const prod of existingProducts) {
    if (currentProductId && prod.id === currentProductId) continue;

    const prodImages = Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []);
    for (const imgUrl of prodImages) {
      const existingBasename = extractCleanImageBasename(imgUrl);
      if (!existingBasename) continue;

      // Exact match or base filename match without extension
      const targetNoExt = targetBasename.replace(/\.[^/.]+$/, "");
      const existingNoExt = existingBasename.replace(/\.[^/.]+$/, "");

      const isExactMatch = targetBasename === existingBasename;
      const isBaseMatch = targetNoExt.length > 3 && targetNoExt === existingNoExt;

      if (isExactMatch || isBaseMatch) {
        return {
          isDuplicate: true,
          matchedProduct: prod,
          matchedImageUrl: imgUrl,
          matchedFilename: targetBasename,
          message: `This image "${targetBasename}" is already uploaded and used by product "${prod.name || prod.id}".`,
        };
      }
    }
  }

  return { isDuplicate: false, matchedProduct: null, matchedImageUrl: null, message: null };
}

/**
 * Parse product code pattern from a string
 * Matches codes like: KSF001, KKC002, KBD015, KSF-001, KKC 001, etc.
 * @param {string} text 
 * @returns {object|null} { prefix, number, formattedCode, rawCode }
 */
export function parseProductCode(text) {
  if (!text || typeof text !== "string") return null;

  // Regex captures 2-6 letters followed by optional dash/space and 1-5 digits
  const match = text.trim().match(/(?:^|\b)([A-Za-z]{2,6})\s*[-_]?\s*(\d{1,5})\b/i);
  if (!match) return null;

  const prefix = match[1].toUpperCase();
  const rawNum = parseInt(match[2], 10);
  const paddingLength = Math.max(3, match[2].length);
  const formattedCode = `${prefix}${String(rawNum).padStart(paddingLength, "0")}`;

  return {
    prefix,
    number: rawNum,
    paddingLength,
    formattedCode,
    rawCode: match[0],
  };
}

/**
 * Get all codes used in the catalog for a specific prefix
 * @param {string} prefix 
 * @param {Array} existingProducts 
 * @param {string|null} currentProductId 
 * @returns {Array<number>} sorted unique numbers used
 */
export function getUsedNumbersForPrefix(prefix, existingProducts = [], currentProductId = null) {
  if (!prefix || !Array.isArray(existingProducts)) return [];
  const cleanPrefix = prefix.toUpperCase();
  const numbersSet = new Set();

  for (const prod of existingProducts) {
    if (currentProductId && prod.id === currentProductId) continue;
    const candidates = [prod.name, prod.code, prod.productCode, prod.id].filter(Boolean);
    
    for (const text of candidates) {
      const parsed = parseProductCode(text);
      if (parsed && parsed.prefix === cleanPrefix) {
        numbersSet.add(parsed.number);
      }
    }
  }

  return Array.from(numbersSet).sort((a, b) => a - b);
}

/**
 * Automatically derive a clean 3-4 letter prefix starting with 'K' (e.g. Kal Furniture)
 * e.g. "Kitchen Cabinet" -> "KKC"
 * e.g. "Outdoor Patio" -> "KOD"
 * e.g. "Living Room" -> "KSF"
 * e.g. "Dining Room" -> "KDN"
 * e.g. "Wardrobe" -> "KWD"
 */
export function generateCategoryPrefix(categoryName) {
  if (!categoryName || typeof categoryName !== "string") return "KSF";
  const trimmed = categoryName.trim();
  if (CATEGORY_DEFAULT_PREFIXES[trimmed]) {
    return CATEGORY_DEFAULT_PREFIXES[trimmed];
  }
  
  const words = trimmed.split(/[\s-_]+/).filter(Boolean);
  if (words.length >= 2) {
    const firstInitial = words[0][0].toUpperCase();
    const secondInitial = words[1][0].toUpperCase();
    return `K${firstInitial}${secondInitial}`;
  } else if (words.length === 1) {
    const word = words[0].toUpperCase();
    if (word.length <= 3) return `K${word}`.slice(0, 3);
    const consonants = word.slice(1).replace(/[AEIOU]/g, '');
    const secondChar = consonants[0] || word[1] || 'X';
    const thirdChar = consonants[1] || word[2] || 'F';
    return `K${secondChar}${thirdChar}`;
  }
  return "KSF";
}

/**
 * Calculate the next sequential product code for a prefix or category
 * @param {string} prefixOrCategory 
 * @param {Array} existingProducts 
 * @param {object} customPrefixMap
 * @returns {string} e.g. "KSF001" or "KKC003"
 */
export function getNextProductCode(prefixOrCategory, existingProducts = [], customPrefixMap = {}) {
  const prefix = (customPrefixMap && customPrefixMap[prefixOrCategory]) ||
    CATEGORY_DEFAULT_PREFIXES[prefixOrCategory] || 
    (parseProductCode(prefixOrCategory)?.prefix || generateCategoryPrefix(prefixOrCategory));
  
  const usedNumbers = getUsedNumbersForPrefix(prefix, existingProducts);
  const nextNum = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

/**
 * Check if the entered product code has a sequence gap or duplicate
 * e.g., if user jumped from KKC001 to KKC003, or started at KKC002 without KKC001
 * @param {string} codeOrName 
 * @param {Array} existingProducts 
 * @param {string|null} currentProductId 
 * @returns {object}
 */
export function checkProductCodeSequence(codeOrName, existingProducts = [], currentProductId = null) {
  const parsed = parseProductCode(codeOrName);
  if (!parsed) {
    return {
      hasCode: false,
      hasGap: false,
      isDuplicate: false,
      message: null,
    };
  }

  const { prefix, number: enteredNumber, paddingLength, formattedCode } = parsed;
  const usedNumbers = getUsedNumbersForPrefix(prefix, existingProducts, currentProductId);

  // 1. Check if the code is already used by another product (Duplicate Code)
  if (usedNumbers.includes(enteredNumber)) {
    const matched = existingProducts.find(p => {
      if (currentProductId && p.id === currentProductId) return false;
      const pParsed = parseProductCode(p.name || p.code);
      return pParsed && pParsed.prefix === prefix && pParsed.number === enteredNumber;
    });

    return {
      hasCode: true,
      hasGap: false,
      isDuplicate: true,
      prefix,
      enteredNumber,
      formattedCode,
      matchedProduct: matched,
      message: `Code "${formattedCode}" is already in use by product "${matched?.name || 'an existing item'}"!`,
      type: "duplicate",
    };
  }

  // 2. Check for sequence gaps
  // Case A: Catalog has NO items under this prefix yet, but user entered > 1 (e.g. KKC002 or KKC005)
  if (usedNumbers.length === 0) {
    if (enteredNumber > 1) {
      const expectedCode = `${prefix}${String(1).padStart(paddingLength, "0")}`;
      return {
        hasCode: true,
        hasGap: true,
        isDuplicate: false,
        prefix,
        enteredNumber,
        formattedCode,
        expectedNextCode: expectedCode,
        skippedCodes: [expectedCode],
        message: `Sequence jump detected: You wrote "${formattedCode}", but "${expectedCode}" does not exist yet. Expected starting code is "${expectedCode}".`,
        type: "gap",
      };
    }

    // Starting at 1 is valid
    return {
      hasCode: true,
      hasGap: false,
      isDuplicate: false,
      prefix,
      enteredNumber,
      formattedCode,
      message: `✓ First item in series (${formattedCode})`,
      type: "valid",
    };
  }

  // Case B: Catalog already has items under this prefix
  const maxUsed = Math.max(...usedNumbers);
  const expectedNextNum = maxUsed + 1;
  const expectedNextCode = `${prefix}${String(expectedNextNum).padStart(paddingLength, "0")}`;

  // Check if there are missing numbers below the entered number
  const skippedNumbers = [];
  for (let i = 1; i < enteredNumber; i++) {
    if (!usedNumbers.includes(i)) {
      skippedNumbers.push(i);
    }
  }

  if (skippedNumbers.length > 0) {
    const skippedCodeStrings = skippedNumbers.map(n => `${prefix}${String(n).padStart(paddingLength, "0")}`);
    const firstSkipped = skippedCodeStrings[0];

    return {
      hasCode: true,
      hasGap: true,
      isDuplicate: false,
      prefix,
      enteredNumber,
      formattedCode,
      expectedNextCode,
      suggestedFixCode: firstSkipped,
      skippedCodes: skippedCodeStrings,
      message: `Sequence gap detected: You entered "${formattedCode}", but ${
        skippedCodeStrings.length === 1 
          ? `"${skippedCodeStrings[0]}" was skipped!` 
          : `codes [${skippedCodeStrings.slice(0, 3).join(", ")}${skippedCodeStrings.length > 3 ? "..." : ""}] are missing!`
      } Next expected sequence code is "${expectedNextCode}".`,
      type: "gap",
    };
  }

  return {
    hasCode: true,
    hasGap: false,
    isDuplicate: false,
    prefix,
    enteredNumber,
    formattedCode,
    message: `✓ Correct sequence (${formattedCode})`,
    type: "valid",
  };
}

/**
 * Check if product name is already in use
 * @param {string} name 
 * @param {Array} existingProducts 
 * @param {string|null} currentProductId 
 * @returns {object} { isDuplicate, matchedProduct, message }
 */
export function checkDuplicateName(name, existingProducts = [], currentProductId = null) {
  if (!name || typeof name !== "string") {
    return { isDuplicate: false, matchedProduct: null, message: null };
  }

  const cleanName = name.trim().toLowerCase();
  if (cleanName.length < 2) {
    return { isDuplicate: false, matchedProduct: null, message: null };
  }

  const matched = existingProducts.find(p => {
    if (currentProductId && p.id === currentProductId) return false;
    return (p.name || "").trim().toLowerCase() === cleanName;
  });

  if (matched) {
    return {
      isDuplicate: true,
      matchedProduct: matched,
      message: `A product with the name "${name.trim()}" already exists in the catalog (${matched.category || 'Inventory'}).`,
    };
  }

  return { isDuplicate: false, matchedProduct: null, message: null };
}

/**
 * Clean & normalize string for high-speed token search
 */
function normalizeSearchText(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
    .replace(/[-_/\\,.:;()]/g, " ")  // Replace punctuation with spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best and efficient multi-attribute product search
 * Searches across:
 *  - Product Code (KSF001, KKC002) - highest weight
 *  - Product Name
 *  - Category & Type
 *  - Materials, Finish, Structure, Wood & Fabric
 *  - Description & Tags
 * 
 * Supports multi-token search with ranking and relevance scoring.
 * 
 * @param {Array} products 
 * @param {string} rawQuery 
 * @returns {Array} sorted matching products with match metadata
 */
export function efficientSearchProducts(products = [], rawQuery = "") {
  if (!Array.isArray(products) || products.length === 0) return [];
  if (!rawQuery || typeof rawQuery !== "string") return products;

  const cleanQuery = normalizeSearchText(rawQuery);
  if (!cleanQuery) return products;

  const queryTokens = cleanQuery.split(" ").filter(t => t.length > 0);
  const compactQuery = cleanQuery.replace(/\s+/g, ""); // e.g. "ksf001" if user typed "ksf 001"

  const scoredResults = [];

  for (const product of products) {
    const prodName = product.name || "";
    const prodCode = product.code || parseProductCode(prodName)?.formattedCode || "";
    const prodCategory = product.category || "";
    const prodType = product.type || "";
    const prodDesc = product.description || "";
    const prodFinish = product.finish || "";
    const prodStructure = product.structure || "";
    const prodColor = product.color || "";

    // Normalize attributes
    const normName = normalizeSearchText(prodName);
    const normCode = normalizeSearchText(prodCode).replace(/\s+/g, "");
    const normCategory = normalizeSearchText(prodCategory);
    const normType = normalizeSearchText(prodType);
    const normDesc = normalizeSearchText(prodDesc);
    const normDetails = normalizeSearchText(`${prodFinish} ${prodStructure} ${prodColor}`);

    // Combined searchable corpus
    const fullCorpus = `${normName} ${normCode} ${normCategory} ${normType} ${normDetails} ${normDesc}`;

    // 1. All tokens must be present in the product corpus (AND condition)
    const allTokensMatch = queryTokens.every(token => {
      // Check compact match for codes (e.g. user typed "ksf" or "001" or "ksf001")
      if (normCode && normCode.includes(token)) return true;
      return fullCorpus.includes(token);
    });

    if (!allTokensMatch) continue;

    // 2. Calculate Weighted Relevance Score
    let score = 0;

    // A. Code Exact / Compact Match (Highest priority)
    if (normCode && (normCode === compactQuery || normCode === cleanQuery)) {
      score += 150;
    } else if (normCode && normCode.includes(compactQuery)) {
      score += 90;
    }

    // B. Title Exact / Prefix Match
    if (normName === cleanQuery) {
      score += 120;
    } else if (normName.startsWith(cleanQuery)) {
      score += 80;
    } else if (normName.includes(cleanQuery)) {
      score += 60;
    }

    // C. Individual Token Distribution
    for (const token of queryTokens) {
      if (normName.includes(token)) score += 30;
      if (normCategory.includes(token)) score += 20;
      if (normType.includes(token)) score += 15;
      if (normDetails.includes(token)) score += 10;
      if (normDesc.includes(token)) score += 5;
    }

    // D. Boost featured & in-stock items slightly
    if (product.featured) score += 5;
    if (!product.outOfStock) score += 2;

    scoredResults.push({
      product,
      score,
      matchedCode: prodCode,
    });
  }

  // Sort descending by relevance score
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.map(item => item.product);
}
