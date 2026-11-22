export function addFavoriteToList(favorites, favorite) {
  return favorites.some((item) => item.id === favorite.id) ? favorites : [...favorites, favorite]
}

export function removeFavoriteFromList(favorites, favoriteId) {
  return favorites.filter((item) => item.id !== favoriteId)
}

export function favoriteCountForUser(favorites, userId) {
  return favorites.filter((item) => item.recruiterId === userId).length
}
