import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';

@Module({
  imports: [DbModule, CommonModule],
  controllers: [AppController],
})
export class AppModule {}
