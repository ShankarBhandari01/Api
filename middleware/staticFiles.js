// staticFiles.js
import { static as expressStatic } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serveStaticFiles = (app) => {
  app.use(
    "/images",
    expressStatic(join(__dirname, "../public/images"), {
      dotfiles: "ignore",
      etag: false,
    })
  );
  app.use(
    "/logos",
    expressStatic(join(__dirname, "../public/logos"), {
      dotfiles: "ignore",
      etag: false,
    })
  );
};

export default serveStaticFiles;
