const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const response = require('../helpers/response');
const { Otp } = require('../models/Otp');
const transporter = require('../helpers/nodemailer');

// User Login
exports.login = async (req, res) => {
  try {
    // check User
    const user = await User.findOne({ email: req.body.email }).select(
      '+password',
    );
    if (!user) {
      return response.error(res, {}, 'User not found!', 404);
    }

    // check password
    const isValidPassword = bcrypt.compareSync(
      req.body.password,
      user.password,
    );
    if (User && !isValidPassword) {
      return response.error(
        res,
        {},
        'Credentials not match. Please try again!',
        401,
      );
    }

    if (user.role !== 'user') {
      return response.error(res, {}, 'User not authorized!', 403);
    }

    // generate a token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '999y' },
    );

    // delete password from response
    user.password = undefined;

    // return response
    return response.success(
      res,
      {
        user,
        token,
      },
      'Login Successful!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// User Register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // User create
    const user = await User.create({
      name,
      email,
      phone,
      password: bcrypt.hashSync(password, 10),
      role: 'user',
      isActive: true,
    });

    return response.success(
      res,
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      'Account created successfully! Verification link sent to your email.',
      201,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// forget password
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validating User
    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, {}, "You don't have any user account.", 404);
    }

    // generate Otp
    const otpNumber = Math.floor(Math.random() * 9999);

    // update otp and save to db
    await Otp.findOneAndUpdate(
      { user_id: user.id },
      { otp: otpNumber, expire_at: new Date(new Date().getTime() + 60 * 5000) },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    // create email
    const mailOptions = {
      from: 'noreplay@appifylab.com',
      to: `${user.email}`,
      subject: 'OTP from appifylab',
      text: `Your OTP is: ${otpNumber} This OTP is valid for 5 minutes.`,
    };

    // send email
    transporter.sendMail(mailOptions, error => {
      if (error) {
        return res.status(500).json({ error });
      }
    });

    return response.success(
      res,
      {},
      'OTP was sent to your email. Do not share this OTP with anyone.',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validating User
    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, {}, 'Invalid User!', 400);
    }

    // Validating OTP
    const otpData = await Otp.findOne({ otp, user_id: user.id });
    if (!otpData || otpData.user_id.toString() !== user.id.toString()) {
      return response.error(res, {}, 'Invalid OTP.', 400);
    }
    if (otpData.expire_at < new Date().getTime()) {
      return response.error(res, {}, 'OTP is expired.', 400);
    }

    return response.success(
      res,
      { email, otp },
      'OTP verified successfully.',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Validating User
    const user = await User.findOne({ email });
    if (!user) {
      return response.error(res, {}, "You don't have any user ID.", 404);
    }

    // Validating OTP
    const otpData = await Otp.findOne({ otp, user_id: user.id });
    if (!otpData || otpData.user_id.toString() !== user.id.toString()) {
      return response.error(res, {}, 'Invalid OTP.', 400);
    }
    if (otpData.expire_at < new Date().getTime()) {
      return response.error(res, {}, 'OTP is expired.', 400);
    }

    // Update User
    await User.findOneAndUpdate(
      { email },
      { password: bcrypt.hashSync(password, 10) },
      { new: true },
    );

    // Delete OTP
    await Otp.findOneAndDelete({ otp, user_id: user.id });

    return response.success(res, {}, 'Password updated successfully.', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};
