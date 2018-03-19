import pm2 from 'pm2';
import fs from 'fs';

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
    let scriptPath = `${__dirname}/worldserver`;
    let crashPath = `${__dirname}/backtrace.log`;

    if (!fs.existsSync(scriptPath)) {
        console.log('Script not found!');
        process.exit(2);
        return;
    }

    // Collect crashlog if there is any
    if (fs.existsSync(crashPath) && fs.statSync(crashPath)['size'] > 1000) {
        fs.copyFileSync(crashPath, `${__dirname}/crash_${(new Date).getTime()}.log`);
    }

    pm2.start(scriptPath, {}, (err) => {
        console.log(err);
    });

    return;
}

checkTheProcess();
setInterval(checkTheProcess, 1000);