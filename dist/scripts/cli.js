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
const readline = require("readline");
require("dotenv/config");
const logger = new bpmn_server_1.Logger({ toConsole: false });
const server = new bpmn_server_1.BPMNServer(configuration_1.configuration, logger, { cron: false });
const api = new bpmn_server_1.BPMNAPI(server);
//const cl = readline.createInterface(process.stdin,null);
function removeBS(str) {
    if (str.indexOf('\b') === -1)
        return str;
    let l;
    while (str.indexOf('\b') > -1) {
        l = str.indexOf('\b');
        str = str.substring(0, l - 1) + str.substring(l + 1);
    }
    return str;
}
const question = function (q) {
    const cl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    console.log(q);
    cl.setPrompt('>');
    cl.prompt();
    return new Promise((res, rej) => {
        cl.on('line', answer => {
            answer = removeBS(answer);
            res(answer);
            cl.close();
        });
    });
};
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let option = '';
        console.log('');
        completeUserTask();
    });
}
function menu() {
    console.log('Commands:');
    console.log('	q	to quit');
    console.log('	s	start process ');
    console.log('	lo	list outstanding items');
    console.log('	li	list items');
    console.log('	l	list instances for a process');
    console.log('	di	display Instance information');
    console.log('	i	Invoke Task');
    console.log('	sgl	Signal Task');
    console.log('	msg	Message Task');
    console.log('	se	Start Event');
    console.log('	rs	Restart an Instance');
    console.log('	d	delete instnaces');
    console.log('	lm	List of Models');
    console.log('	lme	List of Model Events');
    console.log('	ck	Check locked instnaces');
    console.log('	re	Recover hung processes');
    console.log('	lu	List Users');
    console.log('	spw	Set User Password');
    console.log('	?	repeat this list');
}
function completeUserTask() {
    return __awaiter(this, void 0, void 0, function* () {
        menu();
        let option = '';
        let command = '';
        while (option !== 'q') {
            command = yield question('Enter Command, q to quit, or ? to list commands');
            let opts = command.split(' ');
            option = opts[0];
            switch (option) {
                case '?':
                    menu();
                    break;
                case 're':
                    yield recover();
                    break;
                case 'ck':
                    yield checkLocks();
                    break;
                case 'lo':
                    console.log("Listing Outstanding Items");
                    yield findItems({ "items.status": "wait" });
                    break;
                case 'l':
                    console.log("Listing Instances for a Process");
                    yield listInstances();
                    break;
                case 'li':
                    console.log("list items");
                    yield listItems();
                    break;
                case 'di':
                    yield displayInstance();
                    break;
                case 'i':
                    console.log("invoking");
                    yield invoke();
                    break;
                case 'rs':
                    console.log("restarting a workflow");
                    yield restart();
                    break;
                case 's':
                    console.log("Starting Process");
                    yield startProc();
                    break;
                case 'sgl':
                    console.log("Signalling Process");
                    yield signal();
                    break;
                case 'msg':
                    console.log("Message Process");
                    yield message();
                    break;
                case 'se':
                    console.log("Start Event");
                    yield startEvent();
                    break;
                case 'd':
                    console.log("deleting");
                    yield delInstances();
                    break;
                case 'lm':
                    console.log("listing Models");
                    var list = yield server.definitions.getList({});
                    list.forEach(m => { console.log(m.name); });
                    console.log();
                    break;
                case 'lme':
                    console.log("listing Models");
                    var list = yield server.definitions.findEvents({});
                    console.log(list);
                    break;
            }
        }
        console.log("bye");
        process.exit();
    });
}
function startProc() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield question('Please provide your process name: ');
        const taskData = yield getCriteria('Please provide your Task Data: ');
        let response = yield server.engine.start(name, taskData);
        console.log("Process " + name + " started:", 'InstanceId', response.id);
        return yield displayInstance(response.id);
    });
}
function findItems(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var items = yield server.dataStore.findItems(query);
        console.log(`processName	item.name	item.elementId	instanceId	item.id`);
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            console.log(`${item['processName']}	${item.name}	${item.elementId}	${item['instanceId']}	${item.id}`);
        }
        return items;
    });
}
function getCriteria(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield question(prompt + ',in name value pair; example: items.status wait ');
        let str = '' + answer;
        if (str.trim() === '')
            return {};
        //const list = str.match(/li(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);//.match(/(?:[^\s"]+|"[^"]*")+/g);//str.split(' ');
        const list = str.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
        if ((list.length % 2) !== 0) {
            console.log("must be pairs");
            return yield getCriteria(prompt);
        }
        let criteria = {};
        console.log(list);
        for (var i = 0; i < list.length; i += 2) {
            let key = list[i];
            if (key.startsWith('"'))
                key = key.substring(1, key.length - 1);
            let val = list[i + 1];
            if (val.startsWith('"'))
                val = val.substring(1, val.length - 1);
            console.log(key, val);
            criteria[key] = val;
        }
        console.log(criteria);
        return criteria;
    });
}
function listItems() {
    return __awaiter(this, void 0, void 0, function* () {
        var criteria = yield getCriteria("provide Items search criteria");
        var items = yield server.dataStore.findItems(criteria);
        console.log(items.length);
        for (var j = 0; j < items.length; j++) {
            let item = items[j];
            console.log(`element: ${item.elementId} status: ${item.status}  processName: ${item['processName']} InstanceId: ${item['instanceId']}	id:	${item.id}`);
        }
    });
}
function listInstances() {
    return __awaiter(this, void 0, void 0, function* () {
        var criteria = yield getCriteria("Instances search criteria");
        let insts = yield server.dataStore.findInstances(criteria, 'full');
        for (var i = 0; i < insts.length; i++) {
            let inst = insts[i];
            console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`, 'data:', inst.data);
        }
    });
}
function displayInstance() {
    return __awaiter(this, arguments, void 0, function* (instanceId = null) {
        if (instanceId == null)
            instanceId = yield question('Please provide your Instance ID: ');
        console.log("Displaying Instance Details for" + instanceId);
        let insts = yield server.dataStore.findInstances({ id: instanceId }, 'full');
        console.log(insts.length);
        for (var i = 0; i < insts.length; i++) {
            let inst = insts[i];
            var items = inst.items;
            console.log(`name: ${inst.name} status: ${inst.status}	instanceId:	${inst.id}
	startedAt: ${inst.startedAt} endedAt ${inst.endedAt}`, 'data:', inst.data);
            for (var j = 0; j < items.length; j++) {
                let item = items[j];
                console.log(`element: ${item.elementId} status: ${item.status}	id:	${item.id}`);
            }
        }
    });
}
function invoke() {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceId = yield question('Please provide your Instance ID: ');
        const taskId = yield question('Please provide your Task ID: ');
        let taskData = yield question('Please provide your Task Data ');
        try {
            let response = yield server.engine.invoke({ id: instanceId, "items.elementId": taskId }, taskData);
            console.log("Completed UserTask:", taskId);
            return yield displayInstance(response.id);
        }
        catch (exc) {
            console.log("Invoking task failed for:", taskId, instanceId);
            yield findItems({ id: instanceId, "items.elementId": taskId });
        }
    });
}
function restart() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = yield getCriteria("Instance Search criteria");
        try {
            let response = yield server.engine.restart(query, {}, '');
            console.log(' Instance restarted: new Instance follows:');
            return yield displayInstance(response.id);
        }
        catch (exc) {
            console.log("Invoking task failed for:", exc);
        }
    });
}
function signal() {
    return __awaiter(this, void 0, void 0, function* () {
        const signalId = yield question('Please provide signal ID: ');
        const signalData = yield question('Please provide your Data');
        let response = yield server.engine.throwSignal(signalId, signalData);
        console.log("Signal Response:", response);
    });
}
function message() {
    return __awaiter(this, void 0, void 0, function* () {
        const messageId = yield question('Please provide message ID: ');
        const messageData = yield question('Please provide your Data');
        let response = yield server.engine.throwMessage(messageId, messageData);
        if (response['id'])
            return yield displayInstance(response['id']);
        else {
            console.log(' no results.');
            return null;
        }
    });
}
function startEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceId = yield question('Please provide your Instance ID: ');
        const nodeId = yield question('Please provide start Event ID: ');
        const data = yield getCriteria('provide input data');
        try {
            let response = yield server.engine.startEvent(instanceId, nodeId, data);
            return yield displayInstance(response.id);
        }
        catch (exc) {
            console.log("Invoking task failed for:", nodeId, instanceId);
        }
    });
}
function delInstances() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield question('Please provide process name to delete instances for process: ');
        let response = yield server.dataStore.deleteInstances({ name: name });
        console.log("Instances Deleted:", response['result']['deletedCount']);
    });
}
function checkLocks() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- checking locks ---');
        var list = yield server.dataStore.locker.list();
        if (list.length > 0) {
            console.log('current locks ...', list.length);
            for (var i = 0; i < list.length; i++) {
                let item = list[i];
                console.log('lock:', item.id, item.server, item.time, (0, bpmn_server_1.dateDiff)(item.time));
            }
            const response = yield question('delete all(Y/N?');
            if (response == 'Y' || response == 'y') {
                yield server.dataStore.locker.delete({});
            }
        }
    });
}
function recover() {
    return __awaiter(this, void 0, void 0, function* () {
        var query = { "items.status": "start" };
        var list = yield server.dataStore.findItems(query);
        console.log("items to recover: " + list.length);
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                let item = list[i];
                //			if (item.type == 'bpmn:ScriptTask' || item.type == 'bpmn:ServiceTask') 
                {
                    console.log();
                    console.log('>Process:', item.processName, 'item:', item.elementId, item.type, item.startedAt, item.status, 'since:', (0, bpmn_server_1.dateDiff)(item.startedAt));
                    const response = yield question('\n\tRE-INVOKE this item(Y/N) or D to delete instance');
                    if (response.toUpperCase() == 'D') {
                        console.log('deleting ', item.id);
                        try {
                            yield server.dataStore.locker.delete({ id: item.instanceId });
                            yield server.dataStore.deleteInstances({ id: item.instanceId });
                        }
                        catch (exc) {
                            console.log(exc);
                        }
                        console.log('deleted', item.id);
                        console.log();
                    }
                    else if (response.toUpperCase() == 'Y') {
                        console.log('invoking item', item.id);
                        try {
                            yield server.dataStore.locker.delete({ id: item.instanceId });
                            let ret = yield server.engine.invoke({ "items.id": item.id }, {}, null, { recover: true });
                            console.log('done');
                        }
                        catch (exc) {
                            console.log(exc);
                        }
                    }
                }
            }
        }
        else
            console.log('nothing to recover');
    });
}
//# sourceMappingURL=cli.js.map