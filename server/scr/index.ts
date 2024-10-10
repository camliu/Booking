import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import userRoutes from './routes/users.route';
import authRoutes from './routes/auth.route';
import myHotelRoutes from './routes/my-hotels.route';
import hotelRoutes from './routes/hotels.route';
import bookingRoutes from './routes/my-bookings.route';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/my-hotels', myHotelRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/my-bookings', bookingRoutes);

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

mongoose.connect(process.env.DB_URI as string);

mongoose.connection.once('open', () => {
  console.log('Connect to MongoDB');
  app.listen(PORT, () => {
    console.log(`server running on localhost:${PORT}`);
  });
});
