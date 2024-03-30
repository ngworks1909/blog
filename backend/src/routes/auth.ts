import { signinInput, signupInput } from "@ngworks/blog-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    id: string
  }
}>();

userRouter.post("/createUser", async (c) => {
  const body = await c.req.json();
  const result = signupInput.safeParse(body).success;
  let success = false;
  if(!result){
    c.status(411);
    return c.json({success, error: 'Invalid inputs...'})
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());
  try {
    const [existingUser] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          email: body.email,
        },
      }),
    ]);

    if (existingUser) {
      c.status(400);
      success = false;
      return c.json({ success, error: "User already exists..." });
    }
    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
        select: {
          id: true
        }
      }),
    ]);
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    success = true;
    return c.json({ success, token });
  } catch (e) {
    console.log(e);
    success = false;
    c.status(500);
    await prisma.$executeRaw`ROLLBACK`;
    return c.json({ success, error: "Internal server error..." });
  }
});

userRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const result = signinInput.safeParse(body).success;
  let success = false;
  if(!result){
    c.status(411);
    c.json({success, error: 'Invalid inputs...'})
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());

  try {
    const [user] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          email: body.email,
          password: body.password,
        },
        select: {
          name: true,
          id: true,
        },
      }),
    ]);

    if (!user) {
      c.status(403);
      return c.json({ success, error: "Incorrect email or password..." });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    success = true;
    return c.json({ success, token, name: user.name });
  } catch (error) {
    success = false;
    c.status(500);
    c.json({ success, error: "Internal server error..." });
  }
});
