import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

function ensureUploadsDir() {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
}

export const multerDiskStorage = diskStorage({
    destination: (_req, _file, cb) => {
        ensureUploadsDir();
        cb(null, 'uploads');
    },
    filename: (_req, file, cb) => {
        // orijinal uzantıyı koru
        const ext = extname(file.originalname || '') || '';
        cb(null, `${randomUUID()}${ext}`);
    },
});

export function imageFileFilter(_req: any, file: Express.Multer.File, cb: any) {
    // sadece image
    if (!file.mimetype?.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
}
