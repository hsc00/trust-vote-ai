import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { CryptographyService } from './security/cryptography.service';
import { DbModule } from '../db/db.module';

@Global()
@Module({
  imports: [DbModule],
  providers: [SecurityService, CryptographyService],
  exports: [SecurityService, CryptographyService],
})
export class CommonModule {}
