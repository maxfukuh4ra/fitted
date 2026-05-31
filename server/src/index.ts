import express from 'express';
import uploadRouter from './routes/upload';

const app = express();
app.use(express.json({ limit: '10mb' })); // images are large
app.use('/api', uploadRouter);

app.listen(3000);