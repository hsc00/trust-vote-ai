import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security/security.service';

@Global()
@Module({
  providers: [SecurityService],
  exports: [SecurityService],
})
export class CommonModule {}
