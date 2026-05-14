// File storage service. Uses Cloudflare R2 in production, local disk in dev.
// To enable R2, set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET in env.

import fs from "fs";
import path from "path";
import crypto from "crypto";

const LOCAL_DIR = path.join(process.cwd(), "uploads");

const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
};
const useR2 = !!(r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucket);

// Ensure local dir exists for dev fallback
if (!useR2 && !fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

function generateKey(originalName: string): string {
  const ext = path.extname(originalName);
  const random = crypto.randomBytes(16).toString("hex");
  return `${Date.now()}-${random}${ext}`;
}

// AWS Signature v4 implementation for R2 (S3-compatible)
async function signedR2Request(
  method: "GET" | "PUT" | "DELETE",
  key: string,
  body?: Buffer,
  contentType?: string,
): Promise<Response> {
  const host = `${r2Config.accountId}.r2.cloudflarestorage.com`;
  const url = `https://${host}/${r2Config.bucket}/${encodeURIComponent(key)}`;
  const region = "auto";
  const service = "s3";

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = body
    ? crypto.createHash("sha256").update(body).digest("hex")
    : "UNSIGNED-PAYLOAD";

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((k) => `${k}:${headers[k]}\n`).join("");

  const canonicalRequest = [
    method,
    `/${r2Config.bucket}/${encodeURIComponent(key)}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = crypto.createHmac("sha256", `AWS4${r2Config.secretAccessKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  headers["authorization"] =
    `AWS4-HMAC-SHA256 Credential=${r2Config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(url, {
    method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  });
}

export interface StoredFile {
  key: string;
  size: number;
}

export async function uploadFile(buffer: Buffer, originalName: string, contentType: string): Promise<StoredFile> {
  const key = generateKey(originalName);

  if (useR2) {
    const res = await signedR2Request("PUT", key, buffer, contentType);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`R2 upload failed ${res.status}: ${text}`);
    }
  } else {
    fs.writeFileSync(path.join(LOCAL_DIR, key), buffer);
  }

  return { key, size: buffer.length };
}

export async function getFile(key: string): Promise<Buffer | null> {
  if (useR2) {
    const res = await signedR2Request("GET", key);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`R2 get failed ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  } else {
    const filePath = path.join(LOCAL_DIR, key);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath);
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (useR2) {
    const res = await signedR2Request("DELETE", key);
    if (!res.ok && res.status !== 404) {
      throw new Error(`R2 delete failed ${res.status}`);
    }
  } else {
    const filePath = path.join(LOCAL_DIR, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export const storageBackend = useR2 ? "r2" : "local";
