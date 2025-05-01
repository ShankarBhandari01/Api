import { Router } from "express";
const router = Router();
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { readdirSync } from "fs";
import { join } from "path";
import { isUndefined } from "lodash";
import { app } from "../config/appconfig";
const directoryPath = join(__dirname, "../router/api");
const pathes = [];
const filesName = readdirSync(directoryPath, (err, files) => {
  // handling error
  if (err) {
    return console.log(`Unable to scan directory: ${err}`);
  }
  // listing all files using forEach
  return files.forEach((file) => pathes.push(file));
});
function getFullPathes(names) {
  names.forEach((name) => {
    let customePath;
    if (name !== "index") {
      customePath = `./router/api/${name}`;
    }
    if (!isUndefined(name)) {
      pathes.push(customePath);
    }
  });
}

getFullPathes(filesName);
const options = {
  swaggerDefinition: {
    info: {
      title: "restaurant-pos-api",
      version: "1.0.0",
      description: "REST API with Swagger doc",
      contact: {
        email: "iamshankarbhandari@gmail.com",
      },
    },
    tags: [
      {
        name: "users",
        description: "Users API",
      },
      {
        name: "Auth",
        description: "Authentication apis",
      },
      {
        name: "Email",
        description: "for testing and sending emails ",
      },
      {
        name: "termsAndCondition",
        description: " the terms and condition for the application",
      },
      {
        name: "Versioning",
        description:
          " operation related to check the version of the apis or the mobile .. etc ",
      },
    ],
    schemes: ["http"],
    host: `localhost:${app.port}`,
    basePath: "/api/v1",
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        description: "JWT authorization of an API",
        name: "Authorization",
        in: "header",
      },
    },
  },

  apis: pathes,
};
const swaggerSpec = swaggerJSDoc(options);
require("swagger-models-validator")(swaggerSpec);

router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

router.use("/", serve, setup(swaggerSpec));

function validateModel(name, model) {
  const responseValidation = swaggerSpec.validateModel(
    name,
    model,
    false,
    true
  );
  if (!responseValidation.valid) {
    throw new Error("Model doesn't match Swagger contract");
  }
}

export default {
  router,
  validateModel,
};
