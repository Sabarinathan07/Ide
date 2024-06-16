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

        if (!email && !phoneNumber) {
            throw new Error("Either email or phone number must be provided.");
        }
        const contactRepository = AppDataSource.getRepository(Contact);

        const contacts = await this.getAllContacts();
        console.log("--contacts----", contacts);

        let matchedContacts: Contact[] = [];

        for (const existingContact of contacts) {
            if (
                (existingContact.email == email && email !== null) ||
                (existingContact.phoneNumber == phoneNumber &&
                    phoneNumber !== null)
            ) {
                matchedContacts.push(existingContact);
            }
        }

        console.log("--matchedContacts----", matchedContacts);

        if (matchedContacts) {
            try {
                let saveContact: ContactInterface = {};

                console.log("-----saveContact------", saveContact);
                // Find primary contact
                for (const existingContact of matchedContacts) {
                    console.log("-------existingContact----", existingContact);
                    if (existingContact.linkPrecedence == Status.primary) {
                        saveContact.linkedId = existingContact.id
                            ? existingContact.id
                            : null;
                        saveContact.linkPrecedence = Status.secondary;
                        break;
                    }
                }

                console.log("--saveContact----", saveContact);

                let emails = [
                    ...new Set(
                        matchedContacts
                            .map((existingContact) => existingContact.email)
                            .filter((email) => email !== null)
                    ),
                ];
                emails.push(email);
                let phoneNumbers = [
                    ...new Set(
                        matchedContacts
                            .map(
                                (existingContact) => existingContact.phoneNumber
                            )
                            .filter((phone) => phone !== null)
                    ),
                ];
                phoneNumbers.push(phoneNumber);

                let secondaryContactIds = matchedContacts.map(
                    (existingContact) => existingContact.id
                );

                // Save updated primary and secondary contacts
                const primaryDB = new Contact();
                primaryDB.id = saveContact.id;
                primaryDB.email = email ? email : null;
                primaryDB.phoneNumber = phoneNumber ? phoneNumber : null;
                primaryDB.linkedId = saveContact.linkedId
                    ? saveContact.linkedId
                    : null;
                primaryDB.createdAt = saveContact.createdAt
                    ? saveContact.createdAt
                    : new Date();
                primaryDB.updatedAt = new Date();

                let sec = await contactRepository.save(primaryDB);
                secondaryContactIds.push(sec.id);
                console.log(sec);

                return {
                    contact: {
                        primaryContactId: saveContact.linkedId,
                        emails: emails,
                        phoneNumbers: phoneNumbers,
                        secondaryContactIds: secondaryContactIds,
                    },
                };
            } catch (error) {
                console.log(error);
            }
        } else {
            // Create a new primary contact

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
    }

    async getAllContacts(): Promise<Contact[]> {
        const contactRepository = AppDataSource.getRepository(Contact);
        return await contactRepository.find();
    }
}
