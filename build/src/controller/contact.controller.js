"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactController = void 0;
const contact_core_1 = require("../core/contact.core");
const contact_adapter_1 = require("../adapter/contact.adapter");
// import { UserAdapter } from "../adapter/user.adapter";
// import { UserCore } from "../core/user.core";
class contactController {
    static identify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json({ errors: errors.array() });
            // }
            try {
                const contactService = new contact_core_1.contactCore(new contact_adapter_1.ContactAdapter());
                const contact = yield contactService.identify(req.body);
                res.status(200).json(contact);
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
}
exports.contactController = contactController;
