const { connectDB } = require("./config/db");
const app = require("./app");

async function startServer() {
    try {
        // Connect to MySQL database
        await connectDB();
        
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
