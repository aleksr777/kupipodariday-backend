export enum ErrTextWishes {
  SERVER_ERROR_CREATE_WISH = 'Ошибка сервера! Не удалось создать новое желание!',
  NO_WISHES_FOUND = 'Подарки в базе данных не найдены!',
  WISH_NOT_FOUND = 'Подарок с ID не найден в базе данных!',
  SERVER_ERROR_UPDATE_WISH = 'Ошибка сервера! Не удалось отредактировать желание!',
  CANNOT_EDIT_FOREIGN_WISH = 'Нельзя редактировать чужое желание!',
  CANNOT_EDIT_WISH_WITH_OFFERS = 'Желание нельзя редактировать, так как уже есть минимум одно предложение скинуться а него!',
  WISH_NOT_FOUND_GENERIC = 'Желание не найдено в базе данных!',
  CANNOT_DELETE_FOREIGN_WISH = 'Нельзя удалить чужое желание!',
  CANNOT_DELETE_WISH_WITH_OFFERS = 'Это желание удалять нельзя, так как уже есть минимум одно предложение скинуться а него!',
  SERVER_ERROR_DELETE_WISH = 'Ошибка сервера! Не удалось удалить желание!',
  WISH_NOT_FOUND_FOR_COPY = 'Желание не найдено в базе данных!',
  CANNOT_COPY_OWN_WISH = 'Нельзя копировать своё собственное желание!',
  SERVER_ERROR_COPY_WISH = 'Ошибка сервера! Не удалось копировать это желание!',
}

export enum ErrTextWishlists {
  SERVER_ERROR_CREATE_WISHLIST = 'Ошибка сервера! Не удалось создать новый вишлист!',
  WISHLIST_NOT_FOUND = 'Вишлист не найден в базе данных!',
  CANNOT_EDIT_FOREIGN_WISHLIST = 'Нельзя редактировать чужой вишлист!',
  SERVER_ERROR_DELETE_WISHLIST = 'Ошибка сервера! Не удалось удалить вишлист!',
  CANNOT_DELETE_FOREIGN_WISHLIST = 'Нельзя удалить чужой вишлист!',
}

export enum ErrTextUsers {
  USER_NOT_FOUND = 'Пользователь не найден в базе данных!',
  SERVER_ERROR_UPDATE_USER = 'Ошибка сервера! Не удалось обновить данные пользователя!',
  CONFLICT_USER_EXISTS = 'Пользователь с такими уникальными данными уже существует в базе данных!',
  NO_WISHES_FOUND = 'У текущего пользователя не найдены подарки в базе данных!',
  NO_WISHES_FOUND_FOR_USER = 'У пользователя не найдены подарки в базе данных!',
  USER_NOT_FOUND_BY_NAME = 'Пользователь не найден в базе данных!',
  USERS_NOT_FOUND = 'Пользователи не найдены в базе данных!',
  CONFLICT_USER_EXISTS_SIMPLE = 'Пользователь с такими уникальными данными уже существует!',
  SERVER_ERROR_SAVE_USER = 'Не удалось сохранить нового пользователя в базе данных!',
}

export enum ErrTextOffers {
  OFFER_NOT_FOUND = 'Предложение не найдено в базе данных!',
  OWNER_DATA_NOT_FOUND = 'Данные владельца желания не найдены в базе данных!',
  CANNOT_CONTRIBUTE_TO_OWN_WISH = 'Нельзя скинуться на собственное желание!',
  SUM_EXCEEDS_WISH_PRICE = 'Сумма превышает стоимость желания!',
  SERVER_ERROR_CREATE_OFFER = 'Ошибка сервера! Не удалось создать новое предложение скинуться на желание!',
  NO_OFFERS_FOUND = 'Предложений скинуться на желание в базе данных не найдено!',
  OFFER_NOT_FOUND_SINGLE = 'Предложение скинуться на желание не найдено в базе данных!',
}
