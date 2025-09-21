<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$API_KEY = 'o7U7rXDMu2ZYQNqgxMbUHFuLix4CfZzNzh7vKAbsKjTO6kFQxkAnZEyCC27v';
$API_URL = 'https://api.allpes.com.br/api';
$PRODUCT_URL = 'https://go.allpes.com.br/tbevkyttzv';
$AMOUNT = 1990; // R$ 19,90

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check_status') {
    $hash = $_GET['hash'] ?? '';
    
    $statusUrl = $API_URL . '/transaction/' . urlencode($hash) . '/status';
    
    $ch = curl_init($statusUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $API_KEY,
            'Accept: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $data = json_decode($response, true);
        echo json_encode([
            'payment_status' => $data['status'] ?? 'pending',
            'hash' => $hash
        ]);
    } else {
        echo json_encode(['payment_status' => 'pending', 'hash' => $hash]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $customer = $input['customer'] ?? [];
    $utms = $input['utms'] ?? [];
    
    // Generate fake customer data for direct PIX
    $fakeNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'];
    $fakeEmails = ['cliente@email.com', 'usuario@gmail.com', 'comprador@hotmail.com'];
    $fakeCPFs = ['12345678901', '98765432100', '11122233344'];
    $fakePhones = ['11999887766', '21988776655', '31977665544'];
    
    $paymentData = [
        'amount' => $AMOUNT,
        'payment_method' => 'pix',
        'customer' => [
            'name' => $customer['name'] ?? $fakeNames[array_rand($fakeNames)],
            'email' => $customer['email'] ?? $fakeEmails[array_rand($fakeEmails)],
            'document' => $customer['document'] ?? $fakeCPFs[array_rand($fakeCPFs)],
            'phone' => $customer['phone'] ?? $fakePhones[array_rand($fakePhones)]
        ],
        'product_url' => $PRODUCT_URL,
        'utms' => $utms
    ];
    
    $ch = curl_init($API_URL . '/payment/create');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $API_KEY,
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($paymentData)
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro de conexão: ' . $curlError]);
        exit;
    }
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $data = json_decode($response, true);
        
        // Format response for the frontend
        echo json_encode([
            'success' => true,
            'hash' => $data['transaction_hash'] ?? 'HASH_' . uniqid(),
            'pix' => [
                'pix_qr_code' => $data['pix_code'] ?? 'PIX_CODE_' . uniqid(),
                'expiration_date' => date('c', strtotime('+5 minutes'))
            ]
        ]);
    } else {
        http_response_code($httpCode);
        echo $response ?: json_encode(['error' => 'Erro na API']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
