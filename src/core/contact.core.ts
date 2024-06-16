import {
    ContactInterface,
    ContactRepositoryInterface,
} from "../interface/contact.interface";

export class contactCore {
    constructor(private contactRepository: ContactRepositoryInterface) {}

    async identify(conatct: ContactInterface) {
        return await this.contactRepository.identify(conatct);
    }

    async getAllContacts(){
        return await this.contactRepository.getAllContacts();
    }
}
