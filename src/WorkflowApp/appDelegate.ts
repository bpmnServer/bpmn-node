import {  Item, FLOW_ACTION , NODE_ACTION, IExecution , dateDiff } from './';
import { DefaultAppDelegate } from './';
import { AppServices } from './appServices';
import { AppUtils } from './appUtils';


const fs = require('fs');

var seq = 1;

const MULTI_APP_SERVICES =false;


console.log('appDelegate from ',__filename);


class MyAppDelegate extends DefaultAppDelegate{
    winSocket;
    appServices;
    appUtils;
    
    constructor(server) {
        super(server);
        this.appUtils = new AppUtils(server);
    }

    async getServicesProvider(context) {

        // for multiple appServices  -start 
        if (MULTI_APP_SERVICES) {
            this.appServices = new Map();

                console.log('call services provider', context.instance.tenantId);
                const path = './' + context.instance.tenantId + '_appServices';

                let instance = this.appServices.get(path);

                if (!instance) {
                    const IMPORT = await import(path)
                    const aClass = IMPORT.AppServices;
                    instance = new aClass(this);
                    this.appServices.set(path, instance);
                    console.log('instance loaded', path, instance);
                }
                return instance;
            // for multiple appServices  -end 
        }
    else
        {
        if (this.appServices == null)
        this.appServices = new AppServices(this);
        return this.appServices
        }
        
    }
    /**
    * is fired on application startup
    **/
    async startUp(options) {

        await super.startUp(options);
		if (options['cron'] == false) {
			return;
		}

        console.log('myserver started');

        var query = { "items.status": "start" };

        var list = await this.server.dataStore.findItems(query);
        if (list.length > 0) {
            this.server.logger.log("** There are " + list.length," items that seems to be hung");
            console.log("** There are " + list.length," items that seems to be hung");
            list.forEach(it=>{
                console.log(`   item hung: '${it.elementId}' seq: ${it.seq} ${it.type} ${it.status} in process:'${it.processName}' - Instance id: '${it.instanceId}' `);
            });
        }

        var list = await this.server.dataStore.locker.list();

        let date=new Date();
        date.setDate(date.getDate() -1);

        var list = await this.server.dataStore.locker.delete({ time: { $lte: date } });

        if (list.length > 0) {
            console.log('Current locks ...', list.length);
            for (var i = 0; i < list.length; i++) {
                let item = list[i];
                console.log('lock:', item.id, item.server, item.time,dateDiff(item.time));
            }
        }
    

    }

    /**
     * is Called everytime a workflow is completed
     * @param execution 
     */
    async executionEnded(execution: IExecution) {
        
    }
    async executionStarted(execution: IExecution) {
        await super.executionStarted(execution);
    }

    async executionEvent(context, event) {

        if (context.item) {

//            console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
//            if (event == 'wait' && context.item.element.type == 'bpmn:UserTask')
//                console.log(`----->Waiting for User Input for '${context.item.element.id}' id: ${context.item.id}`);
        }
 //       else
 //           console.log('----->All:' + event, context.definition.name);

    
    }
    async messageThrown(messageId, data, matchingQuery, item: Item) {
        await super.messageThrown(messageId, data, matchingQuery,item);
    }
    async signalThrown(signalId, data, matchingQuery, item: Item) {
        await super.signalThrown(signalId, data, matchingQuery, item);
    }
    async serviceCalled(input, context) {
        this.server.logger.log("service called");

    }
}
class Utils {

}
export {MyAppDelegate}