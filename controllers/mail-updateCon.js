'use strict';
// dung thu vien node-mailjet nhe...
const Mailjet = require('node-mailjet');

// Function to send a generic email
function sendEmail(toEmail, subject, htmlContent) {
    const mailjet = Mailjet.apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: "bcfutony2020@gmail.com",
                        Name: "Nmcnpm"
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: "Recipient"
                        }
                    ],
                    Subject: subject,
                    HTMLPart: htmlContent
                }
            ]
        });

    return request;
}

module.exports = { sendEmail };
