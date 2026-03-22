import api from "./services/api.js";
import axios from "axios";
import fs from "fs";

async function test() {
  const logFile = "test_api_output.txt";
  fs.writeFileSync(logFile, "Starting API test...\n");
  
  try {
    // 1. Login as student
    fs.appendFileSync(logFile, "Attempting login as student...\n");
    const loginRes = await axios.post("http://localhost:5001/api/auth/signin", {
      username: "student",
      password: "student123"
    });
    
    const token = loginRes.data.accessToken;
    fs.appendFileSync(logFile, "Login successful. Token obtained.\n");
    
    // 2. Fetch student dashboard
    fs.appendFileSync(logFile, "Attempting to fetch student dashboard...\n");
    const dashRes = await axios.get("http://localhost:5001/api/student/dashboard", {
      headers: { "x-access-token": token }
    });
    
    fs.appendFileSync(logFile, "Dashboard fetch successful!\n");
    fs.appendFileSync(logFile, JSON.stringify(dashRes.data, null, 2) + "\n");
    
  } catch (error) {
    fs.appendFileSync(logFile, `API test failed: ${error.message}\n`);
    if (error.response) {
      fs.appendFileSync(logFile, `Response status: ${error.response.status}\n`);
      fs.appendFileSync(logFile, `Response data: ${JSON.stringify(error.response.data)}\n`);
    }
  } finally {
    process.exit();
  }
}

test();
