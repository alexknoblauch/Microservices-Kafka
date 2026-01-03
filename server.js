import express from 'express'

const app = express()

app.use(cors({
    origin: "http://localhost:3000",
}));
app.use(express.json());
app.post("/order", authMiddleware, async (req, res) => {
    const { cart } = req.body;
    const userId = req.userId;
    const paymentResult = await pay(cart, userId);
    await logAnalytics({ cart, userId }, "Payment successfully");
    const orderId = await createOrder(cart, userId);
    await logAnalytics({ orderId, userId }, "Order created");
    const emailResult = await sendEmail(orderId, userId);
    await logAnalytics({ orderId, userId, emailResult }, "Email sent");
    return res.json({ orderId, paymentResult, emailResult });
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json(err.message);
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});