module.exports = {
  apps: [
    {
      name: "solution_p",  //app's name
      script: "build/server.js",  // main file
      instances: 1,  // Run multiple instance 
      exec_mode: "fork",  // "cluster" if you want to Enable load balancing across CPUs
      env: {
        NODE_ENV: "prod",
        PORT: process.env.PORT ,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
      },
      watch: true,  // Restart on file changes
      ignore_watch: ["node_modules", "logs"],  // Ignore these folders
      max_memory_restart: "300M",  // Restart if memory exceeds 300MB
      out_file: "./logs/out.log",  // Standard output log
      error_file: "./logs/error.log",  // Error log
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};