<?php
require_once 'config/admin_config.php';

echo "<h1>🔍 Redirect Detection Test</h1>";

// Check if we're being redirected
if (isset($_SERVER['HTTP_REFERER'])) {
    echo "<p><strong>Came from:</strong> " . htmlspecialchars($_SERVER['HTTP_REFERER']) . "</p>";
}

echo "<p><strong>Current URL:</strong> " . htmlspecialchars($_SERVER['REQUEST_URI']) . "</p>";
echo "<p><strong>Request Method:</strong> " . htmlspecialchars($_SERVER['REQUEST_METHOD']) . "</p>";

// Check session
echo "<h2>Session Status:</h2>";
echo "<p><strong>Logged In:</strong> " . (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Admin Name:</strong> " . ($_SESSION['admin_name'] ?? 'Not set') . "</p>";

// Check headers
echo "<h2>Response Headers Check:</h2>";
if (headers_sent($file, $line)) {
    echo "<p style='color: red;'>⚠️ Headers already sent from $file:$line</p>";
} else {
    echo "<p style='color: green;'>✅ Headers not sent yet</p>";
}

// JavaScript detection
echo "<h2>JavaScript Redirect Detection:</h2>";
?>

<div id="redirect-log" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
    <strong>Redirect Log:</strong><br>
    <div id="log-content">Monitoring for redirects...</div>
</div>

<div style="margin: 20px 0;">
    <a href="login.php" style="padding: 10px; background: #007bff; color: white; text-decoration: none; margin: 5px; border-radius: 3px;">Test Login Page</a>
    <a href="login-simple.php" style="padding: 10px; background: #28a745; color: white; text-decoration: none; margin: 5px; border-radius: 3px;">Test Simple Login</a>
    <a href="clean-login.php" style="padding: 10px; background: #17a2b8; color: white; text-decoration: none; margin: 5px; border-radius: 3px;">Test Clean Login</a>
</div>

<script>
let redirectCount = 0;
const logDiv = document.getElementById('log-content');

function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logDiv.innerHTML += `<br>[${timestamp}] ${message}`;
}

// Monitor for any redirects
const originalLocation = window.location.href;
addLog(`Page loaded: ${originalLocation}`);

// Override location methods to detect redirects
const originalReplace = window.location.replace;
const originalAssign = window.location.assign;

window.location.replace = function(url) {
    addLog(`🚨 REDIRECT DETECTED: location.replace("${url}")`);
    return originalReplace.call(this, url);
};

window.location.assign = function(url) {
    addLog(`🚨 REDIRECT DETECTED: location.assign("${url}")`);
    return originalAssign.call(this, url);
};

// Monitor href changes
let currentHref = window.location.href;
setInterval(() => {
    if (window.location.href !== currentHref) {
        addLog(`🚨 URL CHANGED: ${currentHref} → ${window.location.href}`);
        currentHref = window.location.href;
    }
}, 100);

// Monitor for meta refresh
const metaTags = document.getElementsByTagName('meta');
for (let meta of metaTags) {
    if (meta.httpEquiv && meta.httpEquiv.toLowerCase() === 'refresh') {
        addLog(`🚨 META REFRESH DETECTED: ${meta.content}`);
    }
}

// Check for automatic form submission
document.addEventListener('submit', (e) => {
    addLog(`📝 FORM SUBMITTED: ${e.target.action || 'current page'}`);
});

addLog('✅ Redirect monitoring active');
</script>