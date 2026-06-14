package com.fateen.chatapplicationbackend.auth.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private final Resend resend;
    private final String fromAddress;

    public EmailService(
            Resend resend,
            @Value("${app.mail.from}")
            String fromAddress
    ) {
        this.resend = resend;
        this.fromAddress = fromAddress;
    }

    public void sendPasswordResetEmail(
            String receiverEmail,
            String resetLink
    ) {

        String safeResetLink = HtmlUtils.htmlEscape(resetLink);

        String html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your ChatApp password</title>
        </head>

        <body style="
                margin: 0;
                padding: 0;
                background-color: #f1f5f9;
                font-family: Arial, Helvetica, sans-serif;
                color: #0f172a;
        ">

            <!-- Hidden preview text shown by Gmail -->
            <div style="
                    display: none;
                    max-height: 0;
                    overflow: hidden;
                    opacity: 0;
                    color: transparent;
            ">
                Reset your ChatApp password. This link expires in 15 minutes.
            </div>

            <table role="presentation"
                   width="100%%"
                   cellspacing="0"
                   cellpadding="0"
                   border="0"
                   style="background-color: #f1f5f9; padding: 40px 16px;">

                <tr>
                    <td align="center">

                        <table role="presentation"
                               width="100%%"
                               cellspacing="0"
                               cellpadding="0"
                               border="0"
                               style="
                                   max-width: 560px;
                                   background-color: #ffffff;
                                   border-radius: 20px;
                                   overflow: hidden;
                                   border: 1px solid #e2e8f0;
                                   box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                               ">

                            <!-- Brand header -->
                            <tr>
                                <td style="
                                        padding: 28px 32px;
                                        background-color: #4f46e5;
                                ">
                                    <table role="presentation"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0">
                                        <tr>
                                            <td style="
                                                    width: 46px;
                                                    height: 46px;
                                                    background-color: #ffffff;
                                                    color: #4f46e5;
                                                    border-radius: 12px;
                                                    text-align: center;
                                                    vertical-align: middle;
                                                    font-size: 24px;
                                                    font-weight: 700;
                                            ">
                                                C
                                            </td>

                                            <td style="
                                                    padding-left: 14px;
                                                    color: #ffffff;
                                                    font-size: 21px;
                                                    font-weight: 700;
                                            ">
                                                ChatApp
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Main content -->
                            <tr>
                                <td style="padding: 38px 32px 20px;">

                                    <h1 style="
                                            margin: 0 0 16px;
                                            font-size: 27px;
                                            line-height: 1.3;
                                            color: #0f172a;
                                    ">
                                        Reset your password
                                    </h1>

                                    <p style="
                                            margin: 0 0 14px;
                                            color: #475569;
                                            font-size: 16px;
                                            line-height: 1.7;
                                    ">
                                        We received a request to reset the password
                                        for your ChatApp account.
                                    </p>

                                    <p style="
                                            margin: 0 0 28px;
                                            color: #475569;
                                            font-size: 16px;
                                            line-height: 1.7;
                                    ">
                                        Click the button below to choose a new password.
                                    </p>

                                    <!-- Button -->
                                    <table role="presentation"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0">
                                        <tr>
                                            <td style="
                                                    background-color: #4f46e5;
                                                    border-radius: 10px;
                                            ">
                                                <a href="%s"
                                                   target="_blank"
                                                   style="
                                                       display: inline-block;
                                                       padding: 14px 24px;
                                                       color: #ffffff;
                                                       text-decoration: none;
                                                       font-size: 16px;
                                                       font-weight: 700;
                                                       border-radius: 10px;
                                                   ">
                                                    Reset password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Expiry notice -->
                                    <table role="presentation"
                                           width="100%%"
                                           cellspacing="0"
                                           cellpadding="0"
                                           border="0"
                                           style="
                                               margin-top: 30px;
                                               background-color: #f8fafc;
                                               border: 1px solid #e2e8f0;
                                               border-radius: 12px;
                                           ">
                                        <tr>
                                            <td style="
                                                    padding: 16px;
                                                    color: #475569;
                                                    font-size: 14px;
                                                    line-height: 1.6;
                                            ">
                                                <strong style="color: #0f172a;">
                                                    Security notice
                                                </strong>
                                                <br>
                                                This reset link expires in
                                                <strong>15 minutes</strong>
                                                and can only be used once.
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Fallback link -->
                                    <p style="
                                            margin: 26px 0 8px;
                                            color: #64748b;
                                            font-size: 13px;
                                            line-height: 1.6;
                                    ">
                                        If the button does not work, copy and paste
                                        this link into your browser:
                                    </p>

                                    <p style="
                                            margin: 0;
                                            word-break: break-all;
                                            font-size: 13px;
                                            line-height: 1.6;
                                    ">
                                        <a href="%s"
                                           target="_blank"
                                           style="color: #4f46e5;">
                                            %s
                                        </a>
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="
                                        padding: 24px 32px 32px;
                                        color: #64748b;
                                        font-size: 13px;
                                        line-height: 1.6;
                                ">
                                    <p style="margin: 0 0 10px;">
                                        If you did not request a password reset,
                                        you can safely ignore this email.
                                    </p>

                                    <p style="
                                            margin: 0;
                                            padding-top: 18px;
                                            border-top: 1px solid #e2e8f0;
                                    ">
                                        Sent securely by ChatApp<br>
                                        <a href="https://chat.fateen.dev"
                                           style="
                                               color: #4f46e5;
                                               text-decoration: none;
                                           ">
                                            chat.fateen.dev
                                        </a>
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        """.formatted(
                safeResetLink,
                safeResetLink,
                safeResetLink
        );

        CreateEmailOptions email =
                CreateEmailOptions.builder()
                        .from("ChatApp Security <security@mail.fateen.dev>")
                        .to(receiverEmail)
                        .subject("Reset your ChatApp password")
                        .html(html)
                        .build();



        try {

            resend.emails().send(email);

        } catch (ResendException exception) {

            throw new IllegalStateException(
                    "Resend failed to send password reset email",
                    exception
            );
        }
    }
}