export function availabilityLabel(profile) {
  if (profile?.availabilityStatus === 'unavailable') return 'Indisponible'
  return profile?.availability || 'Disponible'
}

export function isAvailable(profile) {
  return profile?.availabilityStatus !== 'unavailable'
}
