import Agenda from 'agenda';
import { MongoURL } from '@/settings';
import generateEventsJob from '@/jobs/generate-events';

var agenda = new Agenda({ db: { address: MongoURL } });

generateEventsJob(agenda);

agenda.on('ready', function() {
  agenda.start();
});
