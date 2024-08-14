
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, jwt, sign, verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string ,
        JWT_SECRET : string 
    } 
    Variables : {
        userId : string
    }
}>();

    // M I D D L E W A R E 
    blogRouter.use('/api/v1/blog/*' , async (c , next) => {

        // Extracted the user id
        // pass it down the route handler

        const jwt = c.req.header("Authorization"); // defualt string here!
        if(!jwt) {
            c.status(401);
            return c.json({ error : "unauthorization"})
        }
        const token = jwt.split(' ')[1];
        const Payload = await verify(token , c.env.JWT_SECRET)

        if(!Payload) {
            c.status(401);
            return c.json({ error : "unauthorization"})
        }
        c.set('userId' , String(Payload.id));
        await next();
    
    })


    // == = = Post Blog = = ==
    blogRouter.post('/', async (c) => {

        const userId = c.get('userId');
        const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
     }).$extends(withAccelerate());

        const body = await c.req.json();

        const blog = await prisma.post.create({
            data : {
                title : body.title ,
                content : body.content ,
                authorId : userId ,
            } ,
        })

        return c.json({   id: blog.id  })
  });

  // --- - - - - - - - - - - - - - - - - - - -  - ---
  
    // == = = Update Blog = = ==
    blogRouter.put("/", async (c) => {

        const body = await c.req.json();
        const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

        const blog = await prisma.post.update({

            where : {
                id : body.id
            } ,
            data : {
                title : body.title ,
                content : body.content ,
            }
        })

        return c.json({ id: blog.id  })
    });

  // --- - - - - - - - - - - - - - - - - - - -  - ---
  
  // == = = Get Blogs = = ==
    blogRouter.get("/:id", async (c) => {
        const body = await c.req.json();
        const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

        try {
                const blog = await prisma.post.findFirst({

                where : {
                    id : body.id
                } 
            })

            return c.json({   blog  })

        }catch(error) {
            console.log(error);
            c.status(411);
            return c.json({
                message : "Error While Fetching Blog Post"
            })
        }
    });

 // --- - - - - - - - - - - - - - - - - - - -  - ---

  // == = = Get Blogs = = ==

    // Todo : Add Pagination
    blogRouter.get("/builk :id", async (c) => {

        const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

        const blogs = await prisma.post.findMany();

        return c.json({   blogs   })

    });

  // --- - - - - - - - - - - - - - - - - - - -  - ---
  