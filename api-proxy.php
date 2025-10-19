<?php
/**
 * MyTrips API Proxy
 * This file proxies requests from your frontend to the MyTrips API
 * to bypass Content Security Policy restrictions
 */

// Enable CORS for your domain
header('Access-Control-Allow-Origin: https://www.bahar.co.il');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// MyTrips API base URL
$api_base_url = 'https://mytrips-api.bahar.co.il';

// Get the requested path from the URL
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Build the full API URL
$api_url = $api_base_url . '/' . ltrim($path, '/');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    // Forward important headers
    if (in_array(strtolower($name), ['authorization', 'content-type', 'x-requested-with'])) {
        $headers[] = "$name: $value";
    }
}

// Get request body for POST/PUT/PATCH requests
$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
}

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $api_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HEADER => true,
    CURLOPT_HEADERFUNCTION => function($curl, $header) {
        $len = strlen($header);
        $header = explode(':', $header, 2);
        
        if (count($header) < 2) return $len;
        
        $name = strtolower(trim($header[0]));
        $value = trim($header[1]);
        
        // Forward response headers (except some that might cause issues)
        if (!in_array($name, ['transfer-encoding', 'content-encoding', 'connection'])) {
            header("$name: $value");
        }
        
        return $len;
    }
]);

// Add body for POST/PUT/PATCH requests
if ($body) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute the request
$response = curl_exec($ch);

// Get response info
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

// Check for cURL errors
if (curl_error($ch)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Proxy error: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit();
}

curl_close($ch);

// Extract response body
$response_body = substr($response, $header_size);

// Set the HTTP response code
http_response_code($http_code);

// Output the response
echo $response_body;
?>
