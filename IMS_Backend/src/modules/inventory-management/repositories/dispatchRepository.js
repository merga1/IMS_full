import prisma from '../../../database/index.js';
import { assetSummarySelect, userSummarySelect } from '../../../shared/constants/prismaSelects.js';

class DispatchRepository {
    async findGatePassById(pass_id) {
        return prisma.gatePass.findUnique({
            where: { pass_id },
            include: {
                asset: { select: assetSummarySelect },
                issuer: { select: userSummarySelect },
                receiver: { select: userSummarySelect }
            }
        });
    }

    async createSignature(data) {
        return prisma.signature.upsert({
            where: { req_id: data.req_id },
            create: { req_id: data.req_id, signature_blob: data.signature_blob },
            update: {
                signature_blob: data.signature_blob,
                signed_at: new Date(),
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
