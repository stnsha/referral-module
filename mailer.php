<?php
/**
 * PHPMailer Email Utility
 *
 * This file provides email sending functionality using PHPMailer package
 * located at C:\xampp\htdocs\odb\common\phpmailer
 */

// Include PHPMailer autoloader
require_once('../common/phpmailer/PHPMailerAutoload.php');

/**
 * Send email using PHPMailer
 *
 * @param string $to Recipient email address
 * @param string $subject Email subject
 * @param string $body Email body (HTML supported)
 * @param array $options Additional options (cc, bcc, attachments, etc.)
 * @return bool True on success, false on failure
 */
function sendEmail($to, $subject, $body, $options = []) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        // Looking to send emails in production? Check out our Email API/SMTP product!
        $mail->isSMTP();
        $mail->Host = 'sandbox.smtp.mailtrap.io';
        $mail->SMTPAuth = true;
        $mail->Port = 2525;
        $mail->Username = '';
        $mail->Password = '';

        // Character encoding
        $mail->CharSet = 'UTF-8';

        // Recipients
        $mail->setFrom($options['from'] ?? 'noreply@yourdomain.com', $options['fromName'] ?? 'Referral System');
        $mail->addAddress($to);

        // Add CC if provided
        if (isset($options['cc'])) {
            if (is_array($options['cc'])) {
                foreach ($options['cc'] as $cc) {
                    $mail->addCC($cc);
                }
            } else {
                $mail->addCC($options['cc']);
            }
        }

        // Add BCC if provided
        if (isset($options['bcc'])) {
            if (is_array($options['bcc'])) {
                foreach ($options['bcc'] as $bcc) {
                    $mail->addBCC($bcc);
                }
            } else {
                $mail->addBCC($options['bcc']);
            }
        }

        // Add reply-to if provided
        if (isset($options['replyTo'])) {
            $mail->addReplyTo($options['replyTo'], $options['replyToName'] ?? '');
        }

        // Attachments
        if (isset($options['attachments']) && is_array($options['attachments'])) {
            foreach ($options['attachments'] as $attachment) {
                if (is_array($attachment)) {
                    // Array format: ['path' => 'file.pdf', 'name' => 'custom_name.pdf']
                    $mail->addAttachment($attachment['path'], $attachment['name'] ?? '');
                } else {
                    // String format: just the file path
                    $mail->addAttachment($attachment);
                }
            }
        }

        // Content
        $mail->isHTML(isset($options['isHTML']) ? $options['isHTML'] : true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        // Alternative plain text body
        if (isset($options['altBody'])) {
            $mail->AltBody = $options['altBody'];
        }

        // Send email
        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("Email sending failed: {$mail->ErrorInfo}");
        return false;
    }
}

/**
 * Send referral notification email
 *
 * @param string $recipientEmail Recipient email address
 * @param string $recipientName Recipient name
 * @param string $referralId Referral ID
 * @param array $referralData Referral data
 * @return bool True on success, false on failure
 */
function sendReferralNotification($recipientEmail, $recipientName, $referralId, $referralData = []) {
    $subject = "New Referral Notification - REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT);

    $body = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Referral Notification</h2>
            </div>
            <div class='content'>
                <p>Dear {$recipientName},</p>
                <p>You have received a new referral:</p>

                <div class='info-row'>
                    <span class='label'>Referral ID:</span> REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT) . "
                </div>

                " . (isset($referralData['customer_name']) ? "
                <div class='info-row'>
                    <span class='label'>Customer Name:</span> {$referralData['customer_name']}
                </div>
                " : "") . "

                " . (isset($referralData['from_business_unit']) ? "
                <div class='info-row'>
                    <span class='label'>From:</span> {$referralData['from_business_unit']}
                </div>
                " : "") . "

                " . (isset($referralData['priority']) ? "
                <div class='info-row'>
                    <span class='label'>Priority:</span> {$referralData['priority']}
                </div>
                " : "") . "

                <p>Please log in to the system to view the full details.</p>

                <a href='" . (isset($referralData['view_url']) ? $referralData['view_url'] : '#') . "' class='button'>View Referral</a>
            </div>
            <div class='footer'>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $options = [
        'isHTML' => true,
        'altBody' => "You have received a new referral (REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT) . "). Please log in to the system to view details."
    ];

    return sendEmail($recipientEmail, $subject, $body, $options);
}

/**
 * Send external referral notification email
 *
 * @param string $recipientEmail Recipient email address
 * @param string $recipientName Recipient name
 * @param string $referralId Referral ID
 * @param array $referralData Referral data
 * @return bool True on success, false on failure
 */
function sendExternalReferralNotification($recipientEmail, $recipientName, $referralId, $referralData = []) {
    $subject = "External Referral - REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT);

    $body = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>External Referral Notification</h2>
            </div>
            <div class='content'>
                <p>Dear {$recipientName},</p>
                <p>You have been referred to for a patient case:</p>

                <div class='info-row'>
                    <span class='label'>Referral ID:</span> REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT) . "
                </div>

                " . (isset($referralData['customer_name']) ? "
                <div class='info-row'>
                    <span class='label'>Patient Name:</span> {$referralData['customer_name']}
                </div>
                " : "") . "

                " . (isset($referralData['organization']) ? "
                <div class='info-row'>
                    <span class='label'>From Organization:</span> {$referralData['organization']}
                </div>
                " : "") . "

                " . (isset($referralData['referral_reason']) ? "
                <div class='info-row'>
                    <span class='label'>Reason:</span> {$referralData['referral_reason']}
                </div>
                " : "") . "

                <p>Please contact the referring organization if you need more information.</p>
            </div>
            <div class='footer'>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $options = [
        'isHTML' => true,
        'altBody' => "You have been referred to for a patient case (REF" . str_pad($referralId, 4, '0', STR_PAD_LEFT) . ")."
    ];

    return sendEmail($recipientEmail, $subject, $body, $options);
}

// Example usage (commented out):
/*
// Simple email
sendEmail(
    'recipient@example.com',
    'Test Subject',
    '<h1>Hello</h1><p>This is a test email.</p>'
);

// Email with options
sendEmail(
    'recipient@example.com',
    'Test Subject',
    '<h1>Hello</h1><p>This is a test email.</p>',
    [
        'from' => 'sender@example.com',
        'fromName' => 'Sender Name',
        'cc' => ['cc1@example.com', 'cc2@example.com'],
        'attachments' => [
            '/path/to/file.pdf',
            ['path' => '/path/to/file2.pdf', 'name' => 'custom_name.pdf']
        ]
    ]
);

// Referral notification
sendReferralNotification(
    'doctor@clinic.com',
    'Dr. John Doe',
    123,
    [
        'customer_name' => 'Jane Smith',
        'from_business_unit' => 'Clinic A',
        'priority' => 'High',
        'view_url' => 'https://yourdomain.com/referral/view.php?id=123'
    ]
);

// External referral notification
sendExternalReferralNotification(
    'external.doctor@hospital.com',
    'Dr. John Smith',
    456,
    [
        'customer_name' => 'Jane Doe',
        'organization' => 'Medical Center Hospital',
        'referral_reason' => 'Cardiology consultation'
    ]
);
*/
?>