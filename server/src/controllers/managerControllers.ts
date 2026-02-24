import { Request, Response } from "express";
import { prisma } from "../index.js"

export const getManager = async (req: Request, res: Response): Promise<void> => {

    try {

        const { cognitoId } = req.params;
        const manager = await prisma.manager.findUnique({
            where: { cognitoId }
        })

        if (manager) {
            res.json(manager)
        } else {
            res.status(404).json({ message: "Manager not Found" })
        }


    } catch (error: any) {
        res.status(500).json({ message: "Error Fetching manager", error: error.message })
    }
}

export const createManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body
        const manager = await prisma.manager.create({
            data: {
                cognitoId: Array.isArray(cognitoId) ? cognitoId[0] : cognitoId,
                name: Array.isArray(name) ? name[0] : name,
                email: Array.isArray(email) ? email[0] : email,
                phoneNumber: Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber
            }
        })

        res.status(201).json(manager)

    } catch (error: any) {
        res.status(500).json({ message: "Error creating manager", error: error.message })
    }
}


export const updateManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body
        const updateManager = await prisma.manager.update({
            where: { cognitoId },
            data: {
                name: Array.isArray(name) ? name[0] : name,
                email: Array.isArray(email) ? email[0] : email,
                phoneNumber: Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber
            }
        })

        res.status(201).json(updateManager)

    } catch (error: any) {
        res.status(500).json({ message: "Error updating manager", error: error.message })
    }
}