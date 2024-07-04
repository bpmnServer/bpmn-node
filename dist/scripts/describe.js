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
const configuration_1 = require("../WorkflowApp/configuration");
const bpmn_server_1 = require("bpmn-server");
const logger = new bpmn_server_1.Logger({ toConsole: false });
const server = new bpmn_server_1.BPMNServer(configuration_1.configuration, logger, { cron: false });
const api = new bpmn_server_1.BPMNAPI(server);
const fs = require('fs');
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
if (args.length < 3) {
    console.log("Require 3 parameters: \n1) Model Name \n2) Format (json/md) \n3) filename ");
    process.exit(-1);
}
let outputFile = args[2];
describe(args[0], args[1]);
function describe(model, format) {
    return __awaiter(this, void 0, void 0, function* () {
        var definition;
        const server = new bpmn_server_1.BPMNServer(configuration_1.configuration, logger, { cron: false });
        definition = yield server.definitions.load(model);
        const json = JSON.parse(definition.getJson());
        if (format == 'json') {
            fs.writeFileSync(outputFile, definition.getJson());
            console.log('file ', outputFile, ' written');
            process.exit(0);
            return;
        }
        const pug = require('pug');
        const path = require('path');
        let svg = null;
        try {
            svg = yield server.definitions.getSVG(model);
        }
        catch (ex) {
        }
        let text = "<div>" + svg + "</div>";
        const templatePath = path.join(__dirname, '../views/includes/');
        text = text + pug.renderFile(templatePath + 'modelDoc.pug', { docs: json });
        fs.writeFileSync(outputFile, text);
    });
}
//# sourceMappingURL=describe.js.map