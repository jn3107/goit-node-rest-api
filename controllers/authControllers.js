import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";

const { JWT_SECRET } = process.env;

const avatarsPath = path.resolve("public", "avatars");

const signup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });
    const avatarUrl = gravatar.url(email);
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const newUser = await authServices.signup({
      ...req.body,
      avatarURL: avatarUrl,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authServices.findUser({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    const comaparePassword = await authServices.validatePassword(
      password,
      user.password
    );
    if (!comaparePassword) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id } = user;

    const payload = {
      id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

    await authServices.updateUser({ _id: id }, { token });

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });
  res.status(204).json("No Content");
};

const changeAvatar = async (req, res, next) => {
  try {
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);

    const avatar = await Jimp.read(oldPath);
    avatar.resize(250, 250).quality(60).greyscale().write(oldPath);

    await fs.rename(oldPath, newPath);
    const userAvatar = path.join("avatars", filename);
    const result = await authServices.updateUser({
      ...req.body,
      avatarURL: userAvatar,
    });
    res.status(200).json({
      avatarURL: userAvatar,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  signin,
  getCurrent,
  signout,
  changeAvatar,
};
