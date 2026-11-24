import { topProjectsByViews } from './analytics'

export function dashboardAdvice(metrics) {
  const projectCount = metrics.byProject.length
  const totalViews = metrics.profileViews + metrics.projectViews

  if (projectCount === 0) {
    return {
      title: 'Votre portfolio attend sa première réalisation.',
      description: 'Créez un projet pour commencer à présenter votre travail aux recruteurs.',
    }
  }

  if (metrics.published === 0) {
    return {
      title: 'Préparez votre première publication.',
      description: 'Finalisez un brouillon pour rendre une réalisation visible sur votre portfolio.',
    }
  }

  if (totalViews === 0) {
    return {
      title: 'Rendez votre portfolio plus facile à découvrir.',
      description: 'Affinez les descriptions et les compétences de vos projets, puis partagez votre portfolio.',
    }
  }

  const comparison = metrics.visibilityComparison || { current: 0, previous: 0 }
  if (comparison.previous > 0 && comparison.current > comparison.previous) {
    return {
      title: 'Votre visibilité progresse.',
      description: 'Les consultations sont en hausse sur la période comparable. Continuez à mettre vos réalisations à jour.',
    }
  }

  if (comparison.previous > 0 && comparison.current < comparison.previous) {
    return {
      title: 'Relancez votre visibilité.',
      description: 'Les consultations sont en baisse sur la période comparable. Actualisez ou partagez une réalisation récente.',
    }
  }

  const rankedProjects = topProjectsByViews(metrics.byProject, metrics.byProject.length)
  const leader = rankedProjects[0]
  const hasUniqueLeader = leader && leader.views > 0 && (rankedProjects.length === 1 || leader.views > rankedProjects[1].views)
  if (hasUniqueLeader) {
    return {
      title: `« ${leader.title} » retient le plus l’attention.`,
      description: 'Ajoutez un résultat mesurable ou un détail concret pour renforcer encore son impact.',
    }
  }

  return {
    title: 'Observez les prochaines consultations.',
    description: 'Les données disponibles ne permettent pas encore d’identifier une tendance claire. Gardez vos projets à jour.',
  }
}
