import express from "express";
import crypto from "crypto";
import Joi from "joi";

const app = express();

const user = { username: "admin", password: "admin123" };
const tokens = {};

const loginSchema = Joi.object({
    username: Joi.string().trim().min(3).max(50).required(),
    password: Joi.string().min(8).max(128).required(),
}).unknown(false).required();

const productFields = {
    name: Joi.string().trim().min(1).max(100).required(),
    Price: Joi.number().positive().max(100000).precision(2).required(),
    description: Joi.string().trim().min(1).max(500).required(),
};

const productSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    ...productFields,
}).unknown(false).required();

const productReplacementSchema = Joi.object({
    id: Joi.number().integer().positive(),
    ...productFields,
}).unknown(false).required();

const productPatchSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100),
    Price: Joi.number().positive().max(100000).precision(2),
    description: Joi.string().trim().min(1).max(500),
}).min(1).unknown(false).required();

const productIdSchema = Joi.number().integer().positive().required();

function sendValidationError(res, error) {
    return res.status(400).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
    });
}

app.use(express.json());

// Login
app.post("/login", (req, res) => {
    const { error, value } = loginSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        return sendValidationError(res, error);
    }

    const { username, password } = value;
    if (username !== user.username || password !== user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomUUID();
    tokens[token] = Date.now() + 5 * 60 * 1000;

    res.status(200).json({ token });
});

app.use("/products", (req, res, next) => {
    if (req.method === "GET") {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token required" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    const expiration = tokens[token];

    if (!expiration) {
        return res.status(401).json({ message: "Invalid token" });
    }

    if (Date.now() > expiration) {
        delete tokens[token];
        return res.status(401).json({ message: "Token expired" });
    }

    next();
});
const products = [
    {
        id: 1,
        name: "Pizza",
        Price: 10,
        description: "Delicious cheese pizza",
    },
    {
        id: 2,
        name: "Burger",
        Price: 8,
        description: "Juicy beef burger",
    },
    {
        id: 3,
        name: "Soda",
        Price: 2,
        description: "Refreshing soda drink",
    },
    {
        id: 4,
        name: "Fries",
        Price: 4,
        description: "Crispy french fries",
    },
    {
        id: 5,
        name: "Ice Cream",
        Price: 5,
        description: "Creamy vanilla ice cream",
    },
];

//Lister
app.get("/products", (req, res) => {
  res.json(products);
});

//Consulter
app.get("/products/:id", (req, res) => {
    const { error, value: productId } = productIdSchema.validate(req.params.id);
    if (error) {
        return sendValidationError(res, error);
    }

    let product;
    for (const p of products) {
        if (p.id === productId) {
        product = p;
        break;
        }
    }
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

//ajouter
app.post("/products", (req, res) => {
    const { error, value: newProduct } = productSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        return sendValidationError(res, error);
    }

    if (products.some((product) => product.id === newProduct.id)) {
        return res.status(409).json({ message: "Product id already exists" });
    }

    products.push(newProduct);
    res.status(201).json(newProduct);
});

//remplacer
app.put("/products/:id", (req, res) => {
    const { error: idError, value: productId } = productIdSchema.validate(
        req.params.id,
    );
    if (idError) {
        return sendValidationError(res, idError);
    }

    const { error, value: updatedProduct } = productReplacementSchema.validate(
        req.body,
        { abortEarly: false },
    );
    if (error) {
        return sendValidationError(res, error);
    }

    let product;
    for (const p of products) {
        if (p.id === productId) {
            product = p;
            break;
        }
    }
    if (product) {
        const productIndex = products.indexOf(product);
        products[productIndex] = {
            ...updatedProduct,
            id: productId,
        };
        res.json(products[productIndex]);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

//modifier
app.patch("/products/:id", (req, res) => {
    const { error: idError, value: productId } = productIdSchema.validate(
        req.params.id,
    );
    if (idError) {
        return sendValidationError(res, idError);
    }

    const { error, value: updatedFields } = productPatchSchema.validate(
        req.body,
        { abortEarly: false },
    );
    if (error) {
        return sendValidationError(res, error);
    }

    let product;
    for (const p of products) {
        if (p.id === productId) {
            product = p;
            break;
        }
    }
    if (product) {
        Object.assign(product, updatedFields);
        res.json(product);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

//supprimer
app.delete("/products/:id", (req, res) => {
    let product;
    const { error, value: productId } = productIdSchema.validate(req.params.id);
    if (error) {
        return sendValidationError(res, error);
    }

    for (const p of products) {
        if (p.id === productId) {
            product = p;
            break;
        }
    }
    if (product) {
        const index = products.indexOf(product);
        products.splice(index, 1);
        res.json({ message: "Product deleted successfully" });
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

app.listen(3000);
