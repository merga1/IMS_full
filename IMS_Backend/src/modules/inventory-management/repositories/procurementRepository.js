import prisma from '../../../database/index.js';

class ProcurementRepository {
    async create(data) {
        return prisma.procurement.create({
            data: {
                req_id: data.req_id,
                gd_approval_status: 'PENDING',
            },
            include: {
                requisition: {
                    include: { sku: true, requester: true }
                }
            }
        });
    }

    async findById(proc_id) {
        return prisma.procurement.findUnique({
            where: { proc_id },
            include: {
                requisition: {
                    include: { sku: true, requester: true }
                }
            }
        });
    }

    async update(proc_id, data) {
        return prisma.procurement.update({
            where: { proc_id },
            data,
            include: {
                requisition: true
            }
        });
    }

    async findAllPending() {
        return prisma.procurement.findMany({
            where: { gd_approval_status: 'PENDING' },
            include: {
                requisition: {
                    include: { sku: true, requester: true }
                }
            }
        });
    }
}

export default new ProcurementRepository();
