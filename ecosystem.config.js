module.exports = {
   apps: [
      {
         name: 'pdf-scrapper',
         script: 'app.js',
         instances: 1,
         watch: true,
         exec_mode: "cluster",
         autorestart: true,
         ignore_watch: ['node_modules', 'logs'],
         env: {
            NODE_ENV: 'development'
         },
         env_production: {
            NODE_ENV: 'production'
         }
      }
   ]
};
