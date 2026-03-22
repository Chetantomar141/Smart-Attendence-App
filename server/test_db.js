import db from "./models/index.js";
import fs from "fs";

async function test() {
  const logFile = "test_db_output.txt";
  try {
    fs.writeFileSync(logFile, "Starting DB test...\n");
    await db.sequelize.authenticate();
    fs.appendFileSync(logFile, "Connection has been established successfully.\n");
    
    const users = await db.users.findAll();
    fs.appendFileSync(logFile, `Found ${users.length} users.\n`);
    users.forEach(u => {
      fs.appendFileSync(logFile, `- ${u.username} (${u.role})\n`);
    });
    
  } catch (error) {
    fs.appendFileSync(logFile, `Unable to connect to the database: ${error.message}\n`);
    if (error.original) {
      fs.appendFileSync(logFile, `Original error: ${error.original.message}\n`);
    }
  } finally {
    process.exit();
  }
}

test();
