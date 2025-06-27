"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Token {
    static createSignedResetToken(userId) {
        const tokenData = crypto_1.default.randomBytes(32).toString('hex');
        const timestamp = Date.now().toString();
        const payload = `${userId}.${tokenData}.${timestamp}`;
        const signature = crypto_1.default
            .createHmac('sha256', this.RESET_TOKEN_SECRET)
            .update(payload)
            .digest('hex');
        return `${payload}.${signature}`;
    }
    static createSignedToken(data) {
        const tokenData = crypto_1.default.randomBytes(32).toString('hex');
        const timestamp = Date.now().toString();
        const payload = `${tokenData}.${timestamp}.${data}`;
        const signature = crypto_1.default
            .createHmac('sha256', this.RESET_TOKEN_SECRET)
            .update(payload)
            .digest('hex');
        return `${payload}.${signature}`;
    }
    static verifyResetToken(token) {
        try {
            const [userId, tokenData, timestamp, signature] = token.split('.');
            if (!userId || !tokenData || !timestamp || !signature) {
                return { isValid: false };
            }
            const payload = `${userId}.${tokenData}.${timestamp}`;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.RESET_TOKEN_SECRET)
                .update(payload)
                .digest('hex');
            const isValid = crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
            return {
                isValid,
                userId: isValid ? parseInt(userId, 10) : undefined,
            };
        }
        catch (error) {
            return { isValid: false };
        }
    }
    static verifyTokenWithUserId(token, userId) {
        try {
            const parts = token.split('.');
            if (parts.length === 4) {
                const [tokenUserId, tokenData, timestamp, signature] = parts;
                if (parseInt(tokenUserId, 10) !== userId) {
                    return false;
                }
                const payload = `${userId}.${tokenData}.${timestamp}`;
                const expectedSignature = crypto_1.default
                    .createHmac('sha256', this.RESET_TOKEN_SECRET)
                    .update(payload)
                    .digest('hex');
                return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
            }
            else if (parts.length === 2) {
                const [payload, signature] = parts;
                const expectedSignature = crypto_1.default
                    .createHmac('sha256', this.RESET_TOKEN_SECRET)
                    .update(payload)
                    .digest('hex');
                return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    static generateResetCode() {
        const buffer = crypto_1.default.randomBytes(4);
        // Convert to a number and ensure it's 6 digits
        const code = (parseInt(buffer.toString('hex'), 16) % 900000) + 100000;
        return code.toString();
    }
    static hashResetCode(code, userId) {
        const timestamp = Date.now().toString();
        const dataToHash = `${userId}-${code}-${timestamp}`;
        const hash = crypto_1.default
            .createHmac('sha256', this.RESET_TOKEN_SECRET)
            .update(dataToHash)
            .digest('hex');
        // Store userId and timestamp with the hash for validation
        return `${userId}.${timestamp}.${hash}`;
    }
    static verifyResetCode(code, storedHash) {
        try {
            const [userId, timestamp, hash] = storedHash.split('.');
            if (!userId || !timestamp || !hash) {
                return false;
            }
            const codeTime = parseInt(timestamp, 10);
            const currentTime = Date.now();
            if (currentTime - codeTime > 60 * 60 * 1000) {
                // 1 hour expiration
                return false;
            }
            const dataToHash = `${userId}-${code}-${timestamp}`;
            const expectedHash = crypto_1.default
                .createHmac('sha256', this.RESET_TOKEN_SECRET)
                .update(dataToHash)
                .digest('hex');
            return crypto_1.default.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
        }
        catch (error) {
            return false;
        }
    }
}
Token.RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET;
exports.default = Token;
//# sourceMappingURL=signedTokens.js.map