import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/errors';

const uploadsDir = path.join(process.cwd(), 'public/uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(avatarsDir)) {
	fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, avatarsDir);
	},
	filename: (req, file, cb) => {
		const userId = req.user?.id || 'anonymous';
		const timestamp = Date.now();
		const ext = path.extname(file.originalname);
		cb(null, `${userId}_${timestamp}${ext}`);
	},
});

const avatarFileFilter = (
	req: any,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new BadRequestError('Only image files are allowed!'));
	}
};

export const uploadAvatar = multer({
	storage: avatarStorage,
	fileFilter: avatarFileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
}).single('avatar');

export const uploadAvatarMiddleware = (req: any, res: any, next: any) => {
	uploadAvatar(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return next(
					new BadRequestError('File size too large. Maximum size is 5MB.')
				);
			}
			return next(new BadRequestError(`Upload error: ${err.message}`));
		} else if (err) {
			return next(err);
		}
		next();
	});
};
