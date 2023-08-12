const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Joi = require("joi");

async function registerUser(name, username, password) {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate({ name, username, password });
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Check if user with the same username already exists
    const existingUser = await User.findOne({
      username,
    });
    if (existingUser) {
      throw new Error("Username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user with lowercase name
    const newUser = await User.create({
      name: name.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
    });

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
}


async function loginUser(username, password) {
  try {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid username or password");
    }

     const token = jwt.sign({ userId: user._id }, "your-secret-key", {
       expiresIn: "1h",
     });
    return {token,user:user._id};
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserById(id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  registerUser,getUserById,
  loginUser,
};
