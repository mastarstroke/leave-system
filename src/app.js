import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

// import leaveRequestRoutes from "./modules/leaveRequests/routes/leaveRequest.routes.js";
import leaveRequestModule from "./modules/leaveRequests/index.js";
import employeeRoutes from "./modules/employees/routes/employee.routes.js";


import tenantMiddleware from "./middleware/tenant.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Global Middlewares

// Secure HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Parse URL Encoded data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan("dev"));


// Attach tenantId to req
app.use(tenantMiddleware);



// Health Check
app.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "PeopleFlow API is running.",
    });
});

// Routes
app.use("/api/v1/leave-requests", tenantMiddleware, leaveRequestModule);

app.use("/api/v1/employees", employeeRoutes);


// 404 Handler
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});


// Global Error Handler
app.use(errorMiddleware);

export default app;