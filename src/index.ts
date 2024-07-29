export * from 'bpmn-server';

export {configuration} from './WorkflowApp/configuration';

import * as _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());