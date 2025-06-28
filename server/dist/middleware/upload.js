"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatarMiddleware = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("../utils/errors");
const uploadsDir = path_1.default.join(process.cwd(), 'public/uploads');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(avatarsDir)) {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
}
const avatarStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarsDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'anonymous';
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${userId}_${timestamp}${ext}`);
    },
});
const avatarFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new errors_1.BadRequestError('Only image files are allowed!'));
    }
};
exports.uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
}).single('avatar');
const uploadAvatarMiddleware = (req, res, next) => {
    (0, exports.uploadAvatar)(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new errors_1.BadRequestError('File size too large. Maximum size is 5MB.'));
            }
            return next(new errors_1.BadRequestError(`Upload error: ${err.message}`));
        }
        else if (err) {
            return next(err);
        }
        next();
    });
};
exports.uploadAvatarMiddleware = uploadAvatarMiddleware;
//# sourceMappingURL=upload.js.map