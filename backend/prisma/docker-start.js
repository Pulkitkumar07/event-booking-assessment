const { execFileSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function runNpmScript(script) {
  execFileSync("npm", ["run", script, "--workspace", "backend"], {
    cwd: "/app",
    stdio: "inherit"
  });
}

async function prepareDatabase() {
  runNpmScript("db:migrate:deploy");

  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log("Database is empty. Adding demo data...");
    await prisma.$disconnect();
    runNpmScript("db:seed");
    return;
  }

  console.log("Database already contains data. Skipping seed.");
  await prisma.$disconnect();
}

prepareDatabase().catch(async (error) => {
  console.error("Database setup failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
