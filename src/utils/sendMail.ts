import { EMAIL_USER } from "../config/env";
import { transporter } from "../config/nodemailer";

type sendEmailOptions = {
    to : string,
    subject : string,
    html : string
}

export const sendEmail = async (data : sendEmailOptions) => {
    const {to, subject, html } = data;

    await transporter.sendMail({
        from : EMAIL_USER,
        to,
        subject,
        html
    })
}