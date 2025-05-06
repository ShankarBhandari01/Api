import { Router } from "express";
import apiRoutes from "./api/index.js";

const apiVersion = process.env.API_VERSION;
const router = Router();

router.use(`/api/${apiVersion}`, apiRoutes);

export default router;
