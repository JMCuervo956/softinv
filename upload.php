<?php
$servername = "localhost";
$username = "root"; // Cambia según tu configuración
$password = "123"; // Cambia según tu configuración
$dbname = "sarlaft"; // Cambia según tu configuración

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Comprobar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file']['tmp_name'];

    if (pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION) !== 'txt') {
        echo json_encode(['message' => 'Solo se permiten archivos .txt']);
        exit;
    }

    $fileContent = file_get_contents($file);
    $lines = explode("\n", trim($fileContent));

    // Asumiendo que cada línea del archivo es un dato a insertar en una sola columna
    foreach ($lines as $line) {
        $line = $conn->real_escape_string($line);
        $sql = "INSERT INTO tu_tabla (tu_columna) VALUES ('$line')";
        
        if (!$conn->query($sql)) {
            echo json_encode(['message' => 'Error en la inserción: ' . $conn->error]);
            $conn->close();
            exit;
        }
    }

    echo json_encode(['message' => 'Archivo procesado exitosamente.']);
    $conn->close();
} else {
    echo json_encode(['message' => 'No se ha enviado ningún archivo.']);
}
?>
