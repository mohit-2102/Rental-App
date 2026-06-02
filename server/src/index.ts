import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware.js"
import { prisma } from "./lib/prisma.js";
/* Route Imports */
import tenantRoutes from "./routes/tenantRoutes.js"
import managerRoutes from "./routes/managerRoutes.js"
import propertyRoutes from "./routes/propertyRoutes.js"
// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from '@prisma/adapter-pg';
import applicationRoutes from './routes/applicationRoutes.js';
import leaseRoutes from './routes/leaseRoutes.js';

/* CONFIGURATIONS */
dotenv.config();
const app = express()
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// export const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
// export const prisma = new PrismaClient({ adapter })

/* ROUTES */
app.get("/", (req, res) => {
  console.log("This is the Home Page");
  res.status(200).json("This is the Home Page");
});

app.use("/applications", applicationRoutes);
app.use("/leases", leaseRoutes);
app.use("/properties", propertyRoutes)
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes)
app.use("/managers", authMiddleware(["manager"]), managerRoutes)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`🚀 Server is Running on http://localhost:${port}`)
})