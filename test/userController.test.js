import { createRequest, createResponse } from "node-mocks-http";
import UserService  from "../services/userService";
import UserController from "../controllers/UserController";


describe("getUserById Controller", () => {
  it("should return user data when user exists", async () => {
    const req = createRequest({ params: { id: "1" } });
    const res = createResponse();

    new UserService().getUserById.mockResolvedValue({
      id: "67fe7360a335473e0b6e1a4c",
      name: "Shankar",
    });

    await new UserController().getUserById(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.name).toBe("Shankar");
  });

  it("should return 400 when user is not found", async () => {
    const req = createRequest({ params: { id: "999" } });
    const res = createResponse();

    findUserById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe("User not found");
  });

  it("should return 500 when service throws error", async () => {
    const req = createRequest({ params: { id: "1" } });
    const res = createResponse();

    findUserById.mockRejectedValue(new Error("DB error"));

    await getUserById(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().message).toBe("Internal server error");
  });
});
