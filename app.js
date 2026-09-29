import express from "express";

const app = express();

app.use(express.json());

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
    const productId = parseInt(req.params.id);
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
    const newProduct = req.body;
    products.push(newProduct);
    res.status(201).json(newProduct);
});

//remplacer
app.put("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    let product;
    for (const p of products) {
        if (p.id === productId) {
            product = p;
            break;
        }
    }
    if (product) {
        const updatedProduct = req.body;
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
    const productId = parseInt(req.params.id);
    let product;
    for (const p of products) {
        if (p.id === productId) {
            product = p;
            break;
        }
    }
    if (product) {
        const updatedFields = req.body;
        Object.assign(product, updatedFields);
        res.json(product);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

//supprimer
app.delete("/products/:id", (req, res) => {
    let product;
    const productId = parseInt(req.params.id);
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
