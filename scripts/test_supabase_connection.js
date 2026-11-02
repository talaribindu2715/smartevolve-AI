const { createClient } = require("@supabase/supabase-js");

const url = "https://ohhvhwmmoupcrtieeeov.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHZod21tb3VwY3J0aWVlZW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDMzMjcsImV4cCI6MjEwOTExOTMyN30.qyrmQ5cVlQMsivLVvzOcmIEMMApXrjBgkG80yc6tkEk";

const supabase = createClient(url, anonKey);

async function testConnection() {
  console.log("Testing Supabase connectivity...");
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log("Supabase Auth response error:", error.message);
    } else {
      console.log("[OK] Successfully connected to Supabase project!");
      console.log("Current session status:", data.session ? "Active Session" : "No active session (Anonymous guest)");
    }
  } catch (err) {
    console.error("Network or connection error:", err);
  }
}

testConnection();
