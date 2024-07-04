"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bpmn_server_1 = require("bpmn-server");
const configuration_1 = require("../WorkflowApp/configuration");
const bpmn_server_2 = require("bpmn-server");
const logger = new bpmn_server_2.Logger({ toConsole: false });
const server = new bpmn_server_2.BPMNServer(configuration_1.configuration, logger, { cron: false });
const api = new bpmn_server_2.BPMNAPI(server);
let user = new bpmn_server_2.SecureUser({ userName: 'user1', userGroups: [bpmn_server_1.USER_ROLE.ADMIN] });
////////////////////
// Import the required modules
const { argv } = require('process');
// Function to parse command-line arguments
function parseArguments(args) {
    const parsedArgs = [];
    let currentArg = '';
    let inQuotes = false;
    args.forEach(arg => {
        if (arg.startsWith('"') || arg.startsWith("'")) {
            inQuotes = true;
            currentArg = arg.slice(1);
        }
        else if (inQuotes && (arg.endsWith('"') || arg.endsWith("'"))) {
            currentArg += ' ' + arg.slice(0, -1);
            parsedArgs.push(currentArg);
            currentArg = '';
            inQuotes = false;
        }
        else if (inQuotes) {
            currentArg += ' ' + arg;
        }
        else {
            parsedArgs.push(arg);
        }
    });
    return parsedArgs;
}
// Get the command-line arguments, excluding the first two (node and script path)
const rawArgs = process.argv.slice(2);
// Parse the arguments to handle quotes
const args = parseArguments(rawArgs);
// Output the parsed arguments
console.log('Parsed arguments:', args);
//////////////////////
//  syntax: 
/**
 *  model       name of model to be applied
 *  afterNode   nodeId to check if instances already started
 *
 */
if (args.length < 2) {
    console.log("Require 2 parameters: \n1) Model Name \n2) afterNodeId ");
    process.exit(-1);
}
upgrade(args[0], args.splice(1));
/**
 *
 * @param model
 * @param afterNodeIds
 */
function upgrade(model, afterNodeIds) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(" upgrading ", model, " after", afterNodeIds);
        //    server.dataStore.archive({endedAt: { $lte: date}});
        const results = yield server.engine.upgrade(model, afterNodeIds);
        console.log(results);
        process.exit(0);
    });
}
//# sourceMappingURL=upgradeInstances.js.map