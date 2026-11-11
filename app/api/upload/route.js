import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Allowed upload subfolders
const ALLOWED_FOLDERS = ["products", "packages", "hero", "promo", "general"];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    let fileBuffer = null;
    let fileName = "";
    let fileExt = "webp";
    let folder = "general";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const reqFolder = formData.get("folder");

      if (reqFolder && ALLOWED_FOLDERS.includes(reqFolder.toString())) {
        folder = reqFolder.toString();
      }

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
      }

      const originalName = file.name || "upload";
      const detectedExt = path.extname(originalName).replace(".", "").toLowerCase();
      if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(detectedExt)) {
        fileExt = detectedExt;
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = `${folder}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${fileExt}`;
    } else {
      // JSON payload (e.g. compressed dataUrl)
      let body;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const { dataUrl, folder: reqFolder, filename: reqFilename } = body || {};

      if (reqFolder && ALLOWED_FOLDERS.includes(reqFolder)) {
        folder = reqFolder;
      }

      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ error: "No dataUrl provided" }, { status: 400 });
      }

      // Parse data URL
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid base64 data URL" }, { status: 400 });
      }

      const mime = matches[1];
      const base64Data = matches[2];

      if (mime.includes("png")) fileExt = "png";
      else if (mime.includes("jpeg") || mime.includes("jpg")) fileExt = "jpg";
      else if (mime.includes("svg")) fileExt = "svg";
      else fileExt = "webp";

      fileBuffer = Buffer.from(base64Data, "base64");

      if (fileBuffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
      }

      const basePrefix = reqFilename ? path.parse(reqFilename).name.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() : folder;
      fileName = `${basePrefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${fileExt}`;
    }

    // 1. Ensure local storage directory exists for offline/local preview
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save local copy in public/uploads/[folder]
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    const localPublicUrl = `/uploads/${folder}/${fileName}`;

    // 2. Direct HTTP Bridge to cPanel (https://kalefurnitures.com/api/upload.php)
    const cpanelUploadUrl = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_URL || "https://kalefurnitures.com/api/upload.php";
    const cpanelSecret = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_SECRET || "my_secure_cpanel_token_2026";

    if (cpanelUploadUrl && cpanelSecret) {
      try {
        const cpanelFormData = new FormData();
        cpanelFormData.append("secret", cpanelSecret);
        cpanelFormData.append("folder", folder);
        cpanelFormData.append(
          "file",
          new Blob([fileBuffer], { type: `image/${fileExt}` }),
          fileName
        );

        const cpanelRes = await fetch(cpanelUploadUrl, {
          method: "POST",
          body: cpanelFormData,
        });

        if (cpanelRes.ok) {
          const cpanelData = await cpanelRes.json();
          if (cpanelData.success && cpanelData.url) {
            console.log("[upload] Successfully uploaded to live cPanel:", cpanelData.url);
            return NextResponse.json({
              success: true,
              url: cpanelData.url,
              filename: cpanelData.filename || fileName,
              folder,
              storage: "cpanel_live",
              local_backup: localPublicUrl,
            });
          } else {
            console.warn("[upload] cPanel upload API response:", cpanelData);
          }
        } else {
          console.warn("[upload] cPanel HTTP response status:", cpanelRes.status);
        }
      } catch (cpanelErr) {
        console.warn("[upload] cPanel bridge error (falling back to local):", cpanelErr.message);
      }
    }

    // Return the local URL if cPanel upload was not used or failed
    return NextResponse.json({
      success: true,
      url: localPublicUrl,
      filename: fileName,
      folder,
      storage: "local",
      live_url: `https://kalefurnitures.com${localPublicUrl}`,
    });
  } catch (error) {
    console.error("[upload] Error processing upload:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}


