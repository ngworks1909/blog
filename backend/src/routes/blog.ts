import { Hono } from "hono";
import { fetchUser } from "../middlewares/fetchUser";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {createBlogInput}  from "@ngworks/blog-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
      id: string
    }
}>();

blogRouter.use('/*', fetchUser);

blogRouter.post('/createPost', async(c) => {
    const body = await c.req.json();
    const result = createBlogInput.safeParse(body).success;
    let success = false;
    if(!result){
        c.status(411);
        return c.json({success, error: 'Invalid inputs...'});
    }
    const id = c.get('id');
    if(!id){
        c.status(403);
        return c.json({success, error: "Authentication error..."});
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: id
            }
        })
        success = true;
        return c.json({success, message: "Post created successfully..."});
    } catch (error) {
        success = false;
        c.status(500);
        return c.json({success, error: 'Internal server error...'});
    }
})


blogRouter.put('/updatePost/:id', async(c) => {
    const body = await c.req.json();
    const id = c.get('id');
    const blogId = c.req.param("id");
    let success = false;
    if(!id){
        c.status(403);
        return c.json({success, error: "Authentication error..."});
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        await prisma.post.update({
            where: {
                id: blogId
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })
    
        success = true;
        return c.json({success, message: "Post updated successfully..."});
    } catch (error) {
        success = false;
        c.status(500);
        return c.json({success, error: 'Internal server error...'});
    }
})


blogRouter.get('/fetchPost/:id', async(c) => {
    const id = c.get('id');
    const blogId = c.req.param("id");
    let success = false;
    if(!id){
        c.status(403);
        return c.json({success, error: "Authentication error..."});
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.post.findUnique({
            where: {
                id: blogId
            }
        })
    
        success = true;
        return c.json({success, blog});
    } catch (error) {
        success = false;
        c.status(500);
        return c.json({success, error: 'Internal server error...'});
    }
});

blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    let success = true;
    try {
        const blogs = await prisma.post.findMany();
        return c.json({success, blogs});
    } catch (error) {
        success = false;
        c.status(500);
        c.json({success, error: 'Internal server error...'});
    }
})

