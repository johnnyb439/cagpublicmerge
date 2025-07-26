import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createHash } from 'crypto'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'cleared-advisory-prod'

// Bucket structure
const BUCKET_PATHS = {
  resumes: 'resumes',
  profilePhotos: 'profile-photos',
  documents: 'documents',
  auditLogs: 'audit-logs'
} as const

export type BucketPath = keyof typeof BUCKET_PATHS

// File upload options
export interface UploadOptions {
  path: BucketPath
  fileName: string
  file: Buffer | Uint8Array | string
  contentType: string
  userId: string
  metadata?: Record<string, string>
  encrypt?: boolean
}

// Upload file to S3
export async function uploadFile(options: UploadOptions): Promise<string> {
  const {
    path,
    fileName,
    file,
    contentType,
    userId,
    metadata = {},
    encrypt = true
  } = options

  // Generate secure file key
  const timestamp = Date.now()
  const hash = createHash('sha256')
    .update(`${userId}-${fileName}-${timestamp}`)
    .digest('hex')
    .substring(0, 8)
  
  const key = `${BUCKET_PATHS[path]}/${userId}/${timestamp}-${hash}-${sanitizeFileName(fileName)}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ServerSideEncryption: encrypt ? 'AES256' : undefined,
    Metadata: {
      ...metadata,
      userId,
      uploadedAt: new Date().toISOString()
    },
    StorageClass: path === 'auditLogs' ? 'GLACIER' : 'STANDARD'
  })

  try {
    await s3Client.send(command)
    return key
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('Failed to upload file')
  }
}

// Generate presigned URL for secure file access
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('S3 presigned URL error:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<boolean> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  try {
    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    return false
  }
}

// Check if file exists
export async function fileExists(key: string): Promise<boolean> {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  try {
    await s3Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

// List files for a user
export async function listUserFiles(
  userId: string,
  path: BucketPath,
  maxKeys: number = 100
): Promise<Array<{
  key: string
  size: number
  lastModified: Date
  metadata?: Record<string, string>
}>> {
  const prefix = `${BUCKET_PATHS[path]}/${userId}/`
  
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys
  })

  try {
    const response = await s3Client.send(command)
    
    return (response.Contents || []).map(item => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified!,
      metadata: item.Metadata
    }))
  } catch (error) {
    console.error('S3 list error:', error)
    return []
  }
}

// Sanitize file name
function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

// File type validation
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

// File size validation (in bytes)
export function isValidFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): boolean {
  return size > 0 && size <= maxSize
}

// Resume-specific upload
export async function uploadResume(
  userId: string,
  fileName: string,
  file: Buffer,
  metadata?: Record<string, string>
): Promise<string> {
  // Validate file type
  if (!isValidFileType(fileName, ['pdf', 'doc', 'docx'])) {
    throw new Error('Invalid file type. Only PDF and Word documents are allowed.')
  }

  // Validate file size (5MB for resumes)
  if (!isValidFileSize(file.length, 5 * 1024 * 1024)) {
    throw new Error('File size exceeds 5MB limit')
  }

  return uploadFile({
    path: 'resumes',
    fileName,
    file,
    contentType: getContentType(fileName),
    userId,
    metadata,
    encrypt: true
  })
}

// Profile photo upload
export async function uploadProfilePhoto(
  userId: string,
  fileName: string,
  file: Buffer
): Promise<string> {
  // Validate file type
  if (!isValidFileType(fileName, ['jpg', 'jpeg', 'png', 'webp'])) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
  }

  // Validate file size (2MB for photos)
  if (!isValidFileSize(file.length, 2 * 1024 * 1024)) {
    throw new Error('File size exceeds 2MB limit')
  }

  return uploadFile({
    path: 'profilePhotos',
    fileName,
    file,
    contentType: getContentType(fileName),
    userId,
    encrypt: false // Public CDN access
  })
}

// Get content type from file extension
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  }
  
  return contentTypes[extension || ''] || 'application/octet-stream'
}

// Generate public CDN URL for profile photos
export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

// Compliance: Generate audit log backup
export async function backupAuditLogs(logs: any[]): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0]
  const fileName = `audit-logs-${timestamp}.json`
  
  return uploadFile({
    path: 'auditLogs',
    fileName,
    file: JSON.stringify(logs, null, 2),
    contentType: 'application/json',
    userId: 'system',
    metadata: {
      type: 'audit-backup',
      count: String(logs.length)
    },
    encrypt: true
  })
}