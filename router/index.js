import { Router } from "express";
import { languageMiddleware } from "../middleware/languageMiddleware.js";
import apiRoutes from "./api/index.js";

const apiVersion = process.env.API_VERSION;
const router = Router();

router.use(`/api/${apiVersion}`, languageMiddleware, apiRoutes);

export default router;
