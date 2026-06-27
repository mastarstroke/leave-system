const tenantMiddleware = (req, res, next) => {

    const tenantId = req.header("X-Tenant-Id");

    if (!tenantId) {
        return res.status(400).json({
            success: false,
            message: "X-Tenant-Id header is required.",
        });
    }

    req.tenantId = tenantId;

    next();
};

export default tenantMiddleware;