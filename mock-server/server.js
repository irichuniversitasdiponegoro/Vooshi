    // server.js
import express from "express";

const app = express();
const PORT = 5000;

app.use(express.json());

// Endpoint to receive snippets
app.post("/analyze", (req, res) => {
    const { filename, snippet, relativeCursor } = req.body;

    console.log("=== Received snippet ===");
    console.log("File:", filename);
    console.log("Snippet:\n", snippet);
    console.log("Relative cursor:", relativeCursor);
    console.log("========================");

    res.json({ status: "ok", receivedAt: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
});
