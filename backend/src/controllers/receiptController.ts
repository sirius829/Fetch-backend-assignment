import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Receipt } from "../types";
import { logger } from "../logger";

const receipts: { [key: string]: number } = {};

/**
 * Calculate points based on receipt input
 * @param {*} receipt 
 * @returns {number} points
 */
const calculatePoints = (receipt: Receipt) => {
    let points = 0;

    // Rule: One point for every alphanumeric character in the retailer name
    points += receipt.retailer.replace(/[^a-z0-9]/gi, '').length;

    // Rule: 50 points if the total is a round dollar amount with no cents
    if (parseFloat(receipt.total) % 1 === 0) points += 50;

    // Rule: 25 points if the total is a multiple of 0.25
    if (parseFloat(receipt.total) % 0.25 === 0) points += 25;

    // Rule: 5 points for every two items on the receipt
    points += Math.floor(receipt.items.length / 2) * 5;

    // Rule: Points based on item descriptions
    receipt.items.forEach(item => {
        const trimmedLength = item.shortDescription.trim().length;

        if (trimmedLength % 3 === 0) {
            points += Math.ceil(parseFloat(item.price) * 0.2);
        }
    });

    // Rule: 6 points if the day in the purchase date is odd
    const purchaseDate = new Date(receipt.purchaseDate);
    if (purchaseDate.getDate() % 2 !== 0) {
        points += 6;
    }

    // Rule: 10 points if the time of purchase is after 2:00pm and before 4:00pm
    const purchaseTime = parseInt(receipt.purchaseTime.replace(":", ""), 10);
    if (purchaseTime > 1400 && purchaseTime < 1600) {
        points += 10;
    }

    return points;
};

export const processReceipt = (request: Request, response: Response) => {
    try {
        const id = uuidv4();
        const receipt: Receipt = request.body;
        if (!receipt || JSON.stringify(receipt) === "{}") {
            return response.status(400).json({ error: "Please provide a receipt." });
        }

        const points = calculatePoints(receipt);
        receipts[id] = points;

        response.json({ id });
    } catch (error: any) {
        logger.error(error.message);
        response.status(500).json({ error: "Internal Server Error" });
    }
}

export const getPoints = (request: Request, response: Response) => {
    const id = request.params.id;
    if (!id) {
        return response.status(400).json({ error: "Id was not provide" });
    }
    const points = receipts[id];

    if (points === undefined) {
        return response.status(404).json({ error: "Receipt not found" });
    }

    response.json({ points });
}