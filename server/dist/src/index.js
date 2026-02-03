import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* Route Imports */
/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/* ROUTES */
app.get("/", (req, res) => {
    console.log("This is the Home Page");
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server is Running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map