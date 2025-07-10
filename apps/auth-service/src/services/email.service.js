const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear un 'transporter' con la configuración de nuestro servicio de email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Definir las opciones del email
  const mailOptions = {
    from: '"Proyecto Juego" <noreply@proyectojuego.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '<h1>Versión HTML del correo</h1>' // Opcional
  };

  // 3. Enviar el email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado: %s', info.messageId);
    // Para Ethereal, se genera una URL para previsualizar el correo enviado
    console.log('URL de previsualización: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error al enviar el email:', error);
  }
};

module.exports = sendEmail;