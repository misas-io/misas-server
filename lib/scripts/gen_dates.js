import program from 'commander';
import settings from '@/lib/settings';
import { run } from '@/lib/jobs/generate-events';
import { setupLogger } from '@/lib/log';


program
  .version('1.0.0')
  .parse(process.argv);
  
setupLogger(settings);

run({
  runtime: 'terminal',
});
