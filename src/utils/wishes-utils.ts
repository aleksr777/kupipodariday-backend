import { NotFoundException } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { Offer } from '../offers/entities/offer.entity';
import { CreateWishlistDto } from '../wishlists/dto/create-wishlist.dto';
import { UpdateWishlistDto } from '../wishlists/dto/update-wishlist.dto';
import { protectPrivacyUser, protectPrivacyInArray } from './guard-utils';

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

// Нужен ля формирования ответа сервера по заданию
// https://app.swaggerhub.com/apis/zlocate/KupiPodariDay/1.0.0#/offers/OffersController_findOne
export async function modifyOffer(offer: Offer) {
  if (!offer || !offer.owner) {
    return;
  }

  offer.owner.wishlists?.forEach((wishlist) => {
    if (wishlist && wishlist.owner) {
      protectPrivacyUser(wishlist.owner);
    }
  });

  const userWishes =
    offer.owner.wishes
      ?.filter((wish) => wish?.name !== undefined)
      .map((wish) => wish.name) || [];

  const userOffers =
    offer.owner.offers
      ?.filter((offer) => offer.item?.name !== undefined)
      .map((offer) => offer.item.name) || [];

  const modifiedOffer = {
    ...offer,
    item: offer.item?.name,
    user: {
      ...offer.owner,
      wishes: userWishes,
      offers: userOffers,
    },
  };
  delete modifiedOffer.owner;
  return modifiedOffer;
}

export async function modifyOffersArr(offers: Offer[]) {
  if (!offers.length) {
    return [];
  }
  protectPrivacyInArray(offers, false);
  return Promise.all(
    offers.map(async (offer) => {
      return await modifyOffer(offer);
    }),
  );
}

export async function modifyItemsArr(items: Wish[]) {
  if (!items.length) {
    return [];
  }

  protectPrivacyInArray(items);

  return items.map((item) => {
    const modifiedOffers = modifyOffersArr(item.offers);
    return {
      ...item,
      offers: modifiedOffers,
    };
  });
}
