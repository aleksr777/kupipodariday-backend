import { Module, forwardRef } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersModule } from '../offers/offers.module';
import { Wish } from './entities/wish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wish]), forwardRef(() => OffersModule)],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [TypeOrmModule, WishesService],
})
export class WishesModule {}
