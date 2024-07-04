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
exports.MyAppDelegate = void 0;
const _1 = require("./");
const _2 = require("./");
const appServices_1 = require("./appServices");
const appUtils_1 = require("./appUtils");
const fs = require('fs');
var seq = 1;
const MULTI_APP_SERVICES = false;
console.log('appDelegate from ', __filename);
class MyAppDelegate extends _2.DefaultAppDelegate {
    constructor(server) {
        super(server);
        this.appUtils = new appUtils_1.AppUtils(server);
    }
    getServicesProvider(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // for multiple appServices  -start 
            if (MULTI_APP_SERVICES) {
                this.appServices = new Map();
                console.log('call services provider', context.instance.tenantId);
                const path = './' + context.instance.tenantId + '_appServices';
                let instance = this.appServices.get(path);
                if (!instance) {
                    const IMPORT = yield Promise.resolve(`${path}`).then(s => require(s));
                    const aClass = IMPORT.AppServices;
                    instance = new aClass(this);
                    this.appServices.set(path, instance);
                    console.log('instance loaded', path, instance);
                }
                return instance;
                // for multiple appServices  -end 
            }
            else {
                if (this.appServices == null)
                    this.appServices = new appServices_1.AppServices(this);
                return this.appServices;
            }
        });
    }
    /**
    * is fired on application startup
    **/
    startUp(options) {
        const _super = Object.create(null, {
            startUp: { get: () => super.startUp }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.startUp.call(this, options);
            if (options['cron'] == false) {
                return;
            }
            console.log('myserver started');
            var query = { "items.status": "start" };
            var list = yield this.server.dataStore.findItems(query);
            if (list.length > 0) {
                this.server.logger.log("** There are " + list.length, " items that seems to be hung");
                console.log("** There are " + list.length, " items that seems to be hung");
                list.forEach(it => {
                    console.log(`   item hung: '${it.elementId}' seq: ${it.seq} ${it.type} ${it.status} in process:'${it.processName}' - Instance id: '${it.instanceId}' `);
                });
            }
            var list = yield this.server.dataStore.locker.list();
            let date = new Date();
            date.setDate(date.getDate() - 1);
            var list = yield this.server.dataStore.locker.delete({ time: { $lte: date } });
            if (list.length > 0) {
                console.log('Current locks ...', list.length);
                for (var i = 0; i < list.length; i++) {
                    let item = list[i];
                    console.log('lock:', item.id, item.server, item.time, (0, _1.dateDiff)(item.time));
                }
            }
        });
    }
    /**
     * is Called everytime a workflow is completed
     * @param execution
     */
    executionEnded(execution) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    executionStarted(execution) {
        const _super = Object.create(null, {
            executionStarted: { get: () => super.executionStarted }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.executionStarted.call(this, execution);
        });
    }
    executionEvent(context, event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.item) {
                //            console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
                //            if (event == 'wait' && context.item.element.type == 'bpmn:UserTask')
                //                console.log(`----->Waiting for User Input for '${context.item.element.id}' id: ${context.item.id}`);
            }
            //       else
            //           console.log('----->All:' + event, context.definition.name);
        });
    }
    messageThrown(messageId, data, matchingQuery, item) {
        const _super = Object.create(null, {
            messageThrown: { get: () => super.messageThrown }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.messageThrown.call(this, messageId, data, matchingQuery, item);
        });
    }
    signalThrown(signalId, data, matchingQuery, item) {
        const _super = Object.create(null, {
            signalThrown: { get: () => super.signalThrown }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.signalThrown.call(this, signalId, data, matchingQuery, item);
        });
    }
    serviceCalled(input, context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.logger.log("service called");
        });
    }
}
exports.MyAppDelegate = MyAppDelegate;
class Utils {
}
//# sourceMappingURL=appDelegate.js.map