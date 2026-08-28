import jsPDF from 'jspdf'
import type { InformeFinalResponse } from '../types'
import { flattenSolution } from './format'

export function generarInformePDF(informe: InformeFinalResponse) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 48
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 56

  const checkPageBreak = (needed = 20) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage()
      y = 56
    }
  }

  const heading = (text: string, size = 14) => {
    checkPageBreak(size + 16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(size)
    doc.text(text, marginX, y)
    y += size + 8
    doc.setFont('helvetica', 'normal')
  }

  const paragraph = (text: string, size = 10) => {
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(text, pageWidth - marginX * 2)
    for (const line of lines) {
      checkPageBreak(size + 4)
      doc.text(line, marginX, y)
      y += size + 4
    }
  }

  const bullet = (text: string, size = 10) => {
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(text, pageWidth - marginX * 2 - 14)
    lines.forEach((line: string, i: number) => {
      checkPageBreak(size + 4)
      doc.text(i === 0 ? `•  ${line}` : `   ${line}`, marginX, y)
      y += size + 4
    })
  }

  // Encabezado
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Logic Detective — Informe Final', marginX, y)
  y += 26
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Caso: ${informe.caso}  ·  Generado: ${new Date(informe.generado_en).toLocaleString()}`, marginX, y)
  doc.setTextColor(0)
  y += 24

  heading(informe.titulo, 16)

  heading('Conclusión lógica', 13)
  paragraph(`Responsable lógico: ${informe.responsable_logico ?? 'No determinado'}`)
  paragraph(`Nivel de sospecha: ${informe.nivel_sospecha ?? '—'}`)
  y += 6

  heading('Explicación', 13)
  if (informe.explicacion.length) {
    informe.explicacion.forEach(r => bullet(String(r)))
  } else {
    paragraph('El motor no reportó razones específicas.')
  }
  y += 6

  heading('Evidencias relacionadas', 13)
  if (informe.evidencias_relacionadas.length) {
    informe.evidencias_relacionadas.forEach(e => bullet(flattenSolution(e)))
  } else {
    paragraph('Sin evidencias vinculadas.')
  }
  y += 6

  heading('Contradicciones entre declaraciones', 13)
  if (informe.contradicciones_declaraciones.length) {
    informe.contradicciones_declaraciones.forEach(c => bullet(flattenSolution(c)))
  } else {
    paragraph('No se detectaron contradicciones entre declaraciones.')
  }
  y += 6

  heading('Bitácora de la investigación', 13)
  if (informe.bitacora.length) {
    informe.bitacora.forEach(e => {
      const fecha = e.timestamp ? new Date(e.timestamp).toLocaleString() : 'N/A'
      const resultado = e.correcto === null ? 'N/A' : e.correcto ? 'Correcto' : 'Incorrecto'
      bullet(`[${fecha}] (${e.tipo}) ${e.sospechoso ?? '—'} — ${e.detalle} · Resultado: ${resultado}`)
    })
  } else {
    paragraph('No hay eventos registrados en la bitácora de este caso.')
  }

  doc.save(`informe_${informe.caso}.pdf`)
}