import StockDTO from "../dtos/StockDTO.js";
import CategoryDTO from "../dtos/CategoryDTO.js";
import RequestHandler from "../utils/RequestHandler.js";
import dbConnection from "../database/ConnectionManager.js";
import StockService  from "../services/stockService.js";
const requestHandler = new RequestHandler();

//add menus items
export async function saveStock(req, res) {
  try {
    const lang = req.session.lang || "en"; // Default to English
    //create Dto
    const StockDto = new StockDTO(req.body, req.files, lang);

    // database connection
    const connection = await dbConnection.getConnection(
      req.session.envConfig.database
    );

    const stockService = new StockService(connection);
    // call service layer
    const response = await stockService.addStock(StockDto);
    // return response
    res.statusCode = response.statusCode;
    return res.json(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
}

export async function addCategory(req, res) {
  try {
    const lang = req.session.lang || "en"; // Default to English
    // creating dto
    const categoryDto = new CategoryDTO(req.body);
    // database connection
    const connection = await dbConnection.getConnection(
      req.session.envConfig.database
    );
    const stockService = new StockService(connection);
    const response = await stockService.addCategory(categoryDto, lang);
    res.statusCode = response.statusCode;
    return res.json(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
}

export async function getAllCategory(req, res) {
  try {
    const lang = req.session.lang || "en"; // Default to English
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Validate the limit to avoid too many results
    if (limit > 100) {
      const message = "Limit must be less than 100";
      throw { message: message };
    }
    // database connection
    const connection = await dbConnection.getConnection(
      req.session.envConfig.database
    );
    const stockService = new StockService(connection);
    const response = await stockService.getAllCategory(page, limit);
    res.statusCode = response.statusCode;
    return res.json(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  } // end try catch
}
// get all the menus items
export async function getAllStock(req, res) {
  try {
    // Set the language from query or default to 'en'
    const lang = req.session.lang || "en"; // Default to English

    const searchText = req.query.search || "";
    const type = req.query.searchType || "";
    const filterType = req.query.filterType || "";
    const categoryId = req.query.categoryId || "";
    const sort = req.query.sort || "";
    const sortBy = req.query.sortBy || "";

    let response;
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const searchFilters = {
      searchText,
      type,
      page,
      limit,
      filterType,
      categoryId,
      lang,
      sortBy,
      sort,
    };
    // Validate the limit to avoid too many results
    if (limit >= 100) {
      const message = "Limit must be less than 100";
      throw { message: message };
    }

    // database connection
    const connection = await dbConnection.getConnection(
      req.session.envConfig.database
    );
    const stockService = new StockService(connection);

    response = await stockService.getAllStock(searchFilters);
    // Process response data
    if (response.statusCode === 200) {
      if (response.rsType === "Allstock" && response.data.length > 0) {
        response.data = response.data.map((item) => updateImageUrl(item, req));
      } else if (
        (response.rsType === "categoryWise" ||
          response.rsType === "nameOfWeekWise") &&
        response.data.length > 0
      ) {
        response.data = response.data.map((category) => ({
          ...category,
          categoryName: {
            ...category.categoryName,
            items: category.categoryName.items.map((item) =>
              updateImageUrl(item, req)
            ),
          },
        }));
      }
    }

    // Set the response status and send the response
    res.statusCode = response.statusCode;
    return res.json(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
}

const updateImageUrl = (item, req) => ({
  ...item,
  image: item.image
    ? `${req.protocol}://${req.get("host")}/public/${item.image}`
    : null, // If no image, set to null
});
