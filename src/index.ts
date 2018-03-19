#!/usr/bin/env node
import pm2 from 'pm2';
import fs from 'fs';
import path from 'path';

let basePath = path.resolve('./');

function checkTheProcess() {
    pm2.list((err, list)=>{
        let proc = list.filter(proc => proc.name == 'worldserver').pop();

        // Create the server
        if (!proc) {
            return runProcess();
        }
        
        if (proc.pm2_env.status == 'online') {
            return;
        }

        pm2.start(proc.name);
    });
}

function runProcess() {
    let scriptPath = `${basePath}/worldserver`;
    let crashPath = `${basePath}/backtrace.log`;

    if (!fs.existsSync(scriptPath)) {
        console.log('Script not found!');
        process.exit(2);
        return;
    }

    // Collect crashlog if there is any
    if (fs.existsSync(crashPath) && fs.statSync(crashPath)['size'] > 1000) {
        fs.copyFileSync(crashPath, `${basePath}/crash_${(new Date).getTime()}.log`);
    }

    pm2.start(scriptPath, {}, (err) => {
        if (err) {
            console.log(err);
        }
    });

    return;
}

checkTheProcess();
setInterval(checkTheProcess, 60000);