import * as gitInfo from 'git-repo-info';
import { writeFileSync } from 'fs'; 
import { pick } from 'lodash';

const gitData = gitInfo();
const visibleData = pick(gitData, 'branch', 'abbreviatedSha');

// in jenkins environment branch must be provided as an environment variable
// because it's not available in .git directory
if (!visibleData.branch) {
  visibleData.branch = process.argv[2];
}

writeFileSync('src/version.json', JSON.stringify(visibleData, null, 2));