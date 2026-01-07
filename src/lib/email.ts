import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendContactNotification(data: {
  prenom: string
  nom: string
  email: string
  telephone: string
  type: string
  sujet: string
  message: string
}) {
  try {
    await transporter.sendMail({
      from: `"MZ Energy" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'contact@mz-energy.co.il',
      subject: `Nouvelle demande de contact - ${data.sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            Nouvelle demande de contact
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${data.prenom} ${data.nom}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Téléphone:</strong> <a href="tel:${data.telephone}">${data.telephone}</a></p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Sujet:</strong> ${data.sujet}</p>
          </div>
          <div style="margin-top: 20px;">
            <h3 style="color: #374151;">Message:</h3>
            <p style="background: #ffffff; padding: 15px; border-left: 4px solid #16a34a; border-radius: 4px;">
              ${data.message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Erreur envoi email contact:', error)
    throw error
  }
}

export async function sendCallbackNotification(data: {
  prenom: string
  telephone: string
  type: string
  creneau?: string
}) {
  try {
    await transporter.sendMail({
      from: `"MZ Energy" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'contact@mz-energy.co.il',
      subject: `Nouvelle demande de rappel - ${data.type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            Nouvelle demande de rappel
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Prénom:</strong> ${data.prenom}</p>
            <p><strong>Téléphone:</strong> <a href="tel:${data.telephone}">${data.telephone}</a></p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Créneau préféré:</strong> ${data.creneau || 'Peu importe'}</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Erreur envoi email callback:', error)
    throw error
  }
}

