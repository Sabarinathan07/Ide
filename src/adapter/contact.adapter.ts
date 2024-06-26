import { AppDataSource } from "../database/config";
import { Contact } from "../entity/contact.entity";
import { Status } from "../enums/Status";
import {
    ContactInterface,
    ContactRepositoryInterface,
    ResponseInterface,
} from "../interface/contact.interface";

export class ContactAdapter implements ContactRepositoryInterface {
    async identify(contact: ContactInterface): Promise<ResponseInterface> {
        const { email, phoneNumber } = contact;
        console.log(contact);
        let primaryId = null;
        let flag = false;

        if (!email && !phoneNumber) {
            throw new Error("Either email or phone number must be provided.");
        }
        const contactRepository = AppDataSource.getRepository(Contact);

        const existingContactByEmail = await this.getByEmail(email);
        const existingContactByPhoneNumber = await this.getByPhone(phoneNumber);
        console.log(
            "ContactAdapter afterfinds",
            existingContactByEmail,
            existingContactByPhoneNumber
        );

        if (existingContactByEmail && existingContactByPhoneNumber) {
            flag = true;
            if (existingContactByEmail == existingContactByPhoneNumber) {
                // do nothing
            } else if (
                existingContactByEmail.id < existingContactByPhoneNumber.id
            ) {
                await this.updateSecondaryContact(
                    existingContactByEmail.id,
                    existingContactByPhoneNumber
                );
            } else {
                await this.updateSecondaryContact(
                    existingContactByPhoneNumber.id,
                    existingContactByEmail
                );
            }
        } else if (existingContactByEmail) {
            if (existingContactByEmail.linkPrecedence === Status.primary) {
                primaryId = existingContactByEmail.id;
            } else {
                primaryId = existingContactByEmail.linkedId;
            }
        } else if (existingContactByPhoneNumber) {
            if (
                existingContactByPhoneNumber.linkPrecedence === Status.primary
            ) {
                primaryId = existingContactByPhoneNumber.id;
            } else {
                primaryId = existingContactByPhoneNumber.linkedId;
            }
        } else {
            const newContact = new Contact();
            newContact.email = email;
            newContact.phoneNumber = phoneNumber;
            newContact.createdAt = new Date();
            newContact.updatedAt = new Date();
            newContact.linkPrecedence = Status.primary;

            const res = await contactRepository.save(newContact);

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
            const newContact = new Contact();
            newContact.email = email ? email : null;
            newContact.phoneNumber = phoneNumber ? phoneNumber : null;
            newContact.linkedId = primaryId;
            newContact.createdAt = new Date();
            newContact.updatedAt = new Date();
            newContact.linkPrecedence = Status.secondary;

            let sec = await contactRepository.save(newContact);
            console.log(sec);
        }

        // get the primary contact and and with linkedprecedence of primary contact
        const contacts = await this.getAllContacts();

        let matchedContacts: Contact[] = [];

        for (const existingContact of contacts) {
            if (
                existingContact.email == email &&
                email !== null &&
                existingContact.phoneNumber == phoneNumber &&
                phoneNumber !== null
            ) {
                matchedContacts.push(existingContact);
                break;
            } else if (
                (existingContact.email == email && email !== null) ||
                (existingContact.phoneNumber == phoneNumber &&
                    phoneNumber !== null)
            ) {
                if (existingContact.linkPrecedence === Status.primary) {
                }
                matchedContacts.push(existingContact);
            }
        }

        console.log("--matchedContacts----", matchedContacts);

        if (matchedContacts) {
            try {
                let emails = [
                    ...new Set(
                        matchedContacts
                            .map((existingContact) => existingContact.email)
                            .filter((email) => email !== null)
                    ),
                ];
                // emails.push(email);
                let phoneNumbers = [
                    ...new Set(
                        matchedContacts
                            .map(
                                (existingContact) => existingContact.phoneNumber
                            )
                            .filter((phone) => phone !== null)
                    ),
                ];
                // phoneNumbers.push(phoneNumber);

                let secondaryContactIds = matchedContacts.map(
                    (existingContact) => existingContact.id
                );

                return {
                    contact: {
                        primaryContactId: primaryId,
                        emails: emails,
                        phoneNumbers: phoneNumbers,
                        secondaryContactIds: secondaryContactIds,
                    },
                };
            } catch (error) {
                console.log(error);
            }
        }
    }

    async updateSecondaryContact(
        primaryId: number,
        updateContact: Contact
    ): Promise<void> {
        const contactRepository = AppDataSource.getRepository(Contact);
        updateContact.linkPrecedence = Status.secondary;
        updateContact.updatedAt = new Date();
        updateContact.linkedId = primaryId;
        await contactRepository.save(updateContact);
    }

    async getAllContacts(): Promise<Contact[]> {
        const contactRepository = AppDataSource.getRepository(Contact);
        return await contactRepository.find();
    }

    async getByEmail(email: string): Promise<Contact> {
        if (!email) return;
        const contactRepository = AppDataSource.getRepository(Contact);
        return await contactRepository.findOneBy({ email });
    }

    async getByPhone(phoneNumber: string): Promise<Contact> {
        if (!phoneNumber) return;
        const contactRepository = AppDataSource.getRepository(Contact);
        return await contactRepository.findOneBy({ phoneNumber });
    }
}
