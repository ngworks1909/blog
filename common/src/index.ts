import z from 'zod'

//signup
export const signupInput = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6)
})
export type SignupInput = z.infer<typeof signupInput>

//signin
export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})
export type SigninInput = z.infer<typeof signinInput>

//blog
export const createBlogInput = z.object({
    title: z.string().min(4),
    content: z.string().min(5)
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

