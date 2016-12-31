import Agenda from 'agenda';
import { MongoURL } from '@/lib/settings';
import generateEventsJob from '@/lib/jobs/generate-events';

var agenda = new Agenda({ db: { address: MongoURL } });

generateEventsJob(agenda);

agenda.on('ready', function() {
  agenda.start();
});
