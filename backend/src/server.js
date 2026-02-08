import app from "./app.js";
import dotenv from 'dotenv'; 

const PORT = normalizePort(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`✅  Server is running on port ${PORT}`);
  console.log(`open with: http://localhost:${PORT}`);
});

app.on("error", onError);

function normalizePort(val) {
  const port = parseInt(val, 10);
    if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  } return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}