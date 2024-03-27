import Contact from "../models/Contact.js";

const listContacts = () => Contact.find();

const getContactById = (id) => Contact.findById(id);

const removeContact = (id) => Contact.findByIdAndDelete(id);

const addContact = (data) => Contact.create(data);

const updateContactById = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const updateContactStatus = (id, favorite) =>
  Contact.findByIdAndUpdate(id, favorite, { new: true, runValidators: true });

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
  updateContactStatus,
};
