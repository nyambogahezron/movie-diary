"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFoundHandler;
function NotFoundHandler(req, res) {
    res.status(404).send(`Route Not Found - ${req.originalUrl}`);
}
//# sourceMappingURL=notFound.js.map