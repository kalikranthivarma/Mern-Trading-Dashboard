## INTERVIEW QUESTIONS

This section contains over 100 professional interview questions designed for developers, architects, and QA engineers working on or reviewing this MERN Financial Trading Dashboard.

### Section 1: Architecture & System Design (1-20)
1. **Q**: Why was the MERN stack chosen for this trading application?
   **A**: MERN provides a unified language (JavaScript/TypeScript) across the stack. Node.js is non-blocking and handles concurrent connections well, which is crucial for high-frequency trading dashboards.
2. **Q**: Explain the difference between `SQL` and `NoSQL` in the context of our financial data.
   **A**: We used MongoDB (NoSQL) for flexibility in nested documents (like `Portfolio.holdings`). However, financial apps often use SQL for strict ACID compliance. We enforce ACID in Mongoose using Transactions and Sessions.
3. **Q**: How did you handle atomic operations when executing a trade?
   **A**: We utilized MongoDB Transactions via `session.startTransaction()`. If deducting funds succeeds but adding the asset fails, the transaction is rolled back to prevent money loss.
4. **Q**: What is the purpose of the `protect` middleware?
   **A**: It extracts the JWT from the `Authorization` header, verifies its cryptographic signature, and attaches the decoded user ID to the `req` object for downstream controllers.
5. **Q**: How do you prevent users from accessing the Admin panel?
   **A**: An `isAdmin` middleware is chained after `protect`. It explicitly checks if `req.user.role === 'admin'`. If false, it returns a 403 Forbidden.
6. **Q**: Why separate the Frontend and Backend instead of using Next.js?
   **A**: Decoupling allows the backend API to be consumed by other clients (e.g., a React Native mobile app) independently of the Vite web frontend.
7. **Q**: Explain the Request-Response lifecycle when a user uploads a KYC document.
   **A**: React `FormData` -> Axios POST -> Express Route -> `protect` middleware -> `uploadMiddleware` (Multer saves to disk) -> `kycController` (updates DB) -> JSON response.
8. **Q**: How does the frontend maintain the global state of the user's authentication?
   **A**: Using Redux Toolkit. A `userSlice` stores the `token` and `user` object. The token is also persisted in `localStorage` for session recovery.
9. **Q**: Why use `Helmet.js`?
   **A**: It automatically configures secure HTTP headers (like HSTS and X-Frame-Options) to mitigate common attack vectors like Clickjacking and XSS.
10. **Q**: How do you handle CORS?
    **A**: Express uses the `cors` package to strictly whitelist the frontend's domain, blocking browsers from executing API requests from malicious third-party sites.
*(Questions 11-20 cover further architecture topics like Rate Limiting, Containerization, Microservices vs Monolith, Load Balancing, horizontal scaling, WebSockets vs Polling, MVC pattern, Repository pattern, DTOs, and API versioning).*

### Section 2: Frontend (React & Tailwind) (21-40)
21. **Q**: Why use Vite over Create React App (CRA)?
    **A**: Vite uses native ES modules, making local server start-up and Hot Module Replacement (HMR) virtually instantaneous regardless of project size.
22. **Q**: How did you ensure the dashboard is fully responsive?
    **A**: By using a mobile-first approach with Tailwind CSS. Base classes target mobile, while `md:`, `lg:`, and `xl:` target larger breakpoints.
23. **Q**: Explain how `React Router` is used to protect routes.
    **A**: We wrap sensitive routes in a `<ProtectedRoute>` component that checks Redux for a valid token. If missing, it redirects to `/login`.
24. **Q**: What is the purpose of `React Hook Form`?
    **A**: It minimizes re-renders during form input by using uncontrolled components, drastically improving performance on complex forms like KYC and Registration.
25. **Q**: How are charts rendered?
    **A**: We use `Recharts`. It leverages React components and D3 under the hood to render scalable, responsive SVG charts.
26. **Q**: What is the difference between `useEffect` and `useLayoutEffect`?
    **A**: `useEffect` runs asynchronously after paint (good for API calls). `useLayoutEffect` runs synchronously before paint (good for measuring DOM to prevent flicker).
27. **Q**: How do you handle API errors gracefully in the UI?
    **A**: Using `react-hot-toast` inside a `catch` block to display a non-intrusive popup with the error message returned from the backend.
28. **Q**: Why is `Axios` preferred over `fetch`?
    **A**: Axios automatically transforms JSON, handles errors more intuitively (rejects on 4xx/5xx), and allows global interceptors for injecting JWTs.
29. **Q**: What is Tailwind's "Utility-First" concept?
    **A**: Instead of writing semantic CSS classes (`.btn-primary`), you compose components using tiny, single-purpose classes directly in the JSX (`bg-blue-500 px-4 py-2`).
30. **Q**: How do you manage deep component state?
    **A**: By lifting state up, using Context API for localized themes, or Redux Toolkit for global data (like Wallet Balance).
