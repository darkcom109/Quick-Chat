import express from "express"
import { checkAuth, login, signup } from "../controllers/userController";
import { protectRoute } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute);
userRouter.put("/check", protectRoute, checkAuth);

export default userRouter;
