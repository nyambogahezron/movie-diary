"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const auth_validation_1 = require("../utils/validations/auth.validation");
const router = express_1.default.Router();
router.post('/register', (0, validate_1.validate)(auth_validation_1.authValidation.register), AuthController_1.AuthController.register);
router.post('/login', (0, validate_1.validate)(auth_validation_1.authValidation.login), AuthController_1.AuthController.login);
router.get('/me', auth_1.authMiddleware, AuthController_1.AuthController.getCurrentUser);
router.post('/refresh-token', (0, validate_1.validate)(auth_validation_1.authValidation.refreshToken), AuthController_1.AuthController.refreshToken);
router.get('/verify-email', AuthController_1.AuthController.verifyEmail);
router.post('/resend-verification', (0, validate_1.validate)(auth_validation_1.authValidation.resendVerification), AuthController_1.AuthController.resendVerificationEmail);
router.post('/request-password-reset', (0, validate_1.validate)(auth_validation_1.authValidation.requestPasswordReset), AuthController_1.AuthController.requestPasswordReset);
router.post('/reset-password', (0, validate_1.validate)(auth_validation_1.authValidation.resetPassword), AuthController_1.AuthController.resetPassword);
router.post('/update-email', auth_1.authMiddleware, (0, validate_1.validate)(auth_validation_1.authValidation.updateEmail), AuthController_1.AuthController.updateEmail);
exports.default = router;
//# sourceMappingURL=auth.js.map