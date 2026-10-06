import { Module } from '@nestjs/common';
import { BackendTelemetryService } from './backend-telemetry.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BackendTelemetryService],
  exports: [BackendTelemetryService],
})
export class BackendTelemetryModule {}
