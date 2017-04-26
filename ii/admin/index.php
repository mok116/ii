<?php

include "include/head.php";

$pageName = "admin/index.php";

// run config
$pageConfig = pageInitConfig($pageName);

?>

<!-- Include Html Header/CSS -->
<?php include "include/header.php" ?>

<!-- Page Content -->
<body>

	<div class="admin-login-form">

		<div class="form-group">

			<label class="col-sm-2 control-label">Login Name</label>
			<div class="col-sm-10">
				<input type="text" name="login-name" class="form-control" placeholder="Login Name">
			</div>
			
		</div>

		<div class="form-group">

			<label class="col-sm-2 control-label">Login Password</label>
			<div class="col-sm-10">
				<input type="text" name="login-password" class="form-control" placeholder="Login Password">
			</div>
			
		</div>

		

	</div>

</body>

<!-- Include Html Foooter/JS -->
<?php include "include/footer.php" ?>

<?php
    if ($_POST['submit1']) {
        $v1 = "FirstUser";
        $v2 = "MyPassword";
        $v3 = $_POST['text'];
        $v4 = $_POST['pwd'];
        if ($v1 == $v3 && $v2 == $v4) {
            $_SESSION['luser'] = $v1;
            $_SESSION['start'] = time(); // Taking now logged in time.
            // Ending a session in 30 minutes from the starting time.
            $_SESSION['expire'] = $_SESSION['start'] + (30 * 60);
            header('Location: http://localhost/somefolder/homepage.php');
        } else {
            echo "Please enter the username or password again!";
        }
    }
?>

<!-- Home Page -->
<?php
    session_start();

    if (!isset($_SESSION['luser'])) {
        echo "Please Login again";
        echo "<a href='http://localhost/somefolder/login.php'>Click Here to Login</a>";
    }
    else {
        $now = time(); // Checking the time now when home page starts.

        if ($now > $_SESSION['expire']) {
            session_destroy();
            echo "Your session has expired! <a href='http://localhost/somefolder/login.php'>Login here</a>";
        }
        else { //Starting this else one [else1]
?>
            <!-- From here all HTML coding can be done -->
            <html>
                Welcome
                <?php
                    echo $_SESSION['luser'];
                    echo "<a href='http://localhost/somefolder/logout.php'>Log out</a>";
                ?>
            </html>
<?php
        }
    }
?>

<!-- Log out -->
<?php
    session_start();
    session_destroy();
    header('Location: http://localhost/somefolder/login.php');
?>