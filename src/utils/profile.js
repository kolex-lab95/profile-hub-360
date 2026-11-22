export function availabilityLabel(profile) {
  return isAvailable(profile) ? 'Disponible' : 'Indisponible'
}

export function isAvailable(profile) {
  return profile?.availabilityStatus !== 'unavailable'
}
