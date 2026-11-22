import { describe, expect, it } from 'vitest'
import { addFavoriteToList, favoriteCountForUser, removeFavoriteFromList } from './favorites'

describe('favorite list updates', () => {
  const favorites = [
    { id: 'f1', recruiterId: 'recruiter-a', targetId: 'student-a' },
    { id: 'f2', recruiterId: 'recruiter-b', targetId: 'student-b' },
  ]

  it('updates only the concerned user count during an optimistic add and removal', () => {
    const added = addFavoriteToList(favorites, { id: 'f3', recruiterId: 'recruiter-a', targetId: 'project-a' })
    expect(favoriteCountForUser(added, 'recruiter-a')).toBe(2)
    expect(favoriteCountForUser(added, 'recruiter-b')).toBe(1)

    const removed = removeFavoriteFromList(added, 'f3')
    expect(favoriteCountForUser(removed, 'recruiter-a')).toBe(1)
    expect(removed).toEqual(favorites)
  })
})
