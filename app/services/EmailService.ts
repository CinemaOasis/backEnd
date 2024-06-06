import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import i18n from "@/libraries/i18n";
import { log } from "@/libraries/Log";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

class EmailService {
  mailer: nodemailer.Transporter;

  constructor() {
    // Configuración del transportador de nodemailer
    this.mailer = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true for 465, false for other ports
      auth: {
        user: config.email.auth.user, // generated ethereal user
        pass: config.email.auth.pass, // generated ethereal password
      },
    });
  }

  /**
   * Envía un correo electrónico utilizando nodemailer.
   * @param email - Dirección de correo del destinatario.
   * @param subject - Asunto del correo.
   * @param html - Contenido HTML del correo.
   * @param attachments - Archivos adjuntos del correo.
   * @returns Una promesa con el resultado del envío.
   */
  private send(
    email: string,
    subject: string,
    html: string,
    attachments: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mailer.sendMail(
        {
          from: config.email.from_address,
          to: email,
          subject: subject,
          html: html,
          attachments: attachments,
        },
        (err, info: any) => {
          if (err) return reject(err);
          return resolve(info);
        },
      );
    });
  }

  /**
   * Compila una plantilla EJS con el contexto proporcionado.
   * @param context - Datos para renderizar la plantilla.
   * @returns Una promesa con el contenido HTML renderizado.
   */
  private compileTemplate(context: any): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, `../views/email/${context.page}.ejs`),
        context,
        (err, str) => {
          if (err) return reject(err);
          return resolve(str);
        },
      );
    });
  }

  /**
   * Envía un correo electrónico con los datos proporcionados.
   * @param emailData - Datos del correo electrónico (dirección, asunto, plantilla, contexto, adjuntos).
   * @returns Una promesa con el resultado del envío.
   */
  async sendEmail(emailData: EmailData): Promise<any> {
    if (emailData.context == null) emailData.context = {};
    emailData.context.page = emailData.page;

    const t: any = {};
    i18n.init(t);
    if (emailData.locale == null) emailData.locale = "en";
    t.setLocale(emailData.locale);

    emailData.context.__ = t.__;

    // Asegúrate de pasar el email, name y url al contexto
    emailData.context.email = emailData.email;
    emailData.context.name = emailData.context.name || emailData.email;
    emailData.context.url = emailData.context.url || "";

    // Traducir asunto
    emailData.subject = t.__(emailData.subject);

    const html = await this.compileTemplate(emailData.context);
    log.debug(`Sending ${emailData.page} email to: ${emailData.email}`);
    return await this.send(
      emailData.email,
      emailData.subject,
      html,
      emailData.attachments,
    );
  }
}

const emailService = new EmailService();
export default emailService;
