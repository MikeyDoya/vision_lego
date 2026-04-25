module.exports = {
  apps: [
    {
      name: 'vision_lego',
      script: 'build/index.js',
      cwd: '/home/mikey/vision_lego',
      interpreter: 'node',
      interpreter_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
