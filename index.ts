import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Router as contactRouter } from "./src/routes/contact.router";

import { AppDataSource } from "./src/database/config";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use("/identify", contactRouter);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
