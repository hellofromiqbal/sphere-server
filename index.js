import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import cookieParser from 'cookie-parser';

// LOAD ENVIRONMENT VARIABLES FROM .ENV FILE
dotenv.config();

// USE ENVIRONMENT VARIABLES
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;

// INVOKE APP
const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//   credentials: true,
//   // origin: 'http://localhost:5173'
// }));
app.use(cors({
  credentials: true,
  // origin: CLIENT_DOMAIN
}));

app.get('/', (request, response) => {
  return response.send('App is listening..')
});

// APP ROUTES
app.use('/users', userRoutes);
app.use('/articles', articleRoutes);

// DATABASE CONNECTION
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('App connected to MongoDb..');
    app.listen(PORT, () => {
      console.log(`App is listening in port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });