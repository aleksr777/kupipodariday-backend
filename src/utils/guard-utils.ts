import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from '../wishlists/entities/wishlist.entity';

export function verifyOwner(
  ownerId: number,
  currentUserId: number,
  resourceId: number,
  errorMessage?: string,
): void {
  if (ownerId !== currentUserId) {
    throw new UnauthorizedException(
      errorMessage ||
        `Текущий пользователь не имеет прав для доступа к ресурсу с ID ${resourceId}!`,
    );
  }
}

export function protectPrivacyUser(owner: User) {
  delete owner.email;
  delete owner.password;
}

export function protectPrivacyItems(items: Wish[]) {
  items.forEach((item) => {
    if (item.owner) {
      protectPrivacyUser(item.owner);
    }
  });
}

export function protectPrivacyWishlists(wishlists: Wishlist[]) {
  wishlists.forEach((wishlist) => {
    if (wishlist.owner) {
      protectPrivacyUser(wishlist.owner);
    }
  });
}
