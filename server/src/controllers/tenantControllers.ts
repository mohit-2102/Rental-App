import { Request, Response } from "express";
import {prisma} from "../index.js"


export const getTenant = async (req: Request<{ cognitoId: string }>, res: Response): Promise<void> => {

    try {

        const { cognitoId } = req.params;
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: {
                favorites: true
            }
        })

        if (tenant) {
            res.json(tenant)
        } else {
            res.status(404).json({ message: "Tenant not Found" })
        }

    } catch (error: any) {
        res.status(500).json({ message: "Error fetching tenant", error: error.message })
    }
}

export const createTenant = async (req: Request, res: Response): Promise<void> => {

    try {

        const { cognitoId, name, email, phoneNumber } = req.body;
        const tenant = await prisma.tenant.create({
            data: {
                cognitoId, name, email, phoneNumber
            }
        })

        res.status(201).json(tenant);

    } catch (error: any) {
        res.status(500).json({ message: "Error creating tenant", error: error.message })
    }
}


export const updateTenant = async (req: Request, res: Response): Promise<void> => {

    try {

        const { cognitoId } = req.params
        
        const { name, email, phoneNumber } = req.body;
        const updateTenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                name: Array.isArray(name) ? name[0] : name || undefined,
                email: Array.isArray(email) ? email[0] : email || undefined,
                phoneNumber: Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber || undefined
            }
        })

        res.status(201).json(updateTenant);

    } catch (error: any) {
        res.status(500).json({ message: "Error updating tenant", error: error.message })
    }
}

