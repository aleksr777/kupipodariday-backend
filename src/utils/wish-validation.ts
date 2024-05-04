import { NotFoundException } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateWishlistDto } from '../wishlists/dto/create-wishlist.dto';
import { UpdateWishlistDto } from '../wishlists/dto/update-wishlist.dto';

async function getInvalidWishes(
  itemsId: number[],
  foundItems: Wish[],
): Promise<number[]> {
  const foundIds = new Set(foundItems.map((item) => item.id));
  return itemsId.filter((id) => !foundIds.has(id));
}

async function fetchWishes(
  wishRepository: Repository<Wish>,
  itemsId: number[],
  userId?: number,
): Promise<Wish[]> {
  const where = userId
    ? { id: In(itemsId), owner: { id: userId } }
    : { id: In(itemsId) };
  return await wishRepository.find({ where });
}

export async function validateAndGetWishes(
  wishRepository: Repository<Wish>,
  dto: UpdateWishlistDto | CreateWishlistDto,
  userId?: number,
): Promise<Wish[]> {
  const foundItems = await fetchWishes(wishRepository, dto.itemsId, userId);
  if (foundItems.length !== dto.itemsId.length) {
    const invalidWishes = await getInvalidWishes(dto.itemsId, foundItems);
    if (invalidWishes.length > 0) {
      const errorDetails =
        invalidWishes.length === 1
          ? `Желание с ID ${invalidWishes.join(', ')} ${
              userId
                ? 'не найдено в базе данных или не принадлежит текущему пользователю'
                : 'не найдено в базе данных'
            }.`
          : `Желания с ID: [${invalidWishes.join(', ')}] ${
              userId
                ? 'не найдены в базе данных или не принадлежат текущему пользователю'
                : 'не найдены в базе данных'
            }.`;
      throw new NotFoundException(errorDetails);
    }
  }
  return foundItems;
}
