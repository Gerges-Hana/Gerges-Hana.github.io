<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Method not allowed.');
}

$configPath = __DIR__ . '/config/mail.config.php';

if (!is_file($configPath)) {
    respond(
        500,
        false,
        'Mail is not configured. Copy config/mail.config.example.php to config/mail.config.php.'
    );
}

/** @var array<string, mixed> $config */
$config = require $configPath;
$accessKey = trim((string) ($config['access_key'] ?? ''));

if ($accessKey === '') {
    respond(
        500,
        false,
        'Access Key is missing. Get it free from https://web3forms.com and add it to config/mail.config.php.'
    );
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, false, 'Please complete all fields correctly.');
}

if (mb_strlen($name) > 120 || mb_strlen($email) > 180 || mb_strlen($subject) > 180 || mb_strlen($message) > 5000) {
    respond(400, false, 'One or more fields are too long.');
}

$payload = json_encode([
    'access_key' => $accessKey,
    'name' => $name,
    'email' => $email,
    'subject' => 'Portfolio contact: ' . $subject,
    'message' => $message,
    'from_name' => 'Gerges Hanna Portfolio',
], JSON_UNESCAPED_UNICODE);

if ($payload === false) {
    respond(500, false, 'Could not prepare the message.');
}

$ch = curl_init('https://api.web3forms.com/submit');

if ($ch === false) {
    respond(500, false, 'Could not connect to mail service.');
}

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);

$responseBody = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($responseBody === false) {
    respond(500, false, 'Mail service error: ' . ($curlError ?: 'Unknown error'));
}

/** @var array<string, mixed>|null $result */
$result = json_decode($responseBody, true);

if ($httpCode >= 200 && $httpCode < 300 && !empty($result['success'])) {
    respond(200, true, 'Your message has been sent successfully!');
}

$serviceMessage = is_array($result) && !empty($result['message'])
    ? (string) $result['message']
    : 'There was an error sending your message. Please try again later.';

respond(500, false, $serviceMessage);
