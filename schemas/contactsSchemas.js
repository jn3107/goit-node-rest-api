import Joi from "joi";
import { phonePattern } from "../constants/contactConstants.js";

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().pattern(phonePattern).required(),
  favorite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string().pattern(phonePattern),
  favorite: Joi.boolean(),
})
  .min(1)
  .messages({
    "object.min": "Body must have at least one field",
  });

export const updateContactStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
})
  .unknown(false)
  .messages({
    "boolean.favorite": "Field {#label} must be a true or false.",
    "any.required": "missing required {#label} field",
  });
