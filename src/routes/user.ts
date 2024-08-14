import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// == = = Sign-Up = = ==
userRouter.post("/signup", async (c) => {

  const prisma = new PrismaClient({
  datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
        const user = await prisma.user.create({
        data: {
            email: body.email,
            password: body.password,
            name : body.name

        },
        });

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);

        console.log("Successfully Signing-Up 🎉 ");
        return c.json({ jwt: token });

    }catch (error) {
        console.log(error)
        c.status(403);
        return c.json({ error: "Error While Signing-Up || User Already Exist" });
    }

});

// --- - - - - - - - - - - - - - - - - - - -  - ---


// == = = Sign-Up = = ==
userRouter.post("/signin", async (c) => {

    const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403); // unauthorized
      return c.json({ message: "Incorrect Credential!" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log("Successfully Signing-In 🎉 ");
    return c.json({ jwt });

  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text("Invalid Email & Password!");
  }
  
});

// --- - - - - - - - - - - - - - - - - - - -  - ---
