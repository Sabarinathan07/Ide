import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enums/Status";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn("rowid")
    id: number;

    @Column({ type: "varchar", nullable: true }) // Assuming phone numbers are stored as strings
    phoneNumber: string | null;

    @Column({ type: "varchar", nullable: true }) // Assuming emails are stored as strings
    email: string | null;

    @Column({ nullable: true })
    linkedId: number | null;

    @Column({ default: Status.primary })
    linkPrecedence: Status;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;

    @Column({ nullable: true })
    deletedAt: Date | null;
}
