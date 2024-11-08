<?php
require_once 'config.php';

// Helper function to send JSON response
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$endpoint = $request[0] ?? '';

// User Authentication API
if ($endpoint === 'auth') {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action'])) {
            if ($data['action'] === 'login') {
                $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
                $stmt->execute([$data['username']]);
                $user = $stmt->fetch();

                if ($user && password_verify($data['password'], $user['password'])) {
                    sendResponse(['id' => $user['id'], 'username' => $user['username']]);
                }
                sendResponse(['error' => 'Invalid credentials'], 401);
            }
            
            if ($data['action'] === 'register') {
                try {
                    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
                    $stmt->execute([$data['username'], $hashedPassword, $data['email']]);
                    sendResponse(['message' => 'User registered successfully']);
                } catch (PDOException $e) {
                    sendResponse(['error' => 'Registration failed'], 400);
                }
            }
        }
    }
}

// Transactions API
if ($endpoint === 'transactions') {
    // Get all transactions for a user
    if ($method === 'GET') {
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) sendResponse(['error' => 'User ID required'], 400);

        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC");
        $stmt->execute([$userId]);
        sendResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // Add new transaction
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, date, notes) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['amount'],
            $data['type'],
            $data['date'],
            $data['notes'] ?? null
        ]);
        
        sendResponse(['id' => $pdo->lastInsertId(), 'message' => 'Transaction added successfully']);
    }

    // Update transaction
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("UPDATE transactions SET amount = ?, type = ?, date = ?, notes = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([
            $data['amount'],
            $data['type'],
            $data['date'],
            $data['notes'] ?? null,
            $data['id'],
            $data['user_id']
        ]);
        
        sendResponse(['message' => 'Transaction updated successfully']);
    }

    // Delete transaction
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        $userId = $_GET['user_id'] ?? null;
        
        if (!$id || !$userId) sendResponse(['error' => 'Transaction ID and User ID required'], 400);
        
        $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        
        sendResponse(['message' => 'Transaction deleted successfully']);
    }
}

// Invalid endpoint
sendResponse(['error' => 'Invalid endpoint'], 404);