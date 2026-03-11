const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
        res.status(400);
        next(new Error('Name, email and password are required'));
        return;
    }

    if (String(password).length < 6) {
        res.status(400);
        next(new Error('Password must be at least 6 characters'));
        return;
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        res.status(400);
        next(new Error('Email and password are required'));
        return;
    }
    next();
};

const validateOrderPayload = (req, res, next) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        res.status(400);
        next(new Error('Order items are required'));
        return;
    }

    if (!shippingAddress || !isNonEmptyString(shippingAddress.address) || !isNonEmptyString(shippingAddress.city) || !isNonEmptyString(shippingAddress.postalCode) || !isNonEmptyString(shippingAddress.country)) {
        res.status(400);
        next(new Error('Complete shipping address is required'));
        return;
    }

    if (!isNonEmptyString(paymentMethod)) {
        res.status(400);
        next(new Error('Payment method is required'));
        return;
    }

    next();
};

const validateCollabPayload = (req, res, next) => {
    const requiredFields = ['name', 'email', 'phone', 'bookTitle', 'authorName', 'genre', 'description'];
    for (const field of requiredFields) {
        if (!isNonEmptyString(req.body[field])) {
            res.status(400);
            next(new Error(`Field "${field}" is required`));
            return;
        }
    }
    next();
};

export { validateRegister, validateLogin, validateOrderPayload, validateCollabPayload };
