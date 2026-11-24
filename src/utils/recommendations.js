import { topProjectsByViews } from './analytics'

export function dashboardAdvice(metrics, locale = 'fr-FR') {
  const english = locale.startsWith('en')
  const projectCount = metrics.byProject.length
  const totalViews = metrics.profileViews + metrics.projectViews

  if (projectCount === 0) {
    return {
      title: english ? 'Your portfolio is waiting for its first achievement.' : 'Votre portfolio attend sa première réalisation.',
      description: english ? 'Create a project to start presenting your work to recruiters.' : 'Créez un projet pour commencer à présenter votre travail aux recruteurs.',
    }
  }

  if (metrics.published === 0) {
    return {
      title: english ? 'Prepare your first publication.' : 'Préparez votre première publication.',
      description: english ? 'Finish a draft to make an achievement visible on your portfolio.' : 'Finalisez un brouillon pour rendre une réalisation visible sur votre portfolio.',
    }
  }

  if (totalViews === 0) {
    return {
      title: english ? 'Make your portfolio easier to discover.' : 'Rendez votre portfolio plus facile à découvrir.',
      description: english ? 'Refine project descriptions and skills, then share your portfolio.' : 'Affinez les descriptions et les compétences de vos projets, puis partagez votre portfolio.',
    }
  }

  const comparison = metrics.visibilityComparison || { current: 0, previous: 0 }
  if (comparison.previous > 0 && comparison.current > comparison.previous) {
    return {
      title: english ? 'Your visibility is growing.' : 'Votre visibilité progresse.',
      description: english ? 'Views are up over the comparable period. Keep your work up to date.' : 'Les consultations sont en hausse sur la période comparable. Continuez à mettre vos réalisations à jour.',
    }
  }

  if (comparison.previous > 0 && comparison.current < comparison.previous) {
    return {
      title: english ? 'Boost your visibility.' : 'Relancez votre visibilité.',
      description: english ? 'Views are down over the comparable period. Update or share a recent achievement.' : 'Les consultations sont en baisse sur la période comparable. Actualisez ou partagez une réalisation récente.',
    }
  }

  const rankedProjects = topProjectsByViews(metrics.byProject, metrics.byProject.length)
  const leader = rankedProjects[0]
  const hasUniqueLeader = leader && leader.views > 0 && (rankedProjects.length === 1 || leader.views > rankedProjects[1].views)
  if (hasUniqueLeader) {
    return {
      title: english ? `“${leader.title}” gets the most attention.` : `« ${leader.title} » retient le plus l’attention.`,
      description: english ? 'Add a measurable outcome or concrete detail to strengthen its impact.' : 'Ajoutez un résultat mesurable ou un détail concret pour renforcer encore son impact.',
    }
  }

  return {
    title: english ? 'Watch the next views.' : 'Observez les prochaines consultations.',
    description: english ? 'Available data does not yet identify a clear trend. Keep your projects up to date.' : 'Les données disponibles ne permettent pas encore d’identifier une tendance claire. Gardez vos projets à jour.',
  }
}
