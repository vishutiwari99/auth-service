import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";
const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully ");
    // eslint-disable-next-line no-console
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    logger.error(error);
  }
};
void startServer();
