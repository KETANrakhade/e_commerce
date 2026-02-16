<?php
echo "✅ PHP Server is working!<br>";
echo "Time: " . date('Y-m-d H:i:s') . "<br>";
echo "Server: " . $_SERVER['SERVER_NAME'] . ":" . $_SERVER['SERVER_PORT'] . "<br>";
phpinfo();
?>
