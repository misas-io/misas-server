import program from 'commander';
import { run } from '@/jobs/generate-events';


program
  .version('1.0.0')
  .parse(process.argv);
  
run();
