import express from "express";
import cors from "cors";
import v1Routes from "../src/routes/v1/index"
import { HTTP_STATUS } from "./constants/httpStatus";
import { errorMiddleware } from "./middlewares/error.middleware";
import { ApiError } from "./utils/ApiError";

const app  = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());        

app.use('/api/v1', v1Routes);

app.use((req, res) => {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Route not Found");
})

app.use(errorMiddleware);

export default app;