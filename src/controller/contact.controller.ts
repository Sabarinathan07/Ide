import { Request, Response } from "express";
import { contactCore } from "../core/contact.core";
import { ContactAdapter } from "../adapter/contact.adapter";
// import { UserAdapter } from "../adapter/user.adapter";
// import { UserCore } from "../core/user.core";

export class contactController {
    static async identify(req: Request, res: Response) {
        // const errors = validationResult(req);

        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        try {
            const contactService = new contactCore(new ContactAdapter());
            const contact = await contactService.identify(req.body);
            res.status(200).json(contact);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}
