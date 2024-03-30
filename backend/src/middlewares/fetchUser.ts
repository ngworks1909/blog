import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const fetchUser = async (
  c: Context<
    {
      Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
      };
      Variables: {
        id: string
      }
    },
    never,
    {}
  >,
  next: Next
) => {
  const token = c.req.header("auth-token") || "";
  if (!token) {
    c.status(401);
    return c.text("Please authenticate using valid token...");
  }
  try {
    const data = await verify(token, c.env.JWT_SECRET);
    c.set("id", data.id);
    await next();
  } catch (error) {
    c.status(401);
    return c.text("Please authenticate using valid token...");
  }
};
