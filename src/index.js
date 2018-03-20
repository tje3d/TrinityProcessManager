#!/usr/bin/env node
const pm2 = require('pm2');
const fs = require('fs');
const path = require('path');
const basePath = path.resolve('./');

async function checkTheProcess() {
    let list = await processList();
    let proc = list.filter(proc => proc.name == 'worldserver').pop();

    // Create the server
    if (!proc) {
        return await runProcess();
    }
    
    if (proc.pm2_env.status == 'online') {
        return;
    }

    // Copy backtrace before run
    await copyBackTrace();

    pm2.start(proc.name);
}

function processList() {
    return new Promise((resolve, reject) => {
        pm2.list((err, list)=>{
            resolve(list);
        });
    });
}

async function runProcess() {
    let scriptPath = `${basePath}/worldserver`;

    if (!fs.existsSync(scriptPath)) {
        console.log('Script not found!');
        process.exit(2);
        return 'done';
    }

    // Copy backtrace before run
    await copyBackTrace();

    pm2.start(scriptPath, {}, (err) => {
        if (err) {
            console.log(err);
        }
    });

    return 'done';
}

async function copyBackTrace() {
    let path = `${basePath}/backtrace.log`;

    // Collect crashlog if there is any
    if (fs.existsSync(path) && fs.statSync(path)['size'] > 1000) {
        fs.copyFileSync(path, `${basePath}/crash_${(new Date).getTime()}.log`);
    }

    return 'done';
}

checkTheProcess().then(() => {
    setInterval(checkTheProcess, 60000);
});