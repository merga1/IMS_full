import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Requisition } from '@/shared/types';

export interface GatePass {
    id: string;
    requisitionId: string;
    employeeName: string;
    employeeId: string;
    items: {
        name: string;
        quantity: number;
        serialNumbers?: string[];
    }[];
    issuedAt: string;
    issuedBy: string;
    qrCode: string;
    signature?: string;
}

export async function generateGatePass(
    requisition: Requisition,
    issuedBy: string,
    serialNumbers?: string[],
    signature?: string
): Promise<GatePass> {
    const gatePassId = `GP-${Date.now()}`;

    const gatePassData: GatePass = {
        id: gatePassId,
        requisitionId: requisition.id,
        employeeName: requisition.requesterName,
        employeeId: requisition.requesterId,
        items: requisition.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            serialNumbers: serialNumbers
        })),
        issuedAt: new Date().toISOString(),
        issuedBy,
        qrCode: '',
        signature
    };

    // Generate QR code
    const qrCodeData = JSON.stringify({
        id: gatePassId,
        reqId: requisition.id,
        employee: requisition.requesterName,
        timestamp: gatePassData.issuedAt
    });

    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 1
    });

    gatePassData.qrCode = qrCodeUrl;

    return gatePassData;
}

export function printGatePass(gatePass: GatePass): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDIS MESOB', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Asset Gate Pass', 105, 30, { align: 'center' });

    // Gate Pass ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pass ID: ${gatePass.id}`, 20, 45);
    doc.text(`Date: ${new Date(gatePass.issuedAt).toLocaleString()}`, 20, 52);

    // Employee Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information:', 20, 65);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${gatePass.employeeName}`, 20, 73);
    doc.text(`Fayda ID: ${gatePass.employeeId}`, 20, 80);

    // Items
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Assets:', 20, 95);

    let yPos = 103;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    gatePass.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} (Qty: ${item.quantity})`, 25, yPos);
        yPos += 7;

        if (item.serialNumbers && item.serialNumbers.length > 0) {
            doc.setFontSize(9);
            doc.text(`   Serial: ${item.serialNumbers.join(', ')}`, 25, yPos);
            yPos += 7;
            doc.setFontSize(10);
        }
    });

    // QR Code
    doc.addImage(gatePass.qrCode, 'PNG', 150, 45, 40, 40);
    doc.setFontSize(8);
    doc.text('Scan to verify', 160, 90, { align: 'center' });

    // Signature
    if (gatePass.signature) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const signatureY = yPos + 20;
        doc.text('Confirmed Receipt:', 20, signatureY);

        try {
            doc.addImage(gatePass.signature, 'PNG', 20, signatureY + 5, 60, 30);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${gatePass.employeeName}`, 20, signatureY + 40);
            doc.text(`Signed at: ${new Date(gatePass.issuedAt).toLocaleTimeString()}`, 20, signatureY + 45);
        } catch (e) {
            console.error('Error adding signature to PDF', e);
            doc.text('[Signature Image Error]', 20, signatureY + 15);
        }
    }

    // Footer
    doc.setFontSize(9);
    doc.text('This pass must be presented at the security gate.', 105, 270, { align: 'center' });
    doc.text('Valid for 24 hours from issuance.', 105, 277, { align: 'center' });

    // Border
    doc.rect(10, 10, 190, 277);

    // Open print dialog
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}
