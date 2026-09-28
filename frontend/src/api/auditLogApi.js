import apiClient from "./apiClient";


export const getAuditLogs =
    async () => {

        const response =
            await apiClient.get(
                "/audit-logs"
            );

        return response.data;
    };


export const getAuditLogsByEntityType =
    async (
        entityType
    ) => {

        const response =
            await apiClient.get(
                `/audit-logs/entity/${entityType}`
            );

        return response.data;
    };


export const getEntityAuditHistory =
    async (
        entityType,
        entityId
    ) => {

        const response =
            await apiClient.get(
                `/audit-logs/entity/${entityType}/${entityId}`
            );

        return response.data;
    };


export const getAuditLogsByUser =
    async (
        username
    ) => {

        const response =
            await apiClient.get(
                `/audit-logs/user/${encodeURIComponent(
                    username
                )}`
            );

        return response.data;
    };