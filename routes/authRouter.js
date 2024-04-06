import express from "express";
import authControllers from "../controllers/authControllers.js";
import {
  userSignupSchema,
  userSigninSchema,
  userEmailSchema,
} from "../schemas/usersSchemas.js";
import validateBody from "../helpers/validateBody.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(userSignupSchema),
  authControllers.signup
);

authRouter.post(
  "/login",
  validateBody(userSigninSchema),
  authControllers.signin
);

authRouter.get("/verify/:verificationToken", authControllers.verify);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.signout);

authRouter.post(
  "/verify",
  validateBody(userEmailSchema),
  authControllers.resendVerify
);

authRouter.patch(
  "/avatars",
  upload.single("avatar"),
  authenticate,
  authControllers.changeAvatar
);

export default authRouter;
