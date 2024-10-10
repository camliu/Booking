import express, { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import verifyToken from '../middleware/auth';

const router = express.Router();

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(400).json({ message: 'User not fount' });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'something went wrong' });
  }
});

router.post(
  '/register',
  [
    check('firstName', 'First Name is required').isString(),
    check('lastName', 'Last Name is required').isString(),
    check('email', 'Email Name is required').isEmail(),
    check(
      'password',
      'Password with 6 or more characters is required'
    ).isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    try {
      let user = await User.findOne({
        email: req.body.email,
      });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userID: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d',
        }
      );

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000,
      });
      return res.status(200).send({ message: 'User register OK' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Something went wrong' });
    }
  }
);

export default router;
