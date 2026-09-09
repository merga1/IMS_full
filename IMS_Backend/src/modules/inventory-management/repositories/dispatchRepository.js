import prisma from '../../../database/index.js';

class DispatchRepository {
    async findGatePassById(pass_id) {
        return prisma.gatePass.findUnique({
            where: { pass_id },
            include: {
                asset: { include: { sku: true } },
                issuer: true,
                receiver: true
            }
        });
    }

    async createSignature(data) {
        return prisma.signature.create({
            data: {
                req_id: data.req_id,
                signature_blob: data.signature_blob,
            }
        });
    }

    async findSignatureByReqId(req_id) {
        return prisma.signature.findUnique({
            where: { req_id }
        });
    }
}

export default new DispatchRepository();
