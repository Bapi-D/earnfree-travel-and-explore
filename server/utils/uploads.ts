import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    throw error;
  }
}

export async function saveUploadedFile(
  opts: {
    buffer: Buffer;
    originalName: string;
    mimeType?: string;
  },
): Promise<string> {
  await ensureUploadDir();

  const { buffer, originalName } = opts;
  const ext = originalName.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  try {
    await writeFile(filepath, buffer);
    // Return relative path for URL
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Failed to save file:', error);
    throw new Error('Failed to save uploaded file');
  }
}


export async function deleteUploadedFile(imageUrl: string): Promise<void> {
  try {
    const filename = imageUrl.split('/').pop();
    if (!filename) return;

    const filepath = join(UPLOAD_DIR, filename);
    // Only delete if it's in the uploads directory
    if (!filepath.startsWith(UPLOAD_DIR)) {
      console.warn('Attempted to delete file outside uploads directory');
      return;
    }

    const { unlink } = await import('fs/promises');
    await unlink(filepath).catch(() => {
      // File might not exist, that's okay
    });
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}
