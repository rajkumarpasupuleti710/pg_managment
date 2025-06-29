const { exec } = require('child_process');

// Run the React app
const reactApp = exec('npm start', { cwd: '.' });

// Redirect stdout and stderr to the terminal
reactApp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

reactApp.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

reactApp.on('close', (code) => {
    console.log(`React app exited with code ${code}`);
}); 