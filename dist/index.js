#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var pm2_1 = __importDefault(require("pm2"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var basePath = path_1.default.resolve('./');
function checkTheProcess() {
    pm2_1.default.list(function (err, list) {
        var proc = list.filter(function (proc) { return proc.name == 'worldserver'; }).pop();
        // Create the server
        if (!proc) {
            return runProcess();
        }
        if (proc.pm2_env.status == 'online') {
            return;
        }
        pm2_1.default.start(proc.name);
    });
}
function runProcess() {
    var scriptPath = basePath + "/worldserver";
    var crashPath = basePath + "/backtrace.log";
    if (!fs_1.default.existsSync(scriptPath)) {
        console.log('Script not found!');
        process.exit(2);
        return;
    }
    // Collect crashlog if there is any
    if (fs_1.default.existsSync(crashPath) && fs_1.default.statSync(crashPath)['size'] > 1000) {
        fs_1.default.copyFileSync(crashPath, basePath + "/crash_" + (new Date).getTime() + ".log");
    }
    pm2_1.default.start(scriptPath, {}, function (err) {
        console.log(err);
    });
    return;
}
checkTheProcess();
setInterval(checkTheProcess, 1000);
