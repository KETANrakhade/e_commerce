<!-- layout/sidebar.php -->
<div class="vertical-menu">
    <div data-simplebar class="h-100">
        <!--- Sidemenu -->
        <div id="sidebar-menu">
            <!-- Left Menu Start -->
            <ul class="metismenu list-unstyled" id="side-menu">
                <li class="menu-title">Menu</li>

                <li class="<?php echo ($page === 'dashboard') ? 'mm-active' : ''; ?>">
                    <a href="index.php?page=dashboard" class="waves-effect">
                        <i class="bx bx-home-circle"></i>
                        <span>Dashboard</span>
                    </a>
                </li>

                <li class="<?php echo ($page === 'products') ? 'mm-active' : ''; ?>">
                    <a href="index.php?page=products" class="waves-effect">
                        <i class="bx bx-package"></i>
                        <span>Products</span>
                    </a>
                </li>

                <li class="<?php echo ($page === 'orders') ? 'mm-active' : ''; ?>">
                    <a href="index.php?page=orders" class="waves-effect">
                        <i class="bx bx-cart-alt"></i>
                        <span>Orders</span>
                    </a>
                </li>

                <li class="<?php echo ($page === 'users') ? 'mm-active' : ''; ?>">
                    <a href="index.php?page=users" class="waves-effect">
                        <i class="bx bx-user"></i>
                        <span>Users</span>
                    </a>
                </li>

                <li class="<?php echo ($page === 'settings') ? 'mm-active' : ''; ?>">
                    <a href="index.php?page=settings" class="waves-effect">
                        <i class="bx bx-cog"></i>
                        <span>Settings</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</div>