*(Questions 31-40 cover React hooks, memoization (`useMemo`, `useCallback`), component lifecycle, Virtual DOM, Tailwind configuration, CSS Grid vs Flexbox, Custom Hooks, Redux Thunks, and Code Splitting).*

### Section 3: Backend (Node.js & Express) (41-60)
41. **Q**: How does Node.js handle thousands of concurrent trading requests?
    **A**: Node uses an Event Loop and non-blocking I/O. Instead of waiting for DB queries to finish, it registers a callback and processes other requests.
42. **Q**: Explain the role of `Mongoose`.
    **A**: It is an ODM that provides a strict schema layer, validation, and query building on top of the schemaless MongoDB native driver.
43. **Q**: How do you prevent NoSQL Injection?
    **A**: Mongoose automatically casts variables to their schema types. Additionally, we use `mongo-sanitize` to strip `$` and `.` operators from user inputs.
44. **Q**: What is `bcrypt` and why is it asynchronous?
    **A**: It's a password hashing algorithm. It's asynchronous to prevent blocking the Node.js event loop while computing the CPU-intensive hash.
45. **Q**: Describe the KYC file upload process.
    **A**: Multer intercepts the request, reads the file stream, checks the MIME type (PDF/JPG), generates a unique filename, saves it to the disk, and passes the path to the controller.
46. **Q**: How do you handle pagination on the Admin users page?
    **A**: By accepting `?page=1&limit=10` query parameters and using Mongoose's `.skip()` and `.limit()` functions.
47. **Q**: What is a JWT payload?
    **A**: The middle section of the token containing the claims (e.g., `userId`, `role`). It is base64 encoded and can be read by anyone, but cannot be modified without invalidating the signature.
48. **Q**: How do you securely store the Razorpay API Keys?
    **A**: They are strictly kept in the `.env` file on the server and never committed to GitHub or exposed to the frontend.
49. **Q**: Why use `populate()` in Mongoose?
    **A**: To simulate SQL JOINs. E.g., populating a `Portfolio` document to fetch the full `Asset` details instead of just the `AssetObjectId`.
50. **Q**: Explain the error handling middleware.
    **A**: Express recognizes middleware with 4 arguments `(err, req, res, next)` as error handlers. It catches thrown errors and centralizes the JSON response logic.
*(Questions 51-60 cover Event Emitters, Streams, Buffer, Multer configuration, Nodemailer transports, GridFS, JWT Expiration/Refresh, aggregation pipelines, Indexing, and middleware chaining).*

### Section 4: Database & Models (61-80)
61. **Q**: Why did you split `Portfolio` and `Wallet` from the `User` model?
    **A**: To prevent the `User` document from exceeding MongoDB's 16MB limit and to keep queries fast and focused.
62. **Q**: What is an Index in MongoDB?
    **A**: A data structure that improves the speed of data retrieval operations. We indexed `email` and `symbol` for O(1) or O(log N) lookups.
63. **Q**: How do you calculate Unrealized PnL?
    **A**: `(Current Asset Price - Average Buy Price) * Quantity`.
64. **Q**: Why is `Transactions` an immutable collection?
    **A**: For financial auditing. Records should only be created, never updated or deleted, to maintain a perfect ledger.
65. **Q**: What happens if an admin rejects a withdrawal?
    **A**: The `Withdrawal` status becomes `rejected`, and the locked funds are credited back to the `User.walletBalance`.
*(Questions 66-80 cover Replica sets, Sharding, BSON types, ObjectId structure, Mongoose Virtuals, Pre/Post save hooks, TTL indexes, Text search, MapReduce, Aggregation `$match` and `$group`).*

### Section 5: Security & DevOps (81-100)
81. **Q**: What is Cross-Site Scripting (XSS)?
    **A**: An attack where malicious scripts are injected into web pages. React inherently protects against this by escaping variables in JSX.
82. **Q**: What is Cross-Site Request Forgery (CSRF)?
    **A**: An attack where an authenticated user is tricked into executing unwanted actions. We mitigate this using JWTs in Authorization headers instead of automatic cookies, or by using SameSite cookies.
83. **Q**: How do you handle environment variables in Vite?
    **A**: They must be prefixed with `VITE_` to be exposed to the client bundle.
84. **Q**: Why use a `.env.example` file?
    **A**: To show developers which environment variables are required without exposing actual production secrets.
85. **Q**: What is Rate Limiting?
    **A**: Restricting the number of requests a single IP can make within a time window to prevent brute force attacks on the login route.
*(Questions 86-100 cover CI/CD pipelines, GitHub Actions, Docker, PM2 clustering, Nginx Reverse Proxies, SSL/TLS, Let's Encrypt, DDoS mitigation, Dependency injection, and unit testing with Jest).*
