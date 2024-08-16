const models = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { errorHandler } = require("../utils/error");
const validator = require("fastest-validator");
const v = new validator();
const sendEmail = require("../utils/email");

dotenv.config();

function signUp(req, res) {
  models.User.findOne({ where: { email: req.body.email } })
    .then((result) => {
      if (result) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      } else {
        models.User.findOne({ where: { username: req.body.username } })
          .then((result) => {
            if (result) {
              return res.status(400).json({
                success: false,
                message: "Username already exists",
              });
            } else {
              bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                  const user = {
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                  };

                  models.User.create(user)
                    .then((result) => {
                      res.status(201).json({
                        success: true,
                        message: "User created successfully",
                        user: result,
                      });
                    })
                    .catch((err) => {
                      res.status(500).json({
                        success: false,
                        message: "Internal Server Error",
                        error: err,
                      });
                    });
                });
              });
            }
          })
          .catch((error) => {
            res.status(500).json({
              success: false,
              message: "Internal Server Error",
              error: error,
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    });
}

function signIn(req, res) {
  models.User.findOne({ where: { username: req.body.username } })
    .then((user) => {
      if (user === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      } else {
        bcrypt.compare(
          req.body.password,
          user.password,
          function (err, result) {
            if (result) {
              const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET_KEY
              );
              const { password: pass, ...rest } = user.dataValues;

              res
                .status(200)
                .cookie("access_token", token, {
                  httpOnly: true,
                  maxAge: 86400000,
                })
                .json(rest);
            } else {
              return res.status(400).json({
                success: false,
                message: "Invalid password",
              });
            }
          }
        );
      }
    })
    .catch((error) => {});
}

function changePassword(req, res) {
  var { email, oldPassword, newPassword } = req.body;

  const schema = {
    email: { type: "email" },
    oldPassword: { type: "string", min: 6, max: 20 },
    newPassword: { type: "string", min: 6, max: 20 },
  };

  const check = v.validate(req.body, schema);

  if (check !== true) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: check,
    });
  }

  models.User.findOne({ where: { email: email } })
    .then((user) => {
      if (user === null) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      } else {
        bcrypt.compare(oldPassword, user.password, function (err, result) {
          if (result) {
            // Check if new password is the same as old password
            bcrypt.compare(newPassword, user.password, function (err, result) {
              if (result) {
                return res.status(400).json({
                  success: false,
                  message: "New password cannot be the same as old password",
                });
              } else {
                bcrypt.genSalt(10, function (err, salt) {
                  bcrypt.hash(newPassword, salt, function (err, hash) {
                    models.User.update(
                      { password: hash },
                      { where: { email: email } }
                    )
                      .then(async (result) => {
                        // Send email notification
                        await sendEmail({
                          to: email,
                          subject: "Password Changed",
                          text: "Your password has been changed successfully",
                          html: "<p>Your password has been changed successfully</p>",
                        });

                        res.status(200).json({
                          success: true,
                          message: "Password changed successfully",
                        });
                      })
                      .catch((error) => {
                        res.status(500).json({
                          success: false,
                          message: "Internal Server Error",
                          error: error,
                        });
                      });
                  });
                });
              }
            });
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid old password",
            });
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    });
}

function forgotPassword(req, res) {
  var { email } = req.body;

  const schema = {
    email: { type: "email" },
  };

  const check = v.validate(req.body, schema);

  if (check !== true) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: check,
    });
  }

  models.User.findOne({ where: { email: email } })
    .then(async (user) => {
      if (user === null) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      } else {
        // Generate a token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );

        // Send email notification
        await sendEmail({
          to: email,
          subject: "Reset Password",
          text: "Click the link below to reset your password",
          html: `<a href="${process.env.BASE_URL}/reset-password/${token}">Reset Password</a>`,
        });

        res.status(200).json({
          success: true,
          message: "Reset password link sent to your email",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    });
}

module.exports = {
  signUp: signUp,
  signIn: signIn,
  changePassword: changePassword,
  forgotPassword: forgotPassword,
};
