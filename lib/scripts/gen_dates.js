import program from 'commander';
import { run } from '@/lib/jobs/generate-events';


program
  .version('1.0.0')
  .parse(process.argv);
  
run({
  runtime: 'terminal',
});
