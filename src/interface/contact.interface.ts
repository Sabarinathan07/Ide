import { Status } from "../enums/Status";

export interface ContactInterface {
    id?: number;
    phoneNumber?: string | null;
    email?: string | null;
    linkedId?: number | null;
    linkPrecedence?: Status;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface ResponseInterface {
    contact: {
        primaryContactId: number;
        emails: any;
        phoneNumbers: any;
        secondaryContactIds: any;
    };
}

export interface ContactRepositoryInterface {
    identify(contact: ContactInterface): Promise<ResponseInterface>;
    getAllContacts(): Promise<ContactInterface[]>;
}
