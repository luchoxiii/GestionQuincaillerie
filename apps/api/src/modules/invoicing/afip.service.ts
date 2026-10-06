import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AfipAuthorizeData {
  salePointId: string;
  invoiceTypeId: string;
  total: number;
  customerDocType: string;
  customerDocNum: string;
}

export interface AfipAuthorizeResult {
  success: boolean;
  cae: string;
  caeDueDate: Date;
  qrUrl: string;
  number: number;
  afipRequest: any;
  afipResponse: any;
}

@Injectable()
export class AfipService {
  private readonly logger = new Logger(AfipService.name);

  constructor(private readonly prisma: PrismaService) {}

  async authorizeInvoice(data: AfipAuthorizeData): Promise<AfipAuthorizeResult> {
    try {
      const salePoint = await this.prisma.salePoint.findUnique({
        where: { id: data.salePointId }
      });
      if (!salePoint) {
        throw new Error('Punto de venta no encontrado');
      }

      const invoiceType = await this.prisma.invoiceType.findUnique({
        where: { id: data.invoiceTypeId }
      });
      if (!invoiceType) {
        throw new Error('Tipo de comprobante no encontrado');
      }

      // Compute next invoice number
      const lastInvoice = await this.prisma.invoice.findFirst({
        where: {
          salePointId: data.salePointId,
          invoiceTypeId: data.invoiceTypeId
        },
        orderBy: { number: 'desc' }
      });
      
      const nextNumber = (lastInvoice?.number || 0) + 1;

      // Generate simulated CAE
      // 74 + MMDD + 6 random digits
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const cae = `74${month}${day}${randomPart}`;

      // caeDueDate = current date + 10 days
      const caeDueDate = new Date(today);
      caeDueDate.setDate(caeDueDate.getDate() + 10);

      // Document Type mapping
      // CUIT = 80, DNI = 96, CUIL = 86
      let tipoDocRec = 99; // Sin identificar/Otro
      if (data.customerDocType === 'CUIT') tipoDocRec = 80;
      else if (data.customerDocType === 'DNI') tipoDocRec = 96;
      else if (data.customerDocType === 'CUIL') tipoDocRec = 86;

      const dateStr = today.toISOString().split('T')[0];
      const tipoCmp = parseInt(invoiceType.code, 10);
      const nroDocRec = parseInt(data.customerDocNum.replace(/\D/g, ''), 10) || 0;

      const qrPayload = {
        ver: 1,
        fecha: dateStr,
        cuit: 30712345678, // CUIT de la ferretería (ejemplo)
        ptoVta: salePoint.number,
        tipoCmp: tipoCmp,
        nroCmp: nextNumber,
        importe: data.total,
        moneda: "PES",
        ctz: 1,
        tipoDocRec: tipoDocRec,
        nroDocRec: nroDocRec,
        tipoCodAut: "E",
        codAut: parseInt(cae, 10)
      };

      const base64Json = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
      const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${base64Json}`;

      const afipRequest = {
        FeCAEReq: {
          FeCabReq: {
            CantReg: 1,
            PtoVta: salePoint.number,
            CbteTipo: tipoCmp
          },
          FeDetReq: [{
            Concepto: 1, // Productos
            DocTipo: tipoDocRec,
            DocNro: nroDocRec,
            CbteDesde: nextNumber,
            CbteHasta: nextNumber,
            CbteFch: dateStr.replace(/-/g, ''),
            ImpTotal: data.total,
            // ... more fields would be here in a real AFIP request
          }]
        }
      };

      const afipResponse = {
        FeCAEResponse: {
          FeCabResp: {
            Cuit: 30712345678,
            PtoVta: salePoint.number,
            CbteTipo: tipoCmp,
            FchProceso: today.toISOString().replace(/[-:T]/g, '').slice(0, 14),
            CantReg: 1,
            Resultado: "A", // Aprobado
            Reproceso: "N"
          },
          FeDetResp: [{
            Concepto: 1,
            DocTipo: tipoDocRec,
            DocNro: nroDocRec,
            CbteDesde: nextNumber,
            CbteHasta: nextNumber,
            CbteFch: dateStr.replace(/-/g, ''),
            Resultado: "A",
            CAE: cae,
            CAEFchVto: caeDueDate.toISOString().split('T')[0].replace(/-/g, '')
          }]
        }
      };

      return {
        success: true,
        cae,
        caeDueDate,
        qrUrl,
        number: nextNumber,
        afipRequest,
        afipResponse
      };
    } catch (error) {
      this.logger.error('Error authorizing invoice with AFIP', error);
      throw error;
    }
  }
}
