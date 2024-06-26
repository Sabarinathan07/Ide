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
exports.ContactAdapter = void 0;
const config_1 = require("../database/config");
const contact_entity_1 = require("../entity/contact.entity");
const Status_1 = require("../enums/Status");
class ContactAdapter {
    identify(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, phoneNumber } = contact;
            console.log(contact);
            let primaryId = null;
            let flag = false;
            if (!email && !phoneNumber) {
                throw new Error("Either email or phone number must be provided.");
            }
            const contactRepository = config_1.AppDataSource.getRepository(contact_entity_1.Contact);
            const existingContactByEmail = yield this.getByEmail(email);
            const existingContactByPhoneNumber = yield this.getByPhone(phoneNumber);
            console.log("ContactAdapter afterfinds", existingContactByEmail, existingContactByPhoneNumber);
            if (existingContactByEmail && existingContactByPhoneNumber) {
                flag = true;
                if (existingContactByEmail == existingContactByPhoneNumber) {
                    // do nothing
                }
                else if (existingContactByEmail.id < existingContactByPhoneNumber.id) {
                    yield this.updateSecondaryContact(existingContactByEmail.id, existingContactByPhoneNumber);
                }
                else {
                    yield this.updateSecondaryContact(existingContactByPhoneNumber.id, existingContactByEmail);
                }
            }
            else if (existingContactByEmail) {
                if (existingContactByEmail.linkPrecedence === Status_1.Status.primary) {
                    primaryId = existingContactByEmail.id;
                }
                else {
                    primaryId = existingContactByEmail.linkedId;
                }
            }
            else if (existingContactByPhoneNumber) {
                if (existingContactByPhoneNumber.linkPrecedence === Status_1.Status.primary) {
                    primaryId = existingContactByPhoneNumber.id;
                }
                else {
                    primaryId = existingContactByPhoneNumber.linkedId;
                }
            }
            else {
                const newContact = new contact_entity_1.Contact();
                newContact.email = email;
                newContact.phoneNumber = phoneNumber;
                newContact.createdAt = new Date();
                newContact.updatedAt = new Date();
                newContact.linkPrecedence = Status_1.Status.primary;
                const res = yield contactRepository.save(newContact);
                return {
                    contact: {
                        primaryContactId: res.id,
                        emails: res.email ? [res.email] : [],
                        phoneNumbers: res.phoneNumber ? [res.phoneNumber] : [],
                        secondaryContactIds: [],
                    },
                };
            }
            // Save updated primary and secondary contacts
            if (flag != true) {
                const newContact = new contact_entity_1.Contact();
                newContact.email = email ? email : null;
                newContact.phoneNumber = phoneNumber ? phoneNumber : null;
                newContact.linkedId = primaryId;
                newContact.createdAt = new Date();
                newContact.updatedAt = new Date();
                newContact.linkPrecedence = Status_1.Status.secondary;
                let sec = yield contactRepository.save(newContact);
                console.log(sec);
            }
            // get the primary contact and and with linkedprecedence of primary contact
            const contacts = yield this.getAllContacts();
            let matchedContacts = [];
            for (const existingContact of contacts) {
                if (existingContact.email == email &&
                    email !== null &&
                    existingContact.phoneNumber == phoneNumber &&
                    phoneNumber !== null) {
                    matchedContacts.push(existingContact);
                    break;
                }
                else if ((existingContact.email == email && email !== null) ||
                    (existingContact.phoneNumber == phoneNumber &&
                        phoneNumber !== null)) {
                    if (existingContact.linkPrecedence === Status_1.Status.primary) {
                    }
                    matchedContacts.push(existingContact);
                }
            }
            console.log("--matchedContacts----", matchedContacts);
            if (matchedContacts) {
                try {
                    let emails = [
                        ...new Set(matchedContacts
                            .map((existingContact) => existingContact.email)
                            .filter((email) => email !== null)),
                    ];
                    // emails.push(email);
                    let phoneNumbers = [
                        ...new Set(matchedContacts
                            .map((existingContact) => existingContact.phoneNumber)
                            .filter((phone) => phone !== null)),
                    ];
                    // phoneNumbers.push(phoneNumber);
                    let secondaryContactIds = matchedContacts.map((existingContact) => existingContact.id);
                    return {
                        contact: {
                            primaryContactId: primaryId,
                            emails: emails,
                            phoneNumbers: phoneNumbers,
                            secondaryContactIds: secondaryContactIds,
                        },
                    };
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    }
    updateSecondaryContact(primaryId, updateContact) {
        return __awaiter(this, void 0, void 0, function* () {
            const contactRepository = config_1.AppDataSource.getRepository(contact_entity_1.Contact);
            updateContact.linkPrecedence = Status_1.Status.secondary;
            updateContact.updatedAt = new Date();
            updateContact.linkedId = primaryId;
            yield contactRepository.save(updateContact);
        });
    }
    getAllContacts() {
        return __awaiter(this, void 0, void 0, function* () {
            const contactRepository = config_1.AppDataSource.getRepository(contact_entity_1.Contact);
            return yield contactRepository.find();
        });
    }
    getByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email)
                return;
            const contactRepository = config_1.AppDataSource.getRepository(contact_entity_1.Contact);
            return yield contactRepository.findOneBy({ email });
        });
    }
    getByPhone(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!phoneNumber)
                return;
            const contactRepository = config_1.AppDataSource.getRepository(contact_entity_1.Contact);
            return yield contactRepository.findOneBy({ phoneNumber });
        });
    }
}
exports.ContactAdapter = ContactAdapter;
