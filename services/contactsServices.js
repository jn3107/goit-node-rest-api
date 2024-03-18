import * as path from "path";
import { nanoid } from "nanoid";
import { writeFile, readFile } from "fs/promises";

const contactsPath = path.resolve("db", "contacts.json");

const listContacts = async () => {
  const data = await readFile(contactsPath, "utf-8");
  return JSON.parse(data);
};

const getContactById = async (id) => {
  const contacts = await listContacts();
  const result = contacts.find((item) => item.id === id);

  return result || null;
};

const removeContact = async (id) => {
  const contacts = await listContacts();
  const deletedContactIndex = contacts.findIndex((item) => item.id === id);
  if (deletedContactIndex !== -1) {
    const [deletedContact] = contacts.splice(deletedContactIndex, 1);
    await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return deletedContact;
  }
  return null;
};

const addContact = async ({ name, email, phone }) => {
  const contacts = await listContacts();
  const addedContact = { id: nanoid(), name, email, phone };
  contacts.push(addedContact);
  await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return addedContact;
};

const updateContactById = async (id, data) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  contacts[index] = { ...contacts[index], ...data };
  await writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[index];
};

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
};
