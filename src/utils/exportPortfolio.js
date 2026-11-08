import { jsPDF } from 'jspdf'

export function exportPortfolioPDF(student, projects) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const width = pdf.internal.pageSize.getWidth()
  let y = 22
  pdf.setFillColor(18, 58, 120)
  pdf.rect(0, 0, width, 46, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(24)
  pdf.text(student.name, 16, 20)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(student.title, 16, 29)
  pdf.text(`${student.location} · ${student.email}`, 16, 36)
  y = 58
  pdf.setTextColor(25, 35, 52)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Profil', 16, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10.5)
  const bio = pdf.splitTextToSize(student.bio, width - 32)
  pdf.text(bio, 16, y + 7)
  y += 16 + bio.length * 5
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Compétences', 16, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10.5)
  pdf.text(student.skills.join('  ·  '), 16, y + 7)
  y += 20
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Projets sélectionnés', 16, y)
  y += 8
  projects.filter((project) => project.published).forEach((project, index) => {
    const description = pdf.splitTextToSize(project.description, width - 32)
    const required = 18 + description.length * 4.5
    if (y + required > 280) { pdf.addPage(); y = 22 }
    pdf.setFillColor(244, 247, 252)
    pdf.roundedRect(14, y - 5, width - 28, required, 3, 3, 'F')
    pdf.setTextColor(18, 58, 120)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(`${index + 1}. ${project.title}`, 18, y + 2)
    pdf.setTextColor(25, 35, 52)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9.5)
    pdf.text(description, 18, y + 8)
    pdf.setTextColor(80, 91, 110)
    pdf.setFontSize(8.5)
    pdf.text(`${project.category} · ${project.technologies.join(', ')}`, 18, y + 12 + description.length * 4.5)
    y += required + 6
  })
  pdf.save(`portfolio-${student.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`)
}
