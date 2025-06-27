"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NodemailerConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function NodemailerConfig() {
    return {
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    };
}
//# sourceMappingURL=NodeMailer.js.map