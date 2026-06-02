// import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { wktToGeoJSON } from "@terraformer/wkt";
// const prisma = new PrismaClient();
export const getTenant = async (req, res) => {
    try {
        const cognitoId = (Array.isArray(req.params.cognitoId)
            ? req.params.cognitoId[0]
            : req.params.cognitoId);
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: {
                favorites: true,
            },
        });
        if (tenant) {
            res.json(tenant);
        }
        else {
            res.status(404).json({ message: "Tenant not found" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving tenant: ${error.message}` });
    }
};
export const createTenant = async (req, res) => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const tenant = await prisma.tenant.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber,
            },
        });
        res.status(201).json(tenant);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating tenant: ${error.message}` });
    }
};
export const updateTenant = async (req, res) => {
    try {
        const cognitoId = (Array.isArray(req.params.cognitoId)
            ? req.params.cognitoId[0]
            : req.params.cognitoId);
        const { name, email, phoneNumber } = req.body;
        const updateTenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber,
            },
        });
        res.json(updateTenant);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error updating tenant: ${error.message}` });
    }
};
export const getCurrentResidences = async (req, res) => {
    try {
        const cognitoId = (Array.isArray(req.params.cognitoId)
            ? req.params.cognitoId[0]
            : req.params.cognitoId);
        const properties = await prisma.property.findMany({
            where: { tenants: { some: { cognitoId } } },
            include: {
                location: true,
            },
        });
        const residencesWithFormattedLocation = await Promise.all(properties.map(async (property) => {
            const coordinates = await prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.locationId}`;
            const geoJSON = wktToGeoJSON(coordinates[0]?.coordinates || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            const location = await prisma.location.findUnique({
                where: { id: property.locationId },
            });
            return {
                ...property,
                location: location
                    ? {
                        ...location,
                        coordinates: {
                            longitude,
                            latitude,
                        },
                    }
                    : null,
            };
        }));
        res.json(residencesWithFormattedLocation);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: `Error retrieving manager properties: ${err.message}` });
    }
};
export const addFavoriteProperty = async (req, res) => {
    try {
        const cognitoId = (Array.isArray(req.params.cognitoId)
            ? req.params.cognitoId[0]
            : req.params.cognitoId);
        const { propertyId } = req.params;
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: { favorites: true },
        });
        if (!tenant) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }
        const propertyIdNumber = Number(propertyId);
        const existingFavorites = tenant.favorites || [];
        if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
            const updatedTenant = await prisma.tenant.update({
                where: { cognitoId: cognitoId },
                data: {
                    favorites: {
                        connect: { id: propertyIdNumber },
                    },
                },
                include: { favorites: true },
            });
            res.json(updatedTenant);
        }
        else {
            res.status(409).json({ message: "Property already added as favorite" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error adding favorite property: ${error.message}` });
    }
};
export const removeFavoriteProperty = async (req, res) => {
    try {
        const cognitoId = (Array.isArray(req.params.cognitoId)
            ? req.params.cognitoId[0]
            : req.params.cognitoId);
        const propertyId = (Array.isArray(req.params.propertyId)
            ? req.params.propertyId[0]
            : req.params.propertyId);
        const propertyIdNumber = Number(propertyId);
        const updatedTenant = await prisma.tenant.update({
            where: { cognitoId: cognitoId },
            data: {
                favorites: {
                    disconnect: { id: propertyIdNumber },
                },
            },
            include: { favorites: true },
        });
        res.json(updatedTenant);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: `Error removing favorite property: ${err.message}` });
    }
};
//# sourceMappingURL=tenantControllers.js.map