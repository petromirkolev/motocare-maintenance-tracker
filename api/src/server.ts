import app from './app';
import './db';

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
