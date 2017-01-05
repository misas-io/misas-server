import 'moment-timezone';
import moment from 'moment';
import program from 'commander';
import settings from '@/lib/settings';
import { run } from '@/lib/jobs/generate-events';
import { setupLogger } from '@/lib/log';

moment.tz.setDefault("America/Denver");

program
  .version('1.0.0')
  .parse(process.argv);
  
setupLogger(settings);

run({
  runtime: 'terminal',
  from: moment().startOf("month").toDate(),
  until: moment().add(1, 'month').endOf("month").toDate(),
});
