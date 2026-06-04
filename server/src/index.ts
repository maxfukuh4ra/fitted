import 'dotenv/config';
import express from 'express';
import uploadRouter from './routes/upload';
import wearRouter from './routes/wear';
import cors from 'cors';

const app = express();
app.use(cors()); // allow all origins for now
app.use(express.json({ limit: '10mb' }));
app.use('/api', uploadRouter);
app.use('/api', wearRouter);

app.listen(3000, () => console.log('Server listening on port 3000'));