import express, { Request, Response, NextFunction } from "express";
import receiptRouter from "./routes/receiptRoutes";
import dotenv from "dotenv";
import { logger } from "./logger";
dotenv.config();

const app = express();
app.use(express.json());


app.use((request: Request, response: Response, next: NextFunction) => {
    logger.info(`[${request.method}] ${request.url}`);
    next();
});

app.use('/receipts', receiptRouter);

app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
    logger.error(err.message);
    response.status(500).send("Internal Server Error");
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});