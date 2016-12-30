import Agenda from 'agenda';
import { MongoURL } from '@/settings';

var agenda = new Agenda({ db: { address: MongoURL } });

agenda.define('generate GRP events', function(job, done){
	console.log('generate events');
	done();
});

agenda.on('ready', function() {
  agenda.every('0 0 1 * *', 'generate GRP events');

  agenda.start();
});
