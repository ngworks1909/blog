import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { userRouter } from './routes/auth';
import { blogRouter } from './routes/blog';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    id: string
  }
}>();

app.use('/*', cors());
app.route('/api/auth', userRouter);
app.route('/api/blog', blogRouter);

export default app
