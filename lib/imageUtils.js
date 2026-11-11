export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as WebP for smaller size
        const compressedBase64 = canvas.toDataURL("image/webp", quality);
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const dataUrlToBlob = (dataUrl) => {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].replace("data:", "") || "image/webp";
  const binary = atob(parts[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: contentType });
};

/**
 * Resolves any image URL or file path so that:
 * - cPanel uploaded files (e.g. /uploads/... or https://kalefurnitures.com/uploads/...) are properly fetched
 * - data URLs and remote URLs are preserved as is
 * - local assets like /assets/... are preserved
 */
export const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") return "/assets/img/hero/beige-chair.jpeg";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalefurnitures.com";
    return `${siteUrl}${url}`;
  }
  return url;
};

/**
 * Compresses an image and uploads it to cPanel server storage (/api/upload.php or /api/upload).
 * Supports real-time progress callbacks for smart progress bars,
 * cancel tokens (AbortSignal), and automatic WebP compression.
 * 
 * Returns the public URL path/URL to be saved in Supabase database.
 */
export const uploadImageFile = async (
  file,
  folder = "general",
  optionsOrMaxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85,
  onProgress = null
) => {
  if (!file) throw new Error("No file selected.");

  // If already a URL or path, return as is
  if (typeof file === "string" && (file.startsWith("/") || file.startsWith("http"))) {
    return file;
  }

  // Parse flexible options (object vs positional arguments)
  let maxWidthVal = 1600;
  let maxHeightVal = 1600;
  let qualityVal = 0.85;
  let progressCb = null;
  let signal = null;

  if (typeof optionsOrMaxWidth === "object" && optionsOrMaxWidth !== null) {
    maxWidthVal = optionsOrMaxWidth.maxWidth ?? 1600;
    maxHeightVal = optionsOrMaxWidth.maxHeight ?? 1600;
    qualityVal = optionsOrMaxWidth.quality ?? 0.85;
    progressCb = optionsOrMaxWidth.onProgress || null;
    signal = optionsOrMaxWidth.signal || null;
  } else {
    if (typeof optionsOrMaxWidth === "number") maxWidthVal = optionsOrMaxWidth;
    if (typeof maxHeight === "number") maxHeightVal = maxHeight;
    if (typeof quality === "number") qualityVal = quality;
    progressCb = onProgress;
  }

  const fileName = file?.name || `${folder}-${Date.now()}.webp`;
  const fileSize = file?.size || 0;

  // Stage 1: Client Compression (0% - 25%)
  progressCb?.({
    percent: 10,
    stage: "compressing",
    stageText: "Optimizing image dimensions & converting to WebP...",
    fileName,
    loadedBytes: 0,
    totalBytes: fileSize,
  });

  let dataUrl;
  if (file instanceof Blob || file instanceof File) {
    dataUrl = await compressImage(file, maxWidthVal, maxHeightVal, qualityVal);
  } else if (typeof file === "string" && file.startsWith("data:")) {
    dataUrl = file;
  } else {
    throw new Error("Invalid file format for upload.");
  }

  progressCb?.({
    percent: 25,
    stage: "uploading",
    stageText: "Connecting to cPanel cloud storage...",
    fileName,
    loadedBytes: Math.round(fileSize * 0.25),
    totalBytes: fileSize,
  });

  const cpanelUploadUrl = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_URL || "https://kalefurnitures.com/api/upload.php";
  const cpanelSecret = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_SECRET || "my_secure_cpanel_token_2026";

  const performUpload = (endpoint, isCpanelDirect = false) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);

      if (signal) {
        if (signal.aborted) {
          xhr.abort();
          const err = new Error("Upload aborted");
          progressCb?.({ percent: 0, stage: "error", error: "Upload cancelled", fileName });
          return reject(err);
        }
        signal.addEventListener("abort", () => {
          xhr.abort();
          const err = new Error("Upload aborted by user");
          progressCb?.({ percent: 0, stage: "error", error: "Upload cancelled", fileName });
          reject(err);
        });
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const networkRatio = event.loaded / event.total;
          const mappedPct = Math.min(85, Math.round(25 + networkRatio * 60));
          progressCb?.({
            percent: mappedPct,
            stage: "uploading",
            stageText: `Transferring to cPanel (${Math.round(networkRatio * 100)}%)...`,
            fileName,
            loadedBytes: event.loaded,
            totalBytes: event.total,
          });
        }
      };

      xhr.upload.onload = () => {
        progressCb?.({
          percent: 90,
          stage: "syncing",
          stageText: "Synchronizing with cPanel storage & generating CDN link...",
          fileName,
          loadedBytes: fileSize,
          totalBytes: fileSize,
        });
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data && data.success && data.url) {
              progressCb?.({
                percent: 100,
                stage: "done",
                stageText: "Successfully uploaded to cPanel!",
                fileName,
                url: data.url,
                loadedBytes: fileSize,
                totalBytes: fileSize,
              });
              resolve(data.url);
            } else {
              const msg = data?.error || "Upload failed on server.";
              reject(new Error(msg));
            }
          } catch (e) {
            reject(new Error("Invalid server response."));
          }
        } else {
          let msg = `Upload failed with status ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            if (errorData?.error) msg = errorData.error;
          } catch {}
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload."));
      };

      xhr.onabort = () => {
        progressCb?.({ percent: 0, stage: "error", error: "Upload cancelled", fileName });
        reject(new Error("Upload aborted by user."));
      };

      if (isCpanelDirect) {
        const formData = new FormData();
        formData.append("secret", cpanelSecret);
        formData.append("folder", folder);
        const blob = dataUrlToBlob(dataUrl);
        formData.append("file", blob, fileName);
        xhr.send(formData);
      } else {
        xhr.setRequestHeader("Content-Type", "application/json");
        const payload = JSON.stringify({
          dataUrl,
          folder,
          filename: fileName,
        });
        xhr.send(payload);
      }
    });
  };

  // Try direct cPanel upload first (works on both cPanel live and local dev)
  try {
    return await performUpload(cpanelUploadUrl, true);
  } catch (err) {
    console.warn("[uploadImageFile] Direct cPanel upload attempt error, trying /api/upload fallback:", err.message);
    try {
      return await performUpload("/api/upload", false);
    } catch (fallbackErr) {
      console.error("[uploadImageFile] Both upload attempts failed:", fallbackErr.message);
      progressCb?.({ percent: 0, stage: "error", error: fallbackErr.message, fileName });
      throw fallbackErr;
    }
  }
};


