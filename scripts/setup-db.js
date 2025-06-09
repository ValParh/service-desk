const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  try {
    console.log("🚀 Настройка базы данных...")

    // Подключение к MySQL без указания базы данных
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    })

    console.log("✅ Подключение к MySQL установлено")

    // Чтение и выполнение SQL скриптов
    const scriptsDir = path.join(__dirname, "../scripts")
    const sqlFiles = fs
      .readdirSync(scriptsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    for (const file of sqlFiles) {
      console.log(`📄 Выполнение ${file}...`)
      const sqlContent = fs.readFileSync(path.join(scriptsDir, file), "utf8")
      await connection.query(sqlContent)
      console.log(`✅ ${file} выполнен успешно`)
    }

    await connection.end()
    console.log("🎉 База данных настроена успешно!")
  } catch (error) {
    console.error("❌ Ошибка настройки базы данных:", error)
    process.exit(1)
  }
}

setupDatabase()
