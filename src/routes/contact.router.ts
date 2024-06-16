import express from "express";
import { contactController } from "../controller/contact.controller";
export const Router = express.Router();

Router.post("/", contactController.identify);
