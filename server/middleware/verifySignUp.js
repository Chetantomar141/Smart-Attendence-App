import db from "../models/index.js";
const User = db.users;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const userByUsername = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (userByUsername) {
      return res.status(400).send({
        message: "Failed! Username is already in use!"
      });
    }

    if (req.body.email) {
      const userByEmail = await User.findOne({
        where: {
          email: req.body.email
        }
      });

      if (userByEmail) {
        return res.status(400).send({
          message: "Failed! Email is already in use!"
        });
      }
    }

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

export default verifySignUp;
