import Agenda from 'agenda';
import { MongoURL } from '@/lib/settings';
import generateEventsJob from '@/lib/jobs/generate-events';

var agenda = new Agenda({ db: { address: MongoURL } });

var jobTypes = process.env.JOB_TYPES 
                ? process.env.JOB_TYPES.split(',') 
                : ['generate-events'];
 
jobTypes.forEach(function(type) {
    require('./jobs/' + type).default(agenda);
})
 
agenda.on('ready', function() {
  agenda.start();
});

function graceful() {
  agenda.stop(function() {
    console.log('stop scheduler');
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);
process.on('SIGUSR2', graceful);
