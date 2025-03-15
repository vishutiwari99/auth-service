import app from "./app";
import { Config } from "./config";
const startServer = () => {
  const PORT = Config.PORT;
  try {
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
startServer();
