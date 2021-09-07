import * as gitInfo from 'git-repo-info';
import { writeFileSync } from 'fs'; 
import { pick } from 'lodash';

const gitData = gitInfo();
const visibleData = pick(gitData, 'branch', 'abbreviatedSha', 'committerDate');

writeFileSync('src/version.json',  JSON.stringify(visibleData, null, 2));