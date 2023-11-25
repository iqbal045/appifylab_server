const router = require('express').Router();

// import controller methods
const {
  login,
  register,
  forgetPassword,
  verifyOTP,
  resetPassword,
} = require('../controllers/AuthController');

// import validation
const { validate } = require('../validation');
const {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} = require('../validation/authValidations');

// routes
router.post(`/login`, validate(loginSchema), login);

router.post(`/register`, validate(registerSchema), register);

router.post(`/forget-password`, validate(forgetPasswordSchema), forgetPassword);

router.post(`/verify-otp`, validate(verifyOtpSchema), verifyOTP);

router.post(`/reset-password`, validate(resetPasswordSchema), resetPassword);

module.exports = router;
