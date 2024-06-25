export type Item = {
    shortDescription: string;
    price: string;
};

export interface Receipt {
    retailer: string,
    purchaseDate: string,
    purchaseTime: string,
    total: string,
    items: Item[],
};