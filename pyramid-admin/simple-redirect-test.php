<?php
require_once 'config/admin_config.php';

// Force show redirect page for testing
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirect Test | Admin Panel</title>
        <style>
            body { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-family: Arial, sans-serif;
                margin: 0;
            }
            .card { 
                background: white; 
                padding: 2rem; 
                border-radius: 10px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                text-align: center; 
                max-width: 400px; 
            }
            .spinner { 
                border: 3px solid #f3f3f3; 
                border-top: 3px solid #556ee6; 
                border-radius: 50%; 
                width: 30px; 
                height: 30px; 
                animation: spin 1s linear infinite; 
                margin: 0 auto 1rem; 
            }
            @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
            }
            .btn {
                display: inline-block;
                padding: 10px 20px;
                margin: 5px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .btn-primary { background: #007bff; color: white; }
            .btn-secondary { background: #6c757d; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="spinner"></div>
            <h2 style="color: #556ee6; margin-bottom: 1rem;">Already Logged In</h2>
            <p style="color: #666; margin-bottom: 1rem;">
                Welcome back, <strong><?php echo htmlspecialchars($_SESSION['admin_name'] ?? 'Admin'); ?></strong>!
            </p>
            <p style="color: #888; font-size: 0.9rem; margin-bottom: 1.5rem;">
                Redirecting in <span id="countdown" style="font-weight: bold; color: #556ee6;">5</span> seconds...
            </p>
            <div>
                <a href="index.php" class="btn btn-primary">Go to Dashboard</a>
                <a href="logout.php" class="btn btn-secondary">Logout</a>
            </div>
            <p style="margin-top: 1rem; font-size: 0.8rem; color: #999;">
                Click anywhere to cancel auto-redirect
            </p>
        </div>
        
        <script>
            let countdown = 5;
            let active = true;
            const countdownEl = document.getElementById('countdown');
            
            const timer = setInterval(() => {
                if (!active) return;
                countdown--;
                countdownEl.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(timer);
                    window.location.href = 'index.php';
                }
            }, 1000);
            
            document.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    active = false;
                    clearInterval(timer);
                    countdownEl.textContent = '∞';
                    countdownEl.parentElement.innerHTML = 'Auto-redirect cancelled. Choose an option above.';
                }
            });
        </script>
    </body>
    </html>
    <?php
    exit();
} else {
    echo "<h1>Not Logged In</h1>";
    echo "<p>You are not logged in. <a href='login.php'>Go to login page</a></p>";
}
?>