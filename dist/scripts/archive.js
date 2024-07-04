"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bpmn_server_1 = require("bpmn-server");
const configuration_1 = require("../WorkflowApp/configuration");
const bpmn_server_2 = require("bpmn-server");
const bpmn_server_3 = require("bpmn-server");
const logger = new bpmn_server_2.Logger({ toConsole: false });
const server = new bpmn_server_2.BPMNServer(configuration_1.configuration, logger, { cron: false });
const api = new bpmn_server_2.BPMNAPI(server);
let user = new bpmn_server_2.SecureUser({ userName: 'user1', userGroups: [bpmn_server_1.USER_ROLE.ADMIN] });
if (process.argv.length < 3) {
    console.log("Require 2 parameters: 1) daysToArchive 2) daysToCleanArchive");
    process.exit(-1);
}
console.log(process.argv);
let date = new Date();
let days = parseInt(process.argv[2]);
let archiveDays = parseInt(process.argv[3]);
console.log(days, archiveDays);
date.setDate(date.getDate() - archiveDays);
console.log('will archive all instances before ', date);
let archiveDate = new Date();
archiveDate.setDate(archiveDate.getDate() - archiveDays);
console.log('will delete all archives before ', date);
console.log(date);
server.dataStore.archive({ endedAt: { $lte: date } });
let ds = server.dataStore;
ds.db.remove(ds.dbConfiguration.db, bpmn_server_3.Archive_collection, { endedAt: { $lte: archiveDate } });
process.exit(0);
//# sourceMappingURL=archive.js.map