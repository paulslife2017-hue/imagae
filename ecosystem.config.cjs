module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'node',
      args: 'simple-server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
