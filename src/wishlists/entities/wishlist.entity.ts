import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { IsString, IsNotEmpty, Length, IsArray, IsUrl } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist {
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
  @Length(1, 250)
  @IsString()
  description: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish)
  @JoinTable()
  @IsArray()
  items: Wish[];

  @ManyToOne(() => User)
  owner: User;
}
