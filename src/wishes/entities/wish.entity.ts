import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsNumber,
  Length,
  IsArray,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'createdAt',
    default: () => 'LOCALTIMESTAMP',
  })
  createdAt: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updatedAt',
    default: () => 'LOCALTIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: string;

  @Column()
  @Length(1, 250)
  @IsString()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  raised: number = 0;

  @Column()
  @Length(1, 1024)
  @IsString()
  description: string;

  @Column({ default: 0 })
  @IsNotEmpty()
  @IsNumber()
  copied: number = 0;

  @ManyToOne(() => User, (owner) => owner.items)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.wish)
  @IsArray()
  offers: Offer[];

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items)
  wishlist: Wishlist;
}
