import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarsPath = path.resolve("public", "avatars");

const signup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });
    const avatarUrl = gravatar.url(email);
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const verificationToken = nanoid();
    const newUser = await authServices.signup({
      ...req.body,
      avatarURL: avatarUrl,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);
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

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await authServices.findUser({ verificationToken });
  if (!user) {
    throw HttpError(404, "VerificationToken not found");
  }
  await authServices.updateUser(
    { _id: user._id },
    { verify: true, verificationToken: " " }
  );

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });
    if (!user) {
      throw HttpError(404, "No user with this email address was found");
    }
    if (email.verify) {
      throw HttpError(400, "The email has already been verified");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({
      message: "Verify email send successfully",
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
    if (!user.verify) {
      throw HttpError(401, "Email not verify");
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
  verify,
  resendVerify,
};
