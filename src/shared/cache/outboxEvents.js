import {EventEmitter} from 'events';

export const outboxEvents = new EventEmitter();

outboxEvents.setMaxListeners(10)