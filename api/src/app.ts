import express from 'express';
import authRouter from './routes/auth';
import bikesRouter from './routes/bikes';
import maintenanceRouter from './routes/maintenance';
import maintenanceLogsRouter from './routes/maintenance-log';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'MotoCare Maintenance Tracker API is running' });
});
app.use('/auth', authRouter);
app.use('/bikes', bikesRouter);
app.use('/maintenance', maintenanceRouter);
app.use('/maintenance-logs', maintenanceLogsRouter);

export default app;
