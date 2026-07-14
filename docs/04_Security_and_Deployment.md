## CHAPTER 16: Security

Enterprise-grade security is paramount for financial applications. This system implements multiple layers of defense.

### 1. Data Protection
- **bcrypt**: User passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10+ rounds) before being saved to MongoDB.
- **JWT (JSON Web Tokens)**: Used for stateless authentication. Tokens are cryptographically signed using a strong `JWT_SECRET`. 
- **Secure Cookies (Optional/Implemented)**: If tokens are delivered via cookies, they are marked `httpOnly`, `Secure`, and `SameSite=Strict` to prevent XSS and CSRF attacks.

### 2. Network & Application Security
- **Helmet**: An Express middleware that sets various HTTP headers (e.g., `Strict-Transport-Security`, `X-Content-Type-Options`) to protect against well-known web vulnerabilities.
- **CORS (Cross-Origin Resource Sharing)**: Configured strictly to only accept API requests from the verified Frontend domain (e.g., `http://localhost:5173` or production domain), blocking third-party websites from making unauthorized requests to the backend.
- **Rate Limiting**: `express-rate-limit` is implemented on critical endpoints (like `/api/auth/login` and `/api/auth/register`) to prevent Brute-Force and Denial of Service (DDoS) attacks.

### 3. Role-Based Access Control (RBAC)
- **`protect` Middleware**: Decodes the JWT and attaches the user object to `req.user`. If the token is invalid or missing, it rejects the request with a `401 Unauthorized`.
- **`admin` / `isAdmin` Middleware**: Checks if `req.user.role === 'admin'`. If a standard user attempts to hit an admin route (e.g., fetching all users or approving KYC), it blocks them with a `403 Forbidden`.

---

## CHAPTER 17: Deployment

### 1. Database (MongoDB Atlas)
- Hosted on MongoDB Atlas for high availability, automated backups, and global distribution.
- **Network Access**: IP Whitelisting is used so only the backend server's IP can connect to the cluster.

### 2. Backend (Render / Heroku / AWS)
- Deployed as a Node.js web service.
- **Environment Variables**: Managed securely via the deployment provider's dashboard (e.g., `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`).
- **Build Command**: `npm install`
- **Start Command**: `npm start` (Runs `server.js`).

### 3. Frontend (Vercel / Netlify / Render)
- The React + Vite application is built into static HTML/JS/CSS files.
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Environment Variables**: Prefixed with `VITE_` (e.g., `VITE_API_URL` pointing to the production backend URL).

---

## CHAPTER 18: Error Handling

A robust error-handling architecture prevents sensitive stack traces from leaking to the user while providing helpful feedback.

### 1. Backend Custom Error Class
```javascript
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
```
This allows controllers to easily throw specific HTTP errors: `throw new ApiError(404, "User not found")`.

### 2. Global Error Middleware (`errorMiddleware.js`)
Catches all uncaught exceptions.
- **Development Mode**: Logs the full stack trace to the terminal.
- **Production Mode**: Returns a clean JSON response `{ success: false, message: err.message }` without the stack trace.

### 3. Frontend Toast Notifications
The frontend uses `react-hot-toast` to intercept API errors and display them cleanly to the user.
```javascript
try {
  await api.post('/trade/execute', data);
  toast.success('Trade Executed!');
} catch (error) {
  toast.error(error.response?.data?.message || 'Failed to execute trade.');
}
```

---

## CHAPTER 19: Testing

Quality Assurance is achieved through multi-tiered testing strategies.

### 1. Manual Testing
- **User Flows**: Creating an account, verifying email, uploading dummy KYC documents (`dummy_kyc_document.pdf`), and checking the database for correctness.
- **Admin Flows**: Logging in as admin to verify the KYC and observe the user's status change.

### 2. API Testing
- Tools like **Postman** or **Insomnia** are used to hit backend endpoints directly, bypassing the UI to ensure the APIs are secure against malicious payloads.

### 3. Responsive Testing
- **Chrome DevTools**: The application is strictly tested using the Device Toolbar across iPhone SE (375px), iPad (768px), and standard 1080p monitors.
- **Tailwind Breakpoints**: Ensuring no horizontal scrolling or broken layouts occur across `sm:`, `md:`, `lg:`, and `xl:` breakpoints.

---

## CHAPTER 20: Future Enhancements

The platform is designed to be highly scalable. Future roadmap items include:

1. **Real-time WebSockets (`socket.io`)**: Upgrading from polling/REST to WebSockets for sub-millisecond, real-time cryptocurrency and stock price updates.
2. **AI Trading Bots**: Integrating predictive Machine Learning models to suggest trades to users based on historical data.
3. **Advanced Charting**: Replacing Recharts with TradingView's Lightweight Charts for professional-grade candlestick technical analysis.
4. **Two-Factor Authentication (2FA)**: Requiring Google Authenticator or SMS OTP for withdrawals and logins to enhance security.
5. **Options & Margin Trading**: Allowing users to trade with leverage.
