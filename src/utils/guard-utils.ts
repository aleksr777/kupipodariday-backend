import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from '../wishlists/entities/wishlist.entity';
import { Offer } from 'src/offers/entities/offer.entity';

export function verifyOwner(
  ownerId: number,
  currentUserId: number,
  errorMessage?: string,
): void {
  if (ownerId !== currentUserId) {
    throw new UnauthorizedException(
      errorMessage ||
        `Текущий пользователь не имеет прав доступа к запрашиваемому ресурсу!`,
    );
  }
}

export function protectPrivacyUser(owner: User, deleteEmail = true) {
  delete owner.password;
  if (deleteEmail) {
    delete owner.email;
  }
}

export function protectPrivacyInArray(
  arr: Wish[] | Wishlist[] | Offer[],
  deleteEmail = true,
) {
  arr.forEach((element: Wish | Wishlist | Offer) => {
    if (element.owner) {
      protectPrivacyUser(element.owner, deleteEmail);
    }
  });
}
