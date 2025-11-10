# 🔐 PYRAMID E-Commerce Registration & Login APIs

## 📋 **Complete API Overview**

### ✅ **Available Registration & Login APIs:**

---

## 👤 **Customer APIs**

### **1. Customer Registration**
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
}
```

### **2. Customer Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

---

## 👑 **Admin APIs**

### **3. Super Admin Registration (First Time Setup)**
```http
POST /api/admin/register-super-admin
Content-Type: application/json

{
  "name": "Super Admin",
  "email": "admin@pyramid.com",
  "password": "admin123",
  "secretKey": "PYRAMID_SUPER_ADMIN_2024"
}
```

**Features:**
- ✅ Only works if NO admin exists in database
- ✅ Requires secret key for security
- ✅ Creates first admin user
- ✅ Returns admin token immediately

**Response:**
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "data": {
    "_id": "admin_id",
    "name": "Super Admin",
    "email": "admin@pyramid.com",
    "role": "admin",
    "token": "admin_jwt_token"
  }
}
```

### **4. Admin Registration (By Existing Admin)**
```http
POST /api/admin/register-admin
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "New Admin",
  "email": "newadmin@pyramid.com",
  "password": "newadmin123"
}
```

**Features:**
- ✅ Only existing admins can create new admins
- ✅ Requires admin authentication
- ✅ Creates additional admin users

**Response:**
```json
{
  "success": true,
  "message": "New admin created successfully",
  "data": {
    "_id": "new_admin_id",
    "name": "New Admin",
    "email": "newadmin@pyramid.com",
    "role": "admin"
  }
}
```

### **5. Admin Login**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@pyramid.com",
  "password": "admin123"
}
```

**Features:**
- ✅ Only users with `role: "admin"` can login
- ✅ Returns admin token for management access

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "admin_id",
    "name": "Super Admin",
    "email": "admin@pyramid.com",
    "role": "admin",
    "token": "admin_jwt_token"
  }
}
```

---

## 🔄 **Setup Workflow**

### **Initial Setup (First Time):**
```bash
# 1. Start your backend server
cd backend && npm run dev

# 2. Register super admin (first admin)
curl -X POST http://localhost:5001/api/admin/register-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@pyramid.com", 
    "password": "admin123",
    "secretKey": "PYRAMID_SUPER_ADMIN_2024"
  }'

# 3. Now you can login to admin panel
# Visit: http://localhost:5500/admin.html
# Email: admin@pyramid.com
# Password: admin123
```

### **Adding More Admins:**
```bash
# 1. Login as existing admin to get token
# 2. Use admin token to create new admins
curl -X POST http://localhost:5001/api/admin/register-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Store Manager",
    "email": "manager@pyramid.com",
    "password": "manager123"
  }'
```

---

## 🛡️ **Security Features**

### **Customer Registration:**
- ✅ Email uniqueness validation
- ✅ Password hashing (bcrypt)
- ✅ Automatic `role: "user"` assignment
- ✅ JWT token generation

### **Admin Registration:**
- ✅ **Super Admin**: Requires secret key + no existing admins
- ✅ **Regular Admin**: Requires existing admin authentication
- ✅ Email uniqueness validation
- ✅ Password hashing (bcrypt)
- ✅ Automatic `role: "admin"` assignment

### **Login Security:**
- ✅ Password verification (bcrypt)
- ✅ Account status check (`isActive: true`)
- ✅ Role-based access (admin login checks `role: "admin"`)
- ✅ JWT token with expiration
- ✅ Last login tracking

---

## 🎯 **Default Credentials**

After running super admin registration:
- **Email**: admin@pyramid.com
- **Password**: admin123
- **Role**: admin
- **Access**: Full admin panel access

---

## 🔧 **Frontend Integration**

### **Customer Registration Form:**
```javascript
const registerCustomer = async (name, email, password) => {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
  }
  return data;
};
```

### **Admin Registration Form:**
```javascript
const registerAdmin = async (name, email, password, adminToken) => {
  const response = await fetch('/api/admin/register-admin', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ name, email, password })
  });
  return await response.json();
};
```

---

## ✅ **Summary**

Your PYRAMID e-commerce now has **COMPLETE registration and login system**:

1. ✅ **Customer Registration** - Anyone can register as customer
2. ✅ **Customer Login** - Standard user login
3. ✅ **Super Admin Registration** - First-time admin setup with secret key
4. ✅ **Admin Registration** - Existing admins can create new admins  
5. ✅ **Admin Login** - Admin-only login with role verification

**No manual database setup needed!** Everything can be done through APIs. 🎉