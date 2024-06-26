"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controller/contact.controller");
exports.Router = express_1.default.Router();
exports.Router.post("/", contact_controller_1.contactController.identify);
